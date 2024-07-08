const multer = require("multer");
const path = require("path");
const fs = require("fs");
const apiError = require("../dtos/api-error");

let alphabet = {
    "а": "a",
    "б": "b",
    "в": "v",
    "г": "g",
    "д": "d",
    "е": "e",
    "ж": "zh",
    "з": "z",
    "и": "i",
    "й": "y",
    "к": "k",
    "л": "l",
    "м": "m",
    "н": "n",
    "о": "o",
    "п": "p",
    "р": "r",
    "с": "s",
    "т": "t",
    "у": "u",
    "ф": "f",
    "х": "h",
    "ц": "z",
    "ч": "ch",
    "ш": "sh",
    "щ": "sh",
    "ъ": "",
    "ы": "yi",
    "ь": "",
    "э": "ye",
    "ю": "u",
    "я": "ya"
}

function userFilesUploader() {
    return multer({
        storage: multer.diskStorage({
            encoding: 'utf8',
            destination: function (req, file, cb) {
                cb(null, './files_from_users');
            },
            filename: function (req, file, cb) {
                file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
                let name = file.originalname.split(".")[0].replaceAll(";", "_").replaceAll("'", "").replaceAll('"', "");
                let newName = "";
                let extname = path.extname(file.originalname);
                for (let i in name) {
                    if (name[i] !== ".") {
                        if (name[i].toLowerCase() === "_" || name[i].toLowerCase() === "-") {
                            newName += "_";
                        } else {
                            if (alphabet.hasOwnProperty(name[i].toLowerCase())) {
                                if (alphabet[name[i].toLowerCase()] !== undefined) {
                                    newName += alphabet[name[i].toLowerCase()];
                                } else {

                                }
                            } else {
                                newName += name[i];
                            }
                        }
                    } else {
                        break
                    }
                }
                newName += extname;
                let filePath = './files_from_users' + newName;
                name = "";
                fs.access(filePath, fs.constants.F_OK, (err) => {
                    if (err) {
                        if (newName.length > 100) {
                            for (let i = 0; i < 20; i++) {
                                name += newName[i];
                            }
                            name += path.extname(newName);
                        } else {
                            name = newName;
                        }
                        cb(null, name);
                    } else {
                        const randomNumber = Math.floor(Math.random() * 1000);
                        const currentDate = new Date();
                        newName = newName.split(".")[0].replaceAll(";", "_").replaceAll("'", "").replaceAll('"', "") + randomNumber + currentDate.toISOString().replace(/:/g, '-');
                        if (newName.length > 100) {
                            for (let i = 0; i < 20; i++) {
                                name += newName[i];
                            }
                            name += path.extname(newName);
                        } else {
                            name = newName;
                        }
                        cb(null, name);
                    }
                })
            }
        }),

        fileFilter: (req, file, cb) => {
            const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.py', '.js', '.php', '.mp4', '.docx', '.doc', '.xls', '.xlsx', '.csv', '.zip', '.rar', '.svg', '.css', '.html', '.htm', '.pptx', '.sql', '.txt', '.mp3', '.mov', '.wav'];
            let extname = path.extname(file.originalname).toLowerCase();
            if (!allowedExtensions.includes(extname)) {
                throw apiError.BadRequest("наш сервер не поддерживает расширение вашего файла :/");
                // return cb(new Error('Invalid file extension'), false);
            }

            const maxSize = 20 * 1024 * 1024; // 20MB
            if (file.size > maxSize) {
                throw apiError.BadRequest("размер вашего файла больше лимита (20 мб)");
                //return cb(new Error('File size exceeds the limit (20MB)'), false);
            }

            cb(null, true);
        }
    })
}

module.exports = userFilesUploader;
