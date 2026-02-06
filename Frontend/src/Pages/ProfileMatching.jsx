import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../Components/DashboardLayout';
import MatchCard from '../Components/MatchCard';
import { Search, Filter, Loader2, AlertCircle } from 'lucide-react';
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";

const ProfileMatching = () => {
    const [loading, setLoading] = useState(true);
    const [matches, setMatches] = useState([]);
    const [debugInfo, setDebugInfo] = useState(null);
    const [error, setError] = useState(null);

    const fetchMatches = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await fetch("http://localhost:5001/api/matches/find-matches", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                // Map the backend data to match the MatchCard props structure if needed
                // Backend returns: _id, name, avatar, role, skills, matches...
                // MatchCard expects: id, name, avatar, role, skills...
                const formattedMatches = data.matches.map(m => ({
                    id: m._id,
                    name: m.name,
                    avatar: m.avatar,
                    role: m.role,
                    skills: m.skills,
                    strengths: m.strengths || [],
                    leetcodeRating: m.leetcodeRating,
                    codeforcesRating: m.codeforcesRating,
                    matchPercentage: m.matchPercentage,
                    connectionStatus: m.connectionStatus
                }));
                setMatches(formattedMatches);
                setDebugInfo(data.debug);
            } else {
                setError(data.message || "Failed to find matches");
            }

        } catch (err) {
            console.error("Match fetch error:", err);
            setError("Server error while fetching matches");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatches();
    }, []);

    return (
        <DashboardLayout
            title="Profile Matching"
            subtitle="Connect with peers who complement your skills and goals."
            headerContent={
                <div className="flex items-center gap-3 w-full max-w-md ml-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Search by name, skill, or role..."
                            className="pl-9 bg-slate-950 border-slate-800 focus:ring-violet-500/20"
                        />
                    </div>
                    <Button variant="outline" className="border-slate-800 hover:bg-slate-800 text-slate-400">
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                    </Button>
                </div>
            }
        >
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                    <Loader2 className="h-10 w-10 animate-spin mb-4 text-violet-500" />
                    <p>Analyzing profiles...</p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center h-64 text-red-400">
                    <AlertCircle className="h-10 w-10 mb-4" />
                    <p>{error}</p>
                    <Button onClick={fetchMatches} variant="outline" className="mt-4 border-red-900/50 hover:bg-red-900/20">
                        Retry
                    </Button>
                </div>
            ) : (
                <>
                    {debugInfo && (
                        <div className="mb-4 text-slate-400 text-sm">
                            Found {matches.length} matches from {debugInfo.totalChecked} profiles.
                            (Your CF: {debugInfo.userCF}, LC: {debugInfo.userLC})
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {matches.map((user) => (
                            <MatchCard key={user.id} user={user} />
                        ))}
                    </div>

                    {matches.length === 0 && (
                        <div className="text-center py-20 text-slate-500">
                            <div>No matches found meeting the +100 rating criteria.</div>
                            <div className="text-xs mt-2">Try improving your rating or adding more skills!</div>
                        </div>
                    )}
                </>
            )}
        </DashboardLayout>
    );
};

export default ProfileMatching;
