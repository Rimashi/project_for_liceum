const userService = require('../service/user-service');
const {validationResult} = require('express-validator');
const path = require("path");
const {json} = require("express");
const tokenService = require('../service/token-service');
const createPath = (page) => path.resolve(__dirname, '../views', `${page}.ejs`);

function ucfirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const subjectsDict = {
    "8_А": ["Англ. язык", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский язык", "Физ-ра", "Физика", "Химия"],
    "8_Б": ["Англ. язык", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский язык", "Физ-ра", "Физика", "Химия"],
    "8_В": ["Англ. язык", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский язык", "Физ-ра", "Физика", "Химия"],
    "8_Г": ["Англ. язык", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский язык", "Физ-ра", "Физика", "Химия"],
    "8_Д": ["Англ. язык", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский язык", "Физ-ра", "Физика", "Химия"],
    "8_Е": ["Англ. язык", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский язык", "Физ-ра", "Физика", "Химия"],
    "9_А": ["Англ. язык", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский язык", "Физ-ра", "Физика", "Химия"],
    "9_Б": ["Англ. язык", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский язык", "Физ-ра", "Физика", "Химия"],
    "9_В": ["Англ. язык", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский язык", "Физ-ра", "Физика", "Химия"],
    "9_Г": ["Англ. язык", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский язык", "Физ-ра", "Физика", "Химия"],
    "9_Д": ["Англ. язык", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский язык", "Физ-ра", "Физика", "Химия"],
    "9_Е": ["Англ. язык", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский язык", "Физ-ра", "Физика", "Химия"],
    "10_А": ["Англ. язык", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский язык", "Физ-ра", "Физика", "Химия"],
    "10_Б": ["Англ. язык", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский язык", "Физ-ра", "Физика", "Химия"],
    "10_В": ["Англ. язык", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский язык", "Физ-ра", "Физика", "Химия"],
    "10_Г": ["Англ. язык", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский язык", "Физ-ра", "Физика", "Химия"],
    "10_Д": ["Англ. язык", "Биология", "География", "Информатика", "Литература", "Математика", "Обж", "Общество", "Русский язык", "Физ-ра", "Физика", "Химия"],
    "11_А": ["Англ. язык", "Астрономия", "Биология", "Информатика", "История", "Литература", "Математика", "Обж", "Общество", "Родной Язык", "Русский язык", "Физ-ра", "Физика"],
    "11_Б": ["Англ. язык", "Астрономия", "Биология", "География", "Информатика", "История", "Литература", "Математика", "Общество", "Родной Язык", "Русский язык", "Физ-ра", "Физика", "Экономика"],
    "11_В": ["Англ. язык", "Астрономия", "Генетика", "География", "Информатика", "История", "Литература", "Математика", "Обж", "Общество", "Web", "Python", "Родной Язык", "Русский язык", "Физ-ра", "Физика", "Химия"],
    "11_Г": ["Англ. язык", "Астрономия", "Биология", "География", "Информатика", "История", "Литература", "Математика", "Обж", "Общество", "Родной Язык", "Русский язык", "Физ-ра", "Химия"],
    "11_Д": ["Англ. язык", "Астрономия", "Биология", "География", "Информатика", "История", "Литература", "Математика", "Немецкий", "Обж", "Общество", "Русский язык", "Стр", "ТП", "Физ-ра", "Французский", "Физика"]
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

            const userData = await userService.login(login.toLowerCase(), pass);
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
            const {refreshToken} = req.cookies;
            if (refreshToken) {
                const surname = await userService.student(refreshToken);
                return res.render(createPath("info"), {
                    surname: ucfirst(surname.surname) + " " + surname.class.split("_")[0] + surname.class.split("_")[1],
                    header: "user"
                });
            }
            return res.render(createPath("info"), {
                header: "header"
            });
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
            const {refreshToken} = req.cookies;
            if (refreshToken) {
                const surname = await userService.student(refreshToken);
                return res.render(createPath("schedule"), {
                    surname: ucfirst(surname.surname) + " " + surname.class.split("_")[0] + surname.class.split("_")[1],
                    header: "user"
                });
            }
            return res.render(createPath("schedule"), {
                header: "header"
            });
        } catch (e) {
            return next(e);
        }
    }

    async timetable_reg(req, res, next) {
        try {
            const {class_, monday, tuesday, wednesday, thursday, friday, saturday} = req.body;
            console.log(class_, monday, tuesday, wednesday, thursday, friday, saturday);
            const userData = await userService.timetable_r(class_, monday, tuesday, wednesday, thursday, friday, saturday);
            return res.json(userData);
        } catch (e) {
            return next(e);
        }
    }

    async get_timetable(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            console.log(refreshToken);
            if (refreshToken) {
                const user = await userService.student(refreshToken);
                const parallel = user.class.split("_")[0];
                const usersData = await userService.getTimetable(parallel, user.class);
                console.log(usersData);
                return res.json(usersData);
            }
            const usersData = await userService.getAllTimetable();
            console.log(usersData);
            return res.json(usersData);
        } catch (e) {
            console.log(e);
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
            const notify = await userService.getNotification(surname.class);
            if (surname.status !== "student")
                return res.redirect('/index');
            const homework = await userService.getHomework(refreshToken);
            //console.log(homework, ' - homework');
            if (!homework)
                return res.render(createPath("main-student"), {
                    surname: ucfirst(surname.surname) + " " + surname.class.split("_")[0] + surname.class.split("_")[1],
                    homework: "none",
                    notification: notify
                });
            //console.log(surname, " - surname");//верни
            const isDone = await userService.clearHomework();
            return res.render(createPath("main-student"), {
                surname: ucfirst(surname.surname) + " " + surname.class.split("_")[0] + surname.class.split("_")[1],
                homework: homework,
                notification: notify
            });
        } catch (e) {
            return next(e);
        }
    }

    async studentModal(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const surname = await userService.student(refreshToken);
            const {subject} = req.body;
            //console.log(subject, " - subject in usual modal");
            return res.json({subjects: subjectsDict[surname.class]});
            //console.log(surname, " - surname");
            //return res.json({subjects: subjectsDict[surname.class]});
        } catch (e) {
            return next(e);
        }
    }

    async studentModalDate(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const surname = await userService.student(refreshToken);
            const {subject} = req.query;
            //console.log(subject, " - subject get");
            let date = await userService.getDate(refreshToken, subject);
            //console.log(date, " - data get");
            return res.json({dates: date});
            //console.log(surname, " - surname");
            //return res.json({subjects: subjectsDict[surname.class]});
        } catch (e) {
            return next(e);
        }
    }

    async studentPagePost(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const {homework_text, subject, date} = req.body;
            const body_date = await userService.getDate(refreshToken, subject);
            //console.log("post", homework_text, subject, date);
            //console.log(body_date, " try to date this");
            const homework = await userService.getHomework(refreshToken);
            const surname = await userService.writeHomework(refreshToken, homework_text, subject, date);
            const notify = await userService.getNotification(surname.user.class);
            switch (surname.problems) {
                case "noneDate":
                    console.log("date was not selected");
                    return res.render(createPath("main-student"), {
                        surname: ucfirst(surname.user.surname) + " " + surname.user.class.split("_")[0] + surname.user.class.split("_")[1],
                        subjects: subjectsDict[surname.user[2]],
                        homework: homework,
                        problems: "date was not selected",
                        notification: notify
                    });
                case "noneHomework":
                    console.log("Homework was not write");
                    return res.render(createPath("main-student"), {
                        surname: ucfirst(surname.user.surname) + " " + surname.user.class.split("_")[0] + surname.user.class.split("_")[1],
                        subjects: subjectsDict[surname.user[2]],
                        homework: homework,
                        problems: "Homework was not write",
                        notification: notify
                    });
                case "noneSubject":
                    console.log("subject was not selected");
                    return res.render(createPath("main-student"), {
                        surname: ucfirst(surname.user.surname) + " " + surname.user.class.split("_")[0] + surname.user.class.split("_")[1],
                        subjects: subjectsDict[surname.user[2]],
                        homework: homework,
                        problems: "subject was not selected",
                        notification: notify
                    });
                case "none":
                    return res.render(createPath("main-student"), {
                        surname: ucfirst(surname.user.surname) + " " + surname.user.class.split("_")[0] + surname.user.class.split("_")[1],
                        subjects: subjectsDict[surname.user[2]],
                        homework: homework,
                        problems: "none",
                        notification: notify
                    });
                default:
                    console.log("smth wrong with homework");
                    return res.render(createPath("main-student"), {
                        surname: ucfirst(surname.user.surname) + " " + surname.user.class.split("_")[0] + surname.user.class.split("_")[1],
                        subjects: subjectsDict[surname.user[2]],
                        homework: homework,
                        problems: "unknown",
                        notification: notify
                    });
            }
        } catch (e) {
            return next(e);
        }
    }

    async clearDB(req, res, next) {
        try {
            const isDone = await userService.clearHomework();
            if (isDone)
                //console.log(isDone);
                return isDone;
        } catch (e) {
            return next(e);
        }
    }


//leader----------------------------------------------------------------------------------------------------------------

    async leaderPage(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const user = await userService.leader(refreshToken);
            //console.log(user);
            const notify = await userService.getNotification(user.class);
            const isDone = await userService.clearHomework();
            if (user.status !== "leader")
                return res.redirect(createPath('/index'));
            const homework = await userService.getHomework(refreshToken);
            //console.log(homework, ' - homework');
            if (!homework)
                return res.render(createPath("main-leader"), {
                    surname: ucfirst(user.surname) + " " + user.class.split("_")[0] + user.class.split("_")[1],
                    homework: "none",
                    notification: notify
                });
            console.log(user.surname, " - surname");//верни
            return res.render(createPath("main-leader"), {
                surname: ucfirst(user.surname) + " " + user.class.split("_")[0] + user.class.split("_")[1],
                homework: homework,
                notification: notify
            });
        } catch (e) {
            return next(e);
        }
    }

    async leaderPagePost(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const {homework_text, subject, date} = req.body;
            const {notification} = req.body;
            let surname;
            //console.log(notification, " - notify");

            const body_date = await userService.getDate(refreshToken, subject);
            //console.log("post", homework_text, subject, date);
            //console.log(body_date, " try to date this");
            const homework = await userService.getHomework(refreshToken);
            // if (notification !== "undefined") {
            //     let eventAdd = await userService.leaderNotification(refreshToken, notification);
            //     surname = await userService.writeHomework(refreshToken, homework_text, subject, date);
            // } else {
            //     surname = await userService.leader(refreshToken);
            // } на подумать
            surname = await userService.writeHomework(refreshToken, homework_text, subject, date);
            //console.log(surname.user.surname, " surname after");
            const notify = await userService.getNotification(surname.user.class);
            //console.log(notify, " notifi");
            switch (surname.problems) {
                case "noneDate":
                    console.log("date was not selected");
                    return res.render(createPath("main-leader"), {
                        surname: ucfirst(surname.user.surname) + " " + surname.user.class.split("_")[0] + surname.user.class.split("_")[1],
                        subjects: subjectsDict[surname.user[2]],
                        homework: homework,
                        problems: "date was not selected",
                        notification: notify
                    });
                case "noneHomework":
                    console.log("Homework was not write");
                    return res.render(createPath("main-leader"), {
                        surname: ucfirst(surname.user.surname) + " " + surname.user.class.split("_")[0] + surname.user.class.split("_")[1],
                        subjects: subjectsDict[surname.user[2]],
                        homework: homework,
                        problems: "Homework was not write",
                        notification: notify
                    });
                case "noneSubject":
                    console.log("subject was not selected");
                    return res.render(createPath("main-leader"), {
                        surname: ucfirst(surname.user.surname) + " " + surname.user.class.split("_")[0] + surname.user.class.split("_")[1],
                        subjects: subjectsDict[surname.user[2]],
                        homework: homework,
                        problems: "subject was not selected",
                        notification: notify
                    });
                case "none":
                    return res.render(createPath("main-leader"), {
                        surname: ucfirst(surname.user.surname) + " " + surname.user.class.split("_")[0] + surname.user.class.split("_")[1],
                        subjects: subjectsDict[surname.user[2]],
                        homework: homework,
                        problems: "none",
                        notification: notify
                    });
                default:
                    console.log("smth wrong with homework");
                    return res.render(createPath("main-leader"), {
                        surname: ucfirst(surname.user.surname) + " " + surname.user.class.split("_")[0] + surname.user.class.split("_")[1],
                        subjects: subjectsDict[surname.user[2]],
                        homework: homework,
                        problems: "unknown",
                        notification: notify
                    });
            }
        } catch (e) {
            return next(e);
        }
    }


    async leaderEvents(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const user = await userService.leader(refreshToken);
            const {notification} = req.body;
            console.log(notification, " - notify");
            let eventAdd = await userService.leaderNotification(notification);

            const homework = await userService.getHomework(refreshToken);
            const notify = await userService.getNotification(user.class);
            //console.log(homework, ' - homework');
            if (!homework)
                return res.render(createPath("main-leader"), {
                    surname: ucfirst(user.surname) + " " + user.class.split("_")[0] + user.class.split("_")[1],
                    homework: "none",
                    notification: notify
                });
            console.log(user.surname, " - surname");//верни
            return res.render(createPath("main-leader"), {
                surname: ucfirst(user.surname) + " " + user.class.split("_")[0] + user.class.split("_")[1],
                homework: homework,
                notification: notify
            });
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
            const isDone = await userService.clearHomework();
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
