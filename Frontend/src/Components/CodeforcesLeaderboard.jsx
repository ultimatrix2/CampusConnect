import { useEffect, useState } from "react";
import "./Sidebar.css";
import { Link } from "react-router-dom";

const CodeforcesLeaderboard = ({ selectedCourse }) => {

  console.log(selectedCourse);

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
                "Authorization": `Bearer ${token}`  // Include the token in Authorization header
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
  }, [selectedCourse]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;


  console.log(users)

  const filteredUsers = selectedCourse
  ? users.filter(user => {
    return user.branch == selectedCourse
  })
  : users;

  console.log(filteredUsers)
  
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
            .sort((a, b) => b.codeforcesRating - a.codeforcesRating)
            .map((user, index) => (
              <tr key={user._id}>
                <td id="rank">{index + 1}</td>
                <td>
                  <Link
                  to={`/u/${user._id}`}
                    rel="noopener noreferrer"
                    className="leaderboard-link"
                  >
                    {user.name}
                  </Link>
                </td>
                <td>{user.branch}</td>
                <td>{user.codeforcesRating || "NA"}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default CodeforcesLeaderboard;
