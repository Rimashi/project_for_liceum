const tokenService = require('../service/token-service');
const userController = require('../controllers/user-controller');

module.exports = async function (req, res, next) {
    try {
        const tokens = req.cookies;
        if (tokens.redirect_errors) {
            console.log("problem with tokens");
            return res.redirect('/');
        }

        let refreshToken = tokens.refreshToken;
        if (tokens.accessToken) {
            let accesValid = tokenService.validateAccessToken(tokens.accessToken);
            let refreshValid = tokenService.validateRefreshToken(refreshToken);
            if (accesValid && refreshValid) {

                switch (accesValid.status) {
                    case "student":
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
                let refreshFunc = await userController.refresh(req, res, next);
                switch (refreshFunc) {
                    case "userNone":
                        return next();
                    case "passwordNone":
                        return next();
                    case "/":
                        return next();
                    default:
                        return res.redirect("/" + refreshFunc[0]);
                }
            }
        } else {
            let refreshValid = tokenService.validateRefreshToken(refreshToken);
            if (!refreshValid) {
                return next();
            }
            let refreshFunc = await userController.refresh(req, res, next);
            if (refreshValid)
                switch (refreshFunc) {
                    case "userNone":
                        return next();
                    case "passwordNone":
                        return next();
                    case "/":
                        return next();
                    default:
                        return res.redirect("/" + refreshFunc[0]);
                }
            return next();
        }
    } catch (e) {
        return next(e);
    }

}
