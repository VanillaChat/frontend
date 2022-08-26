import React from "react";
import logo from "../icons/squarelogo.png";
import "../styles/Login.css";
import Input from "../components/Input";
import Button from "../components/Button";
import DiscordIcon from "../icons/discord-icon.png";
import { Link } from "react-router-dom";

export default class Login extends React.PureComponent<
  any,
  { email: string; password: string }
> {
  constructor(props: any) {
    super(props);
    this.state = {
      email: "",
      password: "",
    };
  }

  render() {
    return (
      <div className="login-form">
        <img src={logo} alt="logo" className="form-logo" />
        <h1 className="form-heading">Log in to your account</h1>
        <p>Welcome back! Please enter your details.</p>
        <div className="form">
          <form style={{ marginTop: "10px" }}>
            <Input type="text" placeholder="Enter your email" label="Email" />
            <Input
              type="password"
              placeholder="•••••••••••"
              label="Password"
              labelStyle={{ marginTop: "15px" }}
              id="password"
            />
          </form>
          <div className="fe">
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>
          <Button filled style={{ width: "385px" }}>
            Sign in
          </Button>
          <Button
            style={{ width: "385px", marginTop: "20px" }}
            icon={DiscordIcon}
          >
            Sign in with Discord
          </Button>
          <p className="sign-up-text">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    );
  }
}
