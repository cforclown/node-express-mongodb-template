const express = require('express')
const jwt = require('jsonwebtoken');
const config = require('../../config');
const global = require('../../global/global');

const router = express.Router();

const userRouter=require('./router/user');
const roleRouter=require('./router/role');



router.use(async (req, res, next) => {
    try {
        if (req.headers['authorization'] === undefined) return res.sendStatus(401)

        const token = req.headers['authorization'].split(' ')[1]

        jwt.verify(token, config.ACCESS_TOKEN_SECRET, (err, user) => {
            // TOKEN NOT VALID
            if (err)
                return res.sendStatus(401)  
            // ROLE USER TIDAK VALID
            if(!user.role)
                return res.status(403).send(global.Response(null, "User ini tidak mempunyai attribute Role"))

            req.user = user

            next()
        })
    }
    catch (error) {
        global.DumpError(error)
        res.status(500).send(global.Response(null, error.message))
    }
})

router.use("/user", userRouter);
router.use("/role", roleRouter);

module.exports = router