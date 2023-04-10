import React from "react";
import Button from "../components/Button";
import ArrowLeft from "../icons/arrow-left.svg";
import "../styles/NotFound.css";
import { useLocation, useNavigate } from "react-router-dom";
import XIcon from "../icons/x-icon.svg";
import useMeta from "../hooks/useMeta";

const NotFound: React.FC = () => {
  useMeta("404 Not Found");
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <main id="not-found">
      <div
        className="not-found"
        style={{ height: location.pathname.includes("app") ? "100vh" : "80vh" }}
      >
        <img src={XIcon} alt="x-icon" />
        <h3
          className="heading"
          onClick={(event) =>
            window.open("https://www.youtube.com/watch?v=eyX0xjB0LjY", "_blank")
          }
        >
          404 - Lost Not Found
        </h3>
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
    </main>
  );
};
export default NotFound;
