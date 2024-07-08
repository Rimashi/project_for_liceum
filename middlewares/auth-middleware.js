const tokenService = require('../service/token-service');

module.exports = async function (req, res, next) {
    try {
        const access = req.cookies.accessToken;
        if (!access) {
            const refresh = req.cookies.refreshToken;
            if (!refresh) {
                return res.redirect('/');
            }
            const isRefresh = await tokenService.validateRefreshToken(refresh);
            if (isRefresh) {
                return next();
            }
            return res.redirect('/');
        }
        const isAccess = await tokenService.validateAccessToken(access);
        if (!isAccess) {
            res.clearCookie('refreshToken');
            res.clearCookie('accessToken');
            return res.redirect('/');
        }

        return next();
    } catch (e) {
        console.log("wrong authorization")
        res.redirect('/');
    }
}
