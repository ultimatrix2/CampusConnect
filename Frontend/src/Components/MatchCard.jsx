import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/Components/ui/avatar";
import { Button } from "@/Components/ui/button";
import { MessageSquare, UserPlus, TrendingUp, Code2, Check, Clock } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const MatchCard = ({ user }) => {
    const navigate = useNavigate();
    const [status, setStatus] = useState(user.connectionStatus || 'none'); // none, pending, connected
    const [loading, setLoading] = useState(false);

    const handleConnect = async (e) => {
        e.stopPropagation();
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5001/api/connections/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ receiverId: user.id || user._id })
            });
            const data = await res.json();

            if (data.success) {
                setStatus('pending');
                toast.success("Connection request sent!");
            } else {
                toast.error(data.message || "Failed to send request");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error sending request");
        } finally {
            setLoading(false);
        }
    };

    // Use default cartoon avatar if no profile pic
    const avatarSrc = user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`;

    return (
        <div
            className="group relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-violet-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10 cursor-pointer"
            onClick={() => window.open(`/u/${user.id || user._id}`, '_blank')}
        >
            {/* Header Background */}
            <div className="h-24 bg-gradient-to-r from-violet-600/20 to-purple-600/20 group-hover:from-violet-600/30 group-hover:to-purple-600/30 transition-all" />

            <div className="p-5 -mt-10 relative">
                {/* Profile Picture */}
                <div className="flex justify-between items-end mb-4">
                    <Avatar className="h-20 w-20 border-4 border-slate-900 shadow-xl bg-slate-800">
                        <AvatarImage src={avatarSrc} alt={user.name} />
                        <AvatarFallback className="bg-slate-800 text-slate-200">
                            {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                    </Avatar>

                    {/* Compatibility Score */}
                    <div className="flex flex-col items-center bg-slate-800/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-700">
                        <span className="text-xs text-slate-400">Match</span>
                        <span className="text-lg font-bold text-emerald-400">{user.matchPercentage}%</span>
                    </div>
                </div>

                {/* User Info */}
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-white group-hover:text-violet-400 transition-colors">
                        {user.name}
                    </h3>
                    <p className="text-slate-400 text-sm">{user.role || "Software Engineer"}</p>
                </div>

                {/* Ratings */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50 flex items-center gap-2">
                        <Code2 className="h-4 w-4 text-orange-400" />
                        <div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-wider">LeetCode</div>
                            <div className="text-sm font-semibold text-slate-200">{user.leetcodeRating || "N/A"}</div>
                        </div>
                    </div>
                    <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-400" />
                        <div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Codeforces</div>
                            <div className="text-sm font-semibold text-slate-200">{user.codeforcesRating || "N/A"}</div>
                        </div>
                    </div>
                </div>

                {/* Skills */}
                <div className="mb-4">
                    <div className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Matched Skills</div>
                    <div className="flex flex-wrap gap-1.5">
                        {user.skills.slice(0, 3).map((skill, index) => (
                            <span
                                key={index}
                                className="text-xs px-2 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20"
                            >
                                {skill}
                            </span>
                        ))}
                        {user.skills.length > 3 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                                +{user.skills.length - 3}
                            </span>
                        )}
                    </div>
                </div>

                {/* Extra Strengths */}
                {user.strengths && user.strengths.length > 0 && (
                    <div className="mb-6">
                        <div className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Strengths</div>
                        <div className="flex flex-wrap gap-1.5">
                            {user.strengths.slice(0, 2).map((strength, index) => (
                                <span
                                    key={index}
                                    className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                                >
                                    {strength}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                    {status === 'pending' ? (
                        <Button
                            className="flex-1 bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:border-violet-500/30 transition-all"
                            onClick={handleConnect}
                            disabled={loading}
                        >
                            <Clock className="h-4 w-4 mr-2" />
                            Pending
                        </Button>
                    ) : status === 'accepted' || status === 'connected' ? (
                        <Button className="flex-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default">
                            <Check className="h-4 w-4 mr-2" />
                            Connected
                        </Button>
                    ) : (
                        <Button
                            className="flex-1 bg-white text-slate-900 hover:bg-slate-200"
                            onClick={handleConnect}
                            disabled={loading}
                        >
                            {loading ? <Clock className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                            Connect
                        </Button>
                    )}

                    <Button
                        variant="secondary"
                        size="icon"
                        className="bg-slate-800 text-white hover:bg-slate-700 border border-slate-700"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate('/chat');
                        }}
                    >
                        <MessageSquare className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default MatchCard;
