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
const global = require("./global/global");

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const swaggerSchemas=require('./swagger-schemas');
const swaggerPaths=require('./swagger-paths');



// CREATE FOLDER dump-log IF NOT EXIST
const fs = require("fs");
if (!fs.existsSync("./dump-log"))
    fs.mkdirSync("./dump-log");
// IF NODE_ENV IS test, DEFINE DB SCHEMAs
if(config.NODE_ENV==='test')
    require('./database/database').registerModels();

    

const apiRouter = require('./router/api/api');



const app = express();

//#region ------------------------------CONFIG MIDDLEWARE---------------------------
app.use(logger("dev"));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

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



//#region -------------------------------SWAGGER CONFIG-----------------------------
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
                url: "https://hafisalrizal.com",
                email: "hafisalrizal@gmail.com",
            },
            servers: [`http://${config.SERVER_HOST}:${config.SERVER_PORT}`]
        },
        consumes: [ "application/json", ],
        produces: [ "application/json", ],
        schemes: ["http", "https"],
        components: {
            schemas:swaggerSchemas,
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
    apis: ["server.js", './router/api/router/*.js'],
}
const swaggerDocs = swaggerJsDoc(swaggerOptions)
app.use('/api/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs))
//#endregion -----------------------------------------------------------------------



//#region -----------------------------------ROUTES---------------------------------
app.use('/api', apiRouter);

// WEB PAGE
app.get('/*', (req, res)=>{
    res.sendFile(path.join(__dirname, 'public/index.html'));
})
//#endregion -----------------------------------------------------------------------



app.set("port", config.SERVER_PORT);
app.set("host", config.SERVER_HOST);

module.exports=app;