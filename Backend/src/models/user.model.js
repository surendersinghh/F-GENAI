const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: [true,"username already taken"],
        required: true,
    },

    email: {
        type: String,
        unique: [true, "Account already exist with this email address"],
        required: true,
    },
    password: {
        type: String,
        required: true,
    }
})

const UserModel = mongoose.model("users", UserSchema);
module.exports = UserModel;