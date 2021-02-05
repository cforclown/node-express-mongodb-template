"use strict";

const config = require('./config');
const express = require("express");
const path = require("path");
const logger = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const expressFlash = require("express-flash");
const cors = require("cors");
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const jwt = require('jsonwebtoken');
const global = require("./global/global");

require("./database/connection"); // START DB_CONNECTION

const userRouter = require('./router/server/user')
const roleRouter = require('./router/server/role')



const app = express();



// CREATE FOLDER dump-log IF NOT EXIST
const fs = require("fs");
if (!fs.existsSync("./dump-log"))
    fs.mkdirSync("./dump-log");

//#region ------------------------------CONFIG MIDDLEWARE---------------------------
app.use(logger("dev"));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// CORS
app.use(cors({
    origin: config.APP_HOST.split(' '),
    credentials: true,
}));

app.use(expressFlash());
app.use(expressSession({
    secret: config.SESSION_SECRET,
    resave: config.SESSION_RESAVE,
    saveUninitialized: config.SESSION_SAVE_UNINITIALIZED,
    cookie: {
        secure: false,
        maxAge: parseInt(config.SESSION_COOKIE_MAX_AGE),
    },
}));
app.use(cookieParser(config.SESSION_SECRET));

app.use(express.static(path.join(__dirname, "public")));
//#endregion -----------------------------------------------------------------------



//#region ------------------------------SWAGGER CONFIG------------------------------
// extended : https://swagger.io/specification/#infoObject
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: "API",
            version: '1.0.0',
            description: "API Documentation",
            contact: {
                name: "Hafis Alrizal",
                url: "https://ha-ha.tech",
                email: "hafisalrizal@gmail.com",
            },
            servers: [`http://${config.SERVER_HOST}:${config.SERVER_PORT}`]
        },
        consumes: [
            "application/json"
        ],
        produces: [
            "application/json"
        ],
        schemes: ["http", "https"],
        components: {
            schemas:{
                userData:{
                    type: "object",
                    properties:{
                        userData:{
                            type: "object",
                            properties:{
                                username: { type: "string", },
                                password: { type: "string", },
                                nama: { type: "string", },
                                jabatanOrDepartment:{ type: "string", },
                                perusahaan:{ type: "string", },
                                email:{ type: "string", },
                                telephone:{ type: "string", },
                                role:{ type:"string", }
                            },
                        }
                    },
                },
                roleData:{
                    type: "object",
                    properties:{
                        roleData:{
                            type: "object",
                            properties:{
                                nama: { type: "string", },
                                user: {
                                    type: "object",
                                    properties:{
                                        view:{ type: "boolean", },
                                        create:{ type: "boolean", },
                                        update:{ type: "boolean", },
                                        delete:{ type: "boolean", },
                                    }
                                },
                                masterData: {
                                    type: "object",
                                    properties:{
                                        view:{ type: "boolean", },
                                        create:{ type: "boolean", },
                                        update:{ type: "boolean", },
                                        delete:{ type: "boolean", },
                                    }
                                },
                            }
                        }
                    }
                },
            },
            securitySchemes: {
                Bearer: {
                    "type": "apiKey",
                    "name": "Authorization",
                    "in": "header"
                },
            }
        },
        securityDefinitions: {
            Bearer: {
                "type": "apiKey",
                "name": "Authorization",
                "in": "header"
            }
        },
        security: {
            Bearer: []
        },
    },
    apis: ["server.js", './router/server/*.js'],
}
const swaggerDocs = swaggerJsDoc(swaggerOptions)
app.use('/api/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs))
//#endregion -----------------------------------------------------------------------



//#region ---------------------------AUTHENTICATION MIDDLEWARE----------------------
app.use(async (req, res, next) => {
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
//#endregion -----------------------------------------------------------------------



//#region -----------------------------------ROUTES HERE------------------------------
app.use('/api/user', userRouter)
app.use('/api/role', roleRouter)
//#endregion -----------------------------------------------------------------------



app.set("port", config.SERVER_PORT);
app.set("host", config.SERVER_HOST);

const server = app.listen(app.get("port"), app.get("host"), function () {
    console.log(`=================== ${config.NODE_ENV.toUpperCase()} MODE ===================`);
    console.log(`============ SERVER LISTENING ON PORT ${server.address().port} =============`);
});