import React, { useState } from "react";
import "./Sidebar.css";
import CodeforcesLeaderboard from "./CodeforcesLeaderboard";

const Sidebar = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
  };

  return (
    <div className="sidebar-layout">
      <div className="sidebar">
        <h2 className="sidebar-title">Courses</h2>
        <ul>
          <li onClick={() => handleCourseClick("MCA")}> MCA</li>
          <li onClick={() => handleCourseClick("MBA")}> MBA</li>
          <li onClick={() => handleCourseClick("MTech")}> MTech</li>
          <li onClick={() => handleCourseClick("MSc")}> MSc</li>
          <li onClick={() => handleCourseClick("BTech")}> BTech</li>
        </ul>
      </div>

      <div className="main-content">
        <div className="content-body">
        <CodeforcesLeaderboard selectedCourse={selectedCourse} />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;