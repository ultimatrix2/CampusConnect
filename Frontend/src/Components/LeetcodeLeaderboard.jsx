import { useEffect, useState } from "react";
import "./Sidebar.css";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config";

const LeetcodeLeaderboard = ({ selectedCourse, selectedYear }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Unauthorized");

        const response = await fetch(
          `${API_BASE_URL}/api/users/get-all-users`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched users data:", data);

        if (!data.success) {
          throw new Error("API returned failure");
        }

        setUsers(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const filteredUsers = users.filter((user) => {
    const courseMatch =
      selectedCourse === "All" || user.branch === selectedCourse;
    const yearMatch =
      selectedYear === "All" || user.year?.toString() === selectedYear;
    return courseMatch && yearMatch;
  });

  const sortedUsers = [...filteredUsers].sort(
    (a, b) => (b.leetcodeRating || 0) - (a.leetcodeRating || 0)
  );

  return (
    <div className="leaderboard-container">

      <table className="leaderboard-table">

        <thead>
          <tr>
            <th>Rank</th>
            <th>Username</th>
            <th>Course</th>
            <th>Year</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map((user, index) => (
            <tr key={user._id}>
              <td className="rank">
                {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
              </td>
              <td>
                <Link to={`/u/${user._id}`} className="leaderboard-link">
                  {user.name}
                </Link>
              </td>
              <td>{user.branch}</td>
              <td>{user.year || "NA"}</td>
              <td>{user.leetcodeRating || "NA"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeetcodeLeaderboard;
