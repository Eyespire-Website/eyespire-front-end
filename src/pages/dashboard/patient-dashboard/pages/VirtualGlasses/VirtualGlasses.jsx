import React, { useEffect, useRef, useState } from "react";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Webcam from 'react-webcam';
import PatientSidebar from '../../PatientSidebar';
import glassesService from '../../../../../services/glassesService';
import './VirtualGlasses.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

export default function VirtualGlasses() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [glasses, setGlasses] = useState([]);
  const [selectedGlass, setSelectedGlass] = useState(null);
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favoriteGlasses, setFavoriteGlasses] = useState([]);
  const [activeTab, setActiveTab] = useState("virtual-glasses");

  // Three.js variables
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const glassesModelRef = useRef(null);

  // Fetch glasses data
  useEffect(() => {
    const fetchGlasses = async () => {
      try {
        const response = await glassesService.getAllGlasses();
        setGlasses(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching glasses:", error);
        toast.error("Không thể tải danh sách kính!");
        setLoading(false);
      }
    };

    const fetchFavorites = async () => {
      try {
        const response = await glassesService.getUserFavoriteGlasses();
        setFavoriteGlasses(response.data.map(glass => glass.id));
      } catch (error) {
        console.error("Error fetching favorite glasses:", error);
      }
    };

    fetchGlasses();
    fetchFavorites();
  }, []);

  // Load facemesh model
  useEffect(() => {
    let faceLandmarksDetector = null;
    let videoWidth = 0;
    let videoHeight = 0;
    let detectionInterval = null;

    const loadFaceLandmarks = async () => {
      if (isWebcamOn && webcamRef.current && canvasRef.current) {
        try {
          // Sử dụng API mới của face-landmarks-detection với TensorFlow backend
          faceLandmarksDetector = await faceLandmarksDetection.createDetector(
            faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
            {
              runtime: 'tfjs', // Sử dụng tfjs thay vì mediapipe
              refineLandmarks: true,
              maxFaces: 1
            }
          );

          // Kiểm tra xem video đã sẵn sàng chưa
          if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
            videoWidth = webcamRef.current.video.videoWidth;
            videoHeight = webcamRef.current.video.videoHeight;
            startDetection();
          }
        } catch (error) {
          console.error("Error loading face landmarks model:", error);
          toast.error("Không thể tải mô hình nhận diện khuôn mặt!");
        }
      }
    };

    // Hàm bắt đầu nhận diện khuôn mặt
    const startDetection = () => {
      if (!webcamRef.current || !webcamRef.current.video) return;
      
      detectionInterval = setInterval(async () => {
        if (webcamRef.current && webcamRef.current.video) {
          const predictions = await faceLandmarksDetector.estimateFaces(
            webcamRef.current.video
          );

          if (predictions.length > 0) {
            const keypoints = predictions[0].keypoints;
            const keypoints3D = predictions[0].keypoints3D;

            // Update glasses position based on face landmarks
            if (glassesModelRef.current && sceneRef.current && cameraRef.current) {
              // Tìm các điểm mốc quan trọng
              // Trong API mới, các điểm được đánh số khác nhau
              // Tìm điểm giữa hai mắt
              const midEyePoint = keypoints.find(kp => kp.name === 'midwayBetweenEyes');
              // Tìm điểm mũi
              const nosePoint = keypoints.find(kp => kp.name === 'noseTip');
              // Tìm điểm mắt trái và phải
              const leftEyePoint = keypoints.find(kp => kp.name === 'leftEye');
              const rightEyePoint = keypoints.find(kp => kp.name === 'rightEye');

              if (midEyePoint && leftEyePoint && rightEyePoint) {
                // Chuyển đổi từ tọa độ tương đối sang tọa độ pixel
                const videoWidth = webcamRef.current.video.videoWidth;
                const videoHeight = webcamRef.current.video.videoHeight;

                const pointMidEye = [
                  midEyePoint.x * videoWidth,
                  midEyePoint.y * videoHeight,
                  midEyePoint.z || 0
                ];

                const pointleftEye = [
                  leftEyePoint.x * videoWidth,
                  leftEyePoint.y * videoHeight,
                  leftEyePoint.z || 0
                ];

                const pointrightEye = [
                  rightEyePoint.x * videoWidth,
                  rightEyePoint.y * videoHeight,
                  rightEyePoint.z || 0
                ];

                // Debug - hiển thị tọa độ các điểm quan trọng
                console.log("Mid eye:", pointMidEye);
                console.log("Left eye:", pointleftEye);
                console.log("Right eye:", pointrightEye);

                // Chuyển đổi từ pixel coordinates sang tọa độ thế giới (world coordinates)
                const vector = new THREE.Vector3(
                  (midEyePoint.x * 2) - 1,  // Convert to normalized device coordinates (-1 to 1)
                  -(midEyePoint.y * 2) + 1, // Y is inverted in WebGL
                  0.5                       // Z value between near and far plane (0.5 is middle)
                );
                
                // Unproject to convert from NDC to world coordinates
                vector.unproject(cameraRef.current);
                
                // Đặt vị trí kính sử dụng tọa độ thế giới đã chuyển đổi
                glassesModelRef.current.position.copy(vector);

                // Tính khoảng cách giữa hai mắt để điều chỉnh kích thước kính
                // Nếu có keypoints3D, sử dụng chúng để tính toán chính xác hơn
                let scaleFactor;
                
                if (keypoints3D && keypoints3D.length > 0) {
                  // Tìm các điểm 3D tương ứng
                  const leftEye3D = keypoints3D.find(kp => kp.name === 'leftEye');
                  const rightEye3D = keypoints3D.find(kp => kp.name === 'rightEye');
                  
                  if (leftEye3D && rightEye3D) {
                    // Tính khoảng cách 3D thực sự giữa hai mắt
                    const eyeDist3D = Math.sqrt(
                      Math.pow(leftEye3D.x - rightEye3D.x, 2) +
                      Math.pow(leftEye3D.y - rightEye3D.y, 2) +
                      Math.pow(leftEye3D.z - rightEye3D.z, 2)
                    );
                    
                    // Điều chỉnh hệ số tỷ lệ dựa trên khoảng cách 3D
                    // Giả sử khoảng cách trung bình giữa hai mắt người Việt là khoảng 60mm
                    const STANDARD_EYE_DIST = 60; // mm
                    const MODEL_ORIGINAL_EYE_DIST = 1.2; // đơn vị trong mô hình, cần điều chỉnh theo mô hình thực tế
                    
                    scaleFactor = (eyeDist3D / STANDARD_EYE_DIST) * MODEL_ORIGINAL_EYE_DIST;
                  } else {
                    // Fallback nếu không tìm thấy điểm mắt 3D
                    const eyeDist = Math.sqrt(
                      Math.pow(pointleftEye[0] - pointrightEye[0], 2) +
                      Math.pow(pointleftEye[1] - pointrightEye[1], 2)
                    );
                    
                    // Quy đổi khoảng cách pixel sang tỷ lệ thực
                    const STANDARD_EYE_DIST_PIXELS = 60; // giá trị tham khảo
                    scaleFactor = eyeDist / STANDARD_EYE_DIST_PIXELS * 0.1;
                  }
                } else {
                  // Nếu không có keypoints3D, sử dụng phương pháp 2D
                  const eyeDist = Math.sqrt(
                    Math.pow(pointleftEye[0] - pointrightEye[0], 2) +
                    Math.pow(pointleftEye[1] - pointrightEye[1], 2)
                  );
                  
                  // Quy đổi khoảng cách pixel sang tỷ lệ thực
                  const STANDARD_EYE_DIST_PIXELS = 60; // giá trị tham khảo
                  scaleFactor = eyeDist / STANDARD_EYE_DIST_PIXELS * 0.1;
                }
                
                glassesModelRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor);

                // Tính góc xoay dựa trên vector hướng giữa hai mắt
                const eyeVector = new THREE.Vector3(
                  pointrightEye[0] - pointleftEye[0],
                  pointrightEye[1] - pointleftEye[1],
                  pointrightEye[2] - pointleftEye[2]
                ).normalize();
                
                // Tính góc nghiêng đầu (roll) - xoay quanh trục Z
                const angleZ = Math.atan2(eyeVector.y, eyeVector.x);
                
                // Nếu có điểm mũi, có thể tính thêm pitch và yaw
                const nosePoint = keypoints.find(kp => kp.name === 'noseTip');
                let angleX = 0, angleY = 0;
                
                if (nosePoint && midEyePoint) {
                  // Tính vector từ giữa hai mắt đến mũi
                  const noseVector = new THREE.Vector3(
                    nosePoint.x * videoWidth - pointMidEye[0],
                    nosePoint.y * videoHeight - pointMidEye[1],
                    (nosePoint.z || 0) - pointMidEye[2]
                  ).normalize();
                  
                  // Tính góc ngửa/cúi đầu (pitch) - xoay quanh trục X
                  angleX = Math.atan2(noseVector.y, noseVector.z);
                  
                  // Tính góc quay trái/phải (yaw) - xoay quanh trục Y
                  angleY = Math.atan2(noseVector.x, noseVector.z);
                }
                
                // Áp dụng góc xoay
                glassesModelRef.current.rotation.set(angleX, angleY, angleZ);
                
                // Áp dụng offset để căn chỉnh kính với khuôn mặt
                // Tính toán bounding box của mô hình để căn giữa
                const bbox = new THREE.Box3().setFromObject(glassesModelRef.current);
                const center = bbox.getCenter(new THREE.Vector3());
                
                // Offset theo mô hình kính cụ thể
                // Các giá trị này có thể được lưu trong cơ sở dữ liệu cho từng mẫu kính
                const offsetX = selectedGlass?.offsetX || 0;
                const offsetY = selectedGlass?.offsetY || 0;
                const offsetZ = selectedGlass?.offsetZ || 0;
                
                // Áp dụng offset
                glassesModelRef.current.position.x += offsetX - center.x;
                glassesModelRef.current.position.y += offsetY - center.y;
                glassesModelRef.current.position.z += offsetZ;

                // Debug thông tin vị trí và kích thước
                console.log("Updated glasses position:", glassesModelRef.current.position);
                console.log("Updated glasses scale:", glassesModelRef.current.scale);
                console.log("Updated glasses rotation:", glassesModelRef.current.rotation);
              }
            }
          }
        }
      }, 100);

      toast.success("Mô hình nhận diện khuôn mặt đã được tải!");
    };

    // Chỉ tải mô hình khi webcam đã bật
    if (isWebcamOn) {
      loadFaceLandmarks();
    }

    return () => {
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    };
  }, [isWebcamOn]);

  // Xử lý sự kiện khi webcam đã load xong
  const handleWebcamLoad = () => {
    console.log("Webcam đã sẵn sàng");
    // Không cần làm gì ở đây vì useEffect sẽ xử lý việc tải mô hình
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (isWebcamOn && canvasRef.current) {
      // Đảm bảo canvas có kích thước đúng
      const videoWidth = webcamRef.current?.video?.videoWidth || 640;
      const videoHeight = webcamRef.current?.video?.videoHeight || 480;

      if (canvasRef.current.width === 0 || canvasRef.current.height === 0) {
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;
      }

      // Set up scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Set up renderer
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true
      });
      renderer.setSize(videoWidth, videoHeight);
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace; 
      rendererRef.current = renderer;

      // Set up camera
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
      camera.position.x = videoWidth / 2;
      camera.position.y = -videoHeight / 2;
      camera.position.z = -(videoHeight / 2) / Math.tan(45 / 2); 
      camera.lookAt({ x: videoWidth / 2, y: -videoHeight / 2, z: 0, isVector3: true });
      cameraRef.current = camera;

      // Add lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(0, 1, 1);
      scene.add(directionalLight);

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };
      animate();

      // Handle window resize
      const handleResize = () => {
        const newVideoWidth = webcamRef.current?.video?.videoWidth || 640;
        const newVideoHeight = webcamRef.current?.video?.videoHeight || 480;
        camera.aspect = newVideoWidth / newVideoHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newVideoWidth, newVideoHeight);
      };

      window.addEventListener("resize", handleResize);

      // Load glasses model if selected
      if (selectedGlass) {
        console.log("Selected Glass:", selectedGlass); // Debug để xem cấu trúc dữ liệu

        const loader = new GLTFLoader();

        // Sử dụng đường dẫn trực tiếp từ modelUrl
        const modelUrl = process.env.PUBLIC_URL + selectedGlass.modelUrl;
        console.log("Loading model from:", modelUrl); // Debug đường dẫn mô hình

        loader.load(
          modelUrl,
          (gltf) => {
            if (glassesModelRef.current) {
              scene.remove(glassesModelRef.current);
            }

            const model = gltf.scene;
            scene.add(model);
            glassesModelRef.current = model;

            // Đặt vị trí ban đầu ở trung tâm màn hình để dễ nhìn thấy
            const videoWidth = webcamRef.current.video.videoWidth;
            const videoHeight = webcamRef.current.video.videoHeight;
            model.position.set(videoWidth / 2, -videoHeight / 2, 0);
            console.log("Model position:", model.position); // Debug vị trí

            // Điều chỉnh kích thước - tăng lên để dễ nhìn thấy hơn
            const scaleFactor = 0.7; // Tăng kích thước lên
            model.scale.set(scaleFactor, scaleFactor, scaleFactor);
            console.log("Model scale:", model.scale); // Debug kích thước

            // Đảm bảo kính hướng về phía người dùng
            model.rotation.y = 2 * Math.PI;
            model.rotation.x = 2 * Math.PI;
            model.rotation.z = 0;
            console.log("Model rotation:", model.rotation); // Debug góc xoay

            // Thêm debug để kiểm tra các thuộc tính của mô hình
            console.log("Model loaded successfully");
            console.log("Model bounding box:", new THREE.Box3().setFromObject(model));

            // Thêm các trục tọa độ để dễ debug
            const axesHelper = new THREE.AxesHelper(100);
            scene.add(axesHelper);
          },
          (xhr) => {
            // Kiểm tra để tránh hiển thị Infinity% loaded
            if (xhr.total > 0) {
              console.log(Math.round((xhr.loaded / xhr.total) * 100) + "% loaded");
            } else {
              console.log("Loading model...");
            }
          },
          (error) => {
            console.error("Error loading glasses model:", error);
            toast.error("Không thể tải mô hình kính!");
          }
        );
      }

      return () => {
        window.removeEventListener("resize", handleResize);
        if (rendererRef.current) {
          rendererRef.current.dispose();
        }
        if (glassesModelRef.current) {
          scene.remove(glassesModelRef.current);
        }
      };
    }
  }, [isWebcamOn, selectedGlass]);

  // Debug effect để theo dõi mô hình kính
  useEffect(() => {
    if (glassesModelRef.current && sceneRef.current && cameraRef.current) {
      console.log("Debug glasses model:");
      console.log("- Position:", glassesModelRef.current.position);
      console.log("- Rotation:", glassesModelRef.current.rotation);
      console.log("- Scale:", glassesModelRef.current.scale);
      console.log("- Visible:", glassesModelRef.current.visible);
      console.log("- Camera position:", cameraRef.current.position);
      console.log("- Scene children count:", sceneRef.current.children.length);

      // Đảm bảo mô hình hiển thị
      glassesModelRef.current.visible = true;

      // Thêm ánh sáng trực tiếp vào mô hình để làm nổi bật
      if (sceneRef.current) {
        // Xóa tất cả ánh sáng hiện có
        sceneRef.current.children.forEach(child => {
          if (child.isLight) {
            sceneRef.current.remove(child);
          }
        });

        // Thêm ánh sáng mới
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); // Tăng cường độ
        sceneRef.current.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); // Tăng cường độ
        directionalLight.position.set(0, 1, 1);
        sceneRef.current.add(directionalLight);

        // Thêm ánh sáng điểm để làm nổi bật mô hình
        const pointLight = new THREE.PointLight(0xffffff, 1.0);
        pointLight.position.set(0, 0, 50);
        sceneRef.current.add(pointLight);
      }
    }
  }, [glassesModelRef.current, selectedGlass]);

  const handleGlassSelect = (glass) => {
    setSelectedGlass(glass);
  };

  const handleToggleWebcam = () => {
    setIsWebcamOn(!isWebcamOn);
  };

  const handleAddToFavorites = async (glassId) => {
    try {
      await glassesService.saveUserGlassFavorite(glassId);
      setFavoriteGlasses([...favoriteGlasses, glassId]);
      toast.success("Đã thêm vào danh sách yêu thích!");
    } catch (error) {
      console.error("Error adding to favorites:", error);
      toast.error("Không thể thêm vào danh sách yêu thích!");
    }
  };

  const isFavorite = (glassId) => {
    return favoriteGlasses.includes(glassId);
  };

  return (
    <div className="virtual-glasses-container">
      <PatientSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="virtual-glasses-content">
        <h1>Thử kính ảo</h1>
        <div className="virtual-glasses-main">
          <div className="webcam-container">
            <div className="webcam-wrapper">
              {isWebcamOn ? (
                <>
                  <Webcam
                    ref={webcamRef}
                    id="webcam"
                    autoPlay
                    playsInline
                    mirrored
                    onLoadedMetadata={handleWebcamLoad}
                    style={{
                      width: "100%",
                      height: "auto",
                      position: "absolute",
                    }}
                    width={640}
                    height={480}
                  />
                  <canvas
                    ref={canvasRef}
                    width={640}
                    height={480}
                    style={{
                      width: "100%",
                      height: "auto",
                      position: "absolute",
                      zIndex: 10,
                    }}
                  />
                </>
              ) : (
                <div className="webcam-placeholder">
                  <p>Nhấn "Bật camera" để thử kính</p>
                </div>
              )}
            </div>
            <button
              className={`webcam-toggle ${isWebcamOn ? "on" : "off"}`}
              onClick={handleToggleWebcam}
            >
              {isWebcamOn ? "Tắt camera" : "Bật camera"}
            </button>
          </div>

          <div className="glasses-selection">
            <h2>Chọn mẫu kính</h2>
            {loading ? (
              <p>Đang tải danh sách kính...</p>
            ) : (
              <div className="glasses-grid">
                {glasses.map((glass) => (
                  <div
                    key={glass.id}
                    className={`glass-item ${
                      selectedGlass?.id === glass.id ? "selected" : ""
                    }`}
                    onClick={() => handleGlassSelect(glass)}
                  >
                    <img src={process.env.PUBLIC_URL + glass.thumbnailUrl} alt={glass.name} />
                    <div className="glass-info">
                      <h3>{glass.name}</h3>
                      <p>{glass.price.toLocaleString('vi-VN')} VNĐ</p>
                      <button
                        className={`favorite-button ${
                          isFavorite(glass.id) ? "favorited" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isFavorite(glass.id)) {
                            handleAddToFavorites(glass.id);
                          }
                        }}
                        disabled={isFavorite(glass.id)}
                      >
                        {isFavorite(glass.id) ? "Đã yêu thích" : "Thêm vào yêu thích"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
}