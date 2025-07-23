import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PatientSelector = ({ onPatientSelect, selectedPatientId }) => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPatients, setFilteredPatients] = useState([]);

    useEffect(() => {
        fetchPatientsWithRefunds();
    }, []);

    useEffect(() => {
        // Filter patients based on search term
        const filtered = patients.filter(patient => 
            patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.phone.includes(searchTerm)
        );
        setFilteredPatients(filtered);
    }, [patients, searchTerm]);

    const fetchPatientsWithRefunds = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/refunds/patients-with-refunds', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setPatients(response.data);
        } catch (error) {
            console.error('Error fetching patients with refunds:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePatientSelect = (patient) => {
        onPatientSelect(patient);
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <div>Đang tải danh sách bệnh nhân...</div>
            </div>
        );
    }

    return (
        <div style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '15px' }}>
                <input
                    type="text"
                    placeholder="Tìm kiếm bệnh nhân (tên, email, số điện thoại)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        fontSize: '14px'
                    }}
                />
            </div>

            <div style={{
                maxHeight: '300px',
                overflowY: 'auto',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#fff'
            }}>
                {filteredPatients.length === 0 ? (
                    <div style={{ 
                        padding: '20px', 
                        textAlign: 'center', 
                        color: '#666' 
                    }}>
                        {searchTerm ? 'Không tìm thấy bệnh nhân phù hợp' : 'Không có bệnh nhân nào có lịch sử hoàn tiền'}
                    </div>
                ) : (
                    filteredPatients.map(patient => (
                        <div
                            key={patient.id}
                            onClick={() => handlePatientSelect(patient)}
                            style={{
                                padding: '12px 15px',
                                borderBottom: '1px solid #eee',
                                cursor: 'pointer',
                                backgroundColor: selectedPatientId === patient.id ? '#e3f2fd' : '#fff',
                                transition: 'background-color 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (selectedPatientId !== patient.id) {
                                    e.target.style.backgroundColor = '#f5f5f5';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (selectedPatientId !== patient.id) {
                                    e.target.style.backgroundColor = '#fff';
                                }
                            }}
                        >
                            <div style={{ 
                                fontWeight: 'bold', 
                                marginBottom: '4px',
                                color: '#333'
                            }}>
                                {patient.name}
                            </div>
                            <div style={{ 
                                fontSize: '12px', 
                                color: '#666',
                                marginBottom: '2px'
                            }}>
                                📧 {patient.email}
                            </div>
                            <div style={{ 
                                fontSize: '12px', 
                                color: '#666',
                                marginBottom: '2px'
                            }}>
                                📞 {patient.phone}
                            </div>
                            <div style={{ 
                                fontSize: '12px', 
                                color: '#28a745',
                                fontWeight: 'bold'
                            }}>
                                💰 {patient.totalRefunds} hoàn tiền • {patient.totalRefundAmount?.toLocaleString()} VNĐ
                            </div>
                        </div>
                    ))
                )}
            </div>

            {selectedPatientId && (
                <div style={{
                    marginTop: '10px',
                    padding: '8px 12px',
                    backgroundColor: '#e8f5e8',
                    borderRadius: '4px',
                    fontSize: '14px',
                    color: '#2e7d32'
                }}>
                    ✅ Đã chọn bệnh nhân ID: {selectedPatientId}
                </div>
            )}
        </div>
    );
};

export default PatientSelector;
