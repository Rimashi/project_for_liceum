const userService = require('../service/user-service');
const {validationResult} = require('express-validator');
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
            res.cookie('accessToken', userData.accessToken, {maxAge: 1000 * 60 * 15, httpOnly: true, secure: true});
            res.cookie('refreshToken', userData.refreshToken, {
                maxAge: 1000 * 60 * 60 * 24 * 7,
                httpOnly: true,
                secure: true
            });
            return res.json({success: userData.data[0]});
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

//=================================================PAGES================================================================


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

//TIMETABLE REGISTRATION------------------------------------------------------------------------------------------------
    async timetable_reg(req, res, next) {
        try {
            const {class_, monday, tuesday, wednesday, thursday, friday, saturday} = req.body;
            const userData = await userService.timetable_r(class_, monday, tuesday, wednesday, thursday, friday, saturday);
            return res.json(userData);
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

            const write = await userService.writeHomework(refreshToken, hometask, subject, date, file);
            switch (write.problems) {
                case "noneHomework":
                    return res.json({error: "no homework"});
                case "noneSubject":
                    return res.json({error: "no subject"});
                case "noneDate":
                    return res.json({error: "no date"});
                case "person has written":
                    return res.json({error: "person has written"});
                case "none":
                    return res.json({success: "success"});
                default:
                    return res.json({error: "Something went wrong with homework"});
            }
        } catch (e) {
            next(e);
        }
    }

