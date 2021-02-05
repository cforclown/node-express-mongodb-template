const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    user: {
        view:{
            type: Boolean,
            required: true,
            default:true
        },
        create:{
            type: Boolean,
            required: true,
            default:false
        },
        update:{
            type: Boolean,
            required: true,
            default:false
        },
        delete:{
            type: Boolean,
            required: true,
            default:false
        },
    },
    masterData: {
        view:{
            type: Boolean,
            required: true,
            default:false
        },
        create:{
            type: Boolean,
            required: true,
            default:false
        },
        update:{
            type: Boolean,
            required: true,
            default:false
        },
        delete:{
            type: Boolean,
            required: true,
            default:false
        },
    },
});

exports.Schema = roleSchema;
exports.Model = mongoose.model("Role", roleSchema, "role");