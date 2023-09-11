const UserModel = require('../models/user-model');
const timetableModel = require('../models/timetable-model');
const notificationModel = require('../models/notification-model');
const hometaskModel = require('../models/hometask-model');
const eventModel = require('../models/event-model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const tokenService = require('../service/token-service');
const UserDto = require('../dtos/user-dto');
const json = require('express').json();


class UserService {
//reg-------------------------------------------------------------------------------------------------------------------

    async registration(login, password) {
        console.log(login, password);
        try {
            if (login.split(" ").length - 1 === 0) {
                const candidate = await UserModel.findOne({login: login});
                if (candidate) {
                    // throw ApiError.BadRequest(`пользователь ${login} уже существует`);
                    return null;
                }
            } else {
                const name = login.split(' ')[0];
                const surname = login.split(' ')[1];
                const candidate = await UserModel.findOne({name: name, surname: surname});
                if (candidate) {
                    // throw ApiError.BadRequest(`пользователь ${login} уже существует`);
                    return null;
                }
            }
        } catch (e) {
            console.log(e);
        }
        const hashpassword = await bcrypt.hash(password, 3);

        if (login.split(" ").length - 1 === 0) {
            const user = await UserModel.create(
                {
                    name: "Филиппов",
                    surname: "Егор",
                    login: "rtfet",
                    password: hashpassword,
                    class: "11А",
                    status: "student",
                    rating: 0
                }
            );
            const userDto = new UserDto(user);
            console.log(userDto);
            const tokens = tokenService.generateTokens({...userDto});
            await tokenService.saveToken(userDto.id, tokens.refreshToken);

            return {
                ...tokens,
                user: UserDto
            }
        } else {
            const name = login.split(' ')[0];
            const surname = login.split(' ')[1];
            const user = await UserModel.create({
                name: name, surname: surname,
                password: hashpassword, class: "11b",
                status: "student", rating: 0
            });
            const userDto = new UserDto(user);
            const tokens = tokenService.generateTokens({...userDto});
            await tokenService.saveToken(userDto.id, tokens.refreshToken);

            return {
                ...tokens,
                user: UserDto
            }
        }

    }

//login-----------------------------------------------------------------------------------------------------------------

    async login(login, password) {
        if (login.split(" ").length - 1 === 0) {
            const user = await UserModel.findOne({login});
            if (!user) {
                //throw ApiError.BadRequest('Пользователь не найден');
                return "userNone";
            }

            const isPassTrue = await bcrypt.compare(password, user.password);
            if (!isPassTrue) {
                //throw ApiError.BadRequest('Неверный пароль');
                return "passwordNone";
            }
            const data = [];
            data.push(user.status, user.surname, user.class);
            const userDto = new UserDto(user);
            const tokens = tokenService.generateTokens({...userDto});
            await tokenService.saveToken(userDto.id, tokens.refreshToken);

            return {
                ...tokens,
                data,
                user: UserDto
            }

        } else {
            const name = login.split(' ')[0];
            const surname = login.split(' ')[1];
            const user = await UserModel.findOne({name: name, surname: surname});
            if (!user) {
                //throw ApiError.BadRequest('Пользователь не найден');
                return "userNone";
            }

            const isPassTrue = await bcrypt.compare(password, user.password);
            if (!isPassTrue) {
                //throw ApiError.BadRequest('Неверный пароль');
                return "passwordNone";
            }

            const data = [];
            data.push(user.status, user.surname, user.class);
            const userDto = new UserDto(user);
            const tokens = tokenService.generateTokens({...userDto});
            await tokenService.saveToken(userDto.id, tokens.refreshToken);

            return {
                ...tokens,
                data,
                user: UserDto
            }

        }
    }

//logout----------------------------------------------------------------------------------------------------------------

    async logout(refreshToken) {
        return await tokenService.removeToken(refreshToken);
    }

//refresh---------------------------------------------------------------------------------------------------------------

    async refresh(refreshToken) {
        if (!refreshToken) {
            // throw ApiError.UnathorizedError();
            return "userNone";
        }
        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromdb = await tokenService.findToken(refreshToken);
        if (!userData || !tokenFromdb) {
            // throw ApiError.UnathorizedError();
            return "passwordNone";
        }

        const user = await UserModel.findById(userData.id);
        //console.log(`user - ${user}`);///
        const data = [];
        data.push(user.status, user.surname, user.class);
        const userDto = new UserDto(user);
        //console.log(`userDto - ${userDto}`);///
        await tokenService.removeToken(refreshToken);
        const tokens = tokenService.generateTokens({...userDto});
        //console.log(`tokens - ${tokens}`);///
        await tokenService.removeToken(tokens.refreshToken);
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            data,
            user: UserDto
        }
    }

//student---------------------------------------------------------------------------------------------------------------

    async getHomework(refreshToken) {
        const userData = tokenService.validateRefreshToken(refreshToken);
        const user = await UserModel.findById(userData.id);
        const homework = await hometaskModel.find({class: user.class});
        console.log(homework, " - homework");
        return homework;
    }

    async writeHomework(refreshToken, homework, subject, date) {
        const userData = tokenService.validateRefreshToken(refreshToken);
        const user = await UserModel.findById(userData.id);
        console.log(user);
        const isWritten = await hometaskModel.findOne({surname: user.surname, subject: subject});
        if (isWritten) {
            console.log("this person written homework")
            return {user, problems: "person has written"};
        }
        if (homework === "" || homework === undefined) {
            console.log("smth wrong with data");
            return {user, problems: "noneHomework"};
        }
        if (subject === "" || subject === undefined) {
            console.log("smth wrong with data");
            return {user, problems: "noneSubject"};
        }
        if (date === "" || date === undefined) {
            console.log("smth wrong with data");
            return {user, problems: "noneDate"};
        }
        await hometaskModel.create({
            surname: user.surname, text: homework, class: user.class,
            subject: subject, date: date
        });
        return {user, problems: "none"};

    }

    async student(refreshToken) {
        const userData = tokenService.validateRefreshToken(refreshToken);
        const user = await UserModel.findById(userData.id);
        return user;
    }

    async leader(refreshToken) {
        const userData = tokenService.validateRefreshToken(refreshToken);
        const user = await UserModel.findById(userData.id);
        return user;
    }

    async admin(refreshToken) {
        const userData = tokenService.validateRefreshToken(refreshToken);
        const user = await UserModel.findById(userData.id);
        return user;
    }
}


module
    .exports = new UserService();
