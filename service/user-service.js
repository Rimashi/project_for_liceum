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

class UserService {
//reg-------------------------------------------------------------------------------------------------------------------

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
        console.log(userDto);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: UserDto
        }
        //
        // try {
        //     if (login.split(" ").length - 1 === 0) {
        //         const candidate = await UserModel.findOne({login: login});
        //         if (candidate) {
        //             // throw ApiError.BadRequest(`пользователь ${login} уже существует`);
        //             return null;
        //         }
        //     } else {
        //         const name = login.split(' ')[0];
        //         const surname = login.split(' ')[1];
        //         const candidate = await UserModel.findOne({name: name, surname: surname});
        //         if (candidate) {
        //             // throw ApiError.BadRequest(`пользователь ${login} уже существует`);
        //             return null;
        //         }
        //     }
        // } catch (e) {
        //     console.log(e);
        // }
        // const hashpassword = await bcrypt.hash(password, 3);
        //
        // if (login.split(" ").length - 1 === 0) {
        //     const user = await UserModel.create(
        //         {
        //             name: "Градимир",
        //             surname: "Мотылин",
        //             login: "",
        //             password: hashpassword,
        //             class: "11_В",
        //             status: "leader",
        //             rating: 0,
        //             ban: 0
        //         }
        //     );
        //     const userDto = new UserDto(user);
        //     console.log(userDto);
        //     const tokens = tokenService.generateTokens({...userDto});
        //     await tokenService.saveToken(userDto.id, tokens.refreshToken);
        //
        //     return {
        //         ...tokens,
        //         user: UserDto
        //     }
        // } else {
        //     const name = login.split(' ')[0];
        //     const surname = login.split(' ')[1];
        //     const user = await UserModel.create({
        //         name: name, surname: surname, login: login,
        //         password: hashpassword, class: "11_В",
        //         status: "leader", rating: 0, ban: 0
        //     });
        //     const userDto = new UserDto(user);
        //     const tokens = tokenService.generateTokens({...userDto});
        //     await tokenService.saveToken(userDto.id, tokens.refreshToken);
        //
        //     return {
        //         ...tokens,
        //         user: UserDto
        //     }
        // }

    }

//login-----------------------------------------------------------------------------------------------------------------

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

//logout----------------------------------------------------------------------------------------------------------------

    async logout(refreshToken) {
        return await tokenService.removeToken(refreshToken);
    }

//refresh---------------------------------------------------------------------------------------------------------------

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

//student---------------------------------------------------------------------------------------------------------------

    async getNotification(class_) {
        //console.log(class_);
        const dt = DateTime.now();
        //console.log(dt.day);
        const notification = await notificationModel.find({class: class_, date: dt.day.toString() + "." + dt.month.toString()});
        const data = [];
        //console.log(notification, " - notify");
        for (let i in notification) {
            data.push(notification[i].text);
        }
        if (!notification)
            return "none";
        return data;
    }

    async getHomework(refreshToken) {
        const dt = DateTime.local();
        const userData = tokenService.validateRefreshToken(refreshToken);
        const user = await UserModel.findById(userData.id);
        let today = dt.day.toString() + "." + dt.month.toString();
        console.log(today, " - today" , user.class);
        let tommorow = (dt.day + 1).toString() + "." + dt.month.toString();
        let sendHomework = [];
        let sec = [];

        let homework = await hometaskModel.find({class: user.class, date: today});
        console.log(homework," - homework");
        for (let i in homework) {
            let homeworkStr = [homework[i]['date'], homework[i]['subject'], homework[i]['text']];
            sendHomework.push(homeworkStr);
        }
        sendHomework.sort();
        //console.log(sendHomework, " ----send");
        let homework2 = await hometaskModel.find({class: user.class, date: tommorow});
        for (let i in homework2) {
            let homeworkStr = [homework2[i]['date'], homework2[i]['subject'], homework2[i]['text']];
            sec.push(homeworkStr);
        }
        sec.sort();
        //console.log(sec, " sec -sort");

        //console.log([...sendHomework, ...sec], " - homework from service");
        return [...sendHomework, ...sec];
    }

    async getDate(refreshToken, subject) {
        const dt = DateTime.now();

        //console.log(subject, " - subject in service");
        const week = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

        const userData = tokenService.validateRefreshToken(refreshToken);
        const user = await UserModel.findById(userData.id);

        const dayOfWeek = week[(dt.weekday - 1)];
        let indexOfDays = dt.weekday - 1;
        if (indexOfDays < 0)
            indexOfDays = 0;

        //console.log(dayOfWeek, ' - day of week');

        let month = dt.month;
        let day = dt.day;
        //console.log(month, " - month", day, indexOfDays);

        const timetable = await timetableModel.findOne({class: user.class});
        let dateOfMight = [];
        let timetableDict = new Map();
        for (let i in week) {
            //console.log(week[i], " - i in week");
            if (week[i] !== 'sunday') {
                let strToList = timetable[week[i]].replaceAll(")", " ").replaceAll("/", " ").split(" ");
                let totalStr = [];
                for (let i in strToList) {
                    if (!(strToList[i] in ['1', '2', '3', '4', '5', '6', '7', '8'])) { //8 потому что ОКАЗЫВАЕТСЯ метод in идет только до предпоследнего символа
                        totalStr.push(strToList[i]);
                    }
                }
                timetableDict.set(week[i], totalStr);
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
        console.log(dateOfMight);
        let totalDate = [];
        let fromFtoS = week.indexOf(dateOfMight[1]) - week.indexOf(dateOfMight[0]);
        let fromStoT = week.indexOf(dateOfMight[2]) - week.indexOf(dateOfMight[1]);
        switch (dateOfMight.length) {
            case 1:
                if (indexOfDays >= week.indexOf(dateOfMight[0])) {
                    let date = 7 - indexOfDays + week.indexOf(dateOfMight[0]);
                    //console.log(`indexOfDays - ${indexOfDays}, weekIndex - ${week.indexOf(dateOfMight[0])}`);
                    //console.log(date, "- date ssssss", dt.month);
                    totalDate.push(
                        dt.plus({days: date}).day.toString() + "." + dt.plus({days: date}).month.toString(),
                        dt.plus({days: (date + 7)}).day.toString() + "." + dt.plus({days: (date + 7)}).month.toString(),
                        dt.plus({days: (date + 14)}).day.toString() + "." + dt.plus({days: (date + 14)}).month.toString()
                    );
                    console.log(totalDate);

                } else {
                    let date = week.indexOf(dateOfMight[0]) - indexOfDays;
                    //console.log(date, "- date ssssss", dt.month);
                    totalDate.push(
                        dt.plus({days: date}).day.toString() + "." + dt.plus({days: date}).month.toString(),
                        dt.plus({days: (date + 7)}).day.toString() + "." + dt.plus({days: (date + 7)}).month.toString(),
                        dt.plus({days: (date + 14)}).day.toString() + "." + dt.plus({days: (date + 14)}).month.toString()
                    );
                    console.log(totalDate);
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
                        totalDate.push(
                            dt.plus({days: forEnd}).day.toString() + "." + dt.plus({days: forEnd}).month.toString(),
                            dt.plus({days: (forEnd + fromFtoS)}).day.toString() + "." + dt.plus({days: (forEnd + fromFtoS)}).month.toString(),
                            dt.plus({days: (forEnd + forThird)}).day.toString() + "." + dt.plus({days: (forEnd + forThird)}).month.toString()
                        );
                        console.log(totalDate);
                    } else {
                        let fromNowToS = week.indexOf(dateOfMight[1]) - indexOfDays;
                        let fromNowtoS = 7 - week.indexOf(dateOfMight[1]) + week.indexOf(dateOfMight[0]);
                        totalDate.push(
                            dt.plus({days: fromNowToS}).day.toString() + "." + dt.plus({days: fromNowToS}).month.toString(),
                            dt.plus({days: (fromNowToS + fromNowtoS)}).day.toString() + "." + dt.plus({days: (fromNowToS + fromNowtoS)}).month.toString(),
                            dt.plus({days: (fromNowToS + forThird)}).day.toString() + "." + dt.plus({days: (fromNowToS + forThird)}).month.toString()
                        );
                        console.log(totalDate);
                    }
                } else {
                    let date = week.indexOf(dateOfMight[0]) - indexOfDays;
                    totalDate.push(
                        dt.plus({days: date}).day.toString() + "." + dt.plus({days: date}).month.toString(),
                        dt.plus({days: (date + fromFtoS)}).day.toString() + "." + dt.plus({days: (date + fromFtoS)}).month.toString(),
                        dt.plus({days: (date + forThird)}).day.toString() + "." + dt.plus({days: (date + forThird)}).month.toString()
                    );
                    console.log(totalDate);
                }
                return totalDate;
            case 3:
                //fromFtoS = week.indexOf(dateOfMight[1]) - week.indexOf(dateOfMight[0]);
                //let fromStoT = week.indexOf(dateOfMight[2]) - week.indexOf(dateOfMight[1]);
                let fromTtoF = 7 - week.indexOf(dateOfMight[2]) + week.indexOf(dateOfMight[0]);
                if (indexOfDays >= week.indexOf(dateOfMight[0])) {
                    if (indexOfDays >= week.indexOf(dateOfMight[1])) {
                        if (indexOfDays >= week.indexOf(dateOfMight[2])) { //4 5
                            let date = 7 - indexOfDays + week.indexOf(dateOfMight[0]);
                            totalDate.push(
                                dt.plus({days: date}).day.toString() + "." + dt.plus({days: date}).month.toString(),
                                dt.plus({days: (date + fromFtoS)}).day.toString() + "." + dt.plus({days: (date + fromFtoS)}).month.toString(),
                                dt.plus({days: (date + fromStoT + fromFtoS)}).day.toString() + "." + dt.plus({days: (date + fromStoT + fromFtoS)}).month.toString()
                            );
                            console.log(totalDate);
                        } else {
                            let date = week.indexOf(dateOfMight[2]) - indexOfDays;//1
                            totalDate.push(
                                dt.plus({days: date}).day.toString() + "." + dt.plus({days: date}).month.toString(),
                                dt.plus({days: (date + fromTtoF)}).day.toString() + "." + dt.plus({days: (date + fromTtoF)}).month.toString(),
                                dt.plus({days: (date + fromFtoS + fromTtoF)}).day.toString() + "." + dt.plus({days: (date + fromFtoS + fromTtoF)}).month.toString()
                            );
                            console.log(totalDate);
                        }
                    } else {
                        let date = week.indexOf(dateOfMight[1]) - indexOfDays;
                        totalDate.push(
                            dt.plus({days: date}).day.toString() + "." + dt.plus({days: date}).month.toString(),
                            dt.plus({days: (date + fromStoT)}).day.toString() + "." + dt.plus({days: (date + fromStoT)}).month.toString(),
                            dt.plus({days: (date + fromTtoF + fromStoT)}).day.toString() + "." + dt.plus({days: (date + fromTtoF + fromStoT)}).month.toString()
                        );
                        console.log(totalDate);
                    }
                } else {
                    let date = week.indexOf(dateOfMight[0]) - indexOfDays;
                    totalDate.push(
                        dt.plus({days: date}).day.toString() + "." + dt.plus({days: date}).month.toString(),
                        dt.plus({days: (date + fromFtoS)}).day.toString() + "." + dt.plus({days: (date + fromFtoS)}).month.toString(),
                        dt.plus({days: (date + fromStoT + fromFtoS)}).day.toString() + "." + dt.plus({days: (date + fromStoT + fromFtoS)}).month.toString()
                    );
                    console.log(totalDate);
                }
                return totalDate;
            case 4:
                //fromFtoS = week.indexOf(dateOfMight[1]) - week.indexOf(dateOfMight[0]);
                //fromStoT = week.indexOf(dateOfMight[2]) - week.indexOf(dateOfMight[1]);
                let fromTtoFor = week.indexOf(dateOfMight[3]) - week.indexOf(dateOfMight[2]);
                let fromFortoF = 7 - week.indexOf(dateOfMight[3]) + week.indexOf(dateOfMight[0]);
                if (indexOfDays >= week.indexOf(dateOfMight[0])) {
                    if (indexOfDays >= week.indexOf(dateOfMight[1])) {
                        if (indexOfDays >= week.indexOf(dateOfMight[2])) {
                            if (indexOfDays >= week.indexOf(dateOfMight[3])) {
                                let date = 7 - indexOfDays + week.indexOf(dateOfMight[0]);
                                totalDate.push(
                                    dt.plus({days: date}).day.toString() + "." + dt.plus({days: date}).month.toString(),
                                    dt.plus({days: (date + fromFtoS)}).day.toString() + "." + dt.plus({days: (date + fromFtoS)}).month.toString(),
                                    dt.plus({days: (date + fromStoT + fromFtoS)}).day.toString() + "." + dt.plus({days: (date + fromStoT + fromFtoS)}).month.toString()
                                );
                                console.log(totalDate);
                            } else {
                                let date = week.indexOf(dateOfMight[3]) - indexOfDays;
                                totalDate.push(
                                    dt.plus({days: date}).day.toString() + "." + dt.plus({days: date}).month.toString(),
                                    dt.plus({days: (date + fromFortoF)}).day.toString() + "." + dt.plus({days: (date + fromFortoF)}).month.toString(),
                                    dt.plus({days: (date + fromFortoF + fromFtoS)}).day.toString() + "." + dt.plus({days: (date + fromFortoF + fromFtoS)}).month.toString()
                                );
                                console.log(totalDate);
                            }
                        } else {
                            let date = week.indexOf(dateOfMight[2]) - indexOfDays;
                            totalDate.push(
                                dt.plus({days: date}).day.toString() + "." + dt.plus({days: date}).month.toString(),
                                dt.plus({days: (date + fromTtoFor)}).day.toString() + "." + dt.plus({days: (date + fromTtoFor)}).month.toString(),
                                dt.plus({days: (date + fromTtoFor + fromFortoF)}).day.toString() + "." + dt.plus({days: (date + fromTtoFor + fromFortoF)}).month.toString()
                            );
                            console.log(totalDate);
                        }
                    } else {
                        let date = week.indexOf(dateOfMight[1]) - indexOfDays;
                        totalDate.push(
                            dt.plus({days: date}).day.toString() + "." + dt.plus({days: date}).month.toString(),
                            dt.plus({days: (date + fromFtoS)}).day.toString() + "." + dt.plus({days: (date + fromFtoS)}).month.toString(),
                            dt.plus({days: (date + fromStoT + fromFtoS)}).day.toString() + "." + dt.plus({days: (date + fromStoT + fromFtoS)}).month.toString()
                        );
                        console.log(totalDate);
                    }
                } else {
                    let date = week.indexOf(dateOfMight[0]) - indexOfDays;
                    totalDate.push(
                        dt.plus({days: date}).day.toString() + "." + dt.plus({days: date}).month.toString(),
                        dt.plus({days: (date + fromFtoS)}).day.toString() + "." + dt.plus({days: (date + fromFtoS)}).month.toString(),
                        dt.plus({days: (date + fromStoT + fromFtoS)}).day.toString() + "." + dt.plus({days: (date + fromStoT + fromFtoS)}).month.toString()
                    );
                    console.log(totalDate);
                }
                return totalDate;
        }
    }

    async writeHomework(refreshToken, homework, subject, date) {

        const userData = tokenService.validateRefreshToken(refreshToken);
        const user = await UserModel.findById(userData.id);

        const isWritten = await hometaskModel.findOne({surname: user.surname, subject: subject, date: date});
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
            subject: subject, date: date
        });
        return {user, problems: "none"};

    }

    async student(refreshToken) {
        const userData = await tokenService.validateRefreshToken(refreshToken);
        console.log(userData, "--userData");
        const user = await UserModel.findById(userData.id);
        return user;
    }

    async clearHomework() {
        const dt = DateTime.now();
        let notifications;
        if (dt.hour === 0) {
            notifications = await notificationModel.find();
            for (let i in notifications) {
                await notificationModel.deleteOne({_id: notifications[i]._id});
            }
        }
        const isClear = await hometaskModel.find();
        //console.log(isClear);
        for (let i = 0; i < isClear.length; i++) {
            if (isClear[i]['date'].split(".")[0] < dt.day && isClear[i]['date'].split(".")[0] < dt.month) {
                await hometaskModel.deleteOne({_id: isClear[i]['id']});
            }
        }
        return true;
    }

//leader----------------------------------------------------------------------------------------------------------------

    async leader(refreshToken) {
        const userData = tokenService.validateRefreshToken(refreshToken);
        const user = await UserModel.findById(userData.id);
        //console.log(user);
        return user;
    }

    async leaderNotification(refreshToken, notification) {
        //console.log(notification);
        const dt = DateTime.now();
        const user = await UserModel.findById(tokenService.validateRefreshToken(refreshToken).id);
        //console.log(user, " leader user");
        const userData = await notificationModel.create({
            text: notification,
            class: user.class,
            date: dt.day.toString() + "." + dt.month.toString()
        });
        return true;
    }

//admin-----------------------------------------------------------------------------------------------------------------

    async admin(refreshToken) {
        const userData = tokenService.validateRefreshToken(refreshToken);
        const user = await UserModel.findById(userData.id);
        return user;
    }


//timetable-------------------------------------------------------------------------------------------------------------

    async timetable_r(class_, monday, tuesday, wednesday, thursday, friday, saturday) {
        const isExist = await timetableModel.findOne({class: class_});
        console.log(isExist, " - isExist");
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

module
    .exports = new UserService();
