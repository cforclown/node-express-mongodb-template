const mongoose = require("mongoose");
const global = require('../../global/global')



const roleModel = mongoose.model('Role')

exports.getRoleList = async function () {
    const roleList = await roleModel.find({})
    return roleList.map(role => {
        return role._doc
    })
}
exports.getRole = async function (roleId) {
    const role = await roleModel.findById(roleId).exec();
    if(!role) 
        return null
    return role._doc
}
exports.createRole = async function (roleData) {
    const roleDocument = new roleModel(roleData);
    await roleDocument.save();
    return roleData;
};
exports.updateRole = async function (roleData) {
    const res = await roleModel.findOneAndUpdate({ _id: roleData._id }, roleData ).exec();
    if (res.n === 0)
        throw Error("Role tidak ditemukan");

    return roleData;
};
exports.deleteRole = async function (roleId) {
    const res = await roleModel.findOneAndDelete({ _id: roleId }).exec();
    if (res.n === 0)
        throw Error("Role tidak ditemukan");
    return roleId;
};