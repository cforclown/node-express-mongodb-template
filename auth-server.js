"use strict";

const config=require('./config');
const database = require("./database/database");
const global=require('./global/global');



database.connect().then(() => {
    try{
        const app = require('./auth-app');
        app.listen(app.get("port"), app.get("host"), function () {
            global.LogBgGreen("============================================================================");
            global.LogGreen(`| ${config.NODE_ENV.toUpperCase()} MODE`);
            global.LogGreen(`| AUTH-SERVER LISTENING ON PORT ${app.get("port")}`);
            global.LogGreen('| DATABASE CONNECTED')
            global.LogBgGreen("============================================================================");
        });
    }
    catch(err){
        global.DumpError(err);
    }
}).catch(err=>{
    global.DumpError(err);
    global.LogError('!! DATABASE CONNECTION FAILED: '+err.message);
})