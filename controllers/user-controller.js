const userService = require('../service/user-service');
const {validationResult, body} = require('express-validator');
const path = require("path");
const {json} = require("express");
const tokenService = require('../service/token-service');
const {plugin} = require("mongoose");
const createPath = (page) => path.resolve(__dirname, '../views', `${page}.ejs`);

function ucfirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}


class UserController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.render(createPath(''));
            }

            const {name, surname, login, pass, class_, status} = req.body;
            console.log(name, surname, login, pass, class_, status);
            const userData = await userService.registration(name, surname, login, pass, class_, status);
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

            const userData = await userService.login(login.trim().toLowerCase(), pass);
            //console.log(userData);
            switch (userData) {
                case "userNone":
                    return res.redirect("/");
                case "passwordNone":
                    return res.redirect("/");
            }
            //console.log(userData.user.status);
            res.cookie('accessToken', userData.accessToken, {maxAge: 1000 * 60 * 15, httpOnly: true, secure: true});
            res.cookie('refreshToken', userData.refreshToken, {
                maxAge: 1000 * 60 * 60 * 24 * 7,
                httpOnly: true,
                secure: true
            });

            switch (userData.data[0]) {
                case "student":
                    const str = userData.data[1] + " " + userData.data[2];
                    return res.redirect("/student");
                case "leader":
                    return res.redirect("/leader");
                case "admin":
                    return res.redirect("/admin");
                default:
                    console.log("status is not defind");
                    return res.redirect('/');
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
            return res.redirect('/');
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
        try {
            const {refreshToken} = req.cookies;
            if (refreshToken) {
                const surname = await userService.student(refreshToken);
                //console.log(subjectsDict[surname.class], ' ---subjects from dict');
                let subjects = await userService.getSubjects(surname.class);
                return res.render(createPath("subject"), {
                    surname: ucfirst(surname.surname) + " " + surname.class.split("_")[0] + surname.class.split("_")[1],
                    header: "user",
                    subjects_: subjects
                });
            }
            return res.redirect('/');
        } catch (e) {
            return next(e);
        }
    }

//TIMETABLE-------------------------------------------------------------------------------------------------------------
//main----------------------------------------------------------------------
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

//registration--------------------------------------------------------------
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

//get_timetable-------------------------------------------------------------
    async get_timetable(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            //console.log(refreshToken);
            if (refreshToken) {
                const user = await userService.student(refreshToken);
                const parallel = user.class.split("_")[0];
                const usersData = await userService.getTimetable(parallel, user.class);
                //console.log(usersData);
                return res.json(usersData);
            }
            const usersData = await userService.getAllTimetable();
            //console.log(usersData);
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
            //res.cookie('refreshToken', userData.refreshToken, {maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true});
            return res.json(userData);

        } catch (e) {
            return next(e);
        }
    }

//index-----------------------------------------------------------------------------------------------------------------

    async indexPage(req, res, next) {
        try {
            let events = await userService.getEvents();
            return res.render(createPath("index"), {
                events: events
            });
        } catch (e) {
            return next(e);
        }
    }

//student---------------------------------------------------------------------------------------------------------------
//main----------------------------------------------------------------------
    async studentPage(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const surname = await userService.student(refreshToken);
            const notify = await userService.getNotification(surname.class);
            if (surname.status !== "student")
                return res.redirect('/');
            const homework = await userService.getHomework(refreshToken);
            let events = await userService.getEvents();
            //console.log(homework, ' - homework');
            if (!homework)
                return res.render(createPath("main-student"), {
                    surname: ucfirst(surname.surname) + " " + surname.class.split("_")[0] + surname.class.split("_")[1],
                    homework: "none",
                    notification: notify,
                    events: events
                });
            //console.log(surname, " - surname");//верни
            const isDone = await userService.clearHomework();
            //console.log(isDone);
            return res.render(createPath("main-student"), {
                surname: ucfirst(surname.surname) + " " + surname.class.split("_")[0] + surname.class.split("_")[1],
                homework: homework,
                notification: notify,
                events: events
            });
        } catch (e) {
            return next(e);
        }
    }

//add_hometask--------------------------------------------------------------
    async studentModal(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const surname = await userService.student(refreshToken);
            const {subject} = req.body;
            //console.log(surname.class);
            let subjects = await userService.getSubjects(surname.class);
            return res.json({subjects: subjects});
        } catch (e) {
            return next(e);
        }
    }

//for_dates_in_hometask_modal-----------------------------------------------
    async studentModalDate(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const surname = await userService.student(refreshToken);
            const {subject} = req.query;
            //console.log(subject);
            let date = await userService.getDate(refreshToken, subject);
            return res.json({dates: date});
        } catch (e) {
            return next(e);
        }
    }

//to_send_homework---------------------------------------------------------
    async studentPagePost(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const {homework_text, subject, date} = req.body;
            const body_date = await userService.getDate(refreshToken, subject);
            //console.log("post", homework_text, subject, date);
            //console.log(body_date, " try to date this");
            const homework = await userService.getHomework(refreshToken);
            const surname = await userService.writeHomework(refreshToken, homework_text, subject, date);
            console.log(surname);
            const notify = await userService.getNotification(surname.user.class);
            let events = await userService.getEvents();
            let subjects = await userService.getSubjects(surname.user.class);
            switch (surname.problems) {
                case "noneDate":
                    console.log("date was not selected");
                    return res.render(createPath("main-student"), {
                        surname: ucfirst(surname.user.surname) + " " + surname.user.class.split("_")[0] + surname.user.class.split("_")[1],
                        subjects: subjects,
                        homework: homework,
                        problems: "date was not selected",
                        notification: notify,
                        events: events
                    });
                case "noneHomework":
                    console.log("Homework was not write");
                    return res.render(createPath("main-student"), {
                        surname: ucfirst(surname.user.surname) + " " + surname.user.class.split("_")[0] + surname.user.class.split("_")[1],
                        subjects: subjects,
                        homework: homework,
                        problems: "Homework was not write",
                        notification: notify,
                        events: events
                    });
                case "noneSubject":
                    console.log("subject was not selected");
                    return res.render(createPath("main-student"), {
                        surname: ucfirst(surname.user.surname) + " " + surname.user.class.split("_")[0] + surname.user.class.split("_")[1],
                        subjects: subjects,
                        homework: homework,
                        problems: "subject was not selected",
                        notification: notify,
                        events: events
                    });
                case "none":
                    return res.render(createPath("main-student"), {
                        surname: ucfirst(surname.user.surname) + " " + surname.user.class.split("_")[0] + surname.user.class.split("_")[1],
                        subjects: subjects,
                        homework: homework,
                        problems: "none",
                        notification: notify,
                        events: events
                    });
                default:
                    console.log("smth wrong with homework");
                    return res.render(createPath("main-student"), {
                        surname: ucfirst(surname.user.surname) + " " + surname.user.class.split("_")[0] + surname.user.class.split("_")[1],
                        subjects: subjects,
                        homework: homework,
                        problems: "unknown",
                        notification: notify,
                        events: events
                    });
            }
        } catch (e) {
            return next(e);
        }
    }


//leader----------------------------------------------------------------------------------------------------------------
//main----------------------------------------------------------------------
    async leaderPage(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const user = await userService.leader(refreshToken);

            const notify = await userService.getNotification(user.class);
            const isDone = await userService.clearHomework();

            if (user.status !== "leader")
                return res.redirect(createPath('index'));

            const homework = await userService.getHomework(refreshToken);

            let events = await userService.getEvents();

            if (!homework)
                return res.render(createPath("main-leader"), {
                    surname: ucfirst(user.surname) + " " + user.class.split("_")[0] + user.class.split("_")[1],
                    homework: "none",
                    notification: notify,
                    events: events
                });

            return res.render(createPath("main-leader"), {
                surname: ucfirst(user.surname) + " " + user.class.split("_")[0] + user.class.split("_")[1],
                homework: homework,
                notification: notify,
                events: events
            });
        } catch (e) {
            return next(e);
        }
    }

//for leader modals---------------------------------------------------------
    async leaderPagePost(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            let {homework_text, subject, date, text, location} = req.body;
            let {notification} = req.body;
            let surname;

            if (notification) {
                let eventAdd = await userService.leaderNotification(refreshToken, notification);
                surname = await userService.leader(refreshToken);
                if (eventAdd) {
                    console.log("was add notification");
                    return res.redirect('/');
                } else {
                    surname = await userService.leader(refreshToken);
                    return res.redirect('/');
                }
            } else {
                if (location && date && text) {
                    let eventAdd = await userService.leaderEvents(refreshToken, location, date, text);
                    if (eventAdd) {
                        console.log("was add event");
                        return res.redirect('/');
                    } else {
                        return res.redirect('/');
                    }
                } else {
                    surname = await userService.writeHomework(refreshToken, homework_text, subject, date);
                    const notify = await userService.getNotification(surname.user.class);
                    let events = await userService.getEvents();
                    let subjects = await userService.getSubjects(surname.user.class);
                    let homework = await userService.getHomework(refreshToken);
                    switch (surname.problems) {
                        case "noneDate":
                            console.log("date was not selected");
                            return res.render(createPath("main-leader"), {
                                surname: ucfirst(surname.user.surname) + " " + surname.user.class.split("_")[0] + surname.user.class.split("_")[1],
                                subjects: subjects,
                                homework: homework,
                                problems: "date was not selected",
                                notification: notify,
                                events: events
                            });
                        case "noneHomework":
                            console.log("Homework was not write");
                            return res.render(createPath("main-leader"), {
                                surname: ucfirst(surname.user.surname) + " " + surname.user.class.split("_")[0] + surname.user.class.split("_")[1],
                                subjects: subjects,
                                homework: homework,
                                problems: "Homework was not write",
                                notification: notify,
                                events: events
                            });
                        case "noneSubject":
                            console.log("subject was not selected");
                            return res.render(createPath("main-leader"), {
                                surname: ucfirst(surname.user.surname) + " " + surname.user.class.split("_")[0] + surname.user.class.split("_")[1],
                                subjects: subjects,
                                homework: homework,
                                problems: "subject was not selected",
                                notification: notify,
                                events: events
                            });
                        case "none":
                            return res.render(createPath("main-leader"), {
                                surname: ucfirst(surname.user.surname) + " " + surname.user.class.split("_")[0] + surname.user.class.split("_")[1],
                                subjects: subjects,
                                homework: homework,
                                problems: "none",
                                notification: notify,
                                events: events
                            });
                        default:
                            console.log("smth wrong with homework");
                            return res.render(createPath("main-leader"), {
                                surname: ucfirst(surname.user.surname) + " " + surname.user.class.split("_")[0] + surname.user.class.split("_")[1],
                                subjects: subjects,
                                homework: homework,
                                problems: "unknown",
                                notification: notify,
                                events: events
                            });
                    }
                }
            }


        } catch (e) {
            return next(e);
        }
    }

//rout for hometask check modal--------------------------------------------
    async leaderCheck(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const user = await userService.leader(refreshToken);
            let hometasks = await userService.getCheckHomework(user.class);
            return res.json({hometasks: hometasks});

        } catch (e) {
            return next(e);
        }
    }

//for check modal-----------------------------------------------------------
//add------------------------------------------------
    async leaderModalAdd(req, res, next) {
        try {
            let data = req.query;
            let userData = await userService.leaderHomeworkAdd(data['data']);
            return res.redirect('/');
        } catch (e) {
            console.log(e);
        }
    }

//delete---------------------------------------------
    async leaderModalDel(req, res, next) {
        try {
            let data = req.query;
            let userData = await userService.leaderHomeworkDel(data['data']);
            return res.redirect('/');
        } catch (e) {
            console.log(e);
        }
    }

