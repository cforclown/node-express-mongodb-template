const fs = require('fs').promises
const moment=require('moment')
const CryptoJS = require("crypto-js");
const path=require('path')
const consoleOut = require('./console_out')

exports.Response=function(data, errorMessage=null){
    return {
        data:data,
        message:errorMessage,
    }
}
exports.UnauthorizedResponse=function(){
    return exports.Response(null, 'UNAUTHORIZED')
}
exports.ForbiddenResponse=function(){
    return exports.Response(null, 'FORBIDDEN')
}
exports.OKResponse=function(){
    return exports.Response('OK', null)
}
exports.DumpError=function(_err, saveLog=true){
    console.log(consoleOut.TextError, '===================================');
    if (typeof _err === 'object') {
        console.log(consoleOut.TextYellow, `MESSAGE: ${_err.message?_err.message:''}`)
        if (_err.codeMessage)
            console.log(consoleOut.TextYellow, 'CODE_MSG: ' + _err.codeMessage)
        if (_err.stack) {
            console.log(consoleOut.TextRed, 'STACKTRACE------------------>')
            console.log(consoleOut.TextRed, _err.stack);
        }

        if(saveLog){
            const errorMessage=`
            ============================================
            MESSAGE: ${_err.message?_err.message:''}
            STACKTRACE:
            ${_err.stack?_err.stack:''}
            ============================================
            `
            const filename=moment().format('DD MMMM YYYY')+'.txt';
            fs.writeFile(path.join(__dirname, '../dump-log/'+filename), errorMessage)
            .catch(error=>console.log(consoleOut.TextYellow, `FAILED_SAVING_ERROR_LOG: ${error.message}`))
        }
    }
    else {
        console.log(consoleOut.TextError, 'dumpError : argument is not an object');
    }
    console.log(consoleOut.TextError, '===================================')
}
exports.Hash = async function (password) {
    return await CryptoJS.SHA512(password).toString(CryptoJS.enc.Hex)
};