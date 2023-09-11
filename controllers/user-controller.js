const userService = require('../service/user-service');
const {validationResult} = require('express-validator');
const path = require("path");
const {json} = require("express");
const tokenService = require('../service/token-service');
const createPath = (page) => path.resolve(__dirname, '../views', `${page}.ejs`);

const subjectsDict = {
    "8А": ["Английский", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский", "Физ-ра", "Физика", "Химия"],
    "8Б": ["Английский", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский", "Физ-ра", "Физика", "Химия"],
    "8В": ["Английский", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский", "Физ-ра", "Физика", "Химия"],
    "8Г": ["Английский", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский", "Физ-ра", "Физика", "Химия"],
    "8Д": ["Английский", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский", "Физ-ра", "Физика", "Химия"],
    "8Е": ["Английский", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский", "Физ-ра", "Физика", "Химия"],
    "9А": ["Английский", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский", "Физ-ра", "Физика", "Химия"],
    "9Б": ["Английский", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский", "Физ-ра", "Физика", "Химия"],
    "9В": ["Английский", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский", "Физ-ра", "Физика", "Химия"],
    "9Г": ["Английский", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский", "Физ-ра", "Физика", "Химия"],
    "9Д": ["Английский", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский", "Физ-ра", "Физика", "Химия"],
    "9Е": ["Английский", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский", "Физ-ра", "Физика", "Химия"],
    "10А": ["Английский", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский", "Физ-ра", "Физика", "Химия"],
    "10Б": ["Английский", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский", "Физ-ра", "Физика", "Химия"],
    "10В": ["Английский", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский", "Физ-ра", "Физика", "Химия"],
    "10Г": ["Английский", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский", "Физ-ра", "Физика", "Химия"],
    "10Д": ["Английский", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский", "Физ-ра", "Физика", "Химия"],
    "11А": ["Английский", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский", "Физ-ра", "Физика", "Химия"],
    "11Б": ["Английский", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский", "Физ-ра", "Физика", "Химия"],
    "11В": ["Английский", "Астрономия", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Прикл.прог", "Род.яз", "Русский", "Физ-ра", "Физика", "Химия"],
    "11Г": ["Английский", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский", "Физ-ра", "Физика", "Химия"],
    "11Д": ["Английский", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский", "Физ-ра", "Физика", "Химия"]
}

class UserController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.render(createPath('index'));
            }

            const {login, pass} = req.body;
            const userData = await userService.registration(login, pass);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true});
            return res.json(userData);
        } catch (e) {
            return next(e);
        }
    }

//login-----------------------------------------------------------------------------------------------------------------

    async login(req, res, next) {
        try {
            const {login, pass} = req.body;

            const userData = await userService.login(login, pass);
            //console.log(userData);
            switch (userData) {
                case "userNone":
                    return res.redirect("/index");
                case "passwordNone":
                    return res.redirect("/index");
            }
            //console.log(userData.user.status);
            res.cookie('accessToken', userData.accessToken, {maxAge: 1000 * 60 * 15, httpOnly: true, secure: true});
            res.cookie('refreshToken', userData.refreshToken, {
                maxAge: 1000 * 60 * 60 * 24 * 7,
                httpOnly: true,
                secure: true
            });
            //console.log(`userData - ${userData}`);
            switch (userData.data[0]) {
                case "student":
                    const str = userData.data[1] + " " + userData.data[2];
                    //console.log(str);
                    console.log("try to redirect");
                    return res.redirect("/student");
                case "leader":
                    return res.redirect("/leader");
                case "admin":
                    return res.redirect("/admin");
                default:
                    console.log("status is not defind");
                    return res.redirect('/index');
            }
        } catch (e) {
            return next(e);
        }
    }

//logout----------------------------------------------------------------------------------------------------------------

    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const token = await userService.logout(refreshToken);
            //console.log(`token - ${token}, refresh - ${refreshToken}`);
            res.clearCookie('refreshToken');
            res.clearCookie('accessToken');
            return res.redirect('/index');
        } catch (e) {
            return next(e);
        }
    }

//info------------------------------------------------------------------------------------------------------------------

    async infoPage(req, res, next) {
        try {
            return res.render(createPath("info"));
        } catch (e) {
            return next(e);
        }
    }

//subjects--------------------------------------------------------------------------------------------------------------

    async subjects(req, res, next) {
        try {//думать
            // const {login, pass} = req.body;
            // const userData = await userService.login(login, pass);
            // res.cookie('refreshToken', userData.refreshToken, {maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true});
            // return res.json(userData);

        } catch (e) {
            return next(e);
        }
    }

//timetable-------------------------------------------------------------------------------------------------------------

    async timetable(req, res, next) {
        try {
            // const {login, pass} = req.body;
            // const userData = await userService.login(login, pass);
            // res.cookie('refreshToken', userData.refreshToken, {maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true});
            // return res.json(userData);
            return res.render(createPath("schedule"));
        } catch (e) {
            return next(e);
        }
    }

//map-------------------------------------------------------------------------------------------------------------------

    async map(req, res, next) {
        try {
            const {login, pass} = req.body;
            const userData = await userService.login(login, pass);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true});
            return res.json(userData);

        } catch (e) {
            return next(e);
        }
    }

//index-----------------------------------------------------------------------------------------------------------------

    async indexPage(req, res, next) {
        try {
            return res.render(createPath("index"));
        } catch (e) {
            return next(e);
        }
    }

//student---------------------------------------------------------------------------------------------------------------

    async studentPage(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const surname = await userService.student(refreshToken);
            const homework = await userService.getHomework(refreshToken);
            console.log(surname, " - surname");//верни
            return res.render(createPath("main-student"), {
                surname: surname.surname,
                homework: homework
            });
        } catch (e) {
            return next(e);
        }
    }

    async studentModal(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const surname = await userService.student(refreshToken);
            console.log(surname, " - surname");//верни
            return res.json({subjects: subjectsDict[surname.class]});
        } catch (e) {
            return next(e);
        }
    }

    async studentPagePost(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const {homework_text, subject, date} = req.body;
            console.log("post", homework_text, subject, date);
            const surname = await userService.writeHomework(refreshToken, homework_text, subject, date);
            switch (surname.problems) {
                case "noneDate":
                    console.log("date was not selected");
                    return res.render(createPath("main-student"), {
                        surname: surname.user[1],
                        subjects: subjectsDict[surname.user[2]],
                        problems: "date was not selected"
                    });
                case "noneHomework":
                    console.log("Homework was not write");
                    return res.render(createPath("main-student"), {
                        surname: surname.user[1],
                        subjects: subjectsDict[surname.user[2]],
                        problems: "Homework was not write"
                    });
                case "noneSubject":
                    console.log("subject was not selected");
                    return res.render(createPath("main-student"), {
                        surname: surname.user[1],
                        subjects: subjectsDict[surname.user[2]],
                        problems: "subject was not selected"
                    });
                case "none":
                    return res.render(createPath("main-student"), {
                        surname: surname.user[1],
                        subjects: subjectsDict[surname.user[2]],
                        problems: "none"
                    });
                default:
                    console.log("smth wrong with homework");
                    return res.render(createPath("main-student"), {
                        surname: surname.user[1],
                        subjects: subjectsDict[surname.user[2]],
                        problems: "unknown"
                    });
            }
        } catch (e) {
            return next(e);
        }
    }


//leader----------------------------------------------------------------------------------------------------------------

    async leaderPage(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const user = await userService.leader(refreshToken);
            console.log(user);
            if (user.status === "leader")
                return res.render(createPath("main-leader"));
            else return res.redirect("/index");
        } catch (e) {
            return next(e);
        }
    }

//admin-----------------------------------------------------------------------------------------------------------------

    async adminPage(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const user = await userService.admin(refreshToken);
            console.log(user);
            if (user.status === "admin")
                return res.render(createPath("main-admin"));
            else return res.redirect("/index");
        } catch (e) {
            return next(e);
        }
    }

//refresh---------------------------------------------------------------------------------------------------------------

    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const token = await userService.refresh(refreshToken);
            if (token === "userNone" || token === "passwordNone" || null)
                return token;
            //console.log(`token  - ${token}`)///
            //console.log(`access token - ${token.accessToken} :: ${token.refreshToken} -- valid -- ${tokenService.validateRefreshToken(token.refreshToken)}`);
            console.log(`find - ${await tokenService.findToken(token.refreshToken)}`);///
            try {
                res.cookie('accessToken', token.accessToken, {maxAge: 1000 * 60 * 15, httpOnly: true, secure: true});
                res.cookie('refreshToken', token.refreshToken, {
                    maxAge: 1000 * 60 * 60 * 24 * 7,
                    httpOnly: true,
                    secure: true
                });
            } catch (e) {
                console.log(e);
            }
            switch (token.data[0]) {
                case "student":
                    return token.data;
                case "leader":
                    return token.data;
                case "admin":
                    return token.data;
                default:
                    console.log("status is not defind");
                    return '/index';
            }
        } catch (e) {
            return next(e);
        }
    }
}


module.exports = new UserController();
