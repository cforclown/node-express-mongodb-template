const config = require('../../config');
const express=require('express');
const passport=require('passport');
const jwt=require('jsonwebtoken');
const global=require('../../global/global');
const tokenController=require('../../database/controller/token.controller');
const tokenModel = require('../../database/model/token.model');

const authRouter=express.Router()

const accessTokenExpIn=parseInt(config.ACCESS_TOKEN_EXP_IN)
const refreshTokenExpIn=parseInt(config.ACCESS_TOKEN_EXP_IN)*2

const removeTokenTasks=[]

authRouter.post('/login', passport.authenticate("local", {
        successRedirect: "/auth/login/verify",
        failureRedirect: "/auth/login/error",
        failureFlash: true,
    })
);
authRouter.get('/login/verify', async (req, res)=>{       // LOGIN SUCCESS
    try{
        const user={
            userId:req.user._id,
            nama:req.user.nama,
            role:req.user.role,
        }
        const accessToken=jwt.sign(user, config.ACCESS_TOKEN_SECRET, { 
            expiresIn:`${accessTokenExpIn}s`
        })
        const refreshToken=jwt.sign(user, config.REFRESH_TOKEN_SECRET, { 
            expiresIn:`${refreshTokenExpIn}s`
        })
            
        await tokenController.addToken(user.userId, refreshToken)
        startRemoveTokenTask(refreshToken)

        res.send(global.Response({
            user,
            accessToken, 
            refreshToken
        }))
    }
    catch(error){
        global.DumpError(error)
        res.status(500).send(global.Response(null, error.message))
    }
})
authRouter.get('/login/error', async (req, res)=>{        // LOGIN FAILED
    res.status(404).send(global.Response(null, 'Username atau password salah'))
})
authRouter.post('/refresh', async (req, res)=>{
    try{
        if(!req.body.refreshToken) return res.sendStatus(400)

        if(!(await tokenController.isExists(req.body.refreshToken))) return res.sendStatus(403)

        jwt.verify(req.body.refreshToken, config.REFRESH_TOKEN_SECRET, async (err, user)=>{
            if(err) return res.sendStatus(403)

            const userData={
                userId:user.userId,
                nama:user.nama,
            }
            const accessToken=jwt.sign(userData, config.ACCESS_TOKEN_SECRET, { 
                expiresIn:`${accessTokenExpIn}s`
            })
            const refreshToken=jwt.sign(userData, config.REFRESH_TOKEN_SECRET, { 
                expiresIn:`${refreshTokenExpIn}s`
            })
            
            stopRemoveTokenTask(req.body.refreshToken)
            await tokenController.deleteToken(req.body.refreshToken)
            await tokenController.addToken(userData.userId, refreshToken)
            startRemoveTokenTask(refreshToken)
    
            res.send(global.Response({
                userData,
                accessToken, 
                refreshToken
            }))
        })
    }
    catch(error){
        global.DumpError(error)
        res.status(500).send(global.Response(null, error.message))
    }
})
authRouter.delete('/logout', async (req, res)=>{
    try{
        if(req.headers['authorization']===undefined) return res.sendStatus(401)
        
        const token=req.headers['authorization'].split(' ')[1]

        jwt.verify(token, config.ACCESS_TOKEN_SECRET, (err, user)=>{
            if(err){ // TOKEN NOT VALID
                // STILL RETURN 200
                return res.send(global.OKResponse())
            }
            return res.send(global.OKResponse())
        })
    }
    catch(error){
        global.DumpError(error)
        res.status(500).send(global.Response(null, error.message))
    }
})

module.exports=authRouter

function startRemoveTokenTask(refreshToken){
    const task={
        refreshToken:refreshToken,
        task:setTimeout(async () => {
            try{
                await tokenModel.findOneAndDelete({refreshToken:refreshToken})
                stopRemoveTokenTask(refreshToken)
            }
            catch(error){
                global.DumpError(error, false)
            }
        }, refreshTokenExpIn*1000),
    }
    removeTokenTasks.push(task)
}
function stopRemoveTokenTask(refreshToken){
    try{
        const task = removeTokenTasks.find(t=>t.refreshToken===refreshToken)
        if(!task) return
        
        clearTimeout(task.task)
        removeTokenTasks=removeTokenTasks.filter(t=>t.refreshToken!==refreshToken)
    }
    catch(error){
        global.DumpError(error, false)
        removeTokenTasks=removeTokenTasks.filter(t=>t.refreshToken!==refreshToken)
    }
}



/**
 * @swagger
 * /auth/login:
 *      post:
 *          tags:
 *              - Authentication
 *          description: Login
 *          responses:
 *              '200':
 *                  description: Login Success
 *      parameters:
 *      -   name: data
 *          in: body
 *          required: true
 *          schema:
 *              type: object
 *              properties:
 *                  username: 
 *                      type: string
 *                  password:
 *                      type: string
 *              required:
 *                  - username
 *                  - password
 * /auth/refresh:
 *      post:
 *          tags:
 *              - Authentication
 *          description: Refresh Token
 *          responses:
 *              '200':
 *                  description: Token berhasil diperbarui
 *          security:
 *              - Bearer: []
 *      parameters:
 *      -   name: data
 *          in: body
 *          required: true
 *          schema:
 *              type: object
 *              properties:
 *                  refreshToken: 
 *                      type: string
 *              required:
 *                  - refreshToken
 * /auth/logout:
 *      delete:
 *          tags:
 *              - Authentication
 *          description: Logout berhasil
 *          responses:
 *              '200':
 *                  description: Logout Success
 *          security:
 *              - Bearer: []
 */