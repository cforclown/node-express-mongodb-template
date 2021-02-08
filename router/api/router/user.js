const express = require('express')
const global = require('../../../global/global')
const userController = require('../../../database/controller/user.controller')

const router = express.Router()

router.get('/', async (req, res) => {
    try {
        if (!req.user.role.user.view)
            return res.sendStatus(403)

        const userList = (req.query.search && req.query.search!=='') ? await userController.findUser(req.query.search) : await userController.getUserList();
        res.send(global.Response(userList))
    }
    catch (err) {
        global.DumpError(err)
        res.status(500).send(global.Response(null, err.message))
    }
})
router.get('/:userId', async (req, res) => {
    try {
        if(!req.params.userId)
            return res.sendStatus(400)

        const userData = await userController.getUser(req.params.userId)
        if(!userData)
            return res.status(404).send(global.Response(null, "User tidak ditemukan"));
        res.send(global.Response(userData));
    }
    catch (err) {
        global.DumpError(err)
        res.status(500).send(global.Response(null, err.message))
    }
})
router.get('/permissions/:userId', async (req, res) => {
    try {
        if(!req.params.userId)
            return res.sendStatus(400)

        const permissions = await userController.getUserPermissions(req.params.userId)
        if(!permissions)
            return res.status(404).send(global.Response(null, "User Permissions tidak ditemukan"));
        res.send(global.Response(permissions));
    }
    catch (err) {
        global.DumpError(err)
        res.status(500).send(global.Response(null, err.message))
    }
})
router.post('/', async (req, res) => {
    try {
        if (!req.user.role.user.create)
            return res.sendStatus(403)
        if(!req.body.userData)
            return res.status(400).send("Data User tidak ditemukan")

        const user = await userController.createUser(req.body.userData);
        res.send(global.Response(user));
    }
    catch (err) {
        global.DumpError(err)
        res.status(500).send(global.Response(null, err.message))
    }
});
router.put('/', async (req, res) => {
    try {
        if (!req.user.role.user.update)
            return res.sendStatus(403)
        if(!req.body.userData)
            return res.status(400).send("Data User tidak ditemukan")

        const user = await userController.updateUser(req.body.userData);
        res.send(global.Response(user));
    }
    catch (err) {
        global.DumpError(err)
        res.status(500).send(global.Response(null, err.message))
    }
});
router.delete('/:userId', async (req, res) => {
    try {
        if (!req.user.role.user.delete)
            return res.sendStatus(403)
        if(!req.params.userId)
            return res.sendStatus(400)

        const userId = await userController.deleteUser(req.params.userId);
        res.send(global.Response(userId));
    }
    catch (err) {
        global.DumpError(err)
        res.status(500).send(global.Response(null, err.message))
    }
});

module.exports = router

/**
 * @swagger
 * /api/user:
 *      get:
 *          tags:
 *              - User
 *          description: Get User List
 *          responses:
 *              '200':
 *                  description: OK
 *          security:
 *              - Bearer: []
 *      post:
 *          tags:
 *              - User
 *          description: Create user
 *          responses:
 *              '200':
 *                  description: OK
 *          security:
 *              - Bearer: []
 *          requestBody:
 *              description: "User data"
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/userData'
 *      put:
 *          tags:
 *              - User
 *          description: Update user
 *          responses:
 *              '200':
 *                  description: OK
 *          security:
 *              - Bearer: []
 *          requestBody:
 *              description: "User data"
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/userData'
 * /api/user/{userId}:
 *      get:
 *          tags:
 *              - User
 *          description: Get User Data
 *          responses:
 *              '200':
 *                  description: OK
 *          security:
 *              - Bearer: []
 *          parameters:
 *          -   name: userId
 *              in: path
 *              required: true
 *      delete:
 *          tags:
 *              - User
 *          description: Delete user
 *          responses:
 *              '200':
 *                  description: OK
 *          security:
 *              - Bearer: []
 *          parameters:
 *          -   name: userId
 *              in: path
 *              required: true
 * /api/user/permissions/{userId}:
 *      get:
 *          tags:
 *              - User
 *          description: Get User Permissions
 *          responses:
 *              '200':
 *                  description: OK
 *          security:
 *              - Bearer: []
 *          parameters:
 *          -   name: userId
 *              in: path
 *              required: true
 */