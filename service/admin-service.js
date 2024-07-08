const UserModel = require('../models/user-model');
const timetableModel = require('../models/timetable-model');
const notificationModel = require('../models/notification-model');
const hometaskModel = require('../models/hometask-model');
const eventModel = require('../models/event-model');
const subjectModel = require('../models/subject-model');
const teacherModel = require('../models/teacher-model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const tokenService = require('../service/token-service');
const {DateTime} = require('luxon');
const apiError = require('../dtos/api-error');
const path = require("path");
const fs = require('fs');
const xlsx = require("xlsx");
const userService = require('../service/user-service');


//=================================================FUNCTIONS============================================================
//MAKE DAY / MONTH INTO USUAL VIEW (LIKE 01 OR 11)----------------------------------------------------------------------
function to_day_month(day) {
    if (day.toString().length === 1) {
        return "0" + day.toString();
    }
    return day.toString();
}


//GENERATE UNIC PASSWORD OF 6 NUMBERS-----------------------------------------------------------------------------------
function generatePass() {
    return Math.floor(100000 + crypto.randomInt(900000));
}


//GET LINKS FOR FILES---------------------------------------------------------------------------------------------------
async function getFileLink(fileDir, filename) {
    return new Promise((resolve) => {

        fs.readdir(encodeURI(fileDir), (err, files) => {
            if (err) {
                throw apiError.MaybeServerProblem("Проблемы при чтении каталога. Возможно, каталог не существует или нет доступа.");
            }

            let filePath = files.find(file => file === filename);
            if (!filePath) {
                resolve(null);
                return;
            }

            let result = encodeURIComponent(path.join(fileDir, filePath));
            // console.log(fileDir, " | ", filePath, " | ", result);
            resolve(result);
        });
        //throw apiError.MaybeServerProblem("проблемы с чтением файлов");
    })
}


//===============================================USERSERVICE CLASS======================================================
class AdminService {
//вообще можно также использовать users(), но тут меньше кода т.к. админа нельзя забанить, поэтому и проверять не надо, под вопросом каросче
    async admin(refreshToken) {
        const userData = await tokenService.validateRefreshToken(refreshToken);
        return UserModel.findById(userData.id);
    }

//=================================================USERS LIST===========================================================

//FIND USER-------------------------------------------------------------------------------------------------------------
    async adminFindUser(surname) {
        let user = await UserModel.find({surname: surname});

        if (user.length === 0) {
            return "none";
        }
        return user[0];
    }

//GET LIST OF USERS-----------------------------------------------------------------------------------------------------
    async adminListOfUsers(class_) {
        let result = [];
        let users = '';
        if (class_ === "all") {
            users = await UserModel.find();
        } else {
            users = await UserModel.find({class: class_});
        }
        for (let i in users) {
            if (users[i]['status'] !== "admin")
                result.push([users[i]['surname'], users[i]['name'], users[i]['class'], users[i]['status']]);
        }

        result.sort((a, b) => {
            if (a[0] < b[0]) {
                return -1;
            } else if (a[0] > b[0]) {
                return 1;
            } else {
                return 0;
            }
        });
        return result;
    }

    async adminChangeUsersClass(surname, name, class_) {
        let user = await UserModel.findOne({surname: surname, name: name});
        if (user) {
            if (await timetableModel.findOne({class: class_})) {
                await UserModel.updateOne({surname: surname, name: name}, {
                    $set: {class: class_}
                })
                return true;
            }
            throw apiError.BadRequest("данный класс не корректен или не найден в базе");
        }
        throw apiError.BadRequest("пользователь не найден..");
    }

//GET FILE WITH USERS SURNAME AND PASSWORDS-----------------------------------------------------------------------------
    async adminGetUsersFile() {
        let filePath = './files_to_parse/studentsFile.txt';
        if (fs.existsSync(filePath)) {
            return await getFileLink('./files_to_parse', 'studentsFile.txt');
        } else {
            return "none";
        }
    }

//RESET USERS'S PASSWORD------------------------------------------------------------------------------------------------
    async adminResetPassword(surname, name, class_) {
        let pass = generatePass().toString();
        const hashpassword = await bcrypt.hash(pass, 3);
        let id = await UserModel.find({
            surname: surname,
            name: name,
            class: class_
        });

        let userToken = await tokenService.findUserById(id[0]['id']);
        if (userToken)
            await tokenService.removeToken(userToken);

        await UserModel.updateOne({
            surname: surname,
            name: name,
            class: class_
        }, {$set: {login: surname + name, password: hashpassword, isChangePass: false}});

        return pass;
    }

//DELETE USER-----------------------------------------------------------------------------------------------------------
    async adminUserDelete(surname, name, class_) {
        let del = await UserModel.deleteOne({
            surname: surname,
            name: name,
            class: class_
        });

        let id = await UserModel.find({
            surname: surname,
            name: name,
            class: class_
        });
        if (id.length > 0) {
            let userToken = await tokenService.findUserById(id[0]['id']);
            if (userToken !== null)
                await tokenService.removeToken(userToken);

        }
        return del['acknowledged'] === true;

    }

//CHANGE USER'S STATUS--------------------------------------------------------------------------------------------------
    async adminUserStatus(surname, name, class_, status) {
        let st = '';
        if (status === "Ученик") {
            st = "student";
        } else {
            st = "leader";
        }
        let user = await UserModel.updateOne({
            surname: surname,
            name: name,
            class: class_
        }, {$set: {status: st}});

        let id = await UserModel.find({
            surname: surname,
            name: name,
            class: class_
        });

        let userToken = await tokenService.findUserById(id[0]['id']);


        if (userToken !== null)
            await tokenService.removeToken(userToken);

        return user['acknowledged'] === true;

    }

//PARSE STUDENT FILE AND ADD A LOT STUDENTS-----------------------------------------------------------------------------
    async adminAddListOfStudents(file) {
        //console.log(file, file['filename'])
        let workbook = xlsx.readFile('./files_to_parse/' + file['filename']);
        let students = []
        //получаем данные
        for (const sheetName of workbook.SheetNames) {
            let rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
            //console.log(rows);
            for (let row in rows) {
                let class_ = rows[row]['класс'];
                let numbers = "";
                let letters = "";
                for (let i in class_) {
                    if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(class_[i])) {
                        numbers += class_[i];
                    } else {
                        letters += class_[i];
                    }
                }
                class_ = numbers + "_" + letters.toUpperCase();
                let name = rows[row]['имя'].toLowerCase();
                let surname = rows[row]['фамилия'].toLowerCase();
                let status = 'student';
                let pas = generatePass();
                await this.adminAddClass(class_);
                let isReg = await userService.registration(name.trim(), surname.trim(), class_.trim(), pas, status);
                if (isReg !== null) {
                    students[surname] = pas;
                }
            }
        }
        //создаем файл
        fs.writeFile('./files_to_parse/studentsFile.txt', "фамилия(логин) - пароль \n", (err) => {
            if (err) throw apiError.BadRequest();
            //console.log("file was create");
        });

        for (let student in students) {
            fs.appendFile('./files_to_parse/studentsFile.txt', student + " - " + students[student] + "\n", (err) => {
                if (err) throw apiError.BadRequest();
            })
        }

        let fileDir = './files_to_parse';
        return await getFileLink(fileDir, "studentsFile.txt");

    }

//---------------------------------------------------ADD USER MODAL-----------------------------------------------------
    async adminGeneratePass() {
        return generatePass();
    }

//---------------------------------------------------EVENTS-------------------------------------------------------------

//DELETE EVENT----------------------------------------------------------------------------------------------------------
    async adminEventDel(place, date, text) {
        if (await eventModel.find({place: place, date: date, text: text})) {
            await eventModel.deleteOne({place: place, date: date, text: text});
            return true;
        }
        return false;
    }

//------------------------------------------------NOTIFICATION----------------------------------------------------------

//GET NOTIFICATION BY CLASS---------------------------------------------------------------------------------------------
    async adminGetNotify(class_) {
        let total = [];
        let notices = [];
        if (class_ === "all") {
            notices = await notificationModel.find();
        } else {
            notices = await notificationModel.find({class: class_});
        }

        for (let i in notices) {
            total.push([notices[i]['class'], notices[i]['text']]);
        }
        return total;
    }

//DELETE NOTIFICATION---------------------------------------------------------------------------------------------------
    async adminDelNotify(class_, text) {
        if (await notificationModel.findOne({class: class_, text: text})) {
            await notificationModel.deleteOne({class: class_, text: text});
            return true;
        }
        return false;
    }

//ADD NOTIFICATION FOR ALL----------------------------------------------------------------------------------------------
    async adminAddNotify(text) {
        const dt = DateTime.now();
        await notificationModel.create({
            text: text,
            class: "all",
            date: to_day_month(dt.day) + "." + to_day_month(dt.month) + "." + dt.year
        });

        return true;
    }

//---------------------------------------------TEACHER PAGE-------------------------------------------------------------

//---------------------------------------------GET TEACHERS-------------------------------------------------------------
    async adminGetAllTeachers() {
        let teachers = await teacherModel.find();
        let result = [];
        for (let i in teachers) {
            result.push({
                surname: teachers[i]['surname'],
                name: teachers[i]['name'],
                lastname: teachers[i]['lastname'],
                classroom: teachers[i]['classroom']
            });
        }

        result.sort((a, b) => {
            if (a.surname < b.surname) {
                return -1;
            } else if (a.surname > b.surname) {
                return 1;
            } else {
                return 0;
            }
        });
        return result;
    }

//-------------------------------------------ADD NEW TEACHER------------------------------------------------------------
    async adminAddNewTeacher(name, surname, lastname, subject, classroom) {
        if (await teacherModel.findOne({name: name, surname: surname, lastname: lastname}))
            return null;

        return await teacherModel.create({
            name: name,
            surname: surname,
            lastname: lastname,
            subjects: subject,
            classroom: classroom,
        });
    }

//DELETE TEACHER--------------------------------------------------------------------------------------------------------
    async adminDeleteTeacher(teacher) {
        let surname = teacher.split(" ")[0];
        let name = teacher.split(" ")[1];
        let lastname = teacher.split(" ")[2];

        if (await teacherModel.findOne({name: name, surname: surname, lastname: lastname})) {
            await teacherModel.deleteOne({name: name, surname: surname, lastname: lastname});
            return true;
        }
        return false;
    }

//FIND TEACHER BY SURNAME-----------------------------------------------------------------------------------------------
    async adminTeacherFind(surname) {
        let teachers_search = await teacherModel.find({surname: surname});
        let teachers_result = [];
        if (teachers_search) {
            for (let i in teachers_search) {
                teachers_result.push([teachers_search[i].surname, teachers_search[i].name, teachers_search[i].lastname, teachers_search[i].classroom]);
            }
            return teachers_result;
        }
        return teachers_result.push(["none"]);
    }

//----------------------------------------GET ALL TEACHER'S SUBJECT-----------------------------------------------------
    async adminGetTeachSubjects(teacher) {
        let surname = teacher.split(" ")[0];
        let name = teacher.split(" ")[1];
        let lastname = teacher.split(" ")[2];
        let thisTeacher = await teacherModel.findOne({surname: surname, name: name, lastname: lastname});

        return thisTeacher['subjects'];
    }

//GET TEACHER'S SUBJECTS------------------------------------------------------------------------------------------------
    async adminGetSubjects(teacher) {
        let surname = teacher.split(" ")[0];
        let name = teacher.split(" ")[1];
        let lastname = teacher.split(" ")[2];
        let thisTeacher = await teacherModel.findOne({surname: surname, name: name, lastname: lastname});
        let all_subjects = await subjectModel.find();
        let teacher_subjects = thisTeacher['subjects'];
        let result = [];
        for (let i in all_subjects) {
            if (!(all_subjects[i]['subject'].includes("/"))) {
                if (!(teacher_subjects.includes(all_subjects[i]['subject']))) {
                    result.push(all_subjects[i]['subject']);
                }
            } else {
                if (!teacher_subjects.includes(all_subjects[i]['subject'].split("/")[0])) {
                    result.push(all_subjects[i]['subject'].split("/")[0]);
                }
                if (!teacher_subjects.includes(all_subjects[i]['subject'].split("/")[1])) {
                    result.push(all_subjects[i]['subject'].split("/")[1]);
                }
            }
        }

        return result.sort();
    }

//ADD NEW SUBJECT TO TEACHER--------------------------------------------------------------------------------------------
    async adminAddSubjectToTeacher(teacher, subject) {
        let surname = teacher.split(" ")[0];
        let name = teacher.split(" ")[1];
        let lastname = teacher.split(" ")[2];
        let thisTeacher = await teacherModel.findOne({surname: surname, name: name, lastname: lastname});
        thisTeacher['subjects'].push(subject);
        await teacherModel.updateOne({
            name: name,
            surname: surname,
            lastname: lastname
        }, {$set: {subjects: thisTeacher['subjects']}});

        return "ok";
    }

//DELETE SUBJECT FROM TEACHER-------------------------------------------------------------------------------------------
    async adminDelSubjectToTeacher(teacher, subject) {
        let surname = teacher.split(" ")[0];
        let name = teacher.split(" ")[1];
        let lastname = teacher.split(" ")[2];
        let thisTeacher = await teacherModel.findOne({surname: surname, name: name, lastname: lastname});
        thisTeacher['subjects'] = thisTeacher['subjects'].filter((e) => e !== subject);

        await teacherModel.updateOne({
            name: name,
            surname: surname,
            lastname: lastname
        }, {$set: {subjects: thisTeacher['subjects']}});

        return "ok";
    }

//--------------------------------------GET ALL STUDENTS FOR TEACHER----------------------------------------------------
    async adminGetTeachersStudents(class_, teacher, subject) {
        let surname = teacher.split(" ")[0];
        let name = teacher.split(" ")[1];
        let lastname = teacher.split(" ")[2];
        //console.log(surname);
        let teachers_data = await teacherModel.findOne({surname: surname, name: name, lastname: lastname});
        let students_id = teachers_data['students'];
        let students = [];
        if (class_ === 'all') {
            for (let [key, value] of Object.entries(students_id)) {
                if (value.includes(subject)) {
                    let student = await UserModel.findById(key);
                    if (student)
                        students.push([student['surname'], student['name'], student['class']]);
                }
            }
        } else {
            for (let [key, value] of Object.entries(students_id)) {
                if (value.includes(subject)) {
                    let student = await UserModel.findById(key);
                    if (student['class'] === class_)
                        students.push([student['surname'], student['name'], student['class']]);
                }
            }
        }
        return students;
    }

//----------------------------------------FIND STUDENT FOR TEACHER------------------------------------------------------
    async adminTeacherFindStudent(surname, teacher, subject) {
        let stud = await UserModel.find({surname: surname});
        let Tsurname = teacher.split(" ")[0];
        let Tname = teacher.split(" ")[1];
        let Tlastname = teacher.split(" ")[2];
        let teach = await teacherModel.findOne({surname: Tsurname, name: Tname, lastname: Tlastname});
        let result = [];
        if (stud !== null) {
            for (let [key, value] of Object.entries(teach['students'])) {
                if (key === stud['_id'].toString() && value.includes(subject)) {
                    result.push([stud['surname'], stud['name'], stud['class'], "yes"]);
                    return result;
                }
            }
            result.push([stud['surname'], stud['name'], stud['class'], "no"]);
            return result;
        } else {
            result.push(["no"]);
            return result;
        }
    }


//-------------------------------------------ADD STUDENT FOR TEACHER----------------------------------------------------
    async adminAddStudentForTeacher(student, teacher, subject) {

        let Tsurname = teacher.split(" ")[0];
        let Tname = teacher.split(" ")[1];
        let Tlastname = teacher.split(" ")[2];

        let Sname = student.split(" ")[1];
        let Ssurname = student.split(" ")[0];
        let student_id = await UserModel.findOne({name: Sname, surname: Ssurname});
        student_id = student_id['_id'];
        if (!student_id) {
            throw apiError.MaybeServerProblem("ученик не найден");
        }
        let teacherObj = await teacherModel.findOne({name: Tname, surname: Tsurname, lastname: Tlastname});
        let students = teacherObj['students'] || {};

        let query = {};
        query[`students.${student_id}`] = {$in: [subject]};

        let teachers = await teacherModel.findOne(query);
        if (students[student_id]) {
            if (!(students[student_id].includes(subject))) {
                if (teachers) {
                    let teacher_has_stud_students = teachers['students'];
                    teacher_has_stud_students[student_id] = teacher_has_stud_students[student_id].filter((e) => e !== subject);
                    await teacherModel.updateOne({
                        surname: teachers['surname'],
                        name: teachers['name'],
                        lastname: teachers['lastname']
                    }, {
                        $set: {students: teacher_has_stud_students}
                    })
                }
                students[student_id].push(subject);
            } else {
                return "данный ученик уже обучается у текущего преподавателя";
            }
        } else {
            students[student_id] = [subject];
        }

        await teacherModel.updateOne({
            name: Tname,
            surname: Tsurname,
            lastname: Tlastname
        }, {$set: {students: students}});


        return "ok";
    }

//DELETE STUDENT FROM TEACHER-------------------------------------------------------------------------------------------
    async adminDelStudentForTeacher(student, teacher, subject) {
        let Tsurname = teacher.split(" ")[0];
        let Tname = teacher.split(" ")[1];
        let Tlastname = teacher.split(" ")[2];

        let Sname = student.split(" ")[1];
        let Ssurname = student.split(" ")[0];
        let student_id = await UserModel.findOne({name: Sname, surname: Ssurname});
        student_id = student_id['_id'];
        if (!student_id) {
            throw apiError.MaybeServerProblem("ученик не найден");
        }
        let teacherObj = await teacherModel.findOne({name: Tname, surname: Tsurname, lastname: Tlastname});
        let students = teacherObj['students'] || {};

        if (students[student_id]) {
            if ((students[student_id].includes(subject))) {
                students[student_id] = students[student_id].filter((e) => e !== subject);
                if (students[student_id].length > 0) {
                    await teacherModel.updateOne({
                        name: Tname,
                        surname: Tsurname,
                        lastname: Tlastname
                    }, {$set: {students: students}});
                } else {
                    delete students[student_id];
                    await teacherModel.updateOne({
                        name: Tname,
                        surname: Tsurname,
                        lastname: Tlastname
                    }, {$set: {students: students}});
                }
            } else {
                return "преподавателя не преподает у данного ученика этот предмет";
            }
        } else {
            return "данный ученик не обучается у текущего преподавателя";
        }


        return "ok";
    }

//ADD CLASS TO TEACHER--------------------------------------------------------------------------------------------------
    async adminAddClassForTeacher(class_, teacher, subject) {
        let Tsurname = teacher.split(" ")[0];
        let Tname = teacher.split(" ")[1];
        let Tlastname = teacher.split(" ")[2];
        let students;
        if (class_ !== "all")
            students = await UserModel.find({class: class_});
        else {
            students = await UserModel.find();
        }
        if (!students) {
            throw apiError.MaybeServerProblem("класс пуст ");// это скорее уведомление, чем ошибка
        }
        let teacherObj = await teacherModel.findOne({name: Tname, surname: Tsurname, lastname: Tlastname});
        let teacher_students = teacherObj['students'] || {};

        for (let i in students) {
            if (teacher_students[students[i]['_id']]) {
                if (!teacher_students[students[i]['_id']].includes(subject)) {
                    teacher_students[students[i]['_id']].push(subject);
                }
            } else {
                teacher_students[students[i]['_id']] = [subject];
            }
        }

        await teacherModel.updateOne({
            name: Tname,
            surname: Tsurname,
            lastname: Tlastname
        }, {$set: {students: teacher_students}});


        return "ok";
    }

//PARSE FILE OF TEACHERS AND ADD TEACHERS AND SUBJECTS------------------------------------------------------------------
    async adminAddListOfTeachers(file) {
        //сначала считывание и запись в массив
        // [ класс -> [ предмет -> [ учитель -> "кабинет" ] ] ]
        // если учитель для предмета и класса один, то добавляем весь класс к этому преподу и вдальнейшем..
        // иначе просто добавить препода и все
        let workbook = xlsx.readFile('./files_to_parse/' + file['filename']);
        let teachers = []
        let classrooms = {};
        //получаем данные
        for (const sheetName of workbook.SheetNames) {
            let rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
            for (let row in rows) {
                let class_ = rows[row]['класс'].toLowerCase();
                let teacher = rows[row]['ФИО'].toLowerCase();
                let subject = rows[row]['предмет'].toLowerCase();
                let classroom = rows[row]['кабинет'];

                if (!teachers[class_]) {
                    teachers[class_] = {};
                }
                if (!teachers[class_][subject]) {
                    teachers[class_][subject] = [];
                }
                if (!(teachers[class_][subject].includes(teacher))) {
                    teachers[class_][subject].push(teacher);
                    classrooms[teacher] = classroom;
                }
            }
        }

        //нужно чтобы препод добавлялся и предмет вместе с ним если что

        for (let c in teachers) {
            let class_;
            let letters = "";
            let numbers = "";
            for (let i in c) {
                if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(c[i])) {
                    numbers += c[i];
                } else {
                    letters += c[i];
                }
            }
            class_ = numbers + "_" + letters.toUpperCase();
            let sub = teachers[c];
            for (let s in sub) {
                let subject = s;
                let teachers_for_sub = sub[s];
                if (teachers_for_sub.length === 1) {
                    let surname = teachers_for_sub[0].split(" ")[0].toLowerCase();
                    let name = teachers_for_sub[0].split(" ")[1].toLowerCase();
                    let lastname = teachers_for_sub[0].split(" ")[2].toLowerCase();
                    let classroom = classrooms[teachers_for_sub[0]];
                    await this.adminAddNewTeacher(name, surname, lastname, subject, classroom);
                    await this.adminAddSubject(subject);
                    await this.adminAddClassForTeacher(class_, teachers_for_sub[0], subject);
                } else {
                    for (let t in teachers_for_sub) {
                        let surname = teachers_for_sub[t].split(" ")[0].toLowerCase();
                        let name = teachers_for_sub[t].split(" ")[1].toLowerCase();
                        let lastname = teachers_for_sub[t].split(" ")[2].toLowerCase();
                        let classroom = classrooms[teachers_for_sub[t]];
                        await this.adminAddSubject(subject);
                        await this.adminAddNewTeacher(name, surname, lastname, subject, classroom);
                    }
                }
            }
        }

        return "ok";

    }

//====================================================TIMETABLE=========================================================

//---------------------------------------------TIMETABLE REGISTRATION---------------------------------------------------
    async timetable_r(class_, monday, tuesday, wednesday, thursday, friday, saturday) {

        return await timetableModel.create({
            class: class_,
            monday: monday,
            tuesday: tuesday,
            wednesday: wednesday,
            thursday: thursday,
            friday: friday,
            saturday: saturday
        });
    }

//GET TIMETABLE BY CLASS------------------------------------------------------------------------------------------------
    async adminTimetable(class_) {
        const week = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

        let timetable = await timetableModel.findOne({class: class_});

        let result = new Map();

        for (let i in week) {
            let mass = timetable[week[i]].replaceAll(")", " ").split(" ");
            let day = [];
            for (let j in mass) {
                if (!(['1', '2', '3', '4', '5', '6', '7'].includes(mass[j]))) {
                    day.push(mass[j]);
                }
            }
            result.set(week[i], day);
        }

        return result;
    }

//ADD NEW SUBJECT AND CHECK---------------------------------------------------------------------------------------------
    async adminAddSubject(subject) {
        let sub = subject.replaceAll(" ", "_");
        if (await subjectModel.findOne({subject: sub})) {
            return false;
        } else {
            await subjectModel.create({
                subject: sub
            });
            return true;
        }
    }

//GET ALL SUBJECTS------------------------------------------------------------------------------------------------------
    async adminGetAllSubjects() {
        let result = [];
        let subjects = await subjectModel.find();
        for (let i in subjects) {
            result.push(subjects[i]['subject']);
        }
        return result.sort();
    }

//DELETE SUBJECT--------------------------------------------------------------------------------------------------------
    async adminModalDelSubject(subject) {
        let sub = await subjectModel.deleteOne({subject: subject});
        return sub['acknowledged'] === true;

    }

//CHANGE TIMETABLE BY CLASS---------------------------------------------------------------------------------------------
    async adminChangeTimetable(class_, weekday, number, subject) {
        let timetable = await timetableModel.find({class: class_});
        let day = '';
        let total = '';

        day = timetable[0][weekday].split(" ");
        for (let i in day) {
            let st = day[i];
            if (st.split(')')[0] !== number) {
                total += st + " ";
            } else {
                total += number.toString() + ")" + subject + " ";
            }
        }
        total = total.substring(0, total.length - 1);

        const updateObj = {};
        updateObj[weekday] = total;

        let update = await timetableModel.updateOne({
            class: class_
        }, {
            $set: updateObj
        });
        return update['acknowledged'] === true;

    }

//ADD NEW CLASS---------------------------------------------------------------------------------------------------------
    async adminAddClass(class_) {
        //console.log(class_, "------");
        let number = "";
        let letter = "";
        for (let i in class_) {
            if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(class_[i])) {
                number += class_[i];
            } else {
                if (class_[i].toLowerCase() !== class_[i].toUpperCase()) {
                    letter += class_[i].toUpperCase();
                }
            }
        }
        //console.log(number + "_" + letter, " ---- Cl");
        if (await timetableModel.findOne({class: number + "_" + letter.toUpperCase()})) {
            return false;
        } else {
            await timetableModel.create({
                class: number + "_" + letter.toUpperCase(),
                monday: "1)- 2)- 3)- 4)- 5)- 6)- 7)-",
                tuesday: "1)- 2)- 3)- 4)- 5)- 6)- 7)-",
                wednesday: "1)- 2)- 3)- 4)- 5)- 6)- 7)-",
                thursday: "1)- 2)- 3)- 4)- 5)- 6)- 7)-",
                friday: "1)- 2)- 3)- 4)- 5)- 6)- 7)-",
                saturday: "1)- 2)- 3)- 4)- 5)- 6)- 7)-"
            });
            return true;
        }
    }

//DELETE ALL CLASS------------------------------------------------------------------------------------------------------
    async adminDelClass(class_) {
        if (await timetableModel.findOne({class: class_})) {
            await timetableModel.deleteOne({class: class_});
            await UserModel.deleteMany({class: class_});
            await hometaskModel.deleteMany({class: class_});
            await notificationModel.deleteMany({class: class_});
            return true;
        }
        return false;
    }
}

module.exports = new AdminService();
