import React, { useState } from "react";
import { IoIosSchool } from "react-icons/io";
import './Login.css';
import { FaEye, FaEyeSlash } from "react-icons/fa";
function Login() {
  const [isSignInActive, setIsSignInActive] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const switchToSignIn = () => {
    setIsSignInActive(true);
  };

  const switchToSignUp = () => {
    setIsSignInActive(false);
  };


  return (
    <div
      className={`container ${isSignInActive ? "" : "right-panel-active"}`}
      id="container"
    >
      <div
        className={`form-container sign-up-container ${
          isSignInActive ? "hidden" : ""
        }`}
      >
        <form>
          <h1>Create Account</h1>

          <input type="text" placeholder="NAME" required/>
          <input type="email" placeholder="GSUITE ID" required/>
          <input type="email" placeholder="PERSONAL EMAIL" required/>
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="CREATE PASSWORD"
              required
            />
          </div>
          <div className="password-container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="CONFIRM PASSWORD"
              required
            />
          </div>
          <select placeholder="BRANCH" required>
            <option value="" disabled selected>
              Choose your branch
            </option>
            <option value="BTECH">BTECH</option>
            <option value="MCA">MCA </option>
            <option value="MBA">MBA</option>
            <option value="MSC">MSC</option>
            <option value="MTECH">MTECH</option>
          </select>
          <button type="submit">REGISTER</button>
        </form>
        <button className="switch-btn Login" onClick={switchToSignIn}>
          Go to Login
        </button>
      </div>
      <div
        className={`form-container sign-in-container ${
          isSignInActive ? "" : "hidden"
        }`}
      >
        <form>
          <h1>Login</h1>
          <input type="email" placeholder="EMAIL" required/>
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="PASSWORD"
              required
            />
          </div>
          
          <button type="submit">LOGIN</button>
        </form>
        <button className="switch-btn" onClick={switchToSignUp}>
          Go to Register
        </button>
      </div>
      <div className="overlay-container">
        <div className="overlay">
          <div className="overlay-panel overlay-left">
            <p>Once a student, forever a part of the legacy</p>
            <button className="ghost" id="signIn" onClick={switchToSignIn}>
              GO TO LOGIN
            </button>
          </div>
          <div className="overlay-panel overlay-right">
            <p>MNNIT-A <IoIosSchool /> se chale jaoge , but campus ko kaise bhool paoge</p>
            <button className="ghost" id="signUp" onClick={switchToSignUp}>
              GO TO Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
