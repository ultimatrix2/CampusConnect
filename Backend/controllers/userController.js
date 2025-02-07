const router = require('express').Router();
const User = require('./../models/User');
const axios = require("axios");
const authMiddleware = require('./../middleware/authMiddleware');
// const userRouter = require('./controllers/userController');
// const { loadEnvFile } = require('process');

//getting the detail of logged  in user

router.get('/get-logged-user', authMiddleware, async (req, res) => {
    try{
        const user = await User.findOne({ _id: req.user.userId });

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
        const allUsers = await User.find( { _id : {$ne :   req.user.userId } } );

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
router.put("/update-profile", authMiddleware, async (req, res) => {
    try {
        const { codeforcesUsername } = req.body;

        if (!codeforcesUsername) {
            return res.status(400).json({ success: false, message: "Codeforces username is required" });
        }

        // getting data of user ------
        let user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Fetching  Codeforces user data ( check the front part )
        const cfResponse = await axios.get(`https://codeforces.com/api/user.info?handles=${codeforcesUsername}`);

        if (cfResponse.data.status !== "OK") {
            return res.status(400).json({ success: false, message: "Invalid Codeforces username" });
        }

        const cfData = cfResponse.data.result[0];
        const contestRating = cfData.rating || 0; 

        // Updating  user profile
        user.codeforcesUsername = codeforcesUsername;
        user.codeforcesRating = contestRating;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: {
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                codeforcesUsername: user.codeforcesUsername,
                codeforcesRating: user.codeforcesRating
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

async function getLeetcodeGraphqlResponse(query, variables) {
    let data = JSON.stringify({
        query: query, variables: variables
    });

    let config = {
        method: 'post', url: 'https://leetcode.com/graphql/', headers: {'Content-Type': 'application/json',}, data: data
    };

    return axios(config);
}

router.post("/leetcode" , async (req, res, next) => { 

    
        //we will be using graphql to retrieve user details from leetcode
        //leetcode does not have official api
        const username = req.body.username;

        console.log(username);

        const query = `
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
        const response = await getLeetcodeGraphqlResponse(query, {username});
    
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
    
        res.status(200).json({
            status: "success", data: {
                platformName:"LEETCODE",
                profileLink: `https://leetcode.com/${username}/`, handler, rank, streak, languagesUsed, submissionCount
            }
        })}
    );



module.exports = router;