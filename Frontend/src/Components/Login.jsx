import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosSchool } from "react-icons/io";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch } from "react-redux";
import { loginSuccess, setUser } from "../redux/userSlice";
import "./Login.css";
import { getLoggedUser } from "../chatApiCalls/users";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
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

  /* ================= TOGGLE ================= */
  const switchToSignIn = () => setIsSignInActive(true);
  const switchToSignUp = () => setIsSignInActive(false);

  /* ================= FORM HANDLERS ================= */
  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  /* ================= LOCAL REGISTER ================= */
  const handleRegister = async (e) => {
    e.preventDefault();

    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Registration successful! Please login.");
        setTimeout(() => switchToSignIn(), 1500);
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };




  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // ----------------- STEP 1: Send login request -----------------
      const response = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        // ----------------- STEP 2: Save token -----------------
        localStorage.setItem("token", data.token);

        // ----------------- STEP 3: Determine logged user -----------------
        let loggedUser = data.user;
        if (!loggedUser) {
          const userData = await getLoggedUser();
          loggedUser = userData?.user;
        }

        // ----------------- STEP 4: Dispatch Redux & Navigate -----------------
        if (loggedUser) {
          dispatch(loginSuccess(loggedUser));
          dispatch(setUser({ user: loggedUser, errorMessage: null }));
          toast.success("Login successful!");
          navigate("/home");
        } else {
          toast.error("Failed to load user profile");
        }
      } else {
        toast.error(data.message || "Login failed");
        dispatch(
          setUser({
            user: null,
            errorMessage: data.message || "Login failed",
          })
        );
      }
    } catch (error) {
      console.error("❌ handleLogin catch error:", error);
      toast.error(error.message || "Something went wrong");
      dispatch(
        setUser({
          user: null,
          errorMessage: error.message || "Something went wrong",
        })
      );
    }
  };



  /* ================= GOOGLE AUTH ================= */
  const handleGoogleAuth = async (credentialResponse) => {
    try {
      const res = await axios.post(
        "http://localhost:5001/api/auth/google-register",
        {
          token: credentialResponse.credential,
        }
      );

      localStorage.setItem("token", res.data.token);

      dispatch(loginSuccess(res.data.user));
      dispatch(setUser(res.data.user));

      toast.success("Google login successful!");
      navigate("/home");
    } catch (error) {
      console.error(error);
      toast.error("Google authentication failed");
    }
  };

  return (
    <div className="login-root">
      <div
        className={`login-page-container ${isSignInActive ? "" : "right-panel-active"
          }`}
        id="login-page-container"
      >

        <ToastContainer position="top-right" autoClose={2000} />

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

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="CREATE PASSWORD"
              required
              onChange={handleRegisterChange}
            />

            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="CONFIRM PASSWORD"
              required
              onChange={handleRegisterChange}
            />

            <select name="branch" required onChange={handleRegisterChange}>
              <option value="">Choose your branch</option>
              <option value="BTECH">BTECH</option>
              <option value="MCA">MCA</option>
              <option value="MBA">MBA</option>
              <option value="MSC">MSC</option>
              <option value="MTECH">MTECH</option>
            </select>

            <button type="submit">REGISTER</button>

            {/* GOOGLE REGISTER */}
            <div style={{ marginTop: "10px" }}>
              <GoogleLogin
                onSuccess={handleGoogleAuth}
                onError={() => toast.error("Google Login Failed")}
              />
            </div>
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

            <input
              type="password"
              name="password"
              placeholder="PASSWORD"
              required
              onChange={handleLoginChange}
            />

            <button type="submit">LOGIN</button>

            {/* GOOGLE LOGIN */}
            <div style={{ marginTop: "10px" }}>
              <GoogleLogin
                onSuccess={handleGoogleAuth}
                onError={() => toast.error("Google Login Failed")}
              />
            </div>
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
              <button className="ghost" onClick={switchToSignIn}>
                GO TO LOGIN
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <p>
                MNNIT-A <IoIosSchool /> se chale jaoge, but campus ko kaise bhool
                paoge
              </p>
              <button className="ghost" onClick={switchToSignUp}>
                GO TO REGISTER
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
