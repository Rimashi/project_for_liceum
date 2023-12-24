const jwt = require('jsonwebtoken');
const tokenModel = require('../models/token-model');

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN, {expiresIn: '15m'});
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_TOKEN, {expiresIn: '7d'});
        return {
            accessToken,
            refreshToken
        }
    }

    validateAccessToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
        } catch (e) {
            return null;
        }
    }

    validateRefreshToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_REFRESH_TOKEN);
        } catch (e) {
            return null;
        }
    }

    async saveToken(userId, refreshToken) {
        const tokenData = await tokenModel.findOne({user: userId});
        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return tokenData.save();
        }
        return await tokenModel.create({user: userId, refreshToken: refreshToken});
    }

    async removeToken(refreshToken) {
        return tokenModel.deleteOne({refreshToken: refreshToken});
    }

    async findToken(refreshToken) {
        return tokenModel.findOne({refreshToken: refreshToken});
    }

    async findUserById(userId) {
        let refreshToken = await tokenModel.findOne({user: userId});
        if (refreshToken === null)
            return null;
        return refreshToken['refreshToken'];
    }

}


module.exports = new TokenService();
