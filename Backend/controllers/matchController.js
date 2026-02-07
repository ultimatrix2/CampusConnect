const User = require("../models/User");

// --- Helper Functions in Controller ---

/**
 * Step 1 & 2: Calculate Cosine Similarity for Tags
 */
const calculateTagSimilarity = (userTags, mentorTags) => {
    if (!userTags || !mentorTags) return 0;
    // Normalize to lower case for comparison
    const uTags = userTags.map(t => t.toLowerCase());
    const mTags = mentorTags.map(t => t.toLowerCase());

    const allTags = Array.from(new Set([...uTags, ...mTags]));

    const v1 = allTags.map(tag => uTags.includes(tag) ? 1 : 0);
    const v2 = allTags.map(tag => mTags.includes(tag) ? 1 : 0);

    const dotProduct = v1.reduce((acc, curr, i) => acc + curr * v2[i], 0);

    const mag1 = Math.sqrt(v1.reduce((acc, curr) => acc + curr * curr, 0));
    const mag2 = Math.sqrt(v2.reduce((acc, curr) => acc + curr * curr, 0));

    if (mag1 === 0 || mag2 === 0) return 0;

    return dotProduct / (mag1 * mag2);
};

exports.findMatches = async (req, res) => {
    try {
        const userId = req.user._id; // From authMiddleware

        // 1. Fetch Current User
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // 2. Fetch Potential Mentors (Filtering out current user)
        // Optimization: In a real app, query only those who MIGHT match (e.g. have better rating)
        // to avoid fetching the whole DB.
        // For now, fetch all other users but selecting only necessary fields.
        const users = await User.find({ _id: { $ne: userId } })
            .select("name email profileImage skills leetcodeRating codeforcesRating branch");

        // 2b. Fetch existing connection requests for this user
        // We need to know if we already requested or are connected
        const ConnectionRequest = require("../models/ConnectionRequest");
        const myRequests = await ConnectionRequest.find({
            $or: [{ sender: userId }, { receiver: userId }]
        });

        const statusMap = new Map();
        myRequests.forEach(req => {
            const otherId = req.sender.toString() === userId.toString() ? req.receiver.toString() : req.sender.toString();
            // If already connected/accepted, status is 'connected'
            // If pending and I sent it, status is 'pending'
            // If pending and they sent it, status is 'pending' (or 'received' if we want to distinguish)
            // If rejected, we want to allow sending again, so we can map it to 'none' or 'rejected'.
            // For UI simplicity:
            // 'rejected' -> 'none' (so button says "Connect" again)

            if (req.status === 'rejected') {
                statusMap.set(otherId, 'none');
            } else {
                statusMap.set(otherId, req.status);
            }
        });

        // 3. Run Matching Algorithm
        const matches = users.map(mentor => {
            // Initial Data Prep
            const userTags = currentUser.skills || [];
            const mentorTags = mentor.skills || [];
            const mentorCF = mentor.codeforcesRating || 0;
            const mentorLC = mentor.leetcodeRating || 0;
            const userCF = currentUser.codeforcesRating || 0;
            const userLC = currentUser.leetcodeRating || 0;

            // Step 2b: Weak Match Filter (Tag Similarity)
            const tagSimilarity = calculateTagSimilarity(userTags, mentorTags);
            if (tagSimilarity < 0.25) {
                // Return null to allow concise filtering later
                return null;
            }

            // Step 3: Hard Filter (Rating Threshold: +100)
            const cfDiff = mentorCF - userCF;
            const lcDiff = mentorLC - userLC;

            if (cfDiff < 100 && lcDiff < 100) {
                return null; // Reject
            }

            // Step 4: Supporting Scores
            const maxGap = 500;
            const avgGap = (Math.max(0, cfDiff) + Math.max(0, lcDiff)) / 2;
            const ratingScore = Math.min(avgGap / maxGap, 1);

            // Depth Score -> Overlap / user_tags
            const overlap = userTags.filter(t => mentorTags.some(mt => mt.toLowerCase() === t.toLowerCase())).length;
            const depthScore = userTags.length > 0 ? overlap / userTags.length : 0;

            // Domain Match - Assuming 'branch' is a proxy for domain if explicit domain field missing
            const domainMatch = (currentUser.branch && mentor.branch && currentUser.branch === mentor.branch) ? 1 : 0;

            // Gap Penalty (if gap > 1000)
            const gapTerm = Math.max(cfDiff, lcDiff) > 1000 ? 0 : 1;

            // Step 5: Final Score
            const finalScore =
                (0.45 * tagSimilarity) +
                (0.25 * ratingScore) +
                (0.15 * depthScore) +
                (0.10 * domainMatch) +
                (0.05 * gapTerm);

            // Extra Strengths (Skills mentor has that user doesn't)
            const extraSkills = mentorTags.filter(t => !userTags.some(ut => ut.toLowerCase() === t.toLowerCase()));

            return {
                _id: mentor._id,
                name: mentor.name,
                avatar: mentor.profileImage,
                role: mentor.branch || "Student",
                leetcodeRating: mentorLC,
                codeforcesRating: mentorCF,
                skills: mentorTags,
                strengths: extraSkills,
                matchPercentage: Math.round(finalScore * 100),
                score: finalScore,
                connectionStatus: statusMap.get(mentor._id.toString()) || 'none'
            };
        })
            .filter(m => m !== null) // Remove rejected matches
            .sort((a, b) => b.score - a.score); // Step 6: Sort Descending

        res.status(200).json({
            success: true,
            matches: matches,
            debug: {
                userCF: currentUser.codeforcesRating,
                userLC: currentUser.leetcodeRating,
                totalChecked: users.length
            }
        });

    } catch (error) {
        console.error("Match Error:", error);
        res.status(500).json({ success: false, message: "Server Error matching users" });
    }
};
