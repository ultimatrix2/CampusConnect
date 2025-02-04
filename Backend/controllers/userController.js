const router = require('express').Router();
const User = require('./../models/User');
const authMiddleware = require('./../middleware/authMiddleware')

//  getting the detail of logged  in user , 

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


module.exports = router;