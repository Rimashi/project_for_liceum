const UserModel = require('../models/user-model');
const timetableModel = require('../models/timetable-model');
const notificationModel = require('../models/notification-model');
const hometaskModel = require('../models/hometask-model');
const eventModel = require('../models/event-model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const tokenService = require('../service/token-service');
const UserDto = require('../dtos/user-dto');
const json = require('express').json();
const {DateTime} = require('luxon');
const {configDotenv} = require("dotenv");
const {home} = require("nodemon/lib/utils");


//FUNCTIONS-------------------------------------------------------------------------------------------------------------
//make day/month into normal with lenght == 2----------------------------------------------
function to_day_month(day) {
    if (day.toString().length === 1) {
        return "0" + day.toString();
    }
    return day.toString();
}

//append to list for days------------------------------------------------------------------
function add_to(a, b, c) {
    let list = [];
    let dt = DateTime.now();
    list.push(
        to_day_month(dt.plus({days: a}).day) + "." + to_day_month(dt.plus({days: a}).month),
        to_day_month(dt.plus({days: (b)}).day) + "." + to_day_month(dt.plus({days: (b)}).month),
        to_day_month(dt.plus({days: (c)}).day) + "." + to_day_month(dt.plus({days: (c)}).month)
    );
    return list;
}

//to up first letter-------------------------------------------------------------------------
function ucfirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

class UserService {
//REGISTRATION-------------------------------------------------------------------------------------------------------------------

    async registration(name, surname, login, pass, class_, status) {
        console.log(name, surname, login, pass, class_, status);
        if (await UserModel.findOne({name: name, surname: surname}))
            return null;
        const hashpassword = await bcrypt.hash(pass, 3);
        const user = await UserModel.create({
            name: name,
            surname: surname,
            login: login,
            password: hashpassword,
            class: class_,
            status: status,
            rating: 0,
            ban: 0
        });

        const userDto = new UserDto(user);
        //console.log(userDto);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: UserDto
        }
    }

//LOGIN-----------------------------------------------------------------------------------------------------------------

    async login(login, password) {
        console.log(login);
        if (login.split(" ").length - 1 === 0) {
            const user = await UserModel.findOne({login: login});
            //console.log(user);

            if (!user) {
                const user = await UserModel.findOne({surname: login});
                //console.log(user);
                if (!user) {
                    //throw ApiError.BadRequest('Пользователь не найден');
                    return "userNone";
                }

                const isPassTrue = await bcrypt.compare(password, user.password);
                if (!isPassTrue) {
                    //throw ApiError.BadRequest('Неверный пароль');
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
                //throw ApiError.BadRequest('Неверный пароль');
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
                //throw ApiError.BadRequest('Пользователь не найден');
                return "userNone";
            }

            const isPassTrue = await bcrypt.compare(password, user.password);
            if (!isPassTrue) {
                //throw ApiError.BadRequest('Неверный пароль');
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

//LOGOUT----------------------------------------------------------------------------------------------------------------

    async logout(refreshToken) {
        return await tokenService.removeToken(refreshToken);
    }

//REFRESH---------------------------------------------------------------------------------------------------------------

    async refresh(refreshToken) {
        if (!refreshToken) {
            // throw ApiError.UnathorizedError();
            return "userNone";
        }
        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromdb = await tokenService.findToken(refreshToken);
        if (!userData || !tokenFromdb) {
            // throw ApiError.UnathorizedError();
            return "passwordNone";
        }

        const user = await UserModel.findById(userData.id);
        //console.log(`user - ${user}`);///
        const data = [];
        data.push(user.status, user.surname, user.class);
        const userDto = new UserDto(user);
        //console.log(`userDto - ${userDto}`);///
        await tokenService.removeToken(refreshToken);
        const tokens = tokenService.generateTokens({...userDto});
        //console.log(`tokens - ${tokens}`);///
        await tokenService.removeToken(tokens.refreshToken);
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            data,
            user: UserDto
        }
    }

//GETERS----------------------------------------------------------------------------------------------------------------
//get classes-----------------------------------------------------
    async getClasses() {
        let timetables = await timetableModel.find();
        let classes = [];
        for (let i in timetables) {
            classes.push(timetables[i]['class']);
        }

        return classes;

    }

//get all subjects for class--------------------------------------
    async getSubjects(class_) {
        const week = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

        const timetable = await timetableModel.findOne({class: class_});
        let dateOfMight = new Set();
        for (let j in week) {
            //console.log(week[i], " - i in week");
            let strToList = timetable[week[j]].replaceAll(")", " ").replaceAll("/", " ").split(" ");
            for (let i in strToList) {
                if (!(strToList[i] in ['1', '2', '3', '4', '5', '6', '7', '8']) && strToList[i] !== '-') { //8 потому что ОКАЗЫВАЕТСЯ метод in идет только до предпоследнего символа
                    //console.log(strToList[i]);
                    dateOfMight.add(strToList[i]);
                }
            }
        }

        let totalSub = [];
        for (let i of dateOfMight) {
            totalSub.push(i);
        }
        totalSub.sort();
        //console.log(totalSub);
        return totalSub;
    }


//Homework for leader check---------------------------------------
    async getCheckHomework(class_) {
        const dt = DateTime.now();
        const homework = await hometaskModel.find({
            class: class_
        });
        homework.sort((a, b) => {
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
        });

        let data = [];
        for (let i in homework) {
            let d = [];
            if (homework[i]['proved'] === false)
                if (Number(homework[i]['date'].split('.')[1]) >= dt.month) {
                    if (Number(homework[i]['date'].split('.')[0]) >= dt.day) {
                        d.push(ucfirst(homework[i]['surname']), homework[i]['date'], homework[i]['subject'], homework[i]['text']);
                    }
                }
            if (d) {
                data.push(d);
            }
        }
        return data;
    }


//events--------------------------------------------------------------------
//добавить сортировку по датам
    async getEvents() {
        const dt = DateTime.now();
        const events = await eventModel.find();
        //console.log(events);
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

//notification---------------------------------------------------------------

    async getNotification(class_) {
        //console.log(class_);
        const dt = DateTime.now();
        let todayStr = to_day_month(dt.day) + "." + to_day_month(dt.month);
        let notification = await notificationModel.find({
            class: class_,
            date: todayStr
        });
        const data = [];

        for (let i in notification) {
            data.push(notification[i].text);
        }
        notification = await notificationModel.find();
        for (let i in notification) {
            let notifyDay = Number(notification[i]['date'].split('.')[0]);
            let notifyMonth = Number(notification[i]['date'].split('.')[1]);
            if (notifyMonth < dt.month) {
                await notificationModel.deleteOne({date: notification[i]['date']});
            } else {
                if (notifyDay < dt.day) {
                    await notificationModel.deleteOne({date: notification[i]['date']});
                }
            }
        }


        if (!data || data.length === 0 || data === [])
            return "none";
        return data;
    }

//homework---------------------------------------------------------------
//get---------------------------------------------------------------добавить проверку на рейтинг
    async getHomework(refreshToken) {
        const dt = DateTime.now();
        const userData = tokenService.validateRefreshToken(refreshToken);
        const user = await UserModel.findById(userData.id);
        let today = to_day_month(dt.day) + "." + to_day_month(dt.month);
        let tommorow = to_day_month((dt.day + 1)) + "." + to_day_month(dt.month);
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
            Rate /= homework.size;
        for (let i in homework) {
            let user = await UserModel.findOne({surname: homework[i]['surname']});
            if (homework[i]['proved'] === true || Number(user['rating']) === Rate) {
                let homeworkStr = [homework[i]['date'], homework[i]['subject'], homework[i]['text']];
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
            Rate /= homework2.size;
        for (let i in homework2) {
            let user = await UserModel.findOne({surname: homework2[i]['surname']});
            if (homework2[i]['proved'] === true || Number(user['rating']) === Rate) {
                let homeworkStr = [homework2[i]['date'], homework2[i]['subject'], homework2[i]['text']];
                sec.push(homeworkStr);
            }
        }
        sec.sort();


        let total = [...sendHomework, ...sec];
        let total_return = [];
        let date = '';
        let text = '';
        let subject = '';
        for (let i = 0; i < total.length - 1; i++) {
            if (total[i][0] === total[i + 1][0] && total[i][1] === total[i + 1][1]) {
                text += total[i][2] + ". ";
            } else {
                text += total[i][2];
                date = total[i][0];
                subject = total[i][1];
                total_return.push([date, subject, text]);
                text = '';
            }
        }
        if (total.length > 0) {
            text += total[total.length - 1][2];
            date = total[total.length - 1][0];
            subject = total[total.length - 1][1];
            total_return.push([date, subject, text]);
        }


        return total_return;
    }

//write---------------------------------------------------------------
    async writeHomework(refreshToken, homework, subject, date) {

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
            console.log("this person written homework")
            return {user, problems: "person has written"};
        }
        if (homework === "" || homework === undefined) {
            console.log("smth wrong with data");
            return {user, problems: "noneHomework"};
        }
        if (subject === "" || subject === undefined) {
            console.log("smth wrong with data");
            return {user, problems: "noneSubject"};
        }
        if (date === "" || date === undefined) {
            console.log("smth wrong with data");
            return {user, problems: "noneDate"};
        }
        await hometaskModel.create({
            surname: user.surname, text: homework, class: user.class,
            subject: subject, date: date, proved: false
        });
        return {user, problems: "none"};

    }


//date---------------------------------------------------------------

    async getDate(refreshToken, subject) {
        const dt = DateTime.now();

        const week = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

        const userData = tokenService.validateRefreshToken(refreshToken);
        const user = await UserModel.findById(userData.id);

        const dayOfWeek = week[(dt.weekday - 1)];
        let indexOfDays = dt.weekday - 1;
        if (indexOfDays < 0)
            indexOfDays = 0;

        const timetable = await timetableModel.findOne({class: user.class});
        let dateOfMight = [];
        let timetableDict = new Map();
        for (let j in week) {
            //console.log(week[i], " - i in week");
            if (week[j] !== 'sunday') {
                let strToList = timetable[week[j]].replaceAll(")", " ").replaceAll("/", " ").split(" ");
                let totalStr = [];
                for (let i in strToList) {
                    if (!(strToList[i] in ['1', '2', '3', '4', '5', '6', '7', '8'])) { //8 потому что ОКАЗЫВАЕТСЯ метод in идет только до предпоследнего символа
                        totalStr.push(strToList[i]);
                    }
                }
                timetableDict.set(week[j], totalStr);
            } else {
                break;
            }
        }
        //console.log(timetableDict, " - dict of timetable");
        console.log()
        dateOfMight = [];

        for (let [key, value] of timetableDict.entries()) {
            for (let i = 0; i < value.length; i++) {
                if (subject === value[i]) {
                    //console.log(key);
                    dateOfMight.push(key);
                    break;
                }
            }
        }
        //console.log(dateOfMight);
        let totalDate = [];
        let fromFtoS = week.indexOf(dateOfMight[1]) - week.indexOf(dateOfMight[0]);
        let fromStoT = week.indexOf(dateOfMight[2]) - week.indexOf(dateOfMight[1]);
        switch (dateOfMight.length) {
            case 1:
                if (indexOfDays >= week.indexOf(dateOfMight[0])) {
                    let date = 7 - indexOfDays + week.indexOf(dateOfMight[0]);
                    totalDate = add_to(date, date + 7, date + 14);
                    //console.log(totalDate);

                } else {
                    let date = week.indexOf(dateOfMight[0]) - indexOfDays;
                    totalDate = add_to(date, date + 7, date + 14);
                    //console.log(totalDate, add_to(date, date + 7, date + 14));
                }
                return totalDate;
            case 2:
                //let fromFtoS = week.indexOf(dateOfMight[1]) - week.indexOf(dateOfMight[0]);
                let fromStoF = 7 - week.indexOf(dateOfMight[1]) + week.indexOf(dateOfMight[0]);
                let forThird = fromStoF + fromFtoS;
                //console.log(indexOfDays, " - index")
                if (indexOfDays >= week.indexOf(dateOfMight[0])) {
                    if (indexOfDays >= week.indexOf(dateOfMight[1])) {
                        let forEnd = week.indexOf(dateOfMight[0]) + (7 - indexOfDays);
                        totalDate = add_to(forEnd, forEnd + fromFtoS, forEnd + forThird);
                        //console.log(totalDate);
                    } else {
                        let fromNowToS = week.indexOf(dateOfMight[1]) - indexOfDays;
                        let fromNowtoS = 7 - week.indexOf(dateOfMight[1]) + week.indexOf(dateOfMight[0]);
                        totalDate = add_to(fromNowToS, fromNowToS + fromNowtoS, fromNowToS + forThird);
                        //console.log(totalDate);
                    }
                } else {
                    let date = week.indexOf(dateOfMight[0]) - indexOfDays;
                    totalDate = add_to(date, date + fromFtoS, date + forThird);
                    //console.log(totalDate);
                }
                return totalDate;
            case 3:
                let fromTtoF = 7 - week.indexOf(dateOfMight[2]) + week.indexOf(dateOfMight[0]);
                if (indexOfDays >= week.indexOf(dateOfMight[0])) {
                    if (indexOfDays >= week.indexOf(dateOfMight[1])) {
                        if (indexOfDays >= week.indexOf(dateOfMight[2])) { //4 5
                            let date = 7 - indexOfDays + week.indexOf(dateOfMight[0]);
                            totalDate = add_to(date, date + fromFtoS, date + fromStoT + fromFtoS);
                            //console.log(totalDate);
                        } else {
                            let date = week.indexOf(dateOfMight[2]) - indexOfDays;//1
                            totalDate = add_to(date, date + fromTtoF, date + fromFtoS + fromTtoF);
                            //console.log(totalDate);
                        }
                    } else {
                        let date = week.indexOf(dateOfMight[1]) - indexOfDays;
                        totalDate = add_to(date, date + fromStoT, date + fromTtoF + fromStoT);
                        //console.log(totalDate);
                    }
                } else {
                    let date = week.indexOf(dateOfMight[0]) - indexOfDays;
                    totalDate = add_to(date, date + fromFtoS, date + fromStoT + fromFtoS);
                    //console.log(totalDate);
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
                                //console.log(totalDate);
                            } else {
                                let date = week.indexOf(dateOfMight[3]) - indexOfDays;
                                totalDate = add_to(date, date + fromFortoF, date + fromFortoF + fromFtoS);
                                //console.log(totalDate);
                            }
                        } else {
                            let date = week.indexOf(dateOfMight[2]) - indexOfDays;
                            totalDate = add_to(date, date + fromTtoFor, date + fromTtoFor + fromFortoF);
                            //console.log(totalDate);
                        }
                    } else {
                        let date = week.indexOf(dateOfMight[1]) - indexOfDays;
                        totalDate = add_to(date, date + fromFtoS, date + fromStoT + fromFtoS);
                        //console.log(totalDate);
                    }
                } else {
                    let date = week.indexOf(dateOfMight[0]) - indexOfDays;
                    totalDate = add_to(date, date + fromFtoS, date + fromStoT + fromFtoS);
                    //console.log(totalDate);
                }
                return totalDate;
        }
    }

//STUDENT---------------------------------------------------------------------------------------------------------------

    async student(refreshToken) {
        let dt = DateTime.now();
        let date_now = to_day_month(dt.day) + "." + to_day_month(dt.month);

        const userData = tokenService.validateRefreshToken(refreshToken);
        const user = await UserModel.findById(userData.id);
        if (user.ban.length > 0) {
            if (user.ban <= date_now) {
                let update_user = await UserModel.updateOne({
                    surname: user.surname,
                    name: user.name
                }, {$set: {ban: ''}});
            }
        }
        let mb_update_user = await UserModel.findById(userData.id);
        return mb_update_user;
    }

//clear_Homework-------------------------------------------------------------------
    //надо сделать автономной, чтобы работала на сервере вне зависимости от того, кто зашел
    async clearHomework() {
        const week = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const dt = DateTime.now();
        if (dt.weekday === 1) {
            let homeworks = await hometaskModel.find();
            let del_str = to_day_month(dt.day) + "." + to_day_month(dt.month);
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
        return true;
    }

//LEADER----------------------------------------------------------------------------------------------------------------

    async leader(refreshToken) {
        let dt = DateTime.now();
        let date_now = to_day_month(dt.day) + "." + to_day_month(dt.month);

        const userData = tokenService.validateRefreshToken(refreshToken);
        const user = await UserModel.findById(userData.id);
        if (user.ban.length > 0) {
            if (user.ban <= date_now) {
                let update_user = await UserModel.updateOne({
                    surname: user.surname,
                    name: user.name
                }, {$set: {ban: ''}});
            }
        }
        let mb_update_user = await UserModel.findById(userData.id);
        return mb_update_user;
    }

//notification--------------------------------------------------------------------------
    async leaderNotification(refreshToken, notification) {
        //console.log(notification);
        const dt = DateTime.now();
        const user = await UserModel.findById(tokenService.validateRefreshToken(refreshToken).id);
        const userData = await notificationModel.create({
            text: notification,
            class: user.class,
            date: to_day_month(dt.day) + "." + to_day_month(dt.month)
        });

        return true;
    }

//events--------------------------------------------------------------------------------------
    async leaderEvents(refreshToken, location, date, text) {
        let dt = date.split('-')[2] + "." + date.split('-')[1] + "." + date.split('-')[0];
        const user = await UserModel.findById(tokenService.validateRefreshToken(refreshToken).id);
        //console.log(user.surname);
        const userData = await eventModel.create({
            place: location,
            text: text,
            date: dt,
            surname: user.surname
        });
        return true;
    }

//Check Homework------------------------------------------------------------------------------
//Add-----------------------------------------------------

    async leaderHomeworkAdd(data) {
        //console.log(data, '-----data', data['kok']);
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

//Delete---------------------------------------------------

    async leaderHomeworkDel(data) {
        //console.log(data, '-----data', data['kok']);
        let hometask = await hometaskModel.deleteOne({
            surname: data['kok'].toLowerCase(),
            date: data['kok1'],
            subject: data['kok2']
        });
        //console.log(hometask);

        return true;
    }

//Banned---------------------------------------------------

    async leaderHomeworkBan(data) {
        let dt = DateTime.now();
        let date = to_day_month(dt.plus({days: (dt.day + 6)}).day) + "." + to_day_month(dt.plus({days: (dt.day + 6)}).month);

        //console.log(data, '-----data', data['kok'], date);
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

//ADMIN-----------------------------------------------------------------------------------------------------------------

    async admin(refreshToken) {
        const userData = tokenService.validateRefreshToken(refreshToken);
        const user = await UserModel.findById(userData.id);
        return user;
    }

//Events-----------------------------------------------------------
//Delete------------------------------
    async adminEventDel(data) {
        let event = await eventModel.deleteOne({
            place: data['kok'],
            date: data['kok1'],
            text: data['kok2']
        });
        return true;
    }

//Ban-------------------------------
    async adminEventBan(data) {

        let event = await eventModel.deleteOne({
            place: data['kok'],
            date: data['kok1'],
            text: data['kok2']
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

//TIMETABLE-------------------------------------------------------------------------------------------------------------
//registration--------------------------------------------------------------
    async timetable_r(class_, monday, tuesday, wednesday, thursday, friday, saturday) {
        const isExist = await timetableModel.findOne({class: class_});
        //console.log(isExist, " - isExist");
        // if (isExist)
        //     return null;
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

//get_Timetable-------------------------------------------------------------------------
    async getTimetable(parallel, class_) {
        const userData = await timetableModel.find();
        //console.log(userData);
        let data = [];
        for (let i = 0; i < userData.length; i++) {
            if (userData[i].class.split("_")[0] === parallel && userData[i].class !== class_) {
                data.push(userData[i].class);
            }
        }
        let timetable = [];
        timetable.push(await timetableModel.findOne({class: class_}));
        //console.log(await timetableModel.findOne({class: class_}), " we need this class");
        for (let i = 0; i < data.length; i++) {
            timetable.push(await timetableModel.findOne({class: data[i]}));
        }
        //console.log(timetable, " - this is timetable");
        return timetable;
    }

//get_All_Timetable-----------------------------------------------------------------------
    async getAllTimetable() {
        const userData = await timetableModel.find();
        //console.log(userData);
        let data = [];
        for (let i = 0; i < userData.length; i++) {
            data.push(await timetableModel.findOne({class: userData[i].class}));
        }
        return data;
    }

}

module.exports = new UserService();
