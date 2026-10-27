import { useEffect, useState } from "react";
import { DashboardLayout } from "@/Components/DashboardLayout";
import { EditProfileDialog } from "@/Components/EditProfileDialog";
import { ProfileInfo } from "@/Components/ProfileInfo";
import { API_BASE_URL } from "../config";

export default function Profile() {
  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [leetcode, setLeetcode] = useState(null);
  const [codeforces, setCodeforces] = useState(null);

  /* ================= FETCH PROFILE ================= */
  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProfile(data.data);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  /* ================= FETCH CODING DATA ================= */
  /* ================= FETCH COMPLETED ================= */
  const fetchCodingData = async () => {
    console.log("🔄 Starting Coding Data Fetch...");

    // LeetCode
    try {
      console.log("➡️ Fetching LeetCode...");
      const lcRes = await fetch(`${API_BASE_URL}/api/users/leetcode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const lcData = await lcRes.json();
      console.log("✅ LeetCode Response:", lcData);
      if (lcData.success) setLeetcode(lcData.data);
      else console.warn("⚠️ LeetCode failed:", lcData.message);
    } catch (err) {
      console.error("❌ LeetCode Fetch Error:", err);
    }

    // Codeforces
    try {
      console.log("➡️ Fetching Codeforces...");
      const cfRes = await fetch(`${API_BASE_URL}/api/codeforces/getCodeforcesData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const cfData = await cfRes.json();
      console.log("✅ Codeforces Response:", cfData);
      if (cfData.success) setCodeforces(cfData.data);
      else console.warn("⚠️ Codeforces failed:", cfData.message);
    } catch (err) {
      console.error("❌ Codeforces Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchCodingData();
  }, []);

  if (!profile) {
    return (
      <DashboardLayout title="👤 My Profile" subtitle="Manage your profile and coding stats">
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-400 text-lg">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Header content with Edit button
  const headerContent = (
    <div className="flex items-center gap-3 flex-1 justify-end">
      <button
        onClick={fetchCodingData}
        className="px-4 py-2 rounded-lg font-semibold text-sm transition-all bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 hover:border-slate-600"
      >
        Refresh Stats
      </button>
      <button
        onClick={() => setEditMode(true)}
        className="px-4 py-2 rounded-lg font-semibold text-sm transition-all bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 border border-transparent hover:border-violet-400 shadow-lg shadow-violet-500/20"
      >
        Edit Profile
      </button>
    </div>
  );

  return (
    <DashboardLayout
      headerContent={headerContent}
    >
      <div className="space-y-8">

        {/* VIEW COMPONENT */}
        <ProfileInfo
          profile={profile}
          leetcode={leetcode}
          codeforces={codeforces}
        />

        {/* EDIT COMPONENT (DIALOG) */}
        <EditProfileDialog
          open={editMode}
          onOpenChange={setEditMode}
          profile={profile}
          onProfileUpdate={fetchProfile}
        />
      </div>
    </DashboardLayout>
  );
}
