const cron = require("node-cron");
const axios = require("axios");
const User = require("../models/User");

// --- Helper: LeetCode GraphQL ---
const getLeetcodeGraphqlResponse = async (query, variables) => {
    return axios.post(
        "https://leetcode.com/graphql/",
        { query, variables },
        {
            headers: {
                "Content-Type": "application/json",
                Referer: "https://leetcode.com/",
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
            timeout: 10000,
        }
    );
};

// --- Helper: Sleep ---
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- Main Update Function ---
const updateRatings = async () => {
    console.log("🔄 Starting Scheduled Rating Update...");
    try {
        const users = await User.find({});
        console.log(`Found ${users.length} users to process.`);

        let updatedCount = 0;
        let errorCount = 0;

        for (const user of users) {
            // 🛡️ SECURITY: Rate Limiting
            // Sleep 2 seconds between users to act like a human/polite bot
            // Prevents IP bans from LeetCode/Codeforces
            await sleep(2000);

            try {
                let changed = false;

                // 1. LeetCode Update
                if (user.leetcodeUsername) {
                    try {
                        const query = `
              query userContestRankingInfo($username: String!) {
                userContestRanking(username: $username) { rating }
              }
            `;
                        const response = await getLeetcodeGraphqlResponse(query, {
                            username: user.leetcodeUsername,
                        });

                        // Some users might have username but no contest ranking data
                        const newRating = Math.round(
                            response.data?.data?.userContestRanking?.rating || 0
                        );

                        if (user.leetcodeRating !== newRating) {
                            console.log(
                                `   LC Update [${user.username}]: ${user.leetcodeRating} -> ${newRating}`
                            );
                            user.leetcodeRating = newRating;
                            changed = true;
                        }
                    } catch (err) {
                        console.error(
                            `   ❌ Failed LC fetch for ${user.username} (${user.leetcodeUsername}):`,
                            err.message
                        );
                    }
                }

                // 2. Codeforces Update
                if (user.codeforcesUsername) {
                    try {
                        // 🛡️ SECURITY: Add User-Agent to avoid default axios detection
                        const response = await axios.get(
                            `https://codeforces.com/api/user.info?handles=${user.codeforcesUsername}`,
                            {
                                headers: {
                                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
                                },
                                timeout: 10000
                            }
                        );
                        if (response.data.status === "OK") {
                            const cfUser = response.data.result[0];
                            const newRating = cfUser.rating || 0;

                            if (user.codeforcesRating !== newRating) {
                                console.log(
                                    `   CF Update [${user.username}]: ${user.codeforcesRating} -> ${newRating}`
                                );
                                user.codeforcesRating = newRating;
                                changed = true;
                            }
                        }
                    } catch (err) {
                        console.error(
                            `   ❌ Failed CF fetch for ${user.username} (${user.codeforcesUsername}):`,
                            err.message
                        );
                    }
                }

                if (changed) {
                    await user.save();
                    updatedCount++;
                }
            } catch (userErr) {
                console.error(`   ❌ Error processing user ${user.username}:`, userErr.message);
                errorCount++;
            }
        }

        console.log(
            `✅ Rating Update Complete. Updated: ${updatedCount}, Errors: ${errorCount}`
        );
    } catch (err) {
        console.error("🔥 Fatal Error in Rating Update Job:", err.message);
    }
};

// --- Schedule Job ---
// Run every 7 days (Sunday at midnight)
// Cron expression: "0 0 * * 0"
const startRatingUpdateJob = () => {
    // For testing instant run, uncomment below:
    // setTimeout(updateRatings, 5000); 

    cron.schedule("0 0 * * 0", async () => {
        console.log("⏰ Triggering Weekly Leaderboard Update...");
        await updateRatings();
    });

    console.log("📅 Leaderboard Update Job Scheduled (Every Sunday at 00:00)");
};

module.exports = { startRatingUpdateJob, updateRatings };
