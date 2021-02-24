const mongoose = require("mongoose");
const global = require('../../global/global')



const roleModel = mongoose.model('Role')

exports.getRoleList = async function () {
    const roleList = await roleModel.find({})

    return roleList.map(role => role.toObject() )
}
exports.findRole = async function (query) {
    const roleList = await roleModel.find({
        name: { 
            $regex: query, 
            $options: "i" 
        },
    });

    return roleList.map(role => { return { ...role.toObject() } });
};
exports.getRole = async function (roleId) {
    const role = await roleModel.findById(roleId).exec();
    if(!role) return null

    return role.toObject();
}
exports.createRole = async function (roleData) {
    const roleDocument = new roleModel(roleData);
    await roleDocument.save();
    
    return roleDocument.toObject();
};
exports.updateRole = async function (roleData) {
    const res = await roleModel.updateOne({ _id: roleData._id }, roleData).exec();
    if (res.n === 0)
        throw global.ErrorDataNotFound("DATA NOT FOUND");

    return roleData;
};
exports.deleteRole = async function (roleId) {
    const res = await roleModel.findOneAndDelete({ _id: roleId }).exec();
    if (res.n === 0)
        throw global.ErrorDataNotFound("DATA NOT FOUND")
        
    return roleId;
};