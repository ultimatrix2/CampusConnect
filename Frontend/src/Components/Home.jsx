import React, { useState } from "react";
import { DashboardLayout } from "@/Components/DashboardLayout";
import { Button } from "@/Components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import CodeforcesLeaderboard from "./CodeforcesLeaderboard";
import LeetcodeLeaderboard from "./LeetcodeLeaderboard";

const courses = ["All", "MCA", "MBA", "MTECH", "MSC", "BTECH"];
const years = ["All", "2024", "2025", "2026", "2027", "2028"];

export default function Home() {
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedPlatform, setSelectedPlatform] = useState("codeforces");

  // Header content with filters
  const headerContent = (
    <div className="flex items-center gap-3 flex-1 justify-end">
      {/* Year Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:text-white hover:border-slate-500"
          >
            <span className="text-slate-400">Year:</span>
            <span className="font-semibold text-cyan-400">{selectedYear}</span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-slate-800 border-slate-600">
          {years.map((year) => (
            <DropdownMenuItem
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`text-white hover:bg-slate-700 hover:text-white cursor-pointer ${selectedYear === year ? "bg-cyan-600" : ""}`}
            >
              {year === "All" ? "All Years" : year}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Course Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:text-white hover:border-slate-500"
          >
            <span className="text-slate-400">Course:</span>
            <span className="font-semibold text-purple-400">{selectedCourse}</span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-slate-800 border-slate-600">
          {courses.map((course) => (
            <DropdownMenuItem
              key={course}
              onClick={() => setSelectedCourse(course)}
              className={`text-white hover:bg-slate-700 hover:text-white cursor-pointer ${selectedCourse === course ? "bg-purple-600" : ""}`}
            >
              {course === "All" ? "All Courses" : course}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Platform Toggle */}
      <div className="flex gap-1 p-1 bg-slate-800 rounded-lg border border-slate-600">
        <button
          onClick={() => setSelectedPlatform("codeforces")}
          className={`px-4 py-2 rounded-md font-semibold text-sm transition-all ${selectedPlatform === "codeforces"
            ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
            : "text-slate-400 hover:text-white hover:bg-slate-700"
            }`}
        >
          Codeforces
        </button>
        <button
          onClick={() => setSelectedPlatform("leetcode")}
          className={`px-4 py-2 rounded-md font-semibold text-sm transition-all ${selectedPlatform === "leetcode"
            ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 shadow-lg"
            : "text-slate-400 hover:text-white hover:bg-slate-700"
            }`}
        >
          LeetCode
        </button>
      </div>
    </div>
  );

  return (
    <DashboardLayout
      headerContent={headerContent}
      title={`${selectedPlatform === "codeforces" ? " Codeforces" : " LeetCode"} Leaderboard`}
    >
      {/* Leaderboard */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/80 overflow-hidden shadow-2xl">
        {selectedPlatform === "codeforces" ? (
          <CodeforcesLeaderboard
            selectedCourse={selectedCourse}
            selectedYear={selectedYear}
          />
        ) : (
          <LeetcodeLeaderboard
            selectedCourse={selectedCourse}
            selectedYear={selectedYear}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
