import { useEffect, useState } from "react";
import "./Sidebar.css";

const CodeforcesLeaderboard = ({ selectedCourse }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handles = ["tourist", "Petr", "Benq", "Radewoosh", "Um_nik","amayank18","ace01"];
  
  const courseMapping = {
    "tourist": "MCA",
    "Petr": "MBA",
    "Benq": "MTech",
    "Radewoosh": "MSc",
    "Um_nik": "BTech",
    "amayank18":"MCA",
    "ace01":"MCA"
  };

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await fetch(
          `https://codeforces.com/api/user.info?handles=${handles.join(";")}`
        );
        const data = await response.json();
        if (data.status === "OK") {
          setUsers(data.result);
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

  const filteredUsers = selectedCourse
    ? users.filter(user => courseMapping[user.handle] === selectedCourse)
    : users;

  return (
    <div className="leaderboard-container">
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Username</th>
            <th>Course</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers
            .sort((a, b) => b.rating - a.rating)
            .map((user, index) => (
              <tr key={user.handle}>
                <td id="rank">{index + 1}</td>
                <td>
                  <a
                    href={`https://codeforces.com/profile/${user.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="leaderboard-link"
                  >
                    {user.handle}
                  </a>
                </td>
                <td>{courseMapping[user.handle] || "Unknown"}</td>
                <td>{user.rating}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default CodeforcesLeaderboard;
