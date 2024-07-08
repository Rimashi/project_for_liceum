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
const UserDto = require('../dtos/user-dto');
const {DateTime} = require('luxon');
const apiError = require('../dtos/api-error');
const path = require("path");
const fs = require('fs');
const cron = require('node-cron');

//=================================================FUNCTIONS============================================================
//MAKE DAY / MONTH INTO USUAL VIEW (LIKE 01 OR 11)----------------------------------------------------------------------
function to_day_month(day) {
    if (day.toString().length === 1) {
        return "0" + day.toString();
    }
    return day.toString();
}

//APPEND RIGHT DAYS INTO MAS--------------------------------------------------------------------------------------------
function add_to(l) {
    let list = [];
    let dt = DateTime.now();
    for (let i in l) {
        list.push(to_day_month(dt.plus({days: l[i]}).day) + "." + to_day_month(dt.plus({days: l[i]}).month) + "." + to_day_month(dt.plus({days: l[i]}).year));
    }
    return list;
}

//TO MAKE FIRST LETTER UP-----------------------------------------------------------------------------------------------
function ucfirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

//GENERATE UNIC PASSWORD OF 6 NUMBERS-----------------------------------------------------------------------------------
function generatePass() {
    return Math.floor(100000 + crypto.randomInt(900000));
}

//GET PARALEL-----------------------------------------------------------------------------------------------------------
async function getParalel(class_) {
    let num = Number(class_.split("_")[0]);

    let timetables = await timetableModel.find({class: {$regex: num}});
    let classes = [];
    for (let i in timetables) {
        classes.push(timetables[i]['class']);
    }
    return sortClasses(classes);
}

//SORT CLASSES----------------------------------------------------------------------------------------------------------
function sortClasses(classes) {
    for (let j = 0; j < classes.length - 1; j++) {
        for (let i = 0; i < classes.length - 1; i++) {
            let num1 = Number(classes[i].split("_")[0]);
            let num2 = Number(classes[i + 1].split("_")[0]);
            let letter1 = classes[i].split("_")[1];
            let letter2 = classes[i + 1].split("_")[1];
            if (num1 < num2) {
                classes[i] = num2.toString() + "_" + letter2;
                classes[i + 1] = num1.toString() + "_" + letter1;
            } else {
                if (num1 === num2)
                    if (letter1 > letter2) {
                        classes[i] = num2.toString() + "_" + letter2;
                        classes[i + 1] = num1.toString() + "_" + letter1;
                    }
            }
        }
    }
    return classes;
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

//CLEAR DB ONCE A WEEK--------------------------------------------------------------------------------------------------
cron.schedule('0 0 * * 1', async function () {
    const dt = DateTime.now();
    if (dt.weekday === 1) {
        let homeworks = await hometaskModel.find();
        for (let i in homeworks) {
            if (Number(homeworks[i]['date'].split('.')[2]) < dt.year) {
                await hometaskModel.deleteOne({
                    date: homeworks[i]['date'],
                    surname: homeworks[i]['surname'],
                    subject: homeworks[i]['subject']
                });
            } else {
                if (Number(homeworks[i]['date'].split('.')[0]) < dt.day && Number(homeworks[i]['date'].split('.')[1]) === dt.month) {
                    await hometaskModel.deleteOne({
                        date: homeworks[i]['date'],
                        surname: homeworks[i]['surname'],
                        subject: homeworks[i]['subject']
                    });
                } else {
                    if (Number(homeworks[i]['date'].split('.')[0]) >= dt.day && Number(homeworks[i]['date'].split('.')[1]) < dt.month) {
                        await hometaskModel.deleteOne({
                            date: homeworks[i]['date'],
                            surname: homeworks[i]['surname'],
                            subject: homeworks[i]['subject']
                        });
                    }
                }
            }
        }
    }

    const directoryPath = './files_to_parse';

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error('Ошибка чтения директории:', err);
            return;
        }


        files.forEach(file => {
            const filePath = path.join(directoryPath, file);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Ошибка при удалении файла:', filePath, err);
                }
            });
        });
    });
});

//UP PEOPLE TO THE NEXT CLASS-------------------------------------------------------------------------------------------
cron.schedule('0 0 30 6 *', async function () {
    let users = await UserModel.find();
    for (let i in users) {
        let class_ = users[i]['class'];
        let userName = users[i]['name'];
        let userSurname = users[i]['surname'];
        let number = Number(class_.split("_")[0]);
        let letter = class_.split("_")[1];
        if (number === 11) {
            UserModel.deleteOne({name: userName, surname: userSurname, class: class_});
        } else {
            let newClass = (number + 1).toString() + "_" + letter;
            UserModel.updateOne({surname: userSurname, name: userName}, {
                $set: {
                    class: newClass
                }
            });
        }
    }

})

