import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosSchool } from "react-icons/io";
import './Login.css'
function Login() {
  const navigate = useNavigate();
  const [isSignInActive, setIsSignInActive] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [registerData, setRegisterData] = useState({
    name: "",
    gemail: "",
    email: "",
    password: "",
    confirmPassword: "",
    branch: "",
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const switchToSignIn = () => setIsSignInActive(true);
  const switchToSignUp = () => setIsSignInActive(false);

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
  
    if (registerData.password !== registerData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
  
    if (!registerData.gemail || !registerData.email) {
      alert("Please provide both GSUITE and Personal emails.");
      return;
    }
  
    
    if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      alert("Please enter a valid email address.");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });
  
      const data = await response.json();
      console.log('Response Data:', data); 
  
      if (response.ok) {
        alert("Registration Successful! Redirecting...");
        navigate("/register_success");
      } else {
        alert(`Error: ${data.message || "Registration failed"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    }
  };
  
  

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Login Successful! Redirecting...");
        localStorage.setItem("token", data.token); 
        navigate("/login_success"); 
      } else {
        alert(`Error: ${data.message || "Login failed"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className={`container ${isSignInActive ? "" : "right-panel-active"}`} id="container">
      {/* Sign Up Form */}
      <div className={`form-container sign-up-container ${isSignInActive ? "hidden" : ""}`}>
        <form onSubmit={handleRegister}>
          <h1>Create Account</h1>

          <input
            type="text"
            name="name"
            placeholder="NAME"
            required
            onChange={handleRegisterChange}
          />
          <input
            type="email"
            name="gemail"
            placeholder="GSUITE ID"
            required
            onChange={handleRegisterChange}
          />
          <input
            type="email"
            name="email"
            placeholder="PERSONAL EMAIL"
            required
            onChange={handleRegisterChange}
          />

          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="CREATE PASSWORD"
              required
              onChange={handleRegisterChange}
            />
          </div>

          <div className="password-container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="CONFIRM PASSWORD"
              required
              onChange={handleRegisterChange}
            />
          </div>

          <select name="branch" required onChange={handleRegisterChange}>
            <option value="" disabled selected>
              Choose your branch
            </option>
            <option value="BTECH">BTECH</option>
            <option value="MCA">MCA</option>
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

      {/* Sign In Form */}
      <div className={`form-container sign-in-container ${isSignInActive ? "" : "hidden"}`}>
        <form onSubmit={handleLogin}>
          <h1>Login</h1>
          <input
            type="email"
            name="email"
            placeholder="PERSONAL EMAIL"
            required
            onChange={handleLoginChange}
          />
          <div className="password-container">
            <input
              type="password"
              name="password"
              placeholder="PASSWORD"
              required
              onChange={handleLoginChange}
            />
          </div>
          <button type="submit">LOGIN</button>
        </form>
        <button className="switch-btn" onClick={switchToSignUp}>
          Go to Register
        </button>
      </div>

      {/* Overlay Section */}
      <div className="overlay-container">
        <div className="overlay">
          <div className="overlay-panel overlay-left">
            <p>Once a student, forever a part of the legacy</p>
            <button className="ghost" id="signIn" onClick={switchToSignIn}>
              GO TO LOGIN
            </button>
          </div>
          <div className="overlay-panel overlay-right">
            <p>
              MNNIT-A <IoIosSchool /> se chale jaoge, but campus ko kaise
              bhool paoge
            </p>
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
