const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    namaLengkap: {
        type: String,
        required: true,
    },
    role:{
        type:mongoose.Types.ObjectId,
        required:true,
        ref:'Role'
    }
});

exports.Schema = userSchema;
exports.Model = mongoose.model("User", userSchema, "user");
