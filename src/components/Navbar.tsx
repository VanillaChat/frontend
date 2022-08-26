import * as React from "react";
import "../styles/Navbar.css";
import logo from "../icons/squarelogo.png";
import { Link } from "react-router-dom";
import Button from "./Button";

type Props = {
  isLoggedIn?: boolean;
};
export const Navbar = (props: Props) => {
  return (
    <div className="navbar">
      <Link to="/">
        <div className="logo">
          <img
            src={logo}
            width="32px"
            height="32px"
            alt="logo"
            style={{ borderRadius: "8px" }}
          />
          <p className="wordmark">Vanilla</p>
        </div>
      </Link>
      <div className="links">
        <Link to="/login" className="loginLink">
          Log in
        </Link>
        <Button filled to="/register">
          Sign up
        </Button>
      </div>
    </div>
  );
};
