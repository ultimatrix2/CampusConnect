import { useEffect, useState } from "react";
import "./Sidebar.css";

const CodeforcesLeaderboard = ({ selectedCourse, selectedYear }) => {
  console.log("Selected Filters:", selectedCourse, selectedYear);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch("http://localhost:5001/api/user/get-all-users", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          setUsers(data.data);
        } else {
          throw new Error("Failed to fetch data");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  console.log("All Users:", users);

  const filteredUsers = users.filter((user) => {
    const courseMatch = selectedCourse === "All" || user.branch === selectedCourse;
    const yearMatch = selectedYear === "All" || user.year?.toString() === selectedYear;
    return courseMatch && yearMatch;
  });

  console.log("Filtered Users:", filteredUsers);

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
          {filteredUsers
            .sort((a, b) => b.codeforcesRating - a.codeforcesRating)
            .map((user, index) => (
              <tr key={user._id}>
                <td id="rank">{index + 1}</td>
                <td>
                  <a
                    href={`https://codeforces.com/profile/${user.codeforcesUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="leaderboard-link"
                  >
                    {user.name}
                  </a>
                </td>
                <td>{user.branch}</td>
                <td>{user.year || "NA"}</td>
                <td>{user.codeforcesRating || "NA"}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default CodeforcesLeaderboard;
