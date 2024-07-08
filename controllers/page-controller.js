const userService = require('../service/user-service');
const adminService = require('../service/admin-service');
const path = require("path");
const tokenService = require('../service/token-service');
const UserModel = require("../models/user-model");
const apiError = require("../dtos/api-error");
const fs = require('fs');


const createPath = (page) => path.resolve(__dirname, '../views', `${page}.ejs`);


//==============================================FUNCTIONS===============================================================

//TO MAKE FIRST LETTER UP-----------------------------------------------------------------------------------------------
function ucfirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// FOR LOADING STUDENT OR LEADER PAGE-----------------------------------------------------------------------------------
async function page(req, res, next) {
    try {
        const {refreshToken} = req.cookies;

        const user = await userService.user(refreshToken);

        const notify = await userService.getNotification(user.class);

        const homework = await userService.getHomework(refreshToken);

        let events = await userService.getEvents();

        let isChangePassword = await userService.isChangePass(refreshToken);

        if (!homework)
            return res.render(createPath(`main-${user.status}`), {
                surname: ucfirst(user.surname) + " " + user.class.split("_")[0] + user.class.split("_")[1],
                homework: "none",
                notification: notify,
                events: events,
                isChange: isChangePassword
            });

        return res.render(createPath(`main-${user.status}`), {
            surname: ucfirst(user.surname) + " " + user.class.split("_")[0] + user.class.split("_")[1],
            homework: homework,
            notification: notify,
            events: events,
            isChange: isChangePassword
        });
    } catch (e) {
        next(e);
    }
}

//==============================================CLASS CONTROLLER========================================================

class PageController {

//===================================================INFO===============================================================
    async infoPage(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            if (refreshToken) {
                const surname = await userService.user(refreshToken);
                return res.render(createPath("info"), {
                    surname: ucfirst(surname.surname) + " " + surname.class.split("_")[0] + surname.class.split("_")[1],
                    header: "user"
                });
            }
            return res.render(createPath("info"), {
                header: "header"
            });
        } catch (e) {
            next(e);
        }
    }

//======================================================SUBJECT=========================================================

//-------------------------------------------------SUBJECT PAGE---------------------------------------------------------
    async subjects(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            if (refreshToken) {
                const surname = await userService.user(refreshToken);
                return res.render(createPath("subject"), {
                    surname: ucfirst(surname.surname) + " " + surname.class.split("_")[0] + surname.class.split("_")[1],
                    header: "user",
                });
            }
            return res.redirect('/');
        } catch (e) {
            next(e);
        }
    }

//-----------------------------GET SUBJECTS, HOMETASKS, TEACHERS AND CLASSROOMS-----------------------------------------
    async getAllForSubjectPage(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            if (refreshToken) {
                const surname = await userService.user(refreshToken);
                let subjects = await userService.getSubjects(surname.class);
                let hometasks = await userService.getHometaskForWeek(surname.class, subjects);
                let teachers = await userService.getTeachers(refreshToken);
                return res.json({subjects: subjects, hometasks: hometasks, teachers: teachers});
            }
        } catch (e) {
            next(e);
        }
    }

//===================================================RATING=============================================================

    async getRating(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            let val = req.body['val'];

            let get = await userService.getClassRate(refreshToken);

            if (tokenService.validateRefreshToken(refreshToken)) {
                const userData = tokenService.validateRefreshToken(refreshToken);
                const user = await UserModel.findById(userData.id);

                if (val === undefined || val === null || val === "") {
                    let userRating = await userService.userRating("none", refreshToken);
                    let rating = await userService.getTopFiveOfRating("none", user['class']);
                    return res.render(createPath('rating'), {
                        header: "user",
                        surname: ucfirst(user['surname']) + " " + user['class'].split("_")[0] + user['class'].split("_")[1],
                        rating: rating,
                        userRating: userRating,
                        parallel: get,
                        class_: userRating[1]
                    });
                } else {
                    let userRating = await userService.userRating(val, refreshToken);
                    let rating = await userService.getTopFiveOfRating(val, user['class']);
                    return res.json({
                        rating: rating,
                        userRating: userRating
                    });
                }
            }
            return res.redirect('/');
        } catch (e) {
            next(e);
        }
    }

    async getClassesRating(req, res, next) {
        try {
            let class_ = req.body['class_'];
            let get = await userService.getClassRate(class_);
            return res.json({data: get});
        } catch (e) {
            next(e);
        }
    }


//=================================================TIMETABLE============================================================
//PAGE------------------------------------------------------------------------------------------------------------------
    async timetable(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            if (refreshToken) {
                const surname = await userService.user(refreshToken);
                return res.render(createPath("schedule"), {
                    surname: ucfirst(surname.surname) + " " + surname.class.split("_")[0] + surname.class.split("_")[1],
                    header: "user"
                });
            }
            return res.render(createPath("schedule"), {
                header: "header"
            });
        } catch (e) {
            next(e);
        }
    }

//TIMETABLE GETTER------------------------------------------------------------------------------------------------------
    async get_timetable(req, res, next) {
        try {
            const {refreshToken} = req.cookies;

            if (refreshToken) {
                const user = await userService.user(refreshToken);
                const parallel = user.class.split("_")[0];
                const usersData = await userService.getTimetable(parallel, user.class);

                return res.json(usersData);
            }
            const usersData = await userService.getAllTimetable();

            return res.json(usersData);
        } catch (e) {
            next(e);
        }
    }



