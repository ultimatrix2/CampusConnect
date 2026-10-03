const User = require("../models/User");



//calculate cosine similarity for tags

const calculateTagSimilarity = (userTags, mentorTags) => {
    if (!userTags || !mentorTags) return 0;

    // normalize to lower case for comparison

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
        const userId = req.user._id; // from authmiddleware

        // fetch current user
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // fetch potential mentors (not current user)

        const users = await User.find({ _id: { $ne: userId } })
            .select("name email profileImage skills leetcodeRating codeforcesRating branch");

        // fetch existing connection requests for this user

        const ConnectionRequest = require("../models/ConnectionRequest");
        const myRequests = await ConnectionRequest.find({
            $or: [{ sender: userId }, { receiver: userId }]
        });

        const statusMap = new Map();
        myRequests.forEach(req => {
            const otherId = req.sender.toString() === userId.toString() ? req.receiver.toString() : req.sender.toString();

            // connected | pending | if rejected -> agian connect active 


            if (req.status === 'rejected') {
                statusMap.set(otherId, 'none');
            } else {
                statusMap.set(otherId, req.status);
            }
        });

        //  matching Algorithm
        const matches = users.map(mentor => {

            //  data preparation
            const userTags = currentUser.skills || [];
            const mentorTags = mentor.skills || [];
            const mentorCF = mentor.codeforcesRating || 0;
            const mentorLC = mentor.leetcodeRating || 0;
            const userCF = currentUser.codeforcesRating || 0;
            const userLC = currentUser.leetcodeRating || 0;

            //  tag similarity
            const tagSimilarity = calculateTagSimilarity(userTags, mentorTags);
            if (tagSimilarity < 0.25) {
                // Return null to allow concise filtering later
                return null;
            }

            // rating threshold +100 
            const cfDiff = mentorCF - userCF;
            const lcDiff = mentorLC - userLC;

            if (cfDiff < 100 && lcDiff < 100) {
                return null; // reject
            }

            // supporting scores
            const maxGap = 500;
            const avgGap = (Math.max(0, cfDiff) + Math.max(0, lcDiff)) / 2;
            const ratingScore = Math.min(avgGap / maxGap, 1);

            // depth score 
            const overlap = userTags.filter(t => mentorTags.some(mt => mt.toLowerCase() === t.toLowerCase())).length;
            const depthScore = userTags.length > 0 ? overlap / userTags.length : 0;

            // domain match 
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

            // extra strengths ( mentor )
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
            .filter(m => m !== null) // reject matches
            .sort((a, b) => b.score - a.score); //  sort descending

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
