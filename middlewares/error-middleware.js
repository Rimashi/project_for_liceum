const apiError = require('../dtos/api-error');


module.exports = function (err, req, res, next) {
    console.error("ERROR: " + err);
    console.trace(err);

    if (err instanceof apiError) {
        return res.status(err.status).redirect(`/error?status=${err.status}&message=${encodeURIComponent(err.message)}`);
    }
    return res.status(500).redirect(`/error?status=${500}&message=${encodeURIComponent("Произошла непредвиденная ошибка на сервере")}`);
}