//=====================================================MAP==============================================================
    async map(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            if (refreshToken) {
                const surname = await userService.user(refreshToken);
                return res.render(createPath("map"), {
                    surname: ucfirst(surname.surname) + " " + surname.class.split("_")[0] + surname.class.split("_")[1],
                    header: "user"
                });
            }
            return res.render(createPath("map"), {
                header: "header"
            });
        } catch (e) {
            next(e);
        }
    }

//=====================================================HELP==============================================================
    async helpPage(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            if (refreshToken) {
                const surname = await userService.user(refreshToken);
                return res.render(createPath("help"), {
                    surname: ucfirst(surname.surname) + " " + surname.class.split("_")[0] + surname.class.split("_")[1],
                    header: "user"
                });
            }
            return res.render(createPath("help"), {
                header: "header"
            });
        } catch (e) {
            next(e);
        }
    }

//=================================================INDEX================================================================
    async indexPage(req, res, next) {
        try {
            let events = await userService.getEvents();
            return res.render(createPath("index"), {
                events: events
            });
        } catch (e) {
            next(e);
        }
    }

//==================================================ERROR===============================================================
    async error(req, res, next) {
        try {
            let data = req.query;
            console.log(data, data.message, data.status);
            return res.render(createPath('error'), {
                status: data.status,
                message: data.message
            });
        } catch (e) {
            next(e);
        }
    }


//=================================================STUDENT==============================================================
//---------------------------------------------------PAGE---------------------------------------------------------------
    async studentPage(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const user = await userService.user(refreshToken);
            if (user !== "changed status") {
                if (refreshToken) {
                    await userService.getNotification(user.class);
                    if (user.status !== "student")
                        return res.redirect(createPath('index'));

                    await page(req, res, next);
                }
            } else {
                res.clearCookie('refreshToken');
                res.clearCookie('accessToken');
                return res.redirect('/');
            }
        } catch (e) {
            next(e);
        }
    }

//===========================================DOWNLOADING FILE===========================================================

    async downloadFile(req, res, next) {
        try {
            // when it's on server (unix) make split like "/" not \\

            const filesParam = decodeURIComponent(req.params.filename);
            const filesDir = "./" + filesParam.split("\\")[0];
            const filename = filesParam.split("\\")[1];
            // console.log(filesParam, filesDir, filename, " ----file---- ");
            const filePath = path.join(filesDir, filename);
            // console.log(filePath, " -- path");
            const fileStream = fs.createReadStream(filePath);

            res.setHeader('Content-Disposition', `attachment; filename*=UTF-8\'\''${encodeURIComponent(filename)}`);
            res.setHeader('Content-Type', 'application/octet-stream');

            await new Promise((resolve, reject) => {
                fileStream.on('end', resolve);
                fileStream.on('error', reject);
                fileStream.pipe(res, {end: false});
            });

            res.end();
        } catch (error) {
            console.error(error);
            next(apiError.MaybeServerProblem('Произошла ошибка при скачивании файлов'));
        }
    }

//=================================================LEADER===============================================================

//--------------------------------------------------PAGE----------------------------------------------------------------
    async leaderPage(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const user = await userService.user(refreshToken);
            if (user !== "changed status") {
                if (refreshToken) {
                    await userService.getNotification(user.class);

                    if (user.status !== "leader")
                        return res.redirect(createPath('index'));

                    await page(req, res, next);
                }
            } else {
                res.clearCookie('refreshToken');
                res.clearCookie('accessToken');
                return res.redirect('/');
            }
        } catch (e) {
            next(e);
        }
    }

//===================================================ADMIN==============================================================

//PAGE------------------------------------------------------------------------------------------------------------------
    async adminPage(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const user = await adminService.admin(refreshToken);

            if (user.status === "admin")
                return res.render(createPath("main-admin"));
            else return res.redirect("/");
        } catch (e) {
            next(e);
        }
    }

//HELP------------------------------------------------------------------------------------------------------------------
    async adminHelpPage(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            if (refreshToken) {
                const user = await adminService.admin(refreshToken);

                if (user.status === "admin")
                    return res.render(createPath("admin-help"));
                return res.redirect("/");
            }
            return res.redirect("/");
        } catch (e) {
            next(e);
        }
    }

//=================================================REFRESH==============================================================
    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const token = await userService.refresh(refreshToken);

            res.clearCookie('refreshToken');
            res.clearCookie('accessToken');

            if (token === "userNone" || token === "passwordNone" || null)
                return token;

            res.cookie('accessToken', token.accessToken, {
                maxAge: 1000 * 60 * 15,
                httpOnly: true,
                secure: true,
                sameSite: "strict"
            });
            res.cookie('refreshToken', token.refreshToken, {
                maxAge: 1000 * 60 * 60 * 24 * 7,
                httpOnly: true,
                secure: true,
                sameSite: "strict"
            });
            switch (token.data[0]) {
                case "student":
                    return token.data;
                case "leader":
                    return token.data;
                case "admin":
                    return token.data;
                default:
                    console.log("status is not defined");
                    return '/';
            }
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new PageController();