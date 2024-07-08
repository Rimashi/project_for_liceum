const userService = require('../service/user-service');
const adminService = require('../service/admin-service');

//==============================================CLASS CONTROLLER========================================================
class AdminController {

//---------------------------------------------------USERS LIST---------------------------------------------------------

//FIND USER BY SURNAME--------------------------------------------------------------------------------------------------
    async adminPageUsersFind(req, res, next) {
        try {
            // const {refreshToken} = req.cookies;
            // const admin = await userService.admin(refreshToken);
            let data = req.body;
            console.log(data);
            let user = await adminService.adminFindUser(data['surname'].toLowerCase());
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

//CHANGE CLASS TO STUDENT-----------------------------------------------------------------------------------------------
    async adminUsersClassChange(req, res, next) {
        try {
            let class_ = req.body.class;
            let surname = req.body.surname;
            let name = req.body.name;
            return res.json({is: await adminService.adminChangeUsersClass(surname, name, class_)});
        } catch (e) {
            next(e);
        }
    }

//GET FILE OF STUDENTS--------------------------------------------------------------------------------------------------
    async adminUsersFileGet(req, res, next) {
        try {
            return res.json({link: await adminService.adminGetUsersFile()});
        } catch (e) {
            next(e);
        }
    }

//LIST OF USERS---------------------------------------------------------------------------------------------------------
    async adminUsersList(req, res, next) {
        try {
            let data = req.body;
            let users = await adminService.adminListOfUsers(data['class']);
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
            let reset = await adminService.adminResetPassword(data['surname'], data['name'], data['class']);
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
            let del = await adminService.adminUserDelete(data['surname'], data['name'], data['class']);
            return res.json({result: del});
        } catch (e) {
            next(e);
        }
    }

//CHANGE USER STATUS----------------------------------------------------------------------------------------------------
    async adminUserStatus(req, res, next) {
        try {
            let data = req.body;
            let status = await adminService.adminUserStatus(data['surname'], data['name'], data['class'], data['status']);
            return res.json({result: status});
        } catch (e) {
            next(e);
        }
    }

//----------------------------------------------ADD USER MODAL----------------------------------------------------------

//GENERATE NEW PASSWORD BUTTON------------------------------------------------------------------------------------------
    async adminGeneratePass(req, res, next) {
        try {
            let pass = await adminService.adminGeneratePass();
            return res.json({pass: pass});
        } catch (e) {
            next(e);
        }
    }
//ADD FILE OF STUDENTS--------------------------------------------------------------------------------------------------
    async adminAddFileOfStudents(req, res, next) {
        try {
            let file = req.file;
            res.json({link: await adminService.adminAddListOfStudents(file)});
        } catch (e) {
            next(e);
        }
    }

//-----------------------------------------------TEACHERS---------------------------------------------------------------

//---------------------------------------------GET TEACHERS-------------------------------------------------------------
    async adminGetTeachers(req, res, next) {
        try {
            return res.json({teachers: await adminService.adminGetAllTeachers()});
        } catch (e) {
            next(e);
        }
    }

//-------------------------------------------ADD NEW TEACHER------------------------------------------------------------
    async adminAddTeacher(req, res, next) {
        try {
            let data = req.body;
            return res.json({teacher: await adminService.adminAddNewTeacher(data['name'], data['surname'], data['lastname'], data['subject'], data['classroom'])});
        } catch (e) {
            next(e);
        }
    }

//------------------------------------------DELETE TEACHER--------------------------------------------------------------
    async adminDelTeacher(req, res, next) {
        try {
            let teacher = req.body.teacher;
            return res.json({teach: await adminService.adminDeleteTeacher(teacher)});
        } catch (e) {
            next(e);
        }
    }

//------------------------------------------FIND TEACHER----------------------------------------------------------------
    async adminFindTeacher(req, res, next) {
        try {
            let surname = req.body.surname;
            return res.json({teachers: await adminService.adminTeacherFind(surname)});
        } catch (e) {
            next(e);
        }
    }

//--------------------------------ADD SOME STUDENT TO SOME TEACHER------------------------------------------------------
    async adminAddStudentToTeacher(req, res, next) {
        try {
            let data = req.body;
            let teacher = await adminService.adminAddStudentForTeacher(data['student'], data['teacher'], data['subject']);
            return res.json({teacher: teacher});
        } catch (e) {
            next(e);
        }
    }

//REMOVE SOME STUDENT FROM SOME TEACHER---------------------------------------------------------------------------------
    async adminDelStudentToTeacher(req, res, next) {
        try {
            let data = req.body;
            let teacher = await adminService.adminDelStudentForTeacher(data['student'], data['teacher'], data['subject']);
            return res.json({teacher: teacher});
        } catch (e) {
            next(e);
        }
    }

//ADD FULL CLASS OF STUDENTS TO SOME TEACHER----------------------------------------------------------------------------
    async adminAddClassToTeacher(req, res, next) {
        try {
            let data = req.body;
            let teacher = await adminService.adminAddClassForTeacher(data['class'], data['teacher'], data['subject']);
            return res.json({teacher: teacher});
        } catch (e) {
            next(e);
        }
    }
//-----------------------------------------TEACHER'S SUBJECTS MODAL-----------------------------------------------------

//GET TEACHER'S SUBJECT TO LIST-----------------------------------------------------------------------------------------
    async adminGetTeachersSubjects(req, res, next) {
        try {
            let teacher = req.body.teacher;
            return res.json({subjects: await adminService.adminGetTeachSubjects(teacher)});
        } catch (e) {
            next(e);
        }
    }

//GET OTHER SUBJECTS TO LIST FOR THE TEACHER----------------------------------------------------------------------------
    async adminGetOtherSubjects(req, res, next) {
        try {
            let teacher = req.body.teacher;
            return res.json({subjects: await adminService.adminGetSubjects(teacher)});
        } catch (e) {
            next(e);
        }
    }

//ADD SOME SUBJECT TO SOME TEACHER--------------------------------------------------------------------------------------
    async adminAddSubjectTeacher(req, res, next) {
        try {
            let teacher = req.body.teacher;
            let subject = req.body.subject;
            return res.json({subjects: await adminService.adminAddSubjectToTeacher(teacher, subject)});
        } catch (e) {
            next(e);
        }
    }

//DELETE SOME SUBJECT FROM TEACHER--------------------------------------------------------------------------------------
    async adminDelSubjectTeacher(req, res, next) {
        try {
            let teacher = req.body.teacher;
            let subject = req.body.subject;
            return res.json({subjects: await adminService.adminDelSubjectToTeacher(teacher, subject)});
        } catch (e) {
            next(e);
        }
    }

//------------------------------GET LIST OF TEACHER'S STUDENTS----------------------------------------------------------
    async adminTeachersStudents(req, res, next) {
        try {
            let data = req.body;
            //console.log(data, " - data");
            let students_by_teacher = await adminService.adminGetTeachersStudents(data['class'], data['teacher'], data['subject']);
            let all_students = await adminService.adminListOfUsers(data['class']);
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

//FIND SOME STUDENT FOR TEACHER-----------------------------------------------------------------------------------------
    async adminTeacherStudentFind(req, res, next) {
        try {
            let surname = req.body.surname;
            let teacher = req.body.teacher;
            let subject = req.body.subject;
            let student = await adminService.adminTeacherFindStudent(surname, teacher, subject);
            return res.json({student: student});
        } catch (e) {
            next(e);
        }
    }

//--------------------------------------ADD FILE OF TEACHERS------------------------------------------------------------
    async adminAddFileOfTeachers(req, res, next) {
        try {
            let file = req.file;
            return res.json({is: await adminService.adminAddListOfTeachers(file)});
        } catch (e) {
            next(e);
        }
    }

//------------------------------------------------TIMETABLE-------------------------------------------------------------

//GET TIMETABLE BY CLASS------------------------------------------------------------------------------------------------

    async adminGetTimetable(req, res, next) {
        try {
            let data = req.body;
            let timetable_ = await adminService.adminTimetable(data['class_']);

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
            let add = await adminService.adminAddSubject(data['subject']);
            return res.json({added: add});
        } catch (e) {
            next(e);
        }
    }

//GET SUBJECTS----------------------------------------------------------------------------------------------------------

    async adminGetSubject(req, res, next) {
        try {
            let subjects = await adminService.adminGetAllSubjects();
            return res.json({subjects: subjects});
        } catch (e) {
            next(e);
        }
    }

//DELETE SUBJECT--------------------------------------------------------------------------------------------------------

    async adminModalDel(req, res, next) {
        try {
            let data = req.body;
            let subject = await adminService.adminModalDelSubject(data['subject']);
            return res.json({subject: subject});
        } catch (e) {
            next(e);
        }
    }

//CHANGE TIMETABLE------------------------------------------------------------------------------------------------------

    async adminTimetableChange(req, res, next) {
        try {
            let data = req.body;
            let update = await adminService.adminChangeTimetable(data['class_'], data['weekday'], data['number'], data['subject']);
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
            let create = await adminService.adminAddClass(data['class_']);
            return res.json({class_: create});
        } catch (e) {
            next(e);
        }
    }

//DELETE CLASS----------------------------------------------------------------------------------------------------------

    async adminTimetableDelClass(req, res, next) {
        try {
            let class_ = req.body['class_'];
            let del = await adminService.adminDelClass(class_);
            return res.json({class_: del});
        } catch (e) {
            next(e);
        }
    }

//TIMETABLE REGISTRATION------------------------------------------------------------------------------------------------
    async timetable_reg(req, res, next) {
        try {
            const {class_, monday, tuesday, wednesday, thursday, friday, saturday} = req.body;
            const userData = await adminService.timetable_r(class_, monday, tuesday, wednesday, thursday, friday, saturday);
            return res.json(userData);
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
            let del = await adminService.adminEventDel(data['place'], data['date'], data['text']);
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
            let notify = await adminService.adminGetNotify(data['class_']);
            return res.json({notify: notify});
        } catch (e) {
            next(e);
        }
    }

//DELETE NOTIFICATION---------------------------------------------------------------------------------------------------
    async adminNoticeDel(req, res, next) {
        try {
            let data = req.body;
            let notify = await adminService.adminDelNotify(data['class_'], data['text']);
            return res.json({notify: notify});
        } catch (e) {
            next(e);
        }
    }

//ADD NOTIFICATION FOR ALL----------------------------------------------------------------------------------------------
    async adminNoticeAdd(req, res, next) {
        try {
            let data = req.body;
            let notify = await adminService.adminAddNotify(data['text']);
            return res.json({notify: notify});
        } catch (e) {
            next(e);
        }
    }


}


module.exports = new AdminController();