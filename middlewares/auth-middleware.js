const tokenService = require('../service/token-service');

module.exports = function (req, res, next) {
    try {
        const access = req.cookies.accessToken;
        if (!access) {
            return res.redirect('/');
        }
        const userData = tokenService.validateAccessToken(access);
        if (!userData) {
            return res.redirect('/');
        }

        req.user = userData;
        //console.log("auth-mid");
        return next();
    } catch (e) {
        console.log("wrong authorization")
        res.redirect('/');
    }
}
