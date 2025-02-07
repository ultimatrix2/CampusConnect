import React, { useEffect, useState } from "react";
import "./Profile.css"; // Import the CSS file

const UserProfileCard = () => {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    branch: "",
    year: "",
    codeforcesId: "",
    leetcodeId: "",
  });

//   const years = ["First Year", "Second Year", "Third Year", "Fourth Year"];

  useEffect(() => {
    // Fetch user data from backend API
    const fetchUserData = async () => {
      try {
        const response = await fetch("https://localhost5001/api/user/get-logged-user", {
        //   credentials: "include",
        });
        const data = await response.json();
        if(!data){
            console.error("Error fetching user data:", data);
        }
        if (response.ok) {
          setUserData((prevState) => ({
            ...prevState,
            username: data.username || "",
            email: data.email || "Not Available",
            branch: data.branch || "Not Available",
          }));
        } else {
          console.error("Error fetching user data:", data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("User Data Submitted:", userData);
  };

  return (
    <div className="card">
      <h2 className="card-title">User Profile</h2>

      {/* Username (Read-only) */}
      <div className="form-group">
        <label>Username</label>
        <input type="text" value={userData.username} disabled className="input-field disabled" />
      </div>

      {/* Email (Read-only) */}
      <div className="form-group">
        <label>Email</label>
        <input type="text" value={userData.email} disabled className="input-field disabled" />
      </div>

      {/* Branch (Read-only) */}
      <div className="form-group">
        <label>Branch</label>
        <input type="text" value={userData.branch} disabled className="input-field disabled" />
      </div>

      {/* Year (Dropdown) */}
      <div className="form-group">
        <label>Year</label>
        <select name="year" value={userData.year} onChange={handleChange} className="input-field">
             <option value="">Select Year</option>
             <option value="Year">2025-Batch</option>
             <option value="Year">2026-Batch</option>
             <option value="Year">2027-Batch</option>
             <option value="Year">2028-Batch</option>
         </select>
       
      </div>

      {/* Codeforces ID (User Input) */}
      <div className="form-group">
        <label>Codeforces ID</label>
        <input type="text" name="codeforcesId" value={userData.codeforcesId} onChange={handleChange} className="input-field" />
      </div>

      {/* LeetCode ID (User Input) */}
      <div className="form-group">
        <label>LeetCode ID</label>
        <input type="text" name="leetcodeId" value={userData.leetcodeId} onChange={handleChange} className="input-field" />
      </div>

      {/* Submit Button */}
      <button onClick={handleSubmit} className="submit-button">
        Submit
      </button>
    </div>
  );
};

export default UserProfileCard;