//ban-----------------------------------------------
    async leaderModalBan(req, res, next) {
        try {
            let data = req.query;
            let userData = await userService.leaderHomeworkBan(data['data']);
            return res.redirect('/');
        } catch (e) {
            console.log(e);
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
            else return res.redirect("/");
        } catch (e) {
            return next(e);
        }
    }

//Post: Events, Notifications, Hometasks
    async adminPagePost(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            //let {homework_text, subject, date, text, location, class_} = req.body;
            //let {notification, class_} = req.body;
            let surname;

            if (notification && class_) {
                let eventAdd = await userService.adminNotification(refreshToken, notification, class_);
                surname = await userService.admin(refreshToken);
                if (eventAdd) {
                    console.log("was add notification");
                    return res.redirect('/');
                } else {
                    surname = await userService.admin(refreshToken);
                    return res.redirect('/');
                }
            } else {
                if (location && date && text && class_) {
                    let eventAdd = await userService.leaderEvents(refreshToken, location, date, text, class_);
                    if (eventAdd) {
                        console.log("was add event");
                        return res.redirect('/');
                    } else {
                        return res.redirect('/');
                    }
                } else {
                    surname = await userService.writeHomework(refreshToken, homework_text, subject, date, class_);
                    let homework = await userService.getHomework(refreshToken);
                    switch (surname.problems) {
                        case "noneDate":
                            console.log("date was not selected");
                            return res.render(createPath("main-admin"), {
                                homework: homework,
                                problems: "date was not selected",
                            });
                        case "noneHomework":
                            console.log("Homework was not write");
                            return res.render(createPath("main-leader"), {
                                homework: homework,
                                problems: "Homework was not write",
                            });
                        case "noneSubject":
                            console.log("subject was not selected");
                            return res.render(createPath("main-leader"), {
                                homework: homework,
                                problems: "subject was not selected",
                            });
                        case "none":
                            return res.render(createPath("main-leader"), {
                                homework: homework,
                                problems: "none",
                            });
                        default:
                            console.log("smth wrong with homework");
                            return res.render(createPath("main-leader"), {
                                homework: homework,
                                problems: "unknown",
                            });
                    }
                }
            }
        } catch (e) {
            return next(e);
        }
    }

//rout for hometask check modal--------------------------------------------
//get classes---------------------------------------
    async adminCheckClass(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const user = await userService.leader(refreshToken);
            let classes = await userService.getClasses();
            return res.json({classes: classes});
        } catch (e) {
            return next(e);
        }
    }

//get subjects---------------------------------------
    async adminCheckSub(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            let {data} = req.query;
            let subjects = await userService.getSubjects(data['data']['class']);
            return res.json({subjects: subjects});
        } catch (e) {
            return next(e);
        }
    }


//Events---------------------------------------------------------
//Get--------------------------------

    async adminEventGet(req, res, next) {
        try {
            let events = await userService.getEvents();
            return res.json({events: events});
        } catch (e) {
            return next(e);
        }
    }

//Delete event----------------------
    async adminEventsDel(req, res, next) {
        try {
            let data = req.query;
            let userData = await userService.adminEventDel(data['data']);
            return res.redirect('/');
        } catch (e) {
            return next(e);
        }
    }

//Ban user-------------------------
    async adminEventsBan(req, res, next) {
        try {
            let data = req.query;
            let userData = await userService.adminEventBan(data['data']);
            return res.redirect('/');
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
            try {
                res.cookie('accessToken', token.accessToken, {maxAge: 1000 * 60 * 15, httpOnly: true, secure: true});
                res.cookie('refreshToken', token.refreshToken, {maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true, secure: true});
            } catch (e) {
                next();
                //console.log(e);
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
                    return '/';
            }
        } catch (e) {
            return next(e);
        }
    }
}


module.exports = new UserController();
