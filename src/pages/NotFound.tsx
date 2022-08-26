import React from "react";
import Button from "../components/Button";
import ArrowLeft from "../icons/arrow-left.svg";
import "../styles/NotFound.css";
import { useNavigate } from "react-router-dom";
import XIcon from "../icons/x-icon.svg";

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="not-found">
      <img src={XIcon} alt="x-icon" />
      <h3 className="heading">404 - Not Found</h3>
      <p className="leading">
        We really don’t know, why you’re here... It’s a weird place, perhaps
        you’re lost?
      </p>
      <div className="buttons">
        <Button icon={ArrowLeft} onClick={() => navigate(-1)}>
          Go back
        </Button>
        <Button
          filled
          style={{ marginLeft: "12px" }}
          onClick={() => navigate("/")}
        >
          Take me home
        </Button>
      </div>
    </div>
  );
};
export default NotFound;
