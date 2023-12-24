const apiError = require('../dtos/api-error');
const path = require("path");

const createPath = (page) => path.resolve(__dirname, '../views', `${page}.ejs`);
module.exports = function (err, req, res, next) {
    // console.log(err);

    if (err instanceof apiError) {
        return res.status(err.status).redirect(`/error?status=${err.status}&message=${encodeURIComponent(err.message)}`);
    }
    return res.status(500).redirect(`/error?status=${500}&message=${encodeURIComponent("Произошла непредвиденная ошибка на сервере" + err.message)}`);
}
