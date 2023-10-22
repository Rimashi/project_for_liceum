const tokenService = require('../service/token-service');
const path = require("path");
const userController = require('../controllers/user-controller');

const createPath = (page) => path.resolve(__dirname, '../views', `${page}.ejs`);

module.exports = async function (req, res, next) {
    try {
        const tokens = req.cookies;
        //console.log(tokens.accessToken);
        if (tokens.redirect_errors) {
            console.log("refresh_token_not_found");///
            return next();
        }
        if (tokens.accessToken) {
            const refresh = tokens.refreshToken;

            const userData = tokenService.validateRefreshToken(refresh);

            const userDataAccess = tokenService.validateAccessToken(tokens.accessToken);

            //console.log(`access - ${tokens.accessToken} ::: refresh - ${tokens.refreshToken}`);///
            //console.log(`${userData.status} - статус в редиректе, ${userDataAccess} --access`);///

            if (userData && userDataAccess) {
                switch (userData.status) {
                    case "student":
                        console.log("student redirect");///
                        return res.redirect("/student");
                    case "leader":
                        return res.redirect('/leader');
                    case "admin":
                        return res.redirect('/admin');
                    default:
                        console.log("status is not defind");
                        return res.redirect('/');
                }
            } else {
                if (userDataAccess === null) {
                    console.log("refreshToken not valid");
                    const token = await userController.refresh(req, res, next);
                    //console.log(token)
                    switch (token) {
                        case "userNone":
                            //res.cookie('redirect_errors', true);
                            return next();
                        case "passwordNone":
                            //res.cookie('redirect_errors', true);
                            return next();
                        case "/":
                            return next();
                        default:
                            res.redirect("/" + token[0]);
                    }
                }
            }
            return next();
        } else {
            const refresh = tokens.refreshToken;
            //console.log(refresh);
            //console.log(tokenService.validateRefreshToken(refresh));
            if (refresh) {
                //console.log(refreshToken);
                if (!refresh) {
                    console.log("problem with refresh");///
                    return next();
                } else {
                    console.log("refresh");///
                    const token = await userController.refresh(req, res, next);
                    //console.log(token);
                    switch (token) {
                        case "userNone":
                            //res.cookie('redirect_errors', true);
                            return next();
                        case "passwordNone":
                            //res.cookie('redirect_errors', true);
                            return next();
                        case "/index":
                            return next();
                        default:
                            res.redirect("/" + token[0]);
                    }
                }
            }
            console.log("problem with tokens");///
            // return res.redirect('/index');
            return next();
        }
    } catch (e) {
        return next(e);
    }

}
