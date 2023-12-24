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
function add_to(a, b, c) {
    let list = [];
    let dt = DateTime.now();
    list.push(
        to_day_month(dt.plus({days: a}).day) + "." + to_day_month(dt.plus({days: a}).month) + "." + dt.plus({days: a}).year,
        to_day_month(dt.plus({days: (b)}).day) + "." + to_day_month(dt.plus({days: (b)}).month) + "." + dt.plus({days: b}).year,
        to_day_month(dt.plus({days: (c)}).day) + "." + to_day_month(dt.plus({days: (c)}).month) + "." + dt.plus({days: c}).year
    );
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

//REPLACE "_" WITH " " -------------------------------------------------------------------------------------------------
function replace_(str) {
    let kol = 0;
    for (let i = 0; i < str.length; i++) {
        if (str[i] === '_')
            kol += 1;
    }
    if (kol > 0) {
        return str.replaceAll("_", " ");
    }
    return str;
}

//GET PARALEL-----------------------------------------------------------------------------------------------------------
async function getParalel(class_) {
    let num = Number(class_.split("_")[0]);

    let timetables = await timetableModel.find();
    let classes = [];
    for (let i in timetables) {
        classes.push(timetables[i]['class']);
    }
    let allClasses = sortClasses(classes);
    let totalClasses = [];
    for (let i in allClasses) {
        let number = Number(allClasses[i].split("_")[0]);
        let letter = allClasses[i].split("_")[1];
        if (num === number) {
            totalClasses.push(allClasses[i]); // надо подумать, как потом прекратить идти, елси все нашел
        }
    }
    return totalClasses;
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

//GET DATA FOR TIMETABLE------------------------------------------------------------------------------------------------
function getDataForDate(dateOfMight, indexOfDays, fromFtoS = 7, fromStoTH = 14) {
    const week = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    let date;
    let nearest = Math.min(7 - indexOfDays + week.indexOf(dateOfMight[0]), Math.abs(week.indexOf(dateOfMight[0]) - indexOfDays));
    date = add_to(nearest, nearest + fromFtoS, nearest + fromStoTH);
    return date;
}

//GET LINKS FOR FILES---------------------------------------------------------------------------------------------------
async function getFileLink(filename) {
    return new Promise((resolve, reject) => {
        let fileDir = './files_from_users';

        fs.readdir(fileDir, (err, files) => {
            if (err) {
                throw apiError.MaybeServerProblem("проблемы загрузки файла. Возможно файл поврежден или отсутствует.");
            }

            let sortfiles = files.filter(file => file.includes(filename));
            let fileLinks = sortfiles.map(file => path.join(fileDir, file));
            let result = '';
            result += fileLinks.map(filePath => (`${encodeURIComponent(path.basename(filePath))}`));

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
            if (Number(homeworks[i]['date'].split('.')[0]) < dt.day && Number(homeworks[i]['date'].split('.')[1]) === dt.month) {
                let hometask = await hometaskModel.deleteOne({
                    date: homeworks[i]['date'],
                    surname: homeworks[i]['surname'],
                    subject: homeworks[i]['subject']
                });
            } else {
                if (Number(homeworks[i]['date'].split('.')[0]) >= dt.day && Number(homeworks[i]['date'].split('.')[1]) < dt.month) {
                    let hometask = await hometaskModel.deleteOne({
                        date: homeworks[i]['date'],
                        surname: homeworks[i]['surname'],
                        subject: homeworks[i]['subject']
                    });
                }
            }
        }
    }
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
        console.log(name, surname, class_, pass, status);
        if (await UserModel.findOne({name: name, surname: surname}))
            return null;

        const hashpassword = await bcrypt.hash(pass, 3);

        const user = await UserModel.create({
            name: name,
            surname: surname,
            login: surname,
            password: hashpassword,
            class: class_,
            status: status,
            teachers_id: "",
            rating: 0,
            ban: 0,
            isChangePass: false
        });

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: UserDto
        }
    }

//=========================================CHANGE LOGIN AND PASSWORD====================================================
    async changeLogPass(login, password, user) {
        let surname = user.surname;
        let name = user.name;
        let class_ = user.class;
        const hashPassword = await bcrypt.hash(password, 3);
        await UserModel.updateOne({"surname": surname, "name": name, "class": class_}, {
            $set: {
                "login": login,
                "password": hashPassword,
                "isChangePass": true
            }
        });
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
        const userData = tokenService.validateRefreshToken(refreshToken);
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

        await tokenService.removeToken(tokens.refreshToken);
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
                if (!(['1', '2', '3', '4', '5', '6', '7'].includes(strToList[i])) && strToList[i] !== '-') { //попробовать передалать под include
                    dateOfMight.add(strToList[i]);
                }
            }
        }

        let totalSub = [];
        for (let i of dateOfMight) {
            totalSub.push(replace_(i));
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
                        d.push(ucfirst(homework[i]['surname']), homework[i]['date'], replace_(homework[i]['subject']), homework[i]['text']);
                    } else {
                        if (homework[i]['date'].split('.')[1] === to_day_month(dt.month)) {
                            if (homework[i]['date'].split('.')[0] >= to_day_month(dt.day)) {
                                d.push(ucfirst(homework[i]['surname']), homework[i]['date'], replace_(homework[i]['subject']), homework[i]['text']);
                            }
                        }
                    }
            }
            if (d) {
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
            let users = [];
            if (val === "none" || val === "parallel" || val === undefined) {
                users = await UserModel.find();
            } else {
                users = await UserModel.find({class: class_});
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
        let all = [];

        if (val === "none" || val === "parallel") {
            all = await UserModel.find();
        } else {
            all = await UserModel.find({class: class_});
        }

        for (let i in all) {
            if (all[i]['surname'] !== "admin") {
                users.push(all[i]);
            }
        }

        users.sort((a, b) => {
            let rating = b.rating - a.rating;

            return rating !== 0 ? rating : a.surname.localeCompare(b.surname);
        });

        let top = [];
        let count = 0;
        if (users.length >= 5) {
            count = 5;
        } else {
            count = users.length;
        }

        for (let i = 0; i < count; i++) {
            let class_ = users[i]['class'].split("_")[0] + users[i]['class'].split("_")[1];
            top.push([ucfirst(users[i]['name']), ucfirst(users[i]['surname']), class_, users[i]['rating']]);
        }

        return top;
    }

//------------------------------------GET CLASS RATING FOR PERSON PARALLEL----------------------------------------------
    async getClassRate(refreshToken) {
        let class_ = '';
        if (tokenService.validateRefreshToken(refreshToken)) {
            let userData = tokenService.validateRefreshToken(refreshToken);
            let user = await UserModel.findById(userData.id);
            class_ = user['class'];
        } else {
            class_ = refreshToken;
        }
        let other_classes = ['11', '10', '9', '8'];
        other_classes.splice(other_classes.indexOf(class_.split("_")[0]), 1);
        other_classes.unshift(class_.split("_")[0]);
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
            let rate = b[0].split("_")[1].localeCompare(a[0].split("_")[1]);
            return rate !== 0 ? rate : a[1] - b[1];
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
        let tommorow = "";
        if (dt.weekday === 6) {
            tommorow = to_day_month((dt.day + 2)) + "." + to_day_month(dt.month) + "." + dt.year;
        } else {
            tommorow = to_day_month((dt.day + 1)) + "." + to_day_month(dt.month) + "." + dt.year;
        }
        let sendHomework = [];
        let sec = [];
        let Rate = 0;
        let homework = await hometaskModel.find({class: user.class, date: today});
        if (homework)
            for (let i in homework) {
                let user = await UserModel.findOne({surname: homework[i]['surname']});
                Rate += Number(user['rating']);
            }
        if (Rate > 0)
            Rate /= homework.length;

        for (let i in homework) {
            let user = await UserModel.findOne({surname: homework[i]['surname']});
            if (homework[i]['proved'] === true || Number(user['rating']) >= Rate) {
                let homeworkStr = [homework[i]['date'], homework[i]['subject'], homework[i]['text'], homework[i]['file']];
                sendHomework.push(homeworkStr);
            }
        }
        sendHomework.sort();
        let homework2 = await hometaskModel.find({class: user.class, date: tommorow});
        if (homework2)
            for (let i in homework2) {
                let user = await UserModel.findOne({surname: homework2[i]['surname']});
                Rate += Number(user['rating']);
            }
        if (Rate > 0)
            Rate /= homework2.length;

        for (let i in homework2) {
            let user = await UserModel.findOne({surname: homework2[i]['surname']});
            if (homework2[i]['proved'] === true || Number(user['rating']) >= Rate) {
                let homeworkStr = [homework2[i]['date'], homework2[i]['subject'], homework2[i]['text'], homework2[i]['file']];
                sec.push(homeworkStr);
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

                let link = await getFileLink(files[i]);

                if (link.length > 0)
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
                let files = taskBySub[0]['file'];
                let links=[];
                for(let file in files){
                    let link = await getFileLink(files[file]);

                    if (link.length > 0)
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
                    for (let i = 0; i < taskBySub.length - 1; i++) {
                        if (taskBySub[i]['date'] === taskBySub[i + 1]['date']) {
                            text += taskBySub[i]['text'] + " ";
                            file += taskBySub[i]['file'];
                            if ((i + 2) >= taskBySub.length) {
                                date = taskBySub[i]['date'];
                                text += taskBySub[i + 1]['text'];
                                file += taskBySub[i]['file'];
                                total.push({date: date, text: text, file: file});
                            }
                        } else {
                            text += taskBySub[i]['text'];
                            date = taskBySub[i]['date'];
                            file += taskBySub[i]['file'];
                            total.push({date: date, text: text, file: file});
                            if ((i + 2) >= taskBySub.length) {
                                date = taskBySub[i + 1]['date'];
                                text = taskBySub[i + 1]['text'];
                                file = taskBySub[i]['file'];
                                total.push({date: date, text: text, file: file});
                            } else {
                                text = '';
                                file = '';
                            }
                        }
                    }
                    let total_result = [];
                    for (let task in total) {
                        let links = [];

                        let files = total[task]['file'].split(";");

                        for (let i = 0; i < files.length - 1; i++) {

                            let link = await getFileLink(files[i]);

                            if (link.length > 0)
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
            //subject: [teacher, classroom]
            //["1-0", "1-2", "3-0"]
            let teachers_id = user['teachers_id'].split("_");
            let teachers = {};
            for (let t in teachers_id) {
                let teacher = teachers_id[t].split("-")[0];
                let lesson_id = Number(teachers_id[t].split("-")[1]);
                let getTeacher = await teacherModel.findOne({teacher_id: teacher});
                let getTeacherLessons = getTeacher['subject'].split('_');

                teachers[getTeacherLessons[lesson_id]] = {
                    name: ucfirst(getTeacher['surname']) + " " + ucfirst(getTeacher['name']) + " " + ucfirst(getTeacher['lastname']),
                    classroom: getTeacher['classroom']
                };
            }

            return teachers;
        }
        throw apiError.BadRequest("Статус пользователя или его класс были изменены, почистите куки(нажмите 'выйти') и попробуйте зайти снова");
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
            subject: replace_(subject),
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
            files += file[i].originalname + ";";
        }

        await hometaskModel.create({
            surname: user.surname,
            text: homework,
            class: user.class,
            subject: replace_(subject),
            file: files,
            date: date,
            proved: false
        });
        return {user, problems: "none"};

    }


//-----------------------------------------------------GET DATE---------------------------------------------------------
//подумать над переработкой, gpt привел пример, довольно интересный
    async getDate(refreshToken, subject) {
        const dt = DateTime.now();
        const week = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        let indexOfDays = dt.weekday - 1;

        const userData = tokenService.validateRefreshToken(refreshToken);
        const user = await UserModel.findById(userData.id);

        const timetable = await timetableModel.findOne({class: user.class});
        let dateOfMight = [];
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
        //console.log(dateOfMight);-------------------------------------------------------------------------------------
        let totalDate = [];
        let fromFtoS = week.indexOf(dateOfMight[1]) - week.indexOf(dateOfMight[0]);
        let fromStoT = week.indexOf(dateOfMight[2]) - week.indexOf(dateOfMight[1]);

        dateOfMight.reverse();
        //console.log(dateOfMight)--------------------------------------------------------------------------------------
        for (let day in dateOfMight) {
            //console.log(dateOfMight[day], indexOfDays, week.indexOf(dateOfMight[day]));-------------------------------
            if (indexOfDays > week.indexOf(dateOfMight[day])) {
                let near = Math.min(7 - indexOfDays + week.indexOf(dateOfMight[day]), Math.abs(week.indexOf(dateOfMight[day]) - indexOfDays));
                let index = week.indexOf(dateOfMight[day]);
                //console.log(`index: ${index}, near: ${near}, ${dateOfMight.length}`);---------------------------------
                switch (dateOfMight.length) {
                    case 1:
                        totalDate = add_to(near, near + 7, near + 14);
                        //console.log(totalDate, " - new 1");
                        break
                    case 2:
                        if (day === dateOfMight.length - 1) {
                            fromFtoS = week.indexOf(dateOfMight[day - 1]) - index;
                            let fromStoF = 7 - week.indexOf(dateOfMight[1]);
                            //console.log(`near - ${near}, second - ${fromFtoS}, third - ${fromStoF}`);
                            totalDate = add_to(near, near + fromFtoS, near + fromStoF + fromFtoS);
                        } else {
                            let fromStoF = 7 - index;
                            fromFtoS = week.indexOf(dateOfMight[day + 1]) - index;
                            totalDate = add_to(near, near + fromStoF, near + fromFtoS + fromStoF);
                        }
                        //console.log(totalDate, " - new 2");
                        break
                }
                break;
            }
        }

        dateOfMight.reverse()
        fromFtoS = week.indexOf(dateOfMight[1]) - week.indexOf(dateOfMight[0]);
        fromStoT = week.indexOf(dateOfMight[2]) - week.indexOf(dateOfMight[1]);
        switch (dateOfMight.length) {
            case 1:
                if (indexOfDays >= week.indexOf(dateOfMight[0])) {
                    let date = 7 - indexOfDays + week.indexOf(dateOfMight[0]);
                    totalDate = add_to(date, date + 7, date + 14);
                } else {
                    let date = week.indexOf(dateOfMight[0]) - indexOfDays;
                    totalDate = add_to(date, date + 7, date + 14);
                }
                //console.log(totalDate, " - normal 1");
                return totalDate;
            case 2:
                let fromStoF = 7 - week.indexOf(dateOfMight[1]) + week.indexOf(dateOfMight[0]);
                let forThird = fromStoF + fromFtoS;
                if (indexOfDays >= week.indexOf(dateOfMight[0])) {
                    if (indexOfDays >= week.indexOf(dateOfMight[1])) {
                        let forEnd = week.indexOf(dateOfMight[0]) + (7 - indexOfDays);
                        totalDate = add_to(forEnd, forEnd + fromFtoS, forEnd + forThird);
                    } else {
                        let fromNowToS = week.indexOf(dateOfMight[1]) - indexOfDays;
                        let fromNowtoS = 7 - week.indexOf(dateOfMight[1]) + week.indexOf(dateOfMight[0]);
                        totalDate = add_to(fromNowToS, fromNowToS + fromNowtoS, fromNowToS + forThird);
                    }
                } else {
                    let date = week.indexOf(dateOfMight[0]) - indexOfDays;
                    totalDate = add_to(date, date + fromFtoS, date + forThird);
                }
                //console.log(totalDate, " - normal 2");
                return totalDate;
            case 3:
                let fromTtoF = 7 - week.indexOf(dateOfMight[2]) + week.indexOf(dateOfMight[0]);
                if (indexOfDays >= week.indexOf(dateOfMight[0])) {
                    if (indexOfDays >= week.indexOf(dateOfMight[1])) {
                        if (indexOfDays >= week.indexOf(dateOfMight[2])) {
                            let date = 7 - indexOfDays + week.indexOf(dateOfMight[0]);
                            totalDate = add_to(date, date + fromFtoS, date + fromStoT + fromFtoS);
                        } else {
                            let date = week.indexOf(dateOfMight[2]) - indexOfDays;
                            totalDate = add_to(date, date + fromTtoF, date + fromFtoS + fromTtoF);
                        }
                    } else {
                        let date = week.indexOf(dateOfMight[1]) - indexOfDays;
                        totalDate = add_to(date, date + fromStoT, date + fromTtoF + fromStoT);
                    }
                } else {
                    let date = week.indexOf(dateOfMight[0]) - indexOfDays;
                    totalDate = add_to(date, date + fromFtoS, date + fromStoT + fromFtoS);
                }
                return totalDate;
            case 4:
                let fromTtoFor = week.indexOf(dateOfMight[3]) - week.indexOf(dateOfMight[2]);
                let fromFortoF = 7 - week.indexOf(dateOfMight[3]) + week.indexOf(dateOfMight[0]);
                if (indexOfDays >= week.indexOf(dateOfMight[0])) {
                    if (indexOfDays >= week.indexOf(dateOfMight[1])) {
                        if (indexOfDays >= week.indexOf(dateOfMight[2])) {
                            if (indexOfDays >= week.indexOf(dateOfMight[3])) {
                                let date = 7 - indexOfDays + week.indexOf(dateOfMight[0]);
                                totalDate = add_to(date, date + fromFtoS, date + fromStoT + fromFtoS);
                            } else {
                                let date = week.indexOf(dateOfMight[3]) - indexOfDays;
                                totalDate = add_to(date, date + fromFortoF, date + fromFortoF + fromFtoS);
                            }
                        } else {
                            let date = week.indexOf(dateOfMight[2]) - indexOfDays;
                            totalDate = add_to(date, date + fromTtoFor, date + fromTtoFor + fromFortoF);
                        }
                    } else {
                        let date = week.indexOf(dateOfMight[1]) - indexOfDays;
                        totalDate = add_to(date, date + fromFtoS, date + fromStoT + fromFtoS);
                    }
                } else {
                    let date = week.indexOf(dateOfMight[0]) - indexOfDays;
                    totalDate = add_to(date, date + fromFtoS, date + fromStoT + fromFtoS);
                }
                return totalDate;
        }
    }

//==============================================GENERAL FUNCTIONS=======================================================

//------------------------------------------USER CHECK REFRESHTOKEN-----------------------------------------------------
    async user(refreshToken) {
        let dt = DateTime.now();
        let date_now = to_day_month(dt.day) + "." + to_day_month(dt.month) + "." + dt.year;

        const userData = tokenService.validateRefreshToken(refreshToken);

        const user = await UserModel.findById(userData.id);
        try {
            if (userData.status === user.status) {
                if (user.ban.length > 0) {
                    if (user.ban <= date_now) {//это корректно работает?
                        let update_user = await UserModel.updateOne({
                            surname: user.surname,
                            name: user.name
                        }, {$set: {ban: ''}});
                    }
                }
                return UserModel.findById(userData.id);
            }
        } catch (e) {
            throw apiError.BadRequest("Статус пользователя или его класс были изменены, почистите куки и попробуйте зайти снова");
        }
    }

//--------------------------------CHECK CHANGED PASSWORD AND LOGIN OR NOT-----------------------------------------------
    async isChangePass(refreshToken) {
        const userData = tokenService.validateRefreshToken(refreshToken);
        const user = await UserModel.findById(userData.id);
        if (!user.isChangePass) {
            return false;
        } else {
            return true;
        }
    }

//----------------------------------------CLEAR HOMEWORK FUNCTION-------------------------------------------------------
    //надо сделать автономной, чтобы работала на сервере вне зависимости от того, кто зашел
    // также подумать, а что если сегодня не первый день недели, а есть записи более чем недельной записи, надо будет спросить, на неделю,
    // это так, что вот неделю назад было, или тупо прошлую неделю


//===================================================LEADER=============================================================

//-----------------------------------------------ADD NOTIFICATION-------------------------------------------------------
    async leaderNotification(refreshToken, notification) {
        const dt = DateTime.now();
        const user = await UserModel.findById(tokenService.validateRefreshToken(refreshToken).id);
        const userData = await notificationModel.create({
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
        const userData = await eventModel.create({
            place: location,
            text: text,
            date: dt,
            surname: user.surname
        });
        return true;
    }

//-----------------------------------------------CHECK HOMEWORK MODAL---------------------------------------------------

//ADD HOMETASK----------------------------------------------------------------------------------------------------------
    async leaderHomeworkAdd(data) {
        let hometask = await hometaskModel.updateOne({
            surname: data['kok'].toLowerCase(),
            date: data['kok1'],
            subject: data['kok2']
        }, {$set: {proved: true}});

        let user = await UserModel.findOne({surname: data['kok'].toLowerCase()});
        let rating = user.rating + 1;
        let update_user = await UserModel.updateOne({surname: data['kok'].toLowerCase()}, {$set: {rating: rating}});

        return true;
    }

//DELETE HOMETASK-------------------------------------------------------------------------------------------------------
    async leaderHomeworkDel(data) {
        let hometask = await hometaskModel.deleteOne({
            surname: data['kok'].toLowerCase(),
            date: data['kok1'],
            subject: data['kok2']
        });

        return true;
    }

//BAN USER AND DELETE HIS HOMETASK--------------------------------------------------------------------------------------
    async leaderHomeworkBan(data) {
        let dt = DateTime.now();
        let date = to_day_month(dt.plus({days: (dt.day + 6)}).day) + "." + to_day_month(dt.plus({days: (dt.day + 6)}).month + "." + dt.plus({days: (dt.day + 6)}).year);

        let hometask = await hometaskModel.deleteOne({
            surname: data['kok'].toLowerCase(),
            date: data['kok1'],
            subject: data['kok2']
        });

        let user = await UserModel.findOne({surname: data['kok'].toLowerCase()});
        let rating = user.rating;

        if (rating > 0) {
            let update_user = await UserModel.updateOne({surname: data['kok'].toLowerCase()}, {
                $set: {
                    rating: (rating - 1),
                    ban: date
                }
            });
        } else {
            let update_user = await UserModel.updateOne({surname: data['kok'].toLowerCase()}, {
                $set: {
                    rating: rating,
                    ban: date
                }
            });
        }

        return true;
    }

//====================================================ADMIN=============================================================
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
            if (users[i]['name'] !== "admin")
                result.push([users[i]['surname'], users[i]['name'], users[i]['class'], users[i]['status']]);
        }

        return result.sort();
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
        let tokenDel = '';
        if (userToken !== null)
            tokenDel = await tokenService.removeToken(userToken);

        let user = await UserModel.updateOne({
            surname: surname,
            name: name,
            class: class_
        }, {$set: {password: hashpassword, isChangePass: false}});

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
            let tokenDel = '';
            if (userToken !== null)
                tokenDel = await tokenService.removeToken(userToken);

        }
        if (del['acknowledged'] === true)
            return true;
        return false;
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

        let tokenDel = '';
        if (userToken !== null)
            tokenDel = await tokenService.removeToken(userToken);

        if (user['acknowledged'] === true)
            return true;
        return false;
    }

//---------------------------------------------------ADD USER MODAL-----------------------------------------------------
    async adminGeneratePass() {
        return generatePass();
    }

//----------------------------------------------------TIMETABLE---------------------------------------------------------

//GET TIMETABLE BY CLASS------------------------------------------------------------------------------------------------
    async adminTimetable(class_) {
        const week = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

        let timetable = await timetableModel.findOne({class: class_});

        let result = new Map();
        let mass = [];

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
        if (sub['acknowledged'] === true)
            return true;
        return false;
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
        if (update['acknowledged'] === true)
            return true;
        return false;
    }

//ADD NEW CLASS---------------------------------------------------------------------------------------------------------
    async adminAddClass(class_) {
        let number = "";
        let letter = "";
        for (let i in class_) {
            if ('234567'.includes(class_[i])) {
                return false;
            } else {
                if (class_[i] === '1' || class_[i] === '8' || class_[i] === '9' || class_[i] === '0') {
                    number += class_[i];
                } else {
                    letter += class_[i].toUpperCase();
                }
            }
        }
        if (7 < Number(number) && Number(number) < 12 && letter.length === 1) {
            if (await timetableModel.findOne({class: number + "_" + letter})) {
                return false;
            } else {
                await timetableModel.create({
                    class: number + "_" + letter,
                    monday: "1)- 2)- 3)- 4)- 5)- 6)- 7)-",
                    tuesday: "1)- 2)- 3)- 4)- 5)- 6)- 7)-",
                    wednesday: "1)- 2)- 3)- 4)- 5)- 6)- 7)-",
                    thursday: "1)- 2)- 3)- 4)- 5)- 6)- 7)-",
                    friday: "1)- 2)- 3)- 4)- 5)- 6)- 7)-",
                    saturday: "1)- 2)- 3)- 4)- 5)- 6)- 7)-"
                });
                return true;
            }
        } else {
            return false;
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
        const userData = await notificationModel.create({
            text: text,
            class: "all",
            date: to_day_month(dt.day) + "." + to_day_month(dt.month) + "." + dt.year
        });

        return true;
    }

//---------------------------------------------TEACHER PAGE-------------------------------------------------------------

//-------------------------------------------ADD NEW TEACHER------------------------------------------------------------
    async adminAddNewTeacher(name, surname, lastname, subject, classroom) {
        console.log(name, surname, lastname, subject, classroom);
        if (await teacherModel.findOne({name: name, surname: surname, lastname: lastname, subject: subject}))
            return null;
        let lastTeacher = await teacherModel.find();
        let getLastId = 0;
        if (lastTeacher.length > 0)
            getLastId = Number(lastTeacher[lastTeacher.length - 1]['teacher_id']);
        let teacher_id = (getLastId + 1).toString();

        const teacher = await teacherModel.create({
            name: name,
            surname: surname,
            lastname: lastname,
            subject: subject,
            classroom: classroom,
            teacher_id: teacher_id
        });
        return teacher;
    }

//====================================================TIMETABLE=========================================================

//---------------------------------------------TIMETABLE REGISTRATION---------------------------------------------------
    async timetable_r(class_, monday, tuesday, wednesday, thursday, friday, saturday) {
        const isExist = await timetableModel.findOne({class: class_});
        const userData = await timetableModel.create({
            class: class_,
            monday: monday,
            tuesday: tuesday,
            wednesday: wednesday,
            thursday: thursday,
            friday: friday,
            saturday: saturday
        });
        return userData;
    }

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
