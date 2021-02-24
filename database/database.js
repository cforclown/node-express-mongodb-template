const config = require("../config");
const mongoose = require("mongoose");



async function connect() {
    const dburl = `mongodb://${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`;
    const options = {
        auth: { authSource: "admin" },
        user: config.DB_USERNAME,
        pass: config.DB_PASSWORD,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    if (config.NODE_ENV === "test") {
        const Mockgoose = require("mockgoose").Mockgoose;
        const mockgoose = new Mockgoose(mongoose);

        await mockgoose.prepareStorage();

        await mongoose.connect(dburl, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true,
        });
    }
    else 
        await mongoose.connect(dburl, options);

    registerModels();
}
function close() {
    return mongoose.disconnect();
}
function registerModels() {
    require("./model/user.model").Model;
    require("./model/role.model").Model;
    require("./model/token.model").Model;
}

module.exports = { connect, close, registerModels };
