const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    // ... other user fields
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema); // Model name is "user"