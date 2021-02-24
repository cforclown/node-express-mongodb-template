const mongoose = require("mongoose");
const global = require('../../global/global');



const userModel = mongoose.model('User');
const roleController = require('./role.controller');

exports.authenticate = async function (username, password) {
    const passwordHash = await global.Hash(password)
    const user = await userModel.findOne({
        username: username,
        password: passwordHash
    }).populate('role').exec();

    if (!user) return null

    const userData = { ...user.toObject() }
    delete userData.password
    
    return userData
}
exports.getUserList = async function () {
    const userList = await userModel.find({}).select('-password').populate({
        path: "role",
        select: "_id nama",
        model: "Role",
    }).exec();

    return userList.map(user => { return { ...user.toObject() } });
}
exports.findUser = async function (query) {
    const userList = await userModel.find({
        fullname: { $regex: query, $options: "i" },
    }).select('-password').populate({
        path: "role",
        select: "_id nama",
        model: "Role",
    });

    return userList.map(user => { return { ...user.toObject() } });
};
exports.getUser = async function (userId) {
    const user = await userModel.findById(userId).select('-password').populate('role').exec();
    if (!user)
        return null
        
    return { ...user.toObject() }
}
exports.getUserPermissions = async function (userId) {
    const user = await userModel.findById(userId).select('-password').populate('role').exec();
    if (!user)
        return null

    return { ...user.role.toObject() }
}
exports.createUser = async function (userData) {
    const role = await roleController.getRole(userData.role);
    if (!role)
        throw global.ErrorBadRequest("DATA ROLE NOT FOUND");

    const userdocument = new userModel({
        ...userData,
        password: await global.Hash(userData.password),
        role: role,
    });
    await userdocument.save();

    return userdocument.toObject();
};
exports.updateUser = async function (userData) {
    const role = await roleController.getRole(userData.role);
    if (!role)
        throw global.ErrorBadRequest("DATA ROLE NOT FOUND");

    const res = await userModel.updateOne({ _id: userData._id }, {
        $set: {
            fullname: userData.fullname,
            role: userData.role,
        },
    }).exec();

    if (res.n === 0)
        throw global.ErrorDataNotFound("DATA NOT FOUND");

    return userData;
};
exports.deleteUser = async function (userId) {
    const res = await userModel.deleteOne({ _id: userId }).exec();
    if (res.n === 0)
        throw global.ErrorDataNotFound("DATA NOT FOUND");

    return userId;
};