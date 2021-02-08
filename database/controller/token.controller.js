const mongoose=require('mongoose')



const tokenModel=mongoose.model('Token')

exports.isExists=async function(refreshToken){
    const token=await tokenModel.findOne({ refreshToken: refreshToken }).exec();
    return token!=null
}
exports.getTokenData=async function(refreshToken){
    const token=await tokenModel.findOne({ refreshToken: refreshToken }).exec();
    return {
        userId:token.userId, 
        refreshToken:token.refreshToken
    }
}
exports.addToken=async function(userId, refreshToken){
    await exports.deleteTokenByUserId(userId);
    
    const token=new tokenModel({
        userId:userId,
        refreshToken:refreshToken
    })
    await token.save()

    return {
        userId,
        refreshToken
    }
}
exports.updateToken=async function(refreshToken, userId, newRefreshToken){
    const token=await tokenModel.findOne({refreshToken:refreshToken}).exec();
    token.refreshToken=newRefreshToken
    await token.save()
    return {
        userId,
        refreshToken:newRefreshToken
    }
}
exports.deleteTokenByUserId=async function(userId){
    await tokenModel.deleteMany({userId:userId}).exec();
    return true
}
exports.deleteToken=async function(refreshToken){
    await tokenModel.findOneAndDelete({refreshToken:refreshToken})
    return true
}
