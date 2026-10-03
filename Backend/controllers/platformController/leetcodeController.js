const axios = require("axios");
const User = require("../../models/User");

// helper for leetcode graphql requests 
const getLeetcodeGraphqlResponse = async (query, variables) => {
    return axios.post(
        "https://leetcode.com/graphql/",
        { query, variables },
        {
            headers: {
                "Content-Type": "application/json",
                Referer: "https://leetcode.com/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            },
            timeout: 10000 // 10s timeout
        }
    );
};

exports.getLeetcodeData = async (req, res) => {
    try {
        //  determine user id (checking for user id in body or current user)
        const userId = req.body.id || req.user._id;

        const user = await User.findById(userId);
        if (!user || !user.leetcodeUsername) {
            return res.status(404).json({
                success: false,
                message: "LeetCode username not found for this user",
            });
        }

        const username = user.leetcodeUsername;

        //  construct graphql query
        const query = `
      query getUserProfile($username: String!, $year: Int) {
        matchedUser(username: $username) {
          profile {
            realName
            userAvatar
            ranking
            countryName
            school
            aboutMe
          }
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
          languageProblemCount {
            languageName
            problemsSolved
          }
          tagProblemCounts {
            advanced { tagName problemsSolved }
            intermediate { tagName problemsSolved }
            fundamental { tagName problemsSolved }
          }
          badges {
            displayName
            icon
            creationDate
          }
          # accessing submissionCalendar directly on matchedUser gives all-time data
          submissionCalendar
          userCalendar(year: $year) {
            streak
            totalActiveDays
          }
        }
        userContestRanking(username: $username) {
          attendedContestsCount
          rating
          globalRanking
          topPercentage
        }
        userContestRankingHistory(username: $username) {
            attended
            rating
            ranking
            trendDirection
            contest {
                title
                startTime
            }
        }
        matchedUser(username: $username) {
           contestBadge {
                name
                expired
                hoverText
                icon
           }
        }
      }
    `;

        // 3. Execute Request
        const response = await getLeetcodeGraphqlResponse(query, {
            username,
            year: new Date().getFullYear()
        });

        if (response.data.errors) {
            throw new Error(response.data.errors[0].message);
        }

        const data = response.data.data;
        const matchedUser = data.matchedUser;

        if (!matchedUser) {
            return res.status(404).json({ success: false, message: "LeetCode user not found" });
        }

        // 4. Process Data

        // Rating & Contests
        const contestHistory = data.userContestRankingHistory?.filter(c => c.attended) || [];
        const currentRating = Math.round(data.userContestRanking?.rating || 0);
        const maxRating = contestHistory.length > 0
            ? Math.max(...contestHistory.map(c => c.rating))
            : currentRating;

        // Update DB with latest rating & cache it
        if (user.leetcodeRating !== currentRating) {
            await User.findByIdAndUpdate(userId, { leetcodeRating: currentRating });
        }

        // parse heatmap (submissionCalendar is a JSON string)
        let heatmapData = {};
        let totalActiveDays = matchedUser.userCalendar?.totalActiveDays || 0;

        try {
            // Prefer global submissionCalendar if available
            if (matchedUser.submissionCalendar) {
                heatmapData = JSON.parse(matchedUser.submissionCalendar);
                // Calculate total active days keys
                totalActiveDays = Object.keys(heatmapData).length;
            } else {
                heatmapData = JSON.parse(matchedUser.userCalendar?.submissionCalendar || "{}");
            }
        } catch (e) {
            console.warn("Failed to parse leetcode heatmap json");
        }

        // Format Response
        const responseData = {
            username: username,
            profileLink: `https://leetcode.com/${username}`,
            avatar: matchedUser.profile?.userAvatar,
            ranking: matchedUser.profile?.ranking || 0,

            // Stats
            totalSolved: matchedUser.submitStatsGlobal?.acSubmissionNum?.find(x => x.difficulty === 'All')?.count || 0,
            easySolved: matchedUser.submitStatsGlobal?.acSubmissionNum?.find(x => x.difficulty === 'Easy')?.count || 0,
            mediumSolved: matchedUser.submitStatsGlobal?.acSubmissionNum?.find(x => x.difficulty === 'Medium')?.count || 0,
            hardSolved: matchedUser.submitStatsGlobal?.acSubmissionNum?.find(x => x.difficulty === 'Hard')?.count || 0,

            // Contest Info
            contestRating: currentRating,
            contestMaxRating: Math.round(maxRating),
            contestGlobalRank: data.userContestRanking?.globalRanking || null,
            totalContests: data.userContestRanking?.attendedContestsCount || contestHistory.length,
            contestHistory: contestHistory.map(c => ({
                contestName: c.contest?.title,
                startTime: c.contest?.startTime,
                rating: Math.round(c.rating),
                rank: c.ranking
            })),

            // Analysis
            languageStats: matchedUser.languageProblemCount || [],
            topicStats: {
                advanced: matchedUser.tagProblemCounts?.advanced || [],
                intermediate: matchedUser.tagProblemCounts?.intermediate || [],
                fundamental: matchedUser.tagProblemCounts?.fundamental || []
            },

            // Activity
            streak: matchedUser.userCalendar?.streak || 0,
            totalActiveDays: totalActiveDays,
            submissionCalendar: heatmapData,

            // Awards
            badges: matchedUser.badges || [],
            contestBadge: matchedUser.contestBadge || null
        };

        return res.status(200).json({
            success: true,
            data: responseData
        });

    } catch (error) {
        console.error(" LeetCode Controller Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch LeetCode data",
            error: error.message
        });
    }
};
