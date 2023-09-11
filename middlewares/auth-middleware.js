const tokenService = require('../service/token-service');
const path = require("path");
const createPath = (page) => path.resolve(__dirname, '../views', `${page}.ejs`);

module.exports = function (req, res, next) {
    try {
        const access = req.cookies.accessToken;
        if (!access) {
            return res.redirect('/index');
        }
        const userData = tokenService.validateAccessToken(access);
        if (!userData) {
            return res.redirect('/index');
        }
        //console.log(userData);
        // switch (userData.status) {
        //     case "student":
        //         return res.redirect("/student");
        //     case "leader":
        //         return res.redirect('/leader');
        //     case "admin":
        //         return res.redirect('/admin');
        //     default:
        //         console.log("status is not defind");
        //         return res.redirect('/index');
        // }

        req.user = userData;
        console.log("auth-mid");
        return next();
    } catch (e) {
        console.log("wrong authorization")
        res.redirect('/index');
    }
}
