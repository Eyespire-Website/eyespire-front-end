import React from "react";
import "./Header.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="row-view">
      {/* Logo bên trái */}
      <div className="row-view2">
        <img
          src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/e8ggwzic_expires_30_days.png"}
          className="image"
        />
        <span className="text">{"Eyespire"}</span>
      </div>
      
      {/* Menu điều hướng ở giữa */}
      <div className="column2">
        <div className="row-view5">
          <div className="row-view3">
            <span className="text2">{"Home"}</span>
            <span className="text3">{""}</span>
          </div>
          <span className="text4">{"Services"}</span>
          <div className="row-view3">
            <span className="text5">{"Doctors"}</span>
            <span className="text3">{""}</span>
          </div>
          <div className="row-view3">
            <span className="text5">{"Shop"}</span>
            <span className="text3">{""}</span>
          </div>
          <div className="row-view3">
            <span className="text5">{"About"}</span>
            <span className="text3">{""}</span>
          </div>
        </div>
      </div>
      
      {/* Giỏ hàng và nút login bên phải */}
      <div className="row-view5">
        <div className="cart-icon">
          <FontAwesomeIcon icon={faShoppingCart} />
        </div>
        <button className="login-button" onClick={handleLoginClick}>{"Login"}</button>
      </div>
    </div>
  );
};

export default Header;
