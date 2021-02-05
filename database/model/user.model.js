const mongoose = require("mongoose");
const roleSchema=require('../model/role.model').Schema

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    nama: {
        type: String,
        required: true,
    },
    role:{
        type:roleSchema,
        required:true,
        ref:'Role'
    }
});

exports.Schema = userSchema;
exports.Model = mongoose.model("User", userSchema, "user");
