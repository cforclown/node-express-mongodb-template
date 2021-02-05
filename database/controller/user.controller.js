const mongoose = require("mongoose");
const global = require('../../global/global')



const userModel = mongoose.model('User')
const roleModel = mongoose.model('Role')

exports.authenticate = async function (username, password) {
    const passwordHash=await global.Hash(password)
    const user = await userModel.findOne({username:username, password:passwordHash}).exec();
    if(!user) 
        return null
    const userData = { ...user._doc }
    delete userData.password
    return userData
}
exports.getUserList = async function () {
    const userList = await userModel.find({})
    return userList.map(user => {
        const userData = { ...user._doc }
        userData.role={
            _id:user.role._id,
            nama:user.role.nama,
        }
        delete userData.password
        return userData
    })
}
exports.getUser = async function (userId) {
    const user = await userModel.findById(userId).exec();
    if(!user) 
        return null
    const userData = { ...user._doc }
    delete userData.password
    return userData
}
exports.getUserPermissions = async function (userId) {
    const user = await userModel.findById(userId).exec();
    if(!user) 
        return null
    return { ...user.role._doc }
}
exports.createUser = async function (userData) {
    const role=userData.role?userData.role:(await roleModel.findById(userData.roleId).exec())
    if(!role)
        throw Error("Data Role tidak valid")
    const userdocument = new userModel({
        ...userData,
        password: await global.Hash(userData.password),
        role: role,
    });
    await userdocument.save();
    return userData;
};
exports.updateUser = async function (userData) {
    const role=userData.role?userData.role:(await roleModel.findById(userData.roleId).exec())
    if(!role)
        throw Error("Data Role tidak valid")
    const res = await userModel.updateOne({ _id: userData._id }, {
        $set: {
            nama: userData.nama,
            jabatanOrDepartment: userData.jabatanOrDepartment?userData.jabatanOrDepartment:null,
            perusahaan: userData.perusahaan?userData.perusahaan:null,
            email: userData.email?userData.email:null,
            telephone: userData.telephone?userData.telephone:null,
            role: role,
        },
    }).exec();

    if (res.n === 0)
        throw Error("User tidak ditemukan");

    return userData;
};
exports.deleteUser = async function (userId) {
    const res = await userModel.deleteOne({ _id: userId }).exec();

    if (res.n === 0)
        throw Error("User tidak ditemukan");

    return userId;
};