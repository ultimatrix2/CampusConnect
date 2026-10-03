const axios = require("axios");
const { JSDOM } = require("jsdom");
const User = require("../../models/User");

exports.getCodeforcesData = async (req, res) => {
    try {
        // 1. Determine User ID
        const userId = req.body.id || req.user._id;

        const user = await User.findById(userId);
        if (!user || !user.codeforcesUsername) {
            return res.status(404).json({
                success: false,
                message: "Codeforces username not found for this user",
            });
        }

        const username = user.codeforcesUsername;
        const profileLink = `https://codeforces.com/profile/${username}`;

        /* ================= 1. USER INFO ================= */
        const infoRes = await axios.get(
            `https://codeforces.com/api/user.info?handles=${username}`
        );

        if (infoRes.data.status !== "OK") {
            throw new Error("Invalid Codeforces user");
        }

        const cf = infoRes.data.result[0];

        // Update DB rating
        if (cf.rating && user.codeforcesRating !== cf.rating) {
            await User.findByIdAndUpdate(userId, { codeforcesRating: cf.rating });
        }

        /* ================= 2. RATING HISTORY ================= */
        let ratingHistory = [];
        try {
            const ratingRes = await axios.get(
                `https://codeforces.com/api/user.rating?handle=${username}`
            );
            if (ratingRes.data.status === "OK") {
                ratingHistory = ratingRes.data.result;
            }
        } catch (e) {
            console.warn("CF Rating history fetch failed", e.message);
        }

        /* ================= 3. SUBMISSIONS (HEATMAP DATA) ================= */
        let submissions = [];
        try {
            // limit to recent 1000 only to avoid heavy payload 
            const statusRes = await axios.get(
                `https://codeforces.com/api/user.status?handle=${username}&from=1&count=1000`
            );
            if (statusRes.data.status === "OK") {
                submissions = statusRes.data.result.filter(s => s.verdict === "OK");
            }
        } catch (e) {
            console.warn("CF Submissions fetch failed", e.message);
        }

        // Process Submissions for Heatmap (Count per day)
        const submissionCalendar = {};
        submissions.forEach(sub => {
            const date = new Date(sub.creationTimeSeconds * 1000);
            const dateKey = Math.floor(date.getTime() / 1000); // Unix timestamp


            const dayStart = new Date(date).setHours(0, 0, 0, 0) / 1000;
            submissionCalendar[dayStart] = (submissionCalendar[dayStart] || 0) + 1;
        });


        /* ================= 4. STREAK (Scraping) ================= */
        let streak = 0;
        try {
            const htmlRes = await axios.get(profileLink);
            const dom = new JSDOM(htmlRes.data);
            const document = dom.window.document;

            const streakText = document.querySelector(".heatmap div span")?.textContent || "";

            streak = Number(streakText.replace(/\D/g, "")) || 0;
        } catch {
            // console.warn("Streak scraping failed");
        }

        /* ================= RESPONSE ================= */
        res.status(200).json({
            success: true,
            data: {
                handle: cf.handle,
                avatar: cf.avatar,
                rank: cf.rank,
                maxRank: cf.maxRank,
                rating: cf.rating,
                maxRating: cf.maxRating,

                // Stats
                totalSolved: submissions.length,

                // Contests
                totalContests: ratingHistory.length,
                ratingHistory: ratingHistory.map(r => ({
                    contestName: r.contestName,
                    rating: r.newRating,
                    rank: r.rank,
                    startTime: r.ratingUpdateTimeSeconds
                })),

                // Activity
                submissionCalendar, // { timestamp: count }
                streak,

                profileLink
            }
        });

    } catch (error) {
        console.error(" Codeforces Controller Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch Codeforces data",
            error: error.message
        });
    }
};
