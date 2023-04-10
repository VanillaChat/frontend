import React from "react";
import logo from "../icons/squarelogo.png";
import "../styles/Login.css";
import Input from "../components/Input";
import Button from "../components/Button";
import ArrowLeft from "../icons/arrow-left.svg";

export default class ForgotPassword extends React.PureComponent<
  any,
  { email: string }
> {
  constructor(props: any) {
    super(props);
    this.state = {
      email: "",
    };
  }

  render() {
    document.title = "Forgot password | Vanilla";
    return (
      <main id="forgot-password">
        <div className="login-form">
          <img src={logo} alt="logo" className="form-logo" />
          <h1 className="form-heading">Forgot your password?</h1>
          <p className="leading">
            No problem, just input your email below and we’ll send you an email
            with the reset link.
          </p>
          <div className="form">
            <form style={{ marginTop: "10px" }}>
              <Input
                id="email"
                type="text"
                placeholder="Enter your email"
                label="Email"
              />
            </form>
            <Button filled style={{ width: "100%", marginTop: "20px" }}>
              Reset my password
            </Button>
            <Button icon={ArrowLeft} to="/login" style={{ marginTop: "10px" }}>
              Go back
            </Button>
          </div>
        </div>
      </main>
    );
  }
}
