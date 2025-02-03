import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = () => {
  const [selectedCourse, setSelectedCourse] = useState(null); 

  //Dummy data for leaderboard
  const leaderboardData = {
    MCA: [
      { name: "John Doe", rank: 1, score: 95 },
      { name: "Jane Smith", rank: 2, score: 90 },
      { name: "Sam Wilson", rank: 3, score: 85 },
    ],
    MBA: [
      { name: "Alice Brown", rank: 1, score: 98 },
      { name: "Bob Lee", rank: 2, score: 92 },
      { name: "Charlie White", rank: 3, score: 88 },
    ],
    MTech: [
      { name: "Tom Green", rank: 1, score: 93 },
      { name: "Lisa Adams", rank: 2, score: 89 },
      { name: "Eve Cooper", rank: 3, score: 84 },
    ],
    MSc: [
      { name: "Jake Daniels", rank: 1, score: 97 },
      { name: "Sophia Clark", rank: 2, score: 91 },
      { name: "Mia Harris", rank: 3, score: 86 },
    ],
    BTech: [
      { name: "Luke Scott", rank: 1, score: 96 },
      { name: "Mason Thomas", rank: 2, score: 90 },
      { name: "Ella Miller", rank: 3, score: 85 },
    ],
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
  };

  return (
    <div>
      <div className="sidebar">
        <h2 className="sidebar-title">Courses</h2>
        <ul>
          <li onClick={() => handleCourseClick('MCA')}>Course: MCA</li>
          <li onClick={() => handleCourseClick('MBA')}>Course: MBA</li>
          <li onClick={() => handleCourseClick('MTech')}>Course: MTech</li>
          <li onClick={() => handleCourseClick('MSc')}>Course: MSc</li>
          <li onClick={() => handleCourseClick('BTech')}>Course: BTech</li>
        </ul>
      </div>

      <div className="main-content">
        <div className="content-header">
          {!selectedCourse && <h1>Welcome to the Campus</h1>} 
        </div>
        <div className="content-body">
          {selectedCourse ? (
            <div>
              <h2>Leaderboard: {selectedCourse}</h2>
              <ul>
                {leaderboardData[selectedCourse].map((student) => (
                  <li key={student.rank}>
                    <strong>Rank {student.rank}</strong> - {student.name} - Score: {student.score}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>Please select a course from the sidebar to view the leaderboard.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;