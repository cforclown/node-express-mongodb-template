const express = require('express');
const global = require('../../../global/global');
const roleController = require('../../../database/controller/role.controller');

const Router = express.Router();

Router.get('/', async (req, res) => {
    try {
        const roleList = (req.query.search && req.query.search.trim()!=='') ? 
                            await roleController.findRole(req.query.search):
                            await roleController.getRoleList();
        res.send(global.Response(roleList))
    }
    catch (err) {
        global.DumpError(err)
        res.status(500).send(global.Response(null, err.message))
    }
})
Router.get('/:roleId', async (req, res) => {
    try {
        if(!req.params.roleId)
            return res.sendStatus(400)
        const role = await roleController.getRole(req.params.roleId)
        if(!role)
            return res.status(404).send(global.Response(null, "Role tidak ditemukan"));
        res.send(global.Response(role));
    }
    catch (err) {
        global.DumpError(err)
        res.status(500).send(global.Response(null, err.message))
    }
})
Router.post('/', async (req, res) => {
    try {
        if (!req.user.role.masterData.create)
            return res.sendStatus(403)
        if(!req.body.roleData)
            return res.status(400).send("Data Role tidak ditemukan")

        const role = await roleController.createRole(req.body.roleData);
        res.send(global.Response(role));
    }
    catch (err) {
        global.DumpError(err)
        res.status(err.status?err.status:500).send(global.ErrorResponse(err.message));
    }
});
Router.put('/', async (req, res) => {
    try {
        if (!req.user.role.masterData.update)
            return res.sendStatus(403)
        if(!req.body.roleData)
            return res.status(400).send("Data Role tidak ditemukan")

        const role = await roleController.updateRole(req.body.roleData);
        res.send(global.Response(role));
    }
    catch (err) {
        global.DumpError(err)
        res.status(err.status?err.status:500).send(global.ErrorResponse(err.message));
    }
});
Router.delete('/:roleId', async (req, res) => {
    try {
        if (!req.user.role.masterData.delete)
            return res.sendStatus(403)
        if(!req.params.roleId)
            return res.sendStatus(400)
        const roleId=await roleController.deleteRole(req.params.roleId);
        res.send(global.Response(roleId));
    }
    catch (err) {
        global.DumpError(err)
        res.status(err.status?err.status:500).send(global.ErrorResponse(err.message));
    }
});

module.exports = Router

/**
 * @swagger
 * /api/role:
 *      get:
 *          tags:
 *              - Role
 *          description: Get Role List
 *          responses:
 *              '200':
 *                  description: OK
 *          security:
 *              - Bearer: []
 *      post:
 *          tags:
 *              - Role
 *          description: Create Role
 *          responses:
 *              '200':
 *                  description: OK
 *          security:
 *              - Bearer: []
 *          requestBody:
 *              description: "Role data"
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/roleData'
 *      put:
 *          tags:
 *              - Role
 *          description: Update Role
 *          responses:
 *              '200':
 *                  description: OK
 *          security:
 *              - Bearer: []
 *          requestBody:
 *              description: "Role data"
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/roleData'
 * /api/role/{roleId}:
 *      get:
 *          tags:
 *              - Role
 *          description: Get Role Data
 *          responses:
 *              '200':
 *                  description: OK
 *          security:
 *              - Bearer: []
 *          parameters:
 *          -   name: roleId
 *              in: path
 *              required: true
 *      delete:
 *          tags:
 *              - Role
 *          description: Delete Role
 *          responses:
 *              '200':
 *                  description: OK
 *          security:
 *              - Bearer: []
 *          parameters:
 *          -   name: roleId
 *              in: path
 *              required: true
 */