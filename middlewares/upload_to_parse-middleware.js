const multer = require("multer");
const path = require("path");
const fs = require("fs");
const apiError = require("../dtos/api-error");


function generateUniqueFilename(file) {
    let name = file.originalname.split(".")[0].replaceAll(";", "_").replaceAll(" ", "_").replaceAll("/", "").replaceAll("'", "").replaceAll('"', "");
    let newName = '';
    if (name.length > 100) {
        for (let i = 0; i < 20; i++) {
            newName += name[i];
        }
        newName += path.extname(file.originalname);
    } else {
        newName = file.originalname;
    }
    return newName;
}


function uploadToParseMiddleware() {
    return multer({
        storage: multer.diskStorage({
            encoding: 'utf8',
            destination: function (req, file, cb) {
                cb(null, './files_to_parse');
            },
            filename: function (req, file, cb) {
                file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
                let filePath = './files_to_parse' + file.originalname;
                fs.access(filePath, fs.constants.F_OK, (err) => {
                    if (err) {
                        return cb(null, generateUniqueFilename(file));
                    }

                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error('Ошибка при удалении файла:', err);
                            return cb(err, null);
                        }
                        return cb(null, generateUniqueFilename(file));
                    })
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
    });
}


module.exports = uploadToParseMiddleware;
