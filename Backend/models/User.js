const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true
    },
    gemail: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (email) {
                return email.endsWith("@mnnit.ac.in");
            },
            
            message: "Gemail must be a valid MNNIT email (e.g., example@mnnit.ac.in)."
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: [validator.isEmail, "Invalid email address"]
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    branch: {
        type: String,
        required: true
    },

     // (Optional)
     codeforcesUsername : {
        type: String,
        unique: true,  
        sparse: true   
    },
   
    codeforcesRating: {
        type: Number,
        default: 0  // 
    }
},{timestamps : true} );

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model("User", userSchema);
