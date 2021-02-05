"use strict";

const config = require('./config');
const express = require("express");
const path = require("path");
const logger = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const expressSession = require("express-session");
const expressFlash = require("express-flash");
const cors = require("cors");
const swaggerJsDoc=require('swagger-jsdoc')
const swaggerUI=require('swagger-ui-express')

require("./database/connection"); // START DB_CONNECTION



const initPassportConfig = require("./passport-config/passport-config");
const authRouter = require("./router/auth-server/auth");
const app = express();

//#region ------------------------------CONFIG MIDDLEWARE---------------------------
app.use(logger("dev"));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// CORS
app.use(cors({
    origin: config.AUTH_SERVER_APP.split(' '),
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

app.use(passport.initialize());
app.use(passport.session());
// INIT PASSPORT CONFIGURATION
initPassportConfig(passport);

app.use(express.static(path.join(__dirname, "public")));
//#endregion -----------------------------------------------------------------------



//#region ------------------------------SWAGGER CONFIG------------------------------
// extended : https://swagger.io/specification/#infoObject
const swaggerOptions={
    definition:{
        // openapi: '3.0.0',
        info:{
            title:"Authentication API",
            version: '1.0.0',
            description:"Authentication API Documentation",
            contact:{
                name:"Hafis Alrizal",
                url: "https://ha-ha.tech",
                email: "hafisalrizal@gmail.com",
            },
            servers:["http://localhost:5252"]
        },
        consumes: [
            "application/json"
        ],
        produces: [
            "application/json"
        ],
        schemes:[ "http", "https" ],
        components:{
            securitySchemes:{
                Bearer: {
                    "type": "apiKey",
                    "name": "Authorization",
                    "in": "header"
                }
            }
        },
        securityDefinitions: {
            Bearer: {
                "type": "apiKey",
                "name": "Authorization",
                "in": "header"
            }
        },
        security:{
            Bearer:[]
        },
    },
    apis:["auth-server.js", './router/auth-server/*.js'],
}
const swaggerDocs=swaggerJsDoc(swaggerOptions)
app.use('/auth-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs))
//#endregion -----------------------------------------------------------------------



//#region -------------------------------ROUTES HERE--------------------------------
app.use('/auth', authRouter)
//#endregion -----------------------------------------------------------------------



app.set("port", config.AUTH_SERVER_PORT || 5252);
app.set("host", config.AUTH_SERVER_HOST || "127.0.0.1");

const server = app.listen(app.get("port"), app.get("host"), function () {
    console.log(`===== AUTHENTICATION SERVER LISTENING ON PORT ${server.address().port} =====`);
});