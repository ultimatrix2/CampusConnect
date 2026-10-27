import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/Components/DashboardLayout";
import { ProfileInfo } from "@/Components/ProfileInfo";
import { Loader2 } from "lucide-react";
import { API_BASE_URL } from "../config";

function OtherProfile() {
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [leetcode, setLeetcode] = useState(null);
  const [codeforces, setCodeforces] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const token = localStorage.getItem("token");

    const fetchAll = async () => {
      setLoading(true);
      try {
        // 1. Fetch User Profile (using get-all-users approach as before)
        const usersRes = await fetch(`${API_BASE_URL}/api/users/get-all-users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const usersData = await usersRes.json();
        const foundUser = usersData.data?.find((u) => u._id === id);

        if (!foundUser) throw new Error("User not found");
        setProfile(foundUser);

        // 2. Fetch LeetCode
        try {
          const lcRes = await fetch(`${API_BASE_URL}/api/users/leetcode`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ id }),
          });
          const lcData = await lcRes.json();
          setLeetcode(lcData.data);
        } catch (e) {
          console.warn("LeetCode fetch failed", e);
        }

        // 3. Fetch Codeforces
        try {
          const cfRes = await fetch(`${API_BASE_URL}/api/codeforces/getCodeforcesData`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ id }),
          });
          const cfData = await cfRes.json();
          setCodeforces(cfData.data);
        } catch (e) {
          console.warn("Codeforces fetch failed", e);
        }

      } catch (err) {
        console.error(err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout title="User Profile" subtitle="Loading profile...">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !profile) {
    return (
      <DashboardLayout title="User Profile" subtitle="User not found">
        <div className="text-center text-red-400 mt-10 text-xl font-semibold">
          {error || "User not found"}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout >
      <ProfileInfo
        profile={profile}
        leetcode={leetcode}
        codeforces={codeforces}
      />
    </DashboardLayout>
  );
}

export default OtherProfile;
