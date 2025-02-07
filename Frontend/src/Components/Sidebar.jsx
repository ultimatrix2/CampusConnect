import React, { useState } from "react";
import "./Sidebar.css";
import CodeforcesLeaderboard from "./CodeforcesLeaderboard";

const Sidebar = () => {
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
  };

  const handleYearClick = (year) => {
    setSelectedYear(year);
  };

  return (
    <div className="sidebar-layout">
      <div className="sidebar">
        <h2 className="sidebar-title">Courses</h2>
        <ul>
          <li onClick={() => handleCourseClick("All")}>All Courses</li>
          <li onClick={() => handleCourseClick("MCA")}>MCA</li>
          <li onClick={() => handleCourseClick("MBA")}>MBA</li>
          <li onClick={() => handleCourseClick("MTECH")}>MTech</li>
          <li onClick={() => handleCourseClick("MSC")}>MSc</li>
          <li onClick={() => handleCourseClick("BTECH")}>BTech</li>
        </ul>

        <h2 className="sidebar-title">Year</h2>
        <ul>
          <li onClick={() => handleYearClick("All")}>All Years</li>
          <li onClick={() => handleYearClick("2024")}>2024</li>
          <li onClick={() => handleYearClick("2025")}>2025</li>
          <li onClick={() => handleYearClick("2026")}>2026</li>
          <li onClick={() => handleYearClick("2027")}>2027</li>
          <li onClick={() => handleYearClick("2028")}>2028</li>
        </ul>
      </div>

      <div className="main-content">
        <div className="content-body">
          <CodeforcesLeaderboard selectedCourse={selectedCourse} selectedYear={selectedYear} />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