//===========================================DOWNLOADING FILE===========================================================

    async downloadFile(req, res, next) {
        try {
            const filesParam = decodeURIComponent(req.params.filename);
            const filesDir = "./" + filesParam.split("\\")[0];
            const filename = filesParam.split("\\")[1];

            const filePath = path.join(filesDir, filename);
            const fileStream = fs.createReadStream(filePath);

            res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(filename)}`);
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

//---------------------------------------------------MODALS-------------------------------------------------------------

//NOTIFICATION----------------------------------------------------------------------------------------------------------
    async leaderNotify(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            let data = req.body;
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

//===================================================ADMIN==============================================================

//PAGE------------------------------------------------------------------------------------------------------------------
    async adminPage(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const user = await userService.admin(refreshToken);

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
                const user = await userService.admin(refreshToken);

                if (user.status === "admin")
                    return res.render(createPath("admin-help"));
                return res.redirect("/");
            }
            return res.redirect("/");
        } catch (e) {
            next(e);
        }
    }

//---------------------------------------------------USERS LIST---------------------------------------------------------

//FIND USER BY SURNAME--------------------------------------------------------------------------------------------------
    async adminPageUsersFind(req, res, next) {
        try {
            // const {refreshToken} = req.cookies;
            // const admin = await userService.admin(refreshToken);
            let data = req.body;
            console.log(data);
            let user = await userService.adminFindUser(data['surname'].toLowerCase());
            if (user === "none")
                return res.json({status: "none"});

            return res.json({
                surname: user['surname'],
                name: user['name'],
                class: user['class'],
                status: user['status']
            });


        } catch (e) {
            next(e);
        }
    }

//GET CLASSES-----------------------------------------------------------------------------------------------------------
    async adminUsersClass(req, res, next) {
        try {
            let classes = await userService.getClasses();
            return res.json({classes: classes});
        } catch (e) {
            next(e);
        }
    }

    async adminUsersClassChange(req, res, next) {
        try {
            let class_ = req.body.class;
            let surname = req.body.surname;
            let name = req.body.name;
            return res.json({is: await userService.adminChangeUsersClass(surname, name, class_)});
        } catch (e) {
            next(e);
        }
    }

    async adminUsersFileGet(req, res, next) {
        try {
            return res.json({link: await userService.adminGetUsersFile()});
        } catch (e) {
            next(e);
        }
    }

//LIST OF USERS---------------------------------------------------------------------------------------------------------
    async adminUsersList(req, res, next) {
        try {
            let data = req.body;
            let users = await userService.adminListOfUsers(data['class']);
            return res.json({users: users});
        } catch (e) {
            next(e);
        }
    }

//RESET USER PASSWORD---------------------------------------------------------------------------------------------------
    async adminUserPassword(req, res, next) {
        try {
            let data = req.body;
            console.log(data, " - data");
            let reset = await userService.adminResetPassword(data['surname'], data['name'], data['class']);
            console.log(reset, " - after reset pass");
            return res.json({newPass: reset});
        } catch (e) {
            next(e);
        }
    }

//DELETE USER-----------------------------------------------------------------------------------------------------------
    async adminUserDelete(req, res, next) {
        try {
            let data = req.body;
            let del = await userService.adminUserDelete(data['surname'], data['name'], data['class']);
            return res.json({result: del});
        } catch (e) {
            next(e);
        }
    }

//CHANGE USER STATUS----------------------------------------------------------------------------------------------------
    async adminUserStatus(req, res, next) {
        try {
            let data = req.body;
            let status = await userService.adminUserStatus(data['surname'], data['name'], data['class'], data['status']);
            return res.json({result: status});
        } catch (e) {
            next(e);
        }
    }

//----------------------------------------------ADD USER MODAL----------------------------------------------------------

//GENERATE NEW PASSWORD BUTTON------------------------------------------------------------------------------------------
    async adminGeneratePass(req, res, next) {
        try {
            let pass = await userService.adminGeneratePass();
            return res.json({pass: pass});
        } catch (e) {
            next(e);
        }
    }

    async adminAddFileOfStudents(req, res, next) {
        try {
            let file = req.file;
            res.json({link: await userService.adminAddListOfStudents(file)});
        } catch (e) {
            next(e);
        }
    }

//-----------------------------------------------TEACHERS---------------------------------------------------------------

//---------------------------------------------GET TEACHERS-------------------------------------------------------------
    async adminGetTeachers(req, res, next) {
        try {
            return res.json({teachers: await userService.adminGetAllTeachers()});
        } catch (e) {
            next(e);
        }
    }

//-------------------------------------------ADD NEW TEACHER------------------------------------------------------------
    async adminAddTeacher(req, res, next) {
        try {
            let data = req.body;
            return res.json({teacher: await userService.adminAddNewTeacher(data['name'], data['surname'], data['lastname'], data['subject'], data['classroom'])});
        } catch (e) {
            next(e);
        }
    }

    async adminDelTeacher(req, res, next) {
        try {
            let teacher = req.body.teacher;
            return res.json({teach: await userService.adminDeleteTeacher(teacher)});
        } catch (e) {
            next(e);
        }
    }

    async adminFindTeacher(req, res, next) {
        try {
            let surname = req.body.surname;
            return res.json({teachers: await userService.adminTeacherFind(surname)});
        } catch (e) {
            next(e);
        }
    }

    async adminAddStudentToTeacher(req, res, next) {
        try {
            let data = req.body;
            let teacher = await userService.adminAddStudentForTeacher(data['student'], data['teacher'], data['subject']);
            return res.json({teacher: teacher});
        } catch (e) {
            next(e);
        }
    }

    async adminDelStudentToTeacher(req, res, next) {
        try {
            let data = req.body;
            let teacher = await userService.adminDelStudentForTeacher(data['student'], data['teacher'], data['subject']);
            return res.json({teacher: teacher});
        } catch (e) {
            next(e);
        }
    }

    async adminAddClassToTeacher(req, res, next) {
        try {
            let data = req.body;
            let teacher = await userService.adminAddClassForTeacher(data['class'], data['teacher'], data['subject']);
            return res.json({teacher: teacher});
        } catch (e) {
            next(e);
        }
    }

    async adminGetTeachersSubjects(req, res, next) {
        try {
            let teacher = req.body.teacher;
            return res.json({subjects: await userService.adminGetTeachSubjects(teacher)});
        } catch (e) {
            next(e);
        }
    }

    async adminGetOtherSubjects(req, res, next) {
        try {
            let teacher = req.body.teacher;
            return res.json({subjects: await userService.adminGetSubjects(teacher)});
        } catch (e) {
            next(e);
        }
    }

    async adminAddSubjectTeacher(req, res, next) {
        try {
            let teacher = req.body.teacher;
            let subject = req.body.subject;
            return res.json({subjects: await userService.adminAddSubjectToTeacher(teacher, subject)});
        } catch (e) {
            next(e);
        }
    }

    async adminDelSubjectTeacher(req, res, next) {
        try {
            let teacher = req.body.teacher;
            let subject = req.body.subject;
            return res.json({subjects: await userService.adminDelSubjectToTeacher(teacher, subject)});
        } catch (e) {
            next(e);
        }
    }

    async adminTeachersStudents(req, res, next) {
        try {
            let data = req.body;
            //console.log(data, " - data");
            let students_by_teacher = await userService.adminGetTeachersStudents(data['class'], data['teacher'], data['subject']);
            let all_students = await userService.adminListOfUsers(data['class']);
            let other_students = [];
            if (students_by_teacher.length > 0) {
                for (let i in all_students) {
                    let f = true;
                    for (let j in students_by_teacher) {
                        if (students_by_teacher[j][0] === all_students[i][0] && students_by_teacher[j][1] === all_students[i][1]) {
                            f = false;
                            break;
                        }
                    }
                    if (f) {
                        other_students.push([all_students[i][0], all_students[i][1], all_students[i][2]]);
                    }
                }
            } else {
                for (let i in all_students) {
                    other_students.push([all_students[i][0], all_students[i][1], all_students[i][2]]);
                }
            }

            return res.json({students_by: students_by_teacher, other: other_students});
        } catch (e) {
            next(e);
        }
    }

    async adminTeacherStudentFind(req, res, next) {
        try {
            let surname = req.body.surname;
            let teacher = req.body.teacher;
            let subject = req.body.subject;
            let student = await userService.adminTeacherFindStudent(surname, teacher, subject);
            return res.json({student: student});
        } catch (e) {
            next(e);
        }
    }

    async adminAddFileOfTeachers(req, res, next) {
        try {
            let file = req.file;
            res.json({is: await userService.adminAddListOfTeachers(file)});
        } catch (e) {
            next(e);
        }
    }

//------------------------------------------------TIMETABLE-------------------------------------------------------------

//GET TIMETABLE BY CLASS------------------------------------------------------------------------------------------------

    async adminGetTimetable(req, res, next) {
        try {
            let data = req.body;
            let timetable_ = await userService.adminTimetable(data['class_']);

            return res.json({
                monday: timetable_.get('monday'),
                tuesday: timetable_.get('tuesday'),
                wednesday: timetable_.get('wednesday'),
                thursday: timetable_.get('thursday'),
                friday: timetable_.get('friday'),
                saturday: timetable_.get('saturday'),
            });
        } catch (e) {
            next(e);
        }
    }

//ADD NEW SUBJECT-------------------------------------------------------------------------------------------------------

    async adminAddSubject(req, res, next) {
        try {
            let data = req.body;
            let add = await userService.adminAddSubject(data['subject']);
            return res.json({added: add});
        } catch (e) {
            next(e);
        }
    }

//GET SUBJECTS----------------------------------------------------------------------------------------------------------

    async adminGetSubject(req, res, next) {
        try {
            let subjects = await userService.adminGetAllSubjects();
            return res.json({subjects: subjects});
        } catch (e) {
            next(e);
        }
    }

//DELETE SUBJECT--------------------------------------------------------------------------------------------------------

    async adminModalDel(req, res, next) {
        try {
            let data = req.body;
            let subject = await userService.adminModalDelSubject(data['subject']);
            return res.json({subject: subject});
        } catch (e) {
            next(e);
        }
    }

//CHANGE TIMETABLE------------------------------------------------------------------------------------------------------

    async adminTimetableChange(req, res, next) {
        try {
            let data = req.body;
            let update = await userService.adminChangeTimetable(data['class_'], data['weekday'], data['number'], data['subject']);
            return res.json({update: update});
        } catch (e) {
            next(e);
        }
    }

//ADD NEW CLASS---------------------------------------------------------------------------------------------------------

    async adminTimetableAddClass(req, res, next) {
        try {
            let data = req.body;
            //console.log(data['class_']);
            let create = await userService.adminAddClass(data['class_']);
            return res.json({class_: create});
        } catch (e) {
            next(e);
        }
    }

//DELETE CLASS----------------------------------------------------------------------------------------------------------

    async adminTimetableDelClass(req, res, next) {
        try {
            let class_ = req.body['class_'];
            let del = await userService.adminDelClass(class_);
            return res.json({class_: del});
        } catch (e) {
            next(e);
        }
    }

//---------------------------------------------------EVENTS-------------------------------------------------------------

//GET ALL EVENTS--------------------------------------------------------------------------------------------------------
    async adminEventsGet(req, res, next) {
        try {
            let total = [];
            let events = await userService.getEvents();
            for (let i in events) {
                total.push([events[i]['text'], events[i]['date'], events[i]['place']]);
            }
            return res.json({events: total});
        } catch (e) {
            next(e);
        }
    }

//DELETE EVENT----------------------------------------------------------------------------------------------------------

    async adminEventsDel(req, res, next) {
        try {
            let data = req.body;
            let del = await userService.adminEventDel(data['place'], data['date'], data['text']);
            return res.json({del: del});
        } catch (e) {
            next(e);
        }
    }

//ADD NEW EVENT---------------------------------------------------------------------------------------------------------
    async adminEventAdd(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            let data = req.body;
            let eventAdd = await userService.leaderEvents(refreshToken, data['place'], data['date'], data['text']);
            return res.json({add: eventAdd});
        } catch (e) {
            next(e);
        }
    }

//--------------------------------------------NOTIFICATION--------------------------------------------------------------

//GET NOTIFICATION BY CLASS---------------------------------------------------------------------------------------------
    async adminNoticeGet(req, res, next) {
        try {
            let data = req.body;
            let notify = await userService.adminGetNotify(data['class_']);
            return res.json({notify: notify});
        } catch (e) {
            next(e);
        }
    }

//DELETE NOTIFICATION---------------------------------------------------------------------------------------------------
    async adminNoticeDel(req, res, next) {
        try {
            let data = req.body;
            let notify = await userService.adminDelNotify(data['class_'], data['text']);
            return res.json({notify: notify});
        } catch (e) {
            next(e);
        }
    }

//ADD NOTIFICATION FOR ALL----------------------------------------------------------------------------------------------
    async adminNoticeAdd(req, res, next) {
        try {
            let data = req.body;
            let notify = await userService.adminAddNotify(data['text']);
            return res.json({notify: notify});
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
                secure: true
            });
            res.cookie('refreshToken', token.refreshToken, {
                maxAge: 1000 * 60 * 60 * 24 * 7,
                httpOnly: true,
                secure: true
            });
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
            next(e);
        }
    }
}


module.exports = new UserController();
