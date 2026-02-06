const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        enum: ["connection_request", "info", "alert"],
        default: "info"
    },
    message: {
        type: String,
        required: true
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'onModel'
    },
    onModel: {
        type: String,
        required: false,
        enum: ['ConnectionRequest', 'Post'] // Expand as needed
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
