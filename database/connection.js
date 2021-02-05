const config = require('../config');
const mongoose = require("mongoose");

mongoose.connect(
    `mongodb://${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`,
    {
        auth: { authSource: "admin" },
        user: config.DB_USERNAME,
        pass: config.DB_PASSWORD,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
);

mongoose.connection.on(
    "error",
    console.error.bind(console, "connection error:")
);
mongoose.connection.once("open", () => {
    console.log(`===================== DB CONNECTED ======================`);
});

//#region -----------------INTIATE MODEL HERE----------------
const userModel = require("./model/user.model");
const roleModel = require("./model/role.model");
const tokenModel = require("./model/token.model");
//#endregion
