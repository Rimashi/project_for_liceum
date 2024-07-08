const userService = require('../service/user-service');
const {validationResult} = require('express-validator');
const path = require("path");
const fs = require('fs');


const createPath = (page) => path.resolve(__dirname, '../views', `${page}.ejs`);


//==============================================FUNCTIONS===============================================================

function delFiles(files) {
    if (files.length >= 1) {
        try {
            for (let i in files) {
                let filePath = './files_from_users/' + files[i].filename;
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('файл прикрепленный к заданию не найден. Вероятно только что загруженный файл не прошел проверку и возможно остался на сервере. Ошибка при удалении файла:', err);
                    }
                });
            }
        } catch (e) {
            console.error(e);
        }
    }
}

//==============================================CLASS CONTROLLER========================================================
class UserController {

//==============================================REGISTRATION============================================================
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.render(createPath(''));
            }

            const {name, surname, class_, pass, status} = req.body;
            console.log(name, surname, pass, class_, status);
            const userData = await userService.registration(name, surname, class_, pass, status);
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

//=======================================CHANGE LOGIN AND PASSWORD======================================================
    async changeLogPass(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            let data = req.body;
            console.log(data);
            if (refreshToken) {
                const user = await userService.user(refreshToken);
                await userService.changeLogPass(data['login'], data['pass'], user);
            }
            return res.redirect('/');

        } catch (e) {
            next(e);
        }
    }

//=================================================LOGIN================================================================
    async login(req, res, next) {
        try {
            const {login, pass} = req.body;
            console.log(login, pass);
            let user_login = login || '';
            const userData = await userService.login(user_login.trim().toLowerCase(), pass);

            switch (userData) {
                case "userNone":
                    return res.json({error: userData});
                case "passwordNone":
                    return res.json({error: userData});
            }
            //console.log(userData.user.status);
            res.cookie('accessToken', userData.accessToken, {
                maxAge: 1000 * 60 * 15,
                httpOnly: true,
                secure: true,
                sameSite: "strict"
            });
            res.cookie('refreshToken', userData.refreshToken, {
                maxAge: 1000 * 60 * 60 * 24 * 7,
                httpOnly: true,
                secure: true,
                sameSite: "strict"
            });
            return res.json({success: userData.data[0], token: [userData.accessToken, userData.refreshToken]});
        } catch (e) {
            next(e);
        }
    }

//=================================================LOGOUT===============================================================
    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            await userService.logout(refreshToken);
            res.clearCookie('refreshToken');
            res.clearCookie('accessToken');
            return res.redirect('/');
        } catch (e) {
            next(e);
        }
    }

//---------------------------------------------ADD HOMETASK MODAL-------------------------------------------------------

//GET SUBJECTS----------------------------------------------------------------------------------------------------------
    async studentModal(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const surname = await userService.user(refreshToken);
            let subjects = await userService.getSubjects(surname.class);
            return res.json({subjects: subjects});
        } catch (e) {
            next(e);
        }
    }

//GET SUBJECTS DATE-----------------------------------------------------------------------------------------------------
    async studentModalDate(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            await userService.user(refreshToken);
            const data = req.query;
            let subject = data['subject'];
            console.log(data, subject);
            let date = await userService.getDate(refreshToken, subject);
            return res.json({dates: date});
        } catch (e) {
            next(e);
        }
    }

//ADD HOMEWORK FUNCTION-------------------------------------------------------------------------------------------------
    async HometaskSend(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            let hometask = req.body.text;
            let date = req.body.date;
            let subject = req.body.subject;
            let file = req.files;

            const regex = /<\/?[a-z][^>]*>/gi;
            if (hometask.includes("<script") > 0 || hometask.includes("<php") || hometask.match(regex)) {
                let user = await userService.user(refreshToken);
                console.log(user.surname, user.name, " попробовал написать скрипт");
                return res.json({error: "script"});
            }
            if (hometask.length > 5000) {
                return res.json({error: "large"});
            }
            const write = await userService.writeHomework(refreshToken, hometask, subject, date, file);
            switch (write.problems) {
                case "noneHomework":
                    delFiles(file);
                    return res.json({error: "no homework"});
                case "noneSubject":
                    delFiles(file);
                    return res.json({error: "no subject"});
                case "noneDate":
                    delFiles(file);
                    return res.json({error: "no date"});
                case "person has written":
                    delFiles(file);
                    return res.json({error: "person has written"});
                case "none":
                    return res.json({success: "success"});
                default:
                    delFiles(file);
                    return res.json({error: "Something went wrong with homework"});
            }
        } catch (e) {
            next(e);
        }
    }

//---------------------------------------------------MODALS-------------------------------------------------------------

//NOTIFICATION----------------------------------------------------------------------------------------------------------
    async leaderNotify(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            let data = req.body;
            const regex = /<\/?[a-z][^>]*>/gi;
            if (data['notify'].includes("<script") > 0 || data['notify'].includes("<php") || data['notify'].match(regex)) {
                let user = await userService.user(refreshToken);
                console.log(user.surname, user.name, " попробовал написать скрипт, может забрать модератора?");
                return res.json({error: "script"});
            }
            if (data['notify'].length > 500) {
                return res.json({error: "large"});
            }
            await userService.leaderNotification(refreshToken, data['notify']);

            return res.redirect('/');

        } catch (e) {
            next(e);
        }

    }

//EVENTS----------------------------------------------------------------------------------------------------------------
    async event(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            let data = req.body;
            const regex = /<\/?[a-z][^>]*>/gi;
            if (data['text'].includes("<script") > 0 || data['text'].includes("<php") || data['text'].match(regex)) {
                let user = await userService.user(refreshToken);
                console.log(user.surname, user.name, " попробовал написать скрипт, может забрать модератора?");
                return res.json({error: "script"});
            }
            if (data['place'].includes("<script") > 0 || data['place'].includes("<php") || data['place'].match(regex)) {
                let user = await userService.user(refreshToken);
                console.log(user.surname, user.name, " попробовал написать скрипт, может забрать модератора?");
                return res.json({error: "script"});
            }
            if (data['text'].length > 1000 || data['place'].length > 250) {
                return res.json({error: "large"});
            }
            await userService.leaderEvents(refreshToken, data['place'], data['date'], data['text']);

            return res.redirect('/');

        } catch (e) {
            next(e);
        }
    }

//FOR HOMEWORK CHECK MODAL----------------------------------------------------------------------------------------------

//GET HOMEWORK--------------------------------------------------------
    async leaderCheck(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const user = await userService.user(refreshToken);
            let hometasks = await userService.getCheckHomework(user.class);
            return res.json({hometasks: hometasks});

        } catch (e) {
            next(e);
        }
    }

//ADD HOMETASK--------------------------------------------------------
    async leaderModalAdd(req, res, next) {
        try {
            let data = req.body;
            await userService.leaderHomeworkAdd(data);
            return res.redirect('/');
        } catch (e) {
            next(e);
        }
    }

//DELETE HOMETASK-----------------------------------------------------
    async leaderModalDel(req, res, next) {
        try {
            let data = req.body;
            await userService.leaderHomeworkDel(data);
            return res.redirect('/');
        } catch (e) {
            next(e);
        }
    }

//BAN USER AND DELETE HOMETASK-----------------------------------------
    async leaderModalBan(req, res, next) {
        try {
            let data = req.body;
            await userService.leaderHomeworkBan(data);
            return res.redirect('/');
        } catch (e) {
            next(e);
        }
    }

}


module.exports = new UserController();
