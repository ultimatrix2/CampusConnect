import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./OtherProfile.css"; 

function OtherProfile() {
    const { id } = useParams();
    const [leetcodeData, setLeetcodeData] = useState(null);
    const [codeforcesData, setCodeforcesData] = useState(null);

    useEffect(() => {
        const fetchData = async (url, setter) => {
            try {
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ id }),
                });

                if (!response.ok) throw new Error("Failed to fetch data");

                const data = await response.json();
                setter(data.data || null); 
            } catch (error) {
                console.error("Error fetching data:", error);
                setter(null);
            }
        };

        fetchData("http://localhost:5001/api/user/leetcode", setLeetcodeData);
        fetchData("http://localhost:5001/api/codeforces/getCodeforcesData", setCodeforcesData);
    }, [id]);

    return (
        <div>
            <h1 >Coding Profile</h1>    
        <div className="profile-container">
            

            {/* LeetCode Section */}
            {leetcodeData ? (
                <div className="platform-card leetcode">
                    <h2>LeetCode Profile</h2>
                    <p><strong>Username:</strong> {leetcodeData.handler || "N/A"}</p>
                    <p><strong>Rank:</strong> {leetcodeData.rank || "N/A"}</p>
                    <p><strong>Rating:</strong> {leetcodeData.rating ? leetcodeData.rating.toFixed(2) : "N/A"}</p>
                    <p><strong>Streak:</strong> {leetcodeData.streak || "N/A"} days</p>
                    <p><strong>Languages Used:</strong> {leetcodeData.languagesUsed?.join(", ") || "N/A"}</p>
                    <p><a href={leetcodeData.profileLink} target="_blank" rel="noopener noreferrer">View Profile</a></p>

                    <h3>Submissions:</h3>
                    <ul>
                        {leetcodeData.submissionCount?.map((item, index) => (
                            <li key={index}>
                                <strong>{item.difficulty}:</strong> {item.count} problems solved
                            </li>
                        )) || <p>No submission data available</p>}
                    </ul>
                </div>
            ) : (
                <p>LeetCode data not available.</p>
            )}

            {/* Codeforces Section */}
            {codeforcesData ? (
                <div className="platform-card codeforces">
                    <h2>Codeforces Profile</h2>
                    <p><strong>Username:</strong> {codeforcesData.handler || "N/A"}</p>
                    <p><strong>Rank:</strong> {codeforcesData.rank || "N/A"}</p>
                    <p><strong>Title:</strong> {codeforcesData.title || "N/A"}</p>
                    <p><strong>Streak:</strong> {codeforcesData.streak || "N/A"} days</p>
                    <p><a href={codeforcesData.profileLink} target="_blank" rel="noopener noreferrer">View Profile</a></p>

                    <h3>Submissions:</h3>
                    <ul>
                        {codeforcesData.submissionCount?.map((item, index) => (
                            <li key={index}>
                                <strong>{item.difficulty}:</strong> {item.count} problems solved
                            </li>
                        )) || <p>No submission data available</p>}
                    </ul>
                </div>
            ) : (
                <p>Codeforces data not available.</p>
            )}
        </div>
        </div>
    );
}

export default OtherProfile;
