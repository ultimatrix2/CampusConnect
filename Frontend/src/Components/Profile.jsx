import React, { useEffect, useState } from "react";
import "./Profile.css"; 

const UserProfileCard = () => {

  const [message, setMessage] = useState("");

  const [userData, setUserData] = useState({
    username: "",
    email: "",
    branch: "",
    year: "",
    codeforcesId: "",
    leetcodeId: "",
  });


  useEffect(() => {
    const fetchUserData = async () => {
      try {

        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5001/api/user/get-logged-user", {
          method: "GET",
          headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`  
          },
      });

        const data = (await response.json()).data;

        if(!data){
            console.error("Error fetching user data:", data);
        }

        if (response.ok) {
          setUserData((prevState) => ({
            ...prevState,
            username: data.name || "",
            email: data.email || "Not Available",
            branch: data.branch || "Not Available",
            codeforcesId: data.codeforcesUsername || "NA",
            leetcodeId: data.leetcodeUsername || "NA",
            year: data.year
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const token = localStorage.getItem("token");

    if(userData.codeforcesId !== "NA"){
      await fetch("http://localhost:5001/api/user/update-profile", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`  
        },
        body: JSON.stringify({
            codeforcesUsername: userData.codeforcesId,
            year: userData.year
        })
      });
      setMessage("Codeforces data saved successfully.");
  }
  
    if(userData.leetcodeId === "NA") return;
    await fetch("http://localhost:5001/api/user/update-leetcode", {
      method: "PUT",
      headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`  
      },
      body: JSON.stringify({
        leetcodeUsername: userData.leetcodeId,
      })
    });

    setMessage(message+" Leetcode Data updated Succesfully.");

    console.log("User Data Submitted:", userData);
  };

  return (
    <div className="card">
      <h2 className="card-title">User Profile</h2>

      <div className="form-group">
        <label>Username</label>
        <input type="text" value={userData.username} disabled className="input-field disabled" />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input type="text" value={userData.email} disabled className="input-field disabled" />
      </div>

    
      <div className="form-group">
        <label>Branch</label>
        <input type="text" value={userData.branch} disabled className="input-field disabled" />
      </div>

      <div className="form-group">
        <label>Year</label>
        <select name="year" required value={userData.year} onChange={handleChange} className="input-field">
             <option value="">Select Year</option>
             <option value="2025">2025-Batch</option>
             <option value="2026">2026-Batch</option>
             <option value="2027">2027-Batch</option>
             <option value="2028">2028-Batch</option>
         </select>
       
      </div>

      <div className="form-group">
        <label>Codeforces ID</label>
        <input type="text" name="codeforcesId" value={userData.codeforcesId} onChange={handleChange} className="input-field" />
      </div>

      <div className="form-group">
        <label>LeetCode ID</label>
        <input type="text" name="leetcodeId" value={userData.leetcodeId} onChange={handleChange} className="input-field" />
      </div>


      <div>{message}</div>
      <button onClick={handleSubmit} className="submit-button">
        Submit
      </button>
    </div>
  );
};

export default UserProfileCard;
