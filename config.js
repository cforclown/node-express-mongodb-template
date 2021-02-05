const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
    path: path.resolve(__dirname, process.env.NODE_ENV + '.env')
});

module.exports = {
    NODE_ENV: process.env.NODE_ENV || 'development',

    //#region ============================== SERVER =====================================
    SERVER_HOST: process.env.SERVER_HOST || '127.0.0.1',
    SERVER_PORT: process.env.SERVER_PORT || 55522,
    APP_HOST: process.env.APP_HOST || 'http://localhost:57575 http://localhost:75757',                  // array separate by space
    //#endregion ========================================================================

    //#region ============================ AUTH SERVER ==================================
    AUTH_SERVER_HOST: process.env.AUTH_SERVER_HOST || '127.0.0.1',
    AUTH_SERVER_PORT: process.env.AUTH_SERVER_PORT || 52525,
    AUTH_SERVER_APP: process.env.AUTH_SERVER_APP || 'http://localhost:57575 http://localhost:57575',    // array separate by space
    //#endregion ========================================================================

    //#region ============================= DATABASE ====================================
    DB_HOST: process.env.DB_HOST || '127.0.0.1',        // database host, default=localhost
    DB_PORT: process.env.DB_PORT || 27017,              // database port, default=mongodb default port
    DB_USERNAME: process.env.DB_USERNAME || 'root',     // database username authentication, default=root
    DB_PASSWORD: process.env.DB_PASSWORD || 'haha',     // database password authentication, default=haha
    DB_NAME: process.env.DB_NAME || '<default-db-name>',// database name
    //#endregion ========================================================================

    //#region =========================== SESSION CONFIG ================================
    SESSION_SECRET: process.env.SESSION_SECRET || '<default-session-secret>',
    SESSION_RESAVE: process.env.SESSION_RESAVE || false,
    SESSION_SAVE_UNINITIALIZED: process.env.SESSION_SAVE_UNINITIALIZED || false,
    SESSION_COOKIE_MAX_AGE: process.env.SESSION_COOKIE_MAX_AGE || 3600,
    //#endregion ========================================================================

    //#region ============================ ACCESS TOKEN =================================
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || '<default-access-token-secret>',
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || '<default-refresh-token-secret>',
    ACCESS_TOKEN_EXP_IN: process.env.ACCESS_TOKEN_EXP_IN || 3600,
    //#endregion ========================================================================
}