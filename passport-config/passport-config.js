const LocalStrategy=require('passport-local')
const mongoose=require('mongoose')
const global=require('../global/global')

const userController=require('../database/controller/user.controller')

function Initialize(passport){
    const authenticateCallback=async (username, password, done)=>{
        try{
            const user=await userController.authenticate(username, password)
            if(!user)
                return done(null, false, {message:'User not found'})

            return done(null, user)
        }
        catch(error){
            global.DumpError(error, false)
            return done(error)
        }
    }

    passport.use(new LocalStrategy(authenticateCallback))
    passport.serializeUser((user, done)=>{
        done(null, user._id)
    })
    passport.deserializeUser(async (userId, done)=>{
        const user=await userController.getUser(userId)
        if(!user)
            return done(null, false, {message:'Deserialize User Error'})
        return done(null, user)
    })
}

module.exports=Initialize