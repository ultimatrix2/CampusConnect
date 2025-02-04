const mongoose = require('mongoose');
const chatSchema = new mongoose.Schema({
    members : {
        type : [
            { type : mongoose.Schema.Types.ObjectId , ref : "/test/users"}
        ]
    },
    lastMessage : {
        type : mongoose.Schema.Types.ObjectId , ref : "messages"
    },

    unreadMessageCount : {
        type : Number,
        default : 0
    }
}, {timeStamps : true }) ;


module.exports = mongoose.model( "chats", chatSchema ) ;