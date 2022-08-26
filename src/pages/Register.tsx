import React from "react";
import logo from "../icons/squarelogo.png";
import "../styles/Login.css";
import Input from "../components/Input";
import Button from "../components/Button";
import DiscordIcon from "../icons/discord-icon.png";
import { Link } from "react-router-dom";

export default class Register extends React.PureComponent {
  constructor(props: any) {
    super(props);
    this.state = {
      email: "",
      password: "",
      confirmPassword: "",
    };
  }

  render() {
    return (
      <div className="login-form">
        <img src={logo} alt="logo" className="form-logo" />
        <h1 className="form-heading">Create an account</h1>
        <p>Welcome to Vanilla!</p>
        <div className="form">
          <form style={{ marginTop: "10px" }}>
            <Input
              type="text"
              placeholder="Enter your email"
              label="Email"
              id="email"
            />
            <Input
              type="password"
              placeholder="•••••••••••"
              label="Password"
              labelStyle={{ marginTop: "15px" }}
              id="password"
            />
            <Input
              type="password"
              placeholder="•••••••••••"
              label="Confirm password"
              labelStyle={{ marginTop: "15px" }}
              id="confirmPassword"
            />
          </form>
          <Button
            filled
            style={{ width: "100%", marginTop: "20px", marginBottom: "20px" }}
          >
            Get started
          </Button>
          <p className="line">OR</p>
          <Button
            style={{ width: "385px", marginTop: "20px" }}
            icon={DiscordIcon}
          >
            Use Discord to create my account
          </Button>
          <p className="sign-up-text">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    );
  }
}
