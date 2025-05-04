// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
        signupMethod: {
            type: String,
            enum: ['native', 'google'],
            default: "native"
        },
    },
    { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
