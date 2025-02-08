
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosSchool } from "react-icons/io";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch } from "react-redux";
import { loginSuccess, setUser } from "../redux/userSlice"; 
import './Login.css'
import { getLoggedUser } from "../chatApiCalls/users";

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
      toast.error("Passwords do not match!");
      return;
    }

    if (!registerData.gemail || !registerData.email) {
      toast.error("Please provide both GSUITE and Personal emails.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Registration Successful! Redirecting...");
        setTimeout(() => navigate("/"), 2000);
      } else {
        toast.error(`Error: ${data.message || "Registration failed"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };
  
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Login Successful! Redirecting...");
        
        localStorage.setItem("token", data.token);

        dispatch(loginSuccess(data)); 
        const userData=await getLoggedUser(dispatch);
        console.log("check login",userData);
        dispatch(setUser(userData));

        setTimeout(() => navigate("/home"), 2000);
      } else {
        toast.error(`Error: ${data.message || "Login failed"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className={`container ${isSignInActive ? "" : "right-panel-active"}`} id="container">
      <ToastContainer position="top-right" autoClose={2000} />
      
      <div className={`form-container sign-up-container ${isSignInActive ? "hidden" : ""}`}>
        <form onSubmit={handleRegister}>
          <h1>Create Account</h1>
          <input type="text" name="name" placeholder="NAME" required onChange={handleRegisterChange} />
          <input type="email" name="gemail" placeholder="GSUITE ID" required onChange={handleRegisterChange} />
          <input type="email" name="email" placeholder="PERSONAL EMAIL" required onChange={handleRegisterChange} />

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
            <option value="" disabled selected>Choose your branch</option>
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

      <div className={`form-container sign-in-container ${isSignInActive ? "" : "hidden"}`}>
        <form onSubmit={handleLogin}>
          <h1>Login</h1>
          <input type="email" name="email" placeholder="PERSONAL EMAIL" required onChange={handleLoginChange} />
          <div className="password-container">
            <input type="password" name="password" placeholder="PASSWORD" required onChange={handleLoginChange} />
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
