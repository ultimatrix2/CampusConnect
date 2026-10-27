import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Button } from "@/Components/ui/button";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Upload, Github, Linkedin, Code2, User, GraduationCap, Sparkles } from "lucide-react";
import { API_BASE_URL } from "../config";

// Predefined tags
const TAGS =
    ["DSA", "CP", "DP", "Graph", "Tree", "Greedy", "BinarySearch", "Recursion", "BitManipulation", "LeetCode", "Codeforces", "CodeChef", "GFG", "CSES", "JS", "Node", "SpringBoot", "Django", "RestAPI", "SystemDesign", "React", "MySQL", "MongoDB", "Android", "Flutter", "ML", "DL", "OpenCV", "NLP", "Docker", "CI_CD", "AWS", "CyberSecurity", "Blockchain"];

const BRANCHES = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "MCA", "MBA"];
const YEARS = ["2025", "2026", "2027", "2028", "2029"];

export function EditProfileDialog({ open, onOpenChange, profile, onProfileUpdate }) {
    const fileInputRef = React.useRef(null);
    const [formData, setFormData] = useState({
        // ... (keep existing initial state, which is fine)
        name: "",
        college: "",
        branch: "",
        year: "",
        githubLink: "",
        linkedinLink: "",
        leetcodeLink: "",
        codeforcesLink: "",
        skills: []
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || "",
                college: profile.college || "",
                branch: profile.branch || "",
                year: profile.year ? String(profile.year) : "",
                githubLink: profile.github || "",
                linkedinLink: profile.linkedin || "",
                leetcodeLink: profile.leetcodeUsername || "",
                codeforcesLink: profile.codeforcesUsername || "",
                skills: profile.skills || []
            });
        }
    }, [profile, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleTag = (tag) => {
        setFormData(prev => {
            const skills = prev.skills.includes(tag)
                ? prev.skills.filter(s => s !== tag)
                : [...prev.skills, tag];
            return { ...prev, skills };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const fd = new FormData();

            // Append text fields
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'skills') {
                    fd.append(key, value.join(','));
                } else {
                    fd.append(key, value);
                }
            });

            // Use ref to get the file
            if (fileInputRef.current && fileInputRef.current.files[0]) {
                fd.append("profileImage", fileInputRef.current.files[0]);
            }

            const resumeInput = document.getElementById('resume-input');
            if (resumeInput && resumeInput.files[0]) {
                fd.append("resume", resumeInput.files[0]);
            }

            const res = await fetch(`${API_BASE_URL}/api/users/update-profile`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });

            if (res.ok) {
                onProfileUpdate();
                onOpenChange(false);
            } else {
                console.error("Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setLoading(false);
        }
    };

    // ... (render return)


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[750px] max-h-[90vh] !bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 !border-slate-700/50 !text-white overflow-hidden shadow-2xl shadow-violet-900/20 backdrop-blur-xl">
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-blue-600/5 pointer-events-none"></div>

                <DialogHeader className="relative z-10 space-y-3 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 shadow-lg shadow-violet-500/25">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                            Edit Profile
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-slate-400 text-sm">
                        Update your information and showcase your skills to the community.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="relative z-10 grid grid-cols-1 gap-6 py-2 overflow-y-auto max-h-[calc(90vh-200px)] px-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">

                    {/* Personal Info Section */}
                    <div className="space-y-4 p-5 rounded-xl bg-blue-950/80 border border-teal-800/30 backdrop-blur-sm hover:border-teal-700/50 transition-all duration-300">
                        <div className="flex items-center gap-2 mb-4">
                            <User className="w-5 h-5 text-violet-400" />
                            <h3 className="text-lg font-semibold text-slate-100">Personal Information</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-slate-300 text-sm font-medium">Full Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="bg-slate-900/80 border-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-white placeholder:text-slate-500 transition-all duration-200"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="college" className="text-slate-300 text-sm font-medium">College</Label>
                                <Input
                                    id="college"
                                    name="college"
                                    value={formData.college}
                                    onChange={handleChange}
                                    className="bg-slate-900/80 border-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-white placeholder:text-slate-500 transition-all duration-200"
                                    placeholder="University Name"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300 text-sm font-medium flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4" />
                                    Branch
                                </Label>
                                <Select value={formData.branch} onValueChange={(val) => handleSelectChange("branch", val)}>
                                    <SelectTrigger className="bg-slate-900/80 border-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-white">
                                        <SelectValue placeholder="Select Branch" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-700 text-white">
                                        <SelectGroup>
                                            <SelectLabel className="text-slate-400">Academic Branches</SelectLabel>
                                            {BRANCHES.map(b => (
                                                <SelectItem
                                                    key={b}
                                                    value={b}
                                                    className="focus:bg-violet-600/20 focus:text-white cursor-pointer hover:bg-slate-800 transition-colors"
                                                >
                                                    {b}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300 text-sm font-medium">Graduation Year</Label>
                                <Select value={formData.year} onValueChange={(val) => handleSelectChange("year", val)}>
                                    <SelectTrigger className="bg-slate-900/80 border-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-white">
                                        <SelectValue placeholder="Select Year" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-700 text-white">
                                        <SelectGroup>
                                            <SelectLabel className="text-slate-400">Year</SelectLabel>
                                            {YEARS.map(y => (
                                                <SelectItem
                                                    key={y}
                                                    value={y}
                                                    className="focus:bg-violet-600/20 focus:text-white cursor-pointer hover:bg-slate-800 transition-colors"
                                                >
                                                    {y}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="profile-image-input" className="text-slate-300 text-sm font-medium flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                Profile Image
                            </Label>
                            <Input
                                id="profile-image-input"
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-violet-600 file:text-white hover:file:bg-violet-700 file:cursor-pointer file:transition-all bg-slate-900/80 border-slate-600 text-slate-400"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="resume-input" className="text-slate-300 text-sm font-medium flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                Resume
                            </Label>
                            <Input
                                id="resume-input"
                                type="file"
                                accept="image/*"
                                className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-violet-600 file:text-white hover:file:bg-violet-700 file:cursor-pointer file:transition-all bg-slate-900/80 border-slate-600 text-slate-400"
                            />
                        </div>
                    </div>

                    {/* Social Links Section */}
                    <div className="space-y-4 p-5 rounded-xl bg-blue-950/80 border border-teal-800/30 backdrop-blur-sm hover:border-teal-700/50 transition-all duration-300">
                        <div className="flex items-center gap-2 mb-4">
                            <Github className="w-5 h-5 text-blue-400" />
                            <h3 className="text-lg font-semibold text-slate-100">Social Profiles</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="githubLink" className="text-slate-300 text-sm font-medium flex items-center gap-2">
                                    <Github className="w-4 h-4" />
                                    GitHub
                                </Label>
                                <Input
                                    id="githubLink"
                                    name="githubLink"
                                    value={formData.githubLink}
                                    onChange={handleChange}
                                    placeholder="https://github.com/username"
                                    className="bg-slate-900/80 border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white placeholder:text-slate-500 transition-all duration-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="linkedinLink" className="text-slate-300 text-sm font-medium flex items-center gap-2">
                                    <Linkedin className="w-4 h-4" />
                                    LinkedIn
                                </Label>
                                <Input
                                    id="linkedinLink"
                                    name="linkedinLink"
                                    value={formData.linkedinLink}
                                    onChange={handleChange}
                                    placeholder="https://linkedin.com/in/username"
                                    className="bg-slate-900/80 border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white placeholder:text-slate-500 transition-all duration-200"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Coding Handles Section */}
                    <div className="space-y-4 p-5 rounded-xl bg-blue-950/80 border border-teal-800/30 backdrop-blur-sm hover:border-teal-700/50 transition-all duration-300">
                        <div className="flex items-center gap-2 mb-4">
                            <Code2 className="w-5 h-5 text-emerald-400" />
                            <h3 className="text-lg font-semibold text-slate-100">Coding Platforms</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="codeforcesLink" className="text-slate-300 text-sm font-medium">Codeforces Handle</Label>
                                <Input
                                    id="codeforcesLink"
                                    name="codeforcesLink"
                                    value={formData.codeforcesLink}
                                    onChange={handleChange}
                                    placeholder="username"
                                    className="bg-slate-900/80 border-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-white placeholder:text-slate-500 transition-all duration-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="leetcodeLink" className="text-slate-300 text-sm font-medium">LeetCode Handle</Label>
                                <Input
                                    id="leetcodeLink"
                                    name="leetcodeLink"
                                    value={formData.leetcodeLink}
                                    onChange={handleChange}
                                    placeholder="username"
                                    className="bg-slate-900/80 border-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-white placeholder:text-slate-500 transition-all duration-200"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Skills Section */}
                    <div className="space-y-4 p-5 rounded-xl bg-blue-950/80 border border-teal-800/30 backdrop-blur-sm hover:border-teal-700/50 transition-all duration-300">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-yellow-400" />
                            <h3 className="text-lg font-semibold text-slate-100">Interests & Skills</h3>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">Select areas you're interested in or have experience with</p>
                        <div className="flex flex-wrap gap-2.5">
                            {TAGS.map(tag => {
                                const isSelected = formData.skills.includes(tag);
                                return (
                                    <button
                                        type="button"
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${isSelected
                                            ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/30 ring-2 ring-violet-400/50 hover:shadow-violet-500/50"
                                            : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700 hover:border-slate-600"
                                            }`}
                                    >
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>
                        {formData.skills.length > 0 && (
                            <div className="mt-4 p-3 rounded-lg bg-violet-600/10 border border-violet-500/20">
                                <p className="text-sm text-violet-300">
                                    <span className="font-semibold">{formData.skills.length}</span> skill{formData.skills.length !== 1 ? 's' : ''} selected
                                </p>
                            </div>
                        )}
                    </div>
                </form>

                <DialogFooter className="relative z-10 border-t border-slate-700/50 pt-5 gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-500 transition-all duration-200"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="animate-spin">⏳</span>
                                Saving...
                            </span>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