//===============================================USERSERVICE CLASS======================================================
class UserService {

//=================================================REGISTRATION=========================================================
    async registration(name, surname, class_, pass, status) {
        //console.log(name, surname, class_, pass, status);
        if (await UserModel.findOne({name: name, surname: surname, class: class_, status: status}))
            return null;

        const hashpassword = await bcrypt.hash(pass.toString(), 5);

        const user = await UserModel.create({
            name: name,
            surname: surname,
            login: "",
            password: hashpassword,
            class: class_,
            status: status,
            rating: 0,
            ban: "",
            isChangePass: false
        });

        const userDto = new UserDto(user);

        //просматриваем преподов
        let teachers = await teacherModel.find();
        for (let t in teachers) {
            let teacher = teachers[t];
            try {
                let students = teacher['students'];
                for (let [key, value] of Object.entries(students)) {
                    let student = await UserModel.findById(key);
                    if (student['class'] === class_) {
                        for (let subject in value) {
                            await this.adminAddStudentForTeacher(surname + " " + name, teacher[surname] + " " + teacher['name'] + " " + teacher['lastname'], value[subject]);
                        }
                        break;
                    }
                }
            } catch (e) {
                //
            }
        }

        console.log(UserDto);
        return {
            user: UserDto
        }
    }

//=========================================CHANGE LOGIN AND PASSWORD====================================================
    async changeLogPass(login, password, user) {
        let surname = user.surname;
        let name = user.name;
        let class_ = user.class;
        const hashPassword = await bcrypt.hash(password, 3);
        if (!(await UserModel.findOne({login: login}))) {
            await UserModel.updateOne({"surname": surname, "name": name, "class": class_}, {
                $set: {
                    "login": login,
                    "password": hashPassword,
                    "isChangePass": true
                }
            });
            return true
        }
        throw apiError.BadRequest('Ошибка данных, проверьте корректность введенных данных');
    }

//===================================================LOGIN==============================================================
    async login(login, password) {
        if (login.split(" ").length - 1 === 0) {
            const user = await UserModel.findOne({login: login});

            if (!user) {
                const user = await UserModel.findOne({surname: login});
                if (!user) {
                    return "userNone";
                }

                const isPassTrue = await bcrypt.compare(password, user.password);
                if (!isPassTrue) {
                    return "passwordNone";
                }
                const data = [];
                data.push(user.status, user.surname, user.class);
                const userDto = new UserDto(user);
                if (await tokenService.findUserById(userDto.id)) {
                    let token = await tokenService.findUserById(userDto.id);
                    // console.log(token);
                    await tokenService.removeToken(token);
                }
                const tokens = tokenService.generateTokens({...userDto});
                await tokenService.saveToken(userDto.id, tokens.refreshToken);

                return {
                    ...tokens,
                    data,
                    user: UserDto
                }
            }

            const isPassTrue = await bcrypt.compare(password, user.password);
            if (!isPassTrue) {
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
                return "userNone";
            }

            const isPassTrue = await bcrypt.compare(password, user.password);
            if (!isPassTrue) {
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

//=================================================LOGOUT===============================================================
    async logout(refreshToken) {
        return await tokenService.removeToken(refreshToken);
    }

//=================================================REFRESH==============================================================
    async refresh(refreshToken) {
        if (!refreshToken) {
            return "userNone";
        }
        const userData = await tokenService.validateRefreshToken(refreshToken);
        const tokenFromdb = await tokenService.findToken(refreshToken);
        if (!userData || !tokenFromdb) {
            return "passwordNone";
        }

        const user = await UserModel.findById(userData.id);
        const data = [];

        data.push(user['status'], user['surname'], user['class']);
        const userDto = new UserDto(user);

        await tokenService.removeToken(refreshToken);
        const tokens = tokenService.generateTokens({...userDto});

        await tokenService.saveToken(userDto.id, tokens.refreshToken);


        return {
            ...tokens,
            data,
        }
    }

//==============================================GETER FUNCTIONS=========================================================

//------------------------------------------------GET CLASSES-----------------------------------------------------------
    async getClasses() {
        let timetables = await timetableModel.find();
        let classes = [];
        for (let i in timetables) {
            classes.push(timetables[i]['class']);
        }
        return sortClasses(classes);

    }

//--------------------------------------GET SUBJECT FOR THE SELECTED CLASS----------------------------------------------
    async getSubjects(class_) {
        const week = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

        const timetable = await timetableModel.findOne({class: class_});
        let dateOfMight = new Set();
        for (let j in week) {
            let strToList = timetable[week[j]].replaceAll(")", " ").replaceAll("/", " ").split(" ");
            for (let i in strToList) {
                if (!(['1', '2', '3', '4', '5', '6', '7'].includes(strToList[i])) && strToList[i] !== '-') {
                    dateOfMight.add(strToList[i]);
                }
            }
        }

        let totalSub = [];
        for (let i of dateOfMight) {
            totalSub.push(i);
        }
        totalSub.sort();

        return totalSub;
    }

//---------------------------------------GET HOMEWORK FOR CHECK MODAL---------------------------------------------------
    async getCheckHomework(class_) {
        const dt = DateTime.now();
        const homework = await hometaskModel.find({
            class: class_
        });
        homework.sort((a, b) => {
            if (Number(a.date.split('.')[2]) < Number(b.date.split('.')[2])) {
                return -1;
            } else {
                if (Number(a.date.split('.')[1]) < Number(b.date.split('.')[1])) {
                    return -1;
                } else if (Number(a.date.split('.')[1]) > Number(b.date.split('.')[1])) {
                    return 1;
                } else {
                    if (Number(a.date.split('.')[0]) < Number(b.date.split('.')[0])) {
                        return -1;
                    } else if (Number(a.date.split('.')[0]) > Number(b.date.split('.')[0])) {
                        return 1;
                    } else {
                        // Сортировка по предмету (subject) в алфавитном порядке
                        return a.subject.localeCompare(b.subject);
                    }
                }
            }
        });

        let data = [];
        for (let i in homework) {
            let d = [];
            if (homework[i]['proved'] === false) {
                if (homework[i]['date'].split('.')[2] >= dt.year)
                    if (homework[i]['date'].split('.')[1] > to_day_month(dt.month)) {
                        let file = homework[i]['file'].split(";");
                        let links = [];
                        for (let j = 0; j < file.length - 1; j++) {

                            let link = await getFileLink('./files_from_users', file[j]);

                            if (link && link.length > 0)
                                links.push(link);
                        }
                        d.push(ucfirst(homework[i]['surname']), homework[i]['date'], homework[i]['subject'], homework[i]['text'], links);
                    } else {
                        if (homework[i]['date'].split('.')[1] === to_day_month(dt.month)) {
                            if (homework[i]['date'].split('.')[0] >= to_day_month(dt.day)) {
                                let file = homework[i]['file'].split(";");
                                let links = [];
                                for (let j = 0; j < file.length - 1; j++) {

                                    let link = await getFileLink('./files_from_users', file[j]);

                                    if (link && link.length > 0)
                                        links.push(link);
                                }
                                d.push(ucfirst(homework[i]['surname']), homework[i]['date'], homework[i]['subject'], homework[i]['text'], links);
                            }
                        }
                    }
            }
            if (d && d.length > 0) {
                data.push(d);
            }
        }

        return data;
    }

//------------------------------------------------GET EVENTS------------------------------------------------------------
    async getEvents() {
        const dt = DateTime.now();
        const events = await eventModel.find();
        let data = [];
        for (let i in events) {
            if (Number(events[i]['date'].split('.')[2]) > dt.year) {
                data.push(events[i]);
            } else {
                if (Number(events[i]['date'].split('.')[2]) === dt.year) {
                    if (Number(events[i]['date'].split('.')[1]) > dt.month) {
                        data.push(events[i]);
                    } else {
                        if (Number(events[i]['date'].split('.')[1]) === dt.month) {
                            if (Number(events[i]['date'].split('.')[0]) >= dt.day) {
                                data.push(events[i]);
                            } else {
                                await eventModel.deleteOne({date: events[i]['date']})
                            }
                        } else {
                            await eventModel.deleteOne({date: events[i]['date']})
                        }
                    }
                } else {
                    await eventModel.deleteOne({date: events[i]['date']})
                }
            }
        }

        data.sort((a, b) => {
            if (Number(a.date.split('.')[2]) < Number(b.date.split('.')[2])) {
                return -1;
            } else if (Number(a.date.split('.')[2]) > Number(b.date.split('.')[2])) {
                return 1;
            } else {
                if (Number(a.date.split('.')[1]) < Number(b.date.split('.')[1])) {
                    return -1;
                } else if (Number(a.date.split('.')[1]) > Number(b.date.split('.')[1])) {
                    return 1;
                } else {
                    if (Number(a.date.split('.')[0]) < Number(b.date.split('.')[0])) {
                        return -1;
                    } else if (Number(a.date.split('.')[0]) >= Number(b.date.split('.')[0])) {
                        return 1;
                    }
                }
            }
        });

        return data;
    }

//--------------------------------------------GET NOTIFICATION----------------------------------------------------------
    async getNotification(class_) {
        const dt = DateTime.now();
        let todayStr = to_day_month(dt.day) + "." + to_day_month(dt.month) + "." + dt.year;
        let notification = await notificationModel.find({
            class: class_,
            date: todayStr
        });
        let adminNotice = await notificationModel.find({
            class: "all",
            date: todayStr
        });
        const data = [];

        for (let i in notification) {
            data.push(notification[i].text);
        }
        for (let i in adminNotice) {
            data.push(adminNotice[i].text);
        }
        notification = await notificationModel.find();
        for (let i in notification) {
            let notifyDay = Number(notification[i]['date'].split('.')[0]);
            let notifyMonth = Number(notification[i]['date'].split('.')[1]);
            let notifyYear = Number(notification[i]['date'].split('.')[2]);
            let text = notification[i]['text'];
            if (notifyYear < dt.year) {
                await notificationModel.deleteOne({date: notification[i]['date'], text: text});
            } else {
                if (notifyMonth < dt.month) {
                    await notificationModel.deleteOne({date: notification[i]['date'], text: text});
                } else {
                    if (notifyDay < dt.day) {
                        await notificationModel.deleteOne({date: notification[i]['date'], text: text});
                    }
                }
            }
        }


        if (!data || data.length === 0 || data === [])
            return "none";
        return data;
    }

//------------------------------------------GET RATING FOR PERSON-------------------------------------------------------
    async userRating(val, refreshToken) {
        const userData = tokenService.validateRefreshToken(refreshToken);

        const user = await UserModel.findById(userData.id);

        if (user) {
            let class_ = user['class'];
            let users;
            if (val === "none" || val === "parallel" || val === undefined) {
                users = await UserModel.find({"status": {$ne: "admin"}});
            } else {
                users = await UserModel.find({class: class_, status: {$ne: "admin"}});
            }

            users.sort((a, b) => {
                let rating = b.rating - a.rating;

                return rating !== 0 ? rating : a.surname.localeCompare(b.surname);
            });

            let surname = user['surname'];
            let k = 1;

            for (let i in users) {
                if (users[i]['surname'] === surname) {
                    return [k, user['class'], user['rating']];
                }
                k += 1;
            }
        }
        throw apiError.MaybeServerProblem('Рейтинг пользователя не найден, возможно пользователь не существует');
    }

//------------------------------------GET TOP FIVE PERSON OF RATING FOR CLASS-------------------------------------------
    async getTopFiveOfRating(val, class_) {
        let users = [];
        let all;

        if (val === "none" || val === "parallel") {
            all = await UserModel.find({
                class: {$regex: `${class_.split("_")[0]}`},
                status: {$ne: "admin"}
            }).sort({rating: -1}).limit(7);

        } else {
            all = await UserModel.find({class: class_, status: {$ne: "admin"}}).sort({rating: -1}).limit(7);
        }

        for (let i in all) {
            users.push(all[i]);
        }

        let top = [];
        users.sort((a, b) => {
            let rating = b.rating - a.rating;

            return rating !== 0 ? rating : a.surname.localeCompare(b.surname);
        });
        for (let i = 0; i < users.length; i++) {
            let class_ = users[i]['class'].split("_")[0] + users[i]['class'].split("_")[1];
            top.push([ucfirst(users[i]['name']), ucfirst(users[i]['surname']), class_, users[i]['rating']]);
        }

        return top;
    }

//------------------------------------GET CLASS RATING FOR PERSON'S PARALLEL--------------------------------------------
    async getClassRate(refreshToken) {
        let class_;
        if (tokenService.validateRefreshToken(refreshToken)) {
            let userData = tokenService.validateRefreshToken(refreshToken);
            let user = await UserModel.findById(userData.id);
            class_ = user['class'];
        } else {
            class_ = refreshToken;
        }
        let other_classes = ['11', '10', '9', '8'];
        other_classes.splice(other_classes.indexOf(class_.split("_")[0]), 1);
        other_classes.unshift(class_.split("_")[0]);// для того чтобы сначала получить параллель человека, а затем все остальные
        let classes = await getParalel(class_);
        let paralel = [];
        let ratings = [];
        for (let i in classes) {
            paralel = await UserModel.find({class: classes[i]});
            let class_rate = 0;
            for (let user in paralel) {
                class_rate += paralel[user]['rating'];
            }
            ratings.push([classes[i], class_rate]);
        }

        ratings.sort((a, b) => {
            let rate = b[1] - a[1];
            return rate >= 0 ? rate : b[0].split("_")[1].localeCompare(a[0].split("_")[1]);
        });
        return [ratings, other_classes];
    }

//==================================================HOMEWORK============================================================

//------------------------------------------------GET HOMEWORK----------------------------------------------------------
    async getHomework(refreshToken) {
        const dt = DateTime.now();
        const userData = tokenService.validateRefreshToken(refreshToken);
        const user = await UserModel.findById(userData.id);
        let today = to_day_month(dt.day) + "." + to_day_month(dt.month) + "." + dt.year;
        let tommorow;
        if (dt.weekday === 6) {
            tommorow = to_day_month((dt.day + 2)) + "." + to_day_month(dt.month) + "." + dt.year;
        } else {
            tommorow = to_day_month((dt.day + 1)) + "." + to_day_month(dt.month) + "." + dt.year;
        }
        let sendHomework = [];
        let sec = [];
        let Rate = 0;
        let agreed_today = await hometaskModel.find({class: user.class, date: today, proved: true});
        if (agreed_today) {
            for (let i in agreed_today) {
                let homeworkStr = [agreed_today[i]['date'], agreed_today[i]['subject'], agreed_today[i]['text'], agreed_today[i]['file']];
                sendHomework.push(homeworkStr);
            }
        } else {
            let homework = await hometaskModel.find({class: user.class, date: today});
            if (homework) {
                for (let i in homework) {
                    let user = await UserModel.findOne({surname: homework[i]['surname']});
                    Rate += Number(user['rating']);
                }
                if (Rate > 0)
                    Rate /= homework.length;
            }
            if (Rate >= 10) {
                for (let i in homework) {
                    let user = await UserModel.findOne({surname: homework[i]['surname']});
                    if (homework[i]['proved'] === true || Number(user['rating']) >= Rate) {
                        let homeworkStr = [homework[i]['date'], homework[i]['subject'], homework[i]['text'], homework[i]['file']];
                        sendHomework.push(homeworkStr);
                    }
                }
            }
        }
        sendHomework.sort();

        let agreed_tomorrow = await hometaskModel.find({class: user.class, date: tommorow, proved: true});
        if (agreed_tomorrow) {
            for (let i in agreed_tomorrow) {
                let homeworkStr = [agreed_tomorrow[i]['date'], agreed_tomorrow[i]['subject'], agreed_tomorrow[i]['text'], agreed_tomorrow[i]['file']];
                sendHomework.push(homeworkStr);
            }
        } else {
            Rate = 0;
            let homework2 = await hometaskModel.find({class: user.class, date: tommorow});
            if (homework2) {
                for (let i in homework2) {
                    let user = await UserModel.findOne({surname: homework2[i]['surname']});
                    Rate += Number(user['rating']);
                }
                if (Rate > 0)
                    Rate /= homework2.length;
            }
            if (Rate >= 10) {
                for (let i in homework2) {
                    let user = await UserModel.findOne({surname: homework2[i]['surname']});
                    if (homework2[i]['proved'] === true || Number(user['rating']) >= Rate) {
                        let homeworkStr = [homework2[i]['date'], homework2[i]['subject'], homework2[i]['text'], homework2[i]['file']];
                        sec.push(homeworkStr);
                    }
                }
            }
        }
        sec.sort();


        let total = [...sendHomework, ...sec];
        let total_return = [];
        let date = '';
        let text = '';
        let subject = '';
        let file = '';
        for (let i = 0; i < total.length - 1; i++) {
            if (total[i][0] === total[i + 1][0] && total[i][1] === total[i + 1][1]) {
                text += total[i][2] + " ";
                file += total[i][3];
            } else {
                text += total[i][2];
                file += total[i][3];
                date = total[i][0];
                subject = total[i][1];
                total_return.push([date, subject, text, file]);
                text = '';
                file = '';
            }
        }
        if (total.length > 0) {
            text += total[total.length - 1][2];
            date = total[total.length - 1][0];
            subject = total[total.length - 1][1];
            file += total[total.length - 1][3];
            total_return.push([date, subject, text, file]);
        }
        //получаем ссылки на файлы
        total = [];
        for (let task in total_return) {
            let links = [];
            let files = total_return[task][3].split(";");

            for (let i = 0; i < files.length - 1; i++) {

                let link = await getFileLink('./files_from_users', files[i]);

                if (link && link.length > 0)
                    links.push(link);
            }

            total.push([total_return[task][0], total_return[task][1], total_return[task][2], links]);//date subject text [links]
        }

        return total;
    }

//----------------------------------------GET HOMETASKS FOR A WEEK------------------------------------------------------
    async getHometaskForWeek(class_, subjects) {
        let hometasks = {};
        for (let i in subjects) {
            let taskBySub = await hometaskModel.find({class: class_, subject: subjects[i], proved: true});
            if (taskBySub.length === 1) {
                let files = taskBySub[0]['file'].split(";");
                let links = [];
                for (let i = 0; i < files.length - 1; i++) {
                    let link = await getFileLink('./files_from_users', files[i]);

                    if (link && link.length > 0)
                        links.push(link);
                }
                hometasks[subjects[i]] = [{
                    date: taskBySub[0]['date'],
                    text: taskBySub[0]['text'],
                    file: links
                }];
            } else {
                if (taskBySub.length === 0) {
                    hometasks[subjects[i]] = [{date: "", text: ""}];
                } else {
                    taskBySub.sort((a, b) => new Date(a.date) - new Date(b.date));

                    let total = [];
                    let date = '';
                    let text = '';
                    let file = '';
                    for (let j = 0; j < taskBySub.length - 1; j++) {
                        if (taskBySub[j]['date'] === taskBySub[j + 1]['date']) {
                            text += taskBySub[j]['text'] + ". ";
                            file += taskBySub[j]['file'];
                        } else {
                            text += taskBySub[j]['text'];
                            date = taskBySub[j]['date'];
                            file += taskBySub[j]['file'];
                            total.push({date: date, text: text, file: file});
                            text = '';
                            file = '';
                        }
                    }
                    if (text.length > 0 || file.length > 0) {
                        date = taskBySub[taskBySub.length - 1]['date'];
                        total.push({date: date, text: text, file: file});
                    } else {
                        if (taskBySub.length >= 2) {
                            if (taskBySub[taskBySub.length - 2]['date'] !== taskBySub[taskBySub.length - 1]['date']) {
                                text += taskBySub[taskBySub.length - 1]['text'] + ". ";
                                file += taskBySub[taskBySub.length - 1]['file'];
                                date = taskBySub[taskBySub.length - 1]['date'];
                                total.push({date: date, text: text, file: file});
                            }
                        }
                    }
                    let total_result = [];
                    for (let task in total) {
                        let links = [];

                        let files = total[task]['file'].split(";");

                        for (let i = 0; i < files.length - 1; i++) {

                            let link = await getFileLink('./files_from_users', files[i]);

                            if (link && link.length > 0)
                                links.push(link);
                        }
                        total_result.push({date: total[task]['date'], text: total[task]['text'], file: links});//date subject text [links]
                    }
                    hometasks[subjects[i]] = total_result;
                }
            }
        }

        return hometasks;
    }

//--------------------------------------GET TEACHERS AND CLASSROOMS-----------------------------------------------------
    async getTeachers(refreshToken) {
        const userData = tokenService.validateRefreshToken(refreshToken);
        const user = await UserModel.findById(userData.id);
        if (user) {
            let student_id = user['_id'];
            let query = {};
            query[`students.${student_id}`] = {$exists: true};

            let teachers = await teacherModel.find(query);

            if (teachers.length === 0) {
                throw apiError.BadRequest("к данному ученику не были привязаны учителя, обратитесь к админу с данной проблемой.");
            }

            let result = {};
            for (let i in teachers) {
                let Tname = ucfirst(teachers[i]['surname']) + " " + ucfirst(teachers[i]['name']) + " " + ucfirst(teachers[i]['lastname']);
                let classroom = teachers[i]['classroom'];
                let subjects = teachers[i]['students'][student_id];
                for (let sub in subjects) {
                    result[subjects[sub]] = {
                        name: Tname,
                        classroom: classroom
                    };
                }
            }
            //console.log(result);
            return result;
        }
        throw apiError.BadRequest("Статус пользователя или его класс были изменены, почистите куки(нажмите 'выйти') и попробуйте зайти снова.");
    }

//-------------------------------------------------ADD HOMEWORK---------------------------------------------------------
    async writeHomework(refreshToken, homework, subject, date, file) {
        const userData = tokenService.validateRefreshToken(refreshToken);
        const user = await UserModel.findById(userData.id);
        if (user.ban.length !== 0) {
            return {user, problems: "this user has ban"};
        }
        const isWritten = await hometaskModel.findOne({
            surname: user.surname,
            subject: subject,
            date: date,
        });
        if (isWritten) {
            return {user, problems: "person has written"};
        }
        if (subject === "" || subject === undefined || subject === "none") {
            return {user, problems: "noneSubject"};
        }
        if (date === "" || date === undefined || date === "none") {
            return {user, problems: "noneDate"};
        }
        if (homework === "" || homework === undefined || homework === "none") {
            return {user, problems: "noneHomework"};
        }
        let files = '';
        for (let i in file) {
            files += file[i].filename + ";";
        }

        await hometaskModel.create({
            surname: user.surname,
            text: homework,
            class: user.class,
            subject: subject,
            file: files,
            date: date,
            proved: false
        });
        return {user, problems: "none"};

    }


//-----------------------------------------------------GET DATE---------------------------------------------------------
    async getDate(refreshToken, subject) {
        const dt = DateTime.now();
        const week = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        let indexOfDays = dt.weekday - 1;


        const userData = tokenService.validateRefreshToken(refreshToken);
        const user = await UserModel.findById(userData.id);

        const timetable = await timetableModel.findOne({class: user.class});
        let dateOfMight;
        let timetableDict = new Map();
        for (let j in week) {
            if (week[j] !== 'sunday') {
                let strToList = timetable[week[j]].replaceAll(")", " ").replaceAll("/", " ").split(" ");
                let totalStr = [];
                for (let i in strToList) {
                    if (!(['1', '2', '3', '4', '5', '6', '7'].includes(strToList[i]))) {
                        totalStr.push(strToList[i]);
                    }
                }
                timetableDict.set(week[j], totalStr);
            } else {
                break;
            }
        }
        dateOfMight = [];
        for (let [key, value] of timetableDict.entries()) {
            for (let i = 0; i < value.length; i++) {
                if (subject === value[i]) {
                    dateOfMight.push(key);
                    break;
                }
            }
        }
        //console.log(dateOfMight);
        let week_of_subjects = [];
        switch (dateOfMight.length) {
            case 1:
                for (let i = 0; i < 3; i++) {
                    week_of_subjects.push(dateOfMight[0]);
                }
                break;
            case 2:
                for (let i in dateOfMight) {
                    week_of_subjects.push(dateOfMight[i]);
                }
                week_of_subjects.push(dateOfMight[0]);
                break;
            case 3:
                for (let i in dateOfMight) {
                    week_of_subjects.push(dateOfMight[i]);
                }
                break;
            default:
                week_of_subjects = dateOfMight;
                break;
        }
        //console.log(week_of_subjects);

        let check_week = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        let dates = [];
        let k = 1;
        for (let i = indexOfDays + 1; i < check_week.length; i++) {
            if (dates.length >= 3) {
                break;
            }
            if (week_of_subjects.length > 0 && week_of_subjects.includes(check_week[i])) {
                dates.push(k);
                let index = week_of_subjects.indexOf(check_week[i])
                week_of_subjects.splice(index, 1);
            }
            k++;
        }
        //console.log(dates);
        return add_to(dates);
    }

//==============================================GENERAL FUNCTIONS=======================================================

//------------------------------------------USER CHECK REFRESHTOKEN-----------------------------------------------------
    async user(refreshToken) {
        let dt = DateTime.now();
        let date_now = to_day_month(dt.day) + "." + to_day_month(dt.month) + "." + dt.year;

        const userData = await tokenService.validateRefreshToken(refreshToken);

        const user = await UserModel.findById(userData.id);
        try {
            if (userData.status === user.status) {
                if (user.ban.length > 0) {
                    if (user.ban <= date_now) {//это корректно работает?
                        await UserModel.updateOne({
                            surname: user.surname,
                            name: user.name
                        }, {$set: {ban: ''}});
                    }
                }
                return await UserModel.findById(userData.id);
            }
        } catch (e) {
            throw apiError.BadRequest("Статус пользователя или его класс были изменены, почистите куки и попробуйте зайти снова");
        }
    }

//--------------------------------CHECK CHANGED PASSWORD AND LOGIN OR NOT-----------------------------------------------
    async isChangePass(refreshToken) {
        const userData = tokenService.validateRefreshToken(refreshToken);
        const user = await UserModel.findById(userData.id);
        return user.isChangePass;
    }

//===================================================LEADER=============================================================

//-----------------------------------------------ADD NOTIFICATION-------------------------------------------------------
    async leaderNotification(refreshToken, notification) {
        const dt = DateTime.now();
        const user = await UserModel.findById(tokenService.validateRefreshToken(refreshToken).id);
        if (!(await notificationModel.findOne({text: notification, class: user.class})))
            await notificationModel.create({
                text: notification,
                class: user.class,
                date: to_day_month(dt.day) + "." + to_day_month(dt.month) + "." + dt.year
            });

        return true;
    }


//------------------------------------------------ADD EVENTS------------------------------------------------------------
    async leaderEvents(refreshToken, location, date, text) {
        let dt = date.split('-')[2] + "." + date.split('-')[1] + "." + date.split('-')[0];
        const user = await UserModel.findById(tokenService.validateRefreshToken(refreshToken).id);
        if (await eventModel.findOne({date: dt, place: location})) {
            let lastEvent = await eventModel.findOne({date: dt, place: location});
            await eventModel.updateOne({date: dt, place: location}, {
                $set: {
                    text: lastEvent.text + ". " + text.charAt(0).toUpperCase() + text.slice(1)
                }
            })
        } else {
            await eventModel.create({
                place: location,
                text: text,
                date: dt,
                surname: user.surname
            });
        }
        return true;
    }

//-----------------------------------------------CHECK HOMEWORK MODAL---------------------------------------------------

//ADD HOMETASK----------------------------------------------------------------------------------------------------------
    async leaderHomeworkAdd(data) {
        await hometaskModel.updateOne({
            surname: data['kok'].toLowerCase(),
            date: data['kok1'],
            subject: data['kok2']
        }, {$set: {proved: true}});

        let user = await UserModel.findOne({surname: data['kok'].toLowerCase()});
        let rating = user.rating + 1;
        await UserModel.updateOne({surname: data['kok'].toLowerCase()}, {$set: {rating: rating}});

        return true;
    }

//DELETE HOMETASK-------------------------------------------------------------------------------------------------------
    async leaderHomeworkDel(data) {
        let ht = await hometaskModel.findOne({
            surname: data['kok'].toLowerCase(),
            date: data['kok1'],
            subject: data['kok2']
        });
        if (ht) {
            let files = ht['file'].split(';');
            await hometaskModel.deleteOne({
                surname: data['kok'].toLowerCase(),
                date: data['kok1'],
                subject: data['kok2']
            });
            if (files.length > 1) {
                try {
                    for (let i in files) {
                        if (files[i].length > 0) {
                            let filePath = './files_from_users/' + files[i];
                            fs.unlink(filePath, (err) => {
                                if (err) {
                                    console.error('файл прикрепленный к заданию не найден, но дз удалено. Ошибка при удалении файла:', err);
                                    //throw apiError.MaybeServerProblem("файл прикрепленный к заданию не найден, но дз удалено");
                                }
                            });
                        }
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        }
        return true;
    }

//BAN USER AND DELETE HIS HOMETASK--------------------------------------------------------------------------------------
    async leaderHomeworkBan(data) {
        let dt = DateTime.now();
        let date = to_day_month(dt.plus({days: (dt.day + 6)}).day) + "." + to_day_month(dt.plus({days: (dt.day + 6)}).month + "." + dt.plus({days: (dt.day + 6)}).year);

        await hometaskModel.deleteOne({
            surname: data['kok'].toLowerCase(),
            date: data['kok1'],
            subject: data['kok2']
        });

        let user = await UserModel.findOne({surname: data['kok'].toLowerCase()});
        let rating = user.rating;

        if (rating > 0) {
            await UserModel.updateOne({surname: data['kok'].toLowerCase()}, {
                $set: {
                    rating: (rating - 1),
                    ban: date
                }
            });
        } else {
            await UserModel.updateOne({surname: data['kok'].toLowerCase()}, {
                $set: {
                    rating: rating,
                    ban: date
                }
            });
        }

        return true;
    }

//====================================================TIMETABLE=========================================================

//-----------------------------------------------GET TIMETABLE----------------------------------------------------------
    async getTimetable(parallel, class_) {
        const userData = await timetableModel.find();

        let data = [];
        let other = [];
        for (let i = 0; i < userData.length; i++) {
            if (userData[i].class.split("_")[0] === parallel && userData[i].class !== class_) {
                data.push(userData[i].class);
            }
        }
        let timetable = [];
        timetable.push(await timetableModel.findOne({class: class_}));

        for (let i = 0; i < data.length; i++) {
            other.push(await timetableModel.findOne({class: data[i]}));
        }
        other.sort((a, b) => {
            let number = parseInt(b['class'].split("_")[0]) - parseInt(a['class'].split("_")[0]);
            return number !== 0 ? number : a['class'].split("_")[1].localeCompare(b['class'].split("_")[1]);
        });

        return timetable.concat(other);
    }

//-----------------------------------------GET TIMETABLE FOR ALL USERS--------------------------------------------------
    async getAllTimetable() {
        const userData = await timetableModel.find();
        let data = [];
        for (let i = 0; i < userData.length; i++) {
            data.push(await timetableModel.findOne({class: userData[i].class}));
        }
        data.sort((a, b) => {
            let number = parseInt(b['class'].split("_")[0]) - parseInt(a['class'].split("_")[0]);
            return number !== 0 ? number : a['class'].split("_")[1].localeCompare(b['class'].split("_")[1]);
        });
        return data;
    }

}

module.exports = new UserService();
