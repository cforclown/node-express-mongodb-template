const config = require('../../config');
const express=require('express');
const passport=require('passport');
const jwt=require('jsonwebtoken');
const global=require('../../global/global');
const tokenController=require('../../database/controller/token.controller');

const router=express.Router()

const accessTokenExpIn=parseInt(config.ACCESS_TOKEN_EXP_IN)
const refreshTokenExpIn=parseInt(config.ACCESS_TOKEN_EXP_IN)*2
// const accessTokenExpIn=10;
// const refreshTokenExpIn=20;

const removeTokenTasks=[]

router.post('/login', passport.authenticate("local", {
        successRedirect: "/auth/login/verify",
        failureRedirect: "/auth/login/error",
        failureFlash: true,
    })
);
router.get('/login/verify', async (req, res)=>{       // LOGIN SUCCESS
    try{
        const userData={
            userId:req.user._id,
            namaLengkap:req.user.namaLengkap,
            role:req.user.role,
        }
        const accessToken=jwt.sign(userData, config.ACCESS_TOKEN_SECRET, { 
            expiresIn:`${accessTokenExpIn}s`
        })
        const refreshToken=jwt.sign(userData, config.REFRESH_TOKEN_SECRET, { 
            expiresIn:`${refreshTokenExpIn}s`
        })
            
        await tokenController.addToken(userData.userId, refreshToken)
        startRemoveTokenTask(refreshToken)

        res.send(global.Response(new TokenResponse(userData, accessToken, refreshToken)))
    }
    catch(error){
        global.DumpError(error)
        res.status(500).send(global.Response(null, error.message))
    }
})
router.get('/login/error', async (req, res)=>{        // LOGIN FAILED
    res.status(404).send(global.Response(null, 'Authentication error'))
})
router.post('/refresh', async (req, res)=>{
    try{
        if(!req.body.refreshToken) return res.sendStatus(400)

        if(!(await tokenController.isExists(req.body.refreshToken))) return res.sendStatus(403)

        jwt.verify(req.body.refreshToken, config.REFRESH_TOKEN_SECRET, async (err, user)=>{
            if(err) return res.sendStatus(403)

            const userData={
                userId:user.userId,
                namaLengkap:user.namaLengkap,
                role:user.role,
            }
            const accessToken=jwt.sign(userData, config.ACCESS_TOKEN_SECRET, { 
                expiresIn:`${accessTokenExpIn}s`
            })
            const refreshToken=jwt.sign(userData, config.REFRESH_TOKEN_SECRET, { 
                expiresIn:`${refreshTokenExpIn}s`
            })
            
            stopRemoveTokenTask(req.body.refreshToken)
            await tokenController.addToken(userData.userId, refreshToken); // FUNGSI INI SEKALIGUS MENGHAPUS SEMUA REFRESH TOKEN BY USER ID
            startRemoveTokenTask(refreshToken)
    
            res.send(global.Response(new TokenResponse(userData, accessToken, refreshToken)))
        })
    }
    catch(error){
        global.DumpError(error)
        res.status(500).send(global.Response(null, error.message))
    }
})
router.delete('/logout', async (req, res)=>{
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

module.exports=router

function startRemoveTokenTask(refreshToken){
    const task={
        refreshToken:refreshToken,
        task:setTimeout(async () => {
            try{
                await tokenController.deleteToken(refreshToken);
                stopRemoveTokenTask(refreshToken);
            }
            catch(error){
                global.DumpError(error, false);
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
        const taskIndex=removeTokenTasks.indexOf(t=>t.refreshToken===refreshToken);
        if(taskIndex>=0)
            removeTokenTasks.splice(taskIndex, 1);
    }
    catch(error){
        global.DumpError(error, false)
        const taskIndex=removeTokenTasks.indexOf(t=>t.refreshToken===refreshToken);
        if(taskIndex>=0)
            removeTokenTasks.splice(taskIndex, 1);
    }
}

function TokenResponse(_userData, _accessToken, _refreshToken){
    this.userData={
        userId:_userData.userId,
        namaLengkap:_userData.namaLengkap,
        role:{
            _id:_userData.role._id,
            nama:_userData.role.nama,
        },
    };
    this.accessToken=_accessToken;
    this.refreshToken=_refreshToken;
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
 *          requestBody:
 *              description: "Login Data"
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/loginData'
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
 *          requestBody:
 *              description: "Refresh Token"
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/refreshToken'
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