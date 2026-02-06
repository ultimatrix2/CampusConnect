import React from 'react';

const RatingBadge = ({ rating, platform }) => {
    if (!rating) return null;

    let color = "bg-gray-500";
    let title = "Newbie";

    if (platform === "Codeforces") {
        if (rating >= 2400) { color = "bg-red-600"; title = "Grandmaster"; }
        else if (rating >= 2100) { color = "bg-orange-500"; title = "Master"; }
        else if (rating >= 1900) { color = "bg-purple-500"; title = "Candidate Master"; }
        else if (rating >= 1600) { color = "bg-blue-500"; title = "Expert"; }
        else if (rating >= 1400) { color = "bg-cyan-500"; title = "Specialist"; }
        else if (rating >= 1200) { color = "bg-green-500"; title = "Pupil"; }
    } else {
        // LeetCode
        if (rating >= 2200) { color = "bg-red-600"; title = "Guardian"; }
        else if (rating >= 1850) { color = "bg-orange-500"; title = "Knight"; }
        else { color = "bg-green-500"; title = "Member"; }
    }

    return (
        <span className={`${color} text-white text-[10px] px-1.5 py-0.5 rounded ml-2 font-semibold uppercase tracking-wider`}>
            {title}
        </span>
    );
};

export default RatingBadge;
