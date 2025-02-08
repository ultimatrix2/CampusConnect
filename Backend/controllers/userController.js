const router = require('express').Router();
const User = require('./../models/User');
const axios = require("axios");
const authMiddleware = require('./../middleware/authMiddleware');
const cheerio = require('cheerio');
// const userRouter = require('./controllers/userController');
// const { loadEnvFile } = require('process');

//getting the detail of logged  in user

router.get('/get-logged-user', authMiddleware, async (req, res) => {
    try{
        const user = await User.findOne({ _id: req.user.userId });
        console.log("object",user);
        
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false
            });
        }

        res.status(200).json({
            message: 'User fetched successfully',
            success: true,
            data: user
        });
    }catch(error){
        res.status(400).send({
            message: error.message,
            success: false
        })
    }
});

// fetching the data of logged in user except the current user
router.get('/get-all-users', authMiddleware, async (req, res) => {
    try{
       // const allUsers = await User.find( { _id : {$ne :   req.user.userId } } );
        const allUsers = await User.find({});
        if (!allUsers) {
            return res.status(404).json({
                message: 'Users not found',
                success: false
            });
        }

        res.status(200).json({
            message: 'all  User fetched successfully',
            success: true,
            data: allUsers
        });
    }catch(error){
        res.status(400).send({
            message: error.message,
            success: false
        })
    }
});

// Update Codeforces username & fetch rating


// Update Codeforces Username, Contest Rating & Year
router.put("/update-profile", authMiddleware, async (req, res) => {
    try {
        const { codeforcesUsername, year } = req.body;

        // Validate Input
        if (!codeforcesUsername) {
            return res.status(400).json({ success: false, message: "Codeforces username is required" });
        }
        if (!year || isNaN(year) ) {
            return res.status(400).json({ success: false, message: "Invalid year provided" });
        }

        let user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const cfResponse = await axios.get(`https://codeforces.com/api/user.info?handles=${codeforcesUsername}`);

        if (cfResponse.data.status !== "OK") {
            return res.status(400).json({ success: false, message: "Invalid Codeforces username" });
        }

        const cfData = cfResponse.data.result[0];
        const contestRating = cfData.rating || 0; 

        user.codeforcesUsername = codeforcesUsername;
        user.codeforcesRating = contestRating;
        user.year = year;  
        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: {
                name: user.name,
                email: user.email,
                codeforcesUsername: user.codeforcesUsername,
                codeforcesRating: user.codeforcesRating,
                year: user.year
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});




router.post("/leetcode" , async (req, res, next) => { 
        //we will be using graphql to retrieve user details from leetcode
        //leetcode does not have official api
        
        const id = req.body.id;
        const user = await User.findById(id);
        const username = user.leetcodeUsername;
        console.log("leetcode: "+username);

        if(!username) {
            res.status(200).json({data: {}})
            return;
        }


        let query = `
            query userPublicProfile($username: String!, $year: Int ) {
              matchedUser(username: $username) {
                profile {
                  ranking
                  userAvatar
                }
                submitStatsGlobal {
                    acSubmissionNum {
                        difficulty
                        count
                    }
                }
                userCalendar(year: $year) {
                  streak
                }
                languageProblemCount {
                  languageName
                }
              }
            }
        `;
        let response = await getLeetcodeGraphqlResponse(query, {username});
    
        if (!response.data.data.matchedUser) {
            res.status(400).json({
                status: "fail", message: "No such user found!"
            })
        }
    
        const handler = response.data.data.matchedUser ? username : "";
        const rank = response.data.data.matchedUser?.profile?.ranking || 0;
        const streak = response.data.data.matchedUser?.userCalendar?.streak || 0;
        const languagesUsed = response.data.data.matchedUser?.languageProblemCount.map(language => language.languageName) || [];
        const submissionCount = response.data.data.matchedUser?.submitStatsGlobal?.acSubmissionNum || [];
    
        query = `query userContestRankingInfo($username: String!) {
                       userContestRanking(username: $username) {
                                rating
                            }
                        }
                                                                              `
        response = await getLeetcodeGraphqlResponse(query, {username});

        console.log(response.data.data);
        

        res.status(200).json({
            status: "success", data: {
                platformName:"LEETCODE",
                profileLink: `https://leetcode.com/${username}/`, handler, rank, streak, languagesUsed, submissionCount, rating: response.data.data?.userContestRanking?.rating || "NA"
            }
        })}
    );



async function getLeetcodeGraphqlResponse(query, variables) {
    let data = JSON.stringify({ query, variables });

    let config = {
        method: "post",
        url: "https://leetcode.com/graphql/",
        headers: {
            "Content-Type": "application/json",
            "Referer": "https://leetcode.com/"
        },
        data: data
    };

    return axios(config);
}

// Update LeetCode Username and Rating
router.put("/update-leetcode", authMiddleware, async (req, res) => {
    try {
        console.log("inside ")
        const { leetcodeUsername } = req.body;

        if (!leetcodeUsername) {
            return res.status(400).json({ success: false, message: "LeetCode username is required" });
        }

        let user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        console.log(user);


        let query = `
            query userPublicProfile($username: String!, $year: Int ) {
              matchedUser(username: $username) {
                profile {
                  ranking
                  userAvatar
                }
                submitStatsGlobal {
                    acSubmissionNum {
                        difficulty
                        count
                    }
                }
                userCalendar(year: $year) {
                  streak
                }
                languageProblemCount {
                  languageName
                }
              }
            }
        `;
        let response = await getLeetcodeGraphqlResponse(query, { username: leetcodeUsername });

        if (!response.data.data.matchedUser) {
            return res.status(400).json({ success: false, message: "Invalid LeetCode username" });
        }

        const handler = response.data.data.matchedUser ? leetcodeUsername  : "";
        const rank = response.data.data.matchedUser?.profile?.ranking || 0;
        const streak = response.data.data.matchedUser?.userCalendar?.streak || 0;
        const languagesUsed = response.data.data.matchedUser?.languageProblemCount.map(language => language.languageName) || [];
        const submissionCount = response.data.data.matchedUser?.submitStatsGlobal?.acSubmissionNum || [];

        // Fetch userContestRanking separately
        query = `
            query userContestRankingInfo($username: String!) {
                userContestRanking(username: $username) {
                    rating
                }
            }
        `;
        response = await getLeetcodeGraphqlResponse(query, { username: leetcodeUsername });

        console.log("second");
        console.log(response.data.data);
        //  (default data 0 if not found)
        const leetcodeRating = response.data.data.userContestRanking?.rating || 0;

        user.leetcodeUsername = leetcodeUsername;
        user.leetcodeRating = Math.floor(leetcodeRating); 

        await user.save();

        res.status(200).json({
            success: true,
            message: "LeetCode profile updated successfully",
            data: {
                name: user.name,
                email: user.email,
                leetcodeUsername: user.leetcodeUsername,
                leetcodeRating: user.leetcodeRating,
                platformName:"LEETCODE",
                profileLink: `https://leetcode.com/u/${leetcodeUsername }/`, handler, rank, streak, languagesUsed, submissionCount, rating: Math.floor(response.data.data?.userContestRanking?.rating || 0)
                           
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;