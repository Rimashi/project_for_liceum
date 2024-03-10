const Router = require('express').Router;
const userController = require('../controllers/user-controller');
const router = new Router();
const urlencodedParser = require('express').urlencoded({extended: false});
const authMiddleware = require('../middlewares/auth-middleware');
const redirectMid = require('../middlewares/redirect-middleware');
const multer = require("multer");
const path = require("path");
const apiError = require("../dtos/api-error");
const fs = require('fs');

const storage = multer.diskStorage({
    encoding: 'utf8',
    destination: function (req, file, cb) {
        cb(null, './files_from_users');
    },
    filename: function (req, file, cb) {
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
        let name = "";
        let filePath = './files_from_users' + file.originalname;
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                // Файл не существует, продолжить обработку
                name = file.originalname.split(".")[0].replaceAll(";", "_");
                let newName = '';
                if (name.length > 100) {
                    for (let i = 0; i < 20; i++) {
                        newName += name[i];
                    }
                    newName += path.extname(file.originalname);
                } else {
                    newName = file.originalname;
                }
                cb(null, newName);
            }
            const randomNumber = Math.floor(Math.random() * 1000);
            const currentDate = new Date();
            name = file.originalname.split(".")[0].replaceAll(";", "_") + randomNumber + currentDate.toISOString().replace(/:/g, '-');
            let newName = '';
            if (name.length > 100) {
                for (let i = 0; i < 20; i++) {
                    newName += name[i];
                }
                newName += path.extname(file.originalname);
            } else {
                newName = file.originalname;
            }
            cb(null, newName);
        })
    }
})
const fileFilter = (req, file, cb) => {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.py', '.js', '.php', '.mp4', '.docx', '.doc', '.xls', '.xlsx', '.csv', '.zip', '.rar', '.svg', '.css', '.html', '.htm', '.pptx', '.sql', '.txt', '.mp3', '.mov', '.wav'];
    let extname = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(extname)) {
        throw apiError.BadRequest("наш сервер не поддерживает расширение вашего файла :/");//не работает должным образом
        // return cb(new Error('Invalid file extension'), false);
    }

    // Проверка размера файла (20MB максимум)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
        throw apiError.BadRequest("размер вашего файла больше лимита (20 мб)");
        //return cb(new Error('File size exceeds the limit (20MB)'), false);
    }

    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

const storageConf = multer.diskStorage({
    encoding: 'utf8',
    destination: function (req, file, cb) {
        cb(null, './files_to_parse');
    },
    filename: function (req, file, cb) {
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
        let filePath = './files_to_parse' + file.originalname;
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                // Файл не существует, продолжить обработку
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
})

function generateUniqueFilename(file) {
    let name = file.originalname.split(".")[0].replaceAll(";", "_").replaceAll(" ", "_").replaceAll("/", "");
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

const upload_parse = multer({
    storage: storageConf,
    fileFilter: fileFilter
})
//===================================================ROUTS==============================================================

//===============================================REGISTRATION===========================================================
router.post('/registration', urlencodedParser, userController.registration);

//================================================INDEX PAGE============================================================

//--------------------------------------------------LOADING-------------------------------------------------------------
router.get('/', redirectMid, userController.indexPage);

router.post('/login', urlencodedParser, userController.login);

//===============================================INFO PAGE==============================================================

//--------------------------------------------------LOADING-------------------------------------------------------------
router.get('/info', userController.infoPage);

//================================================RATING PAGE===========================================================

//--------------------------------------------------LOADING-------------------------------------------------------------
router.get('/rating', authMiddleware, userController.getRating);

//---------------------------------------------GET USER RATING----------------------------------------------------------
router.post('/rating/change', urlencodedParser, authMiddleware, userController.getRating);

//---------------------------------------------GET CLASS RATING---------------------------------------------------------
router.post('/rating/change/class', urlencodedParser, authMiddleware, userController.getClassesRating);

//==============================================TIMETABLE PAGE==========================================================

//--------------------------------------------------LOADING-------------------------------------------------------------
router.get('/schedule', userController.timetable);

router.post('/schedule', urlencodedParser, userController.login);//------------------------------------------------

//------------------------------------------GET TIMETABLE FOR CLASS/ALL-------------------------------------------------
router.get('/schedule/get', userController.get_timetable);

//-------------------------------------------REGISTRATE NEW TIMETABLE---------------------------------------------------
router.get('/schedule/reg', userController.timetable_reg);

//=====================================================MAP==============================================================

//--------------------------------------------------LOADING-------------------------------------------------------------
router.get('/map', userController.map);

//=====================================================MAP==============================================================

//--------------------------------------------------LOADING-------------------------------------------------------------
router.get('/help', userController.helpPage);

//=================================================SUBJECT PAGE=========================================================

//--------------------------------------------------LOADING-------------------------------------------------------------
router.get('/subject', authMiddleware, userController.subjects);

router.get('/subject/get', authMiddleware, userController.getAllForSubjectPage);

//===================================================USERS==============================================================

//===============================================STUDENT PAGE===========================================================

//--------------------------------------------------LOADING-------------------------------------------------------------
router.get('/student', authMiddleware, userController.studentPage);

//----------------------------------------------HOMEWORK MODAL----------------------------------------------------------
router.get('/homework/subject', urlencodedParser, authMiddleware, userController.studentModal);

//--------------------------------------------GET DATE BY SUBJECT-------------------------------------------------------
router.get('/homework/date', urlencodedParser, authMiddleware, userController.studentModalDate);

//------------------------------------------------SEND HOMETASK---------------------------------------------------------
router.post('/homework/send', urlencodedParser, upload.array('files', 3), authMiddleware, userController.HometaskSend);

//===============================================LEADER PAGE============================================================

//--------------------------------------------------LOADING-------------------------------------------------------------
router.get('/leader', authMiddleware, userController.leaderPage);

//------------------------------------CHANGE LOGIN AND PASSWORD FOR ALL(without admin)----------------------------------
router.post('/login/change', urlencodedParser, authMiddleware, userController.changeLogPass);

//=================================================EVENTS===============================================================

//-----------------------------------------------EVENT MODAL------------------------------------------------------------
router.post('/event', urlencodedParser, authMiddleware, userController.event);

//===============================================NOTIFICATION===========================================================

//-----------------------------------------------NOTIFICATION-----------------------------------------------------------
router.post('/notification', urlencodedParser, authMiddleware, userController.leaderNotify);

//=========================================HOMETASK CHECK MODAL=========================================================

//------------------------------------GET NOT CHECKED HOMETASKS FOR CLASS-----------------------------------------------
router.get('/checkmodal', urlencodedParser, authMiddleware, userController.leaderCheck);

//-------------------------------------------ADD HOMETASK(check)--------------------------------------------------------
router.post('/checkmodal/add', urlencodedParser, authMiddleware, userController.leaderModalAdd);

//---------------------------------------------DELETE HOMETASK----------------------------------------------------------
router.post('/checkmodal/del', urlencodedParser, authMiddleware, userController.leaderModalDel);

//-----------------------------------DELETE HOMETASK AND BAN USER FOR A WEEK--------------------------------------------
router.post('/checkmodal/ban', urlencodedParser, authMiddleware, userController.leaderModalBan);

//================================================ADMIN PAGE============================================================

//--------------------------------------------------LOADING-------------------------------------------------------------
router.get('/admin', authMiddleware, userController.adminPage);

router.get('/admin/help', authMiddleware, userController.adminHelpPage);

//================================================USERS PART============================================================

//------------------------------------------------FIND USER-------------------------------------------------------------
router.post('/admin/users/find', urlencodedParser, authMiddleware, userController.adminPageUsersFind);

//-----------------------------------------GET LIST OF CLASSES----------------------------------------------------------
router.get('/admin/users/class', urlencodedParser, authMiddleware, userController.adminUsersClass);

router.get('/admin/users/get/file', urlencodedParser, authMiddleware, userController.adminUsersFileGet);

router.post('/admin/users/class/change', urlencodedParser, authMiddleware, userController.adminUsersClassChange);

//----------------------------------------GET LIST OF USERS BY CLASS----------------------------------------------------
router.post('/admin/users/list', urlencodedParser, authMiddleware, userController.adminUsersList);

//----------------------------------------------RESET PASSWORD----------------------------------------------------------
router.post('/admin/user/password', urlencodedParser, authMiddleware, userController.adminUserPassword);

//-----------------------------------------------DELETE USER------------------------------------------------------------
router.post('/admin/user/delete', urlencodedParser, authMiddleware, userController.adminUserDelete);

router.post('/admin/users/load', urlencodedParser, authMiddleware, upload_parse.single('file'), userController.adminAddFileOfStudents);

//-------------------------------------------CHANGE USER'S STATUS-------------------------------------------------------
router.post('/admin/user/status', urlencodedParser, authMiddleware, userController.adminUserStatus);

//---------------------------------------------GENERATE PASSWORD--------------------------------------------------------
router.get('/admin/addmodal/getpass', urlencodedParser, authMiddleware, userController.adminGeneratePass);

//==============================================ADMIN EVENTS============================================================

//-----------------------------------------------GET ALL EVENTS---------------------------------------------------------
router.get('/admin/events/get', urlencodedParser, authMiddleware, userController.adminEventsGet);

//------------------------------------------------DELETE EVENT----------------------------------------------------------
router.post('/admin/events/del', urlencodedParser, authMiddleware, userController.adminEventsDel);

//--------------------------------------------------ADD EVENT-----------------------------------------------------------
router.post('/admin/events/add', urlencodedParser, authMiddleware, userController.adminEventAdd);

//==========================================ADMIN NOTIFICATIONS=========================================================

//--------------------------------------------GET NOTIFICATIONS---------------------------------------------------------
router.post('/admin/notice/get', urlencodedParser, authMiddleware, userController.adminNoticeGet);

//-------------------------------------------DELETE NOTIFICATION--------------------------------------------------------
router.post('/admin/notice/del', urlencodedParser, authMiddleware, userController.adminNoticeDel);

//----------------------------------------------ADD NOTIFICATION--------------------------------------------------------
router.post('/admin/notice/add', urlencodedParser, authMiddleware, userController.adminNoticeAdd);

//==============================================ADMIN TEACHER===========================================================

//---------------------------------------------GET ALL TEACHERS---------------------------------------------------------
router.get('/admin/teacher/get', urlencodedParser, authMiddleware, userController.adminGetTeachers);

//------------------------------------GET ALL STUDENTS FOR TEACHER------------------------------------------------------

//---------------------------------------GET SUBJECTS FOR TEACHER-------------------------------------------------------
router.post('/admin/teacher/subject/get', urlencodedParser, authMiddleware, userController.adminGetTeachersSubjects);

router.post('/admin/teacher/othersubject/get', urlencodedParser, authMiddleware, userController.adminGetOtherSubjects);

router.post('/admin/teacher/subject/add', urlencodedParser, authMiddleware, userController.adminAddSubjectTeacher);

router.post('/admin/teacher/subject/del', urlencodedParser, authMiddleware, userController.adminDelSubjectTeacher);

//---------------------------------------------ADD NEW TEACHER----------------------------------------------------------
router.post('/admin/teacher/add', urlencodedParser, authMiddleware, userController.adminAddTeacher);

router.post('/admin/teacher/del', urlencodedParser, authMiddleware, userController.adminDelTeacher);

router.post('/admin/teacher/find', urlencodedParser, authMiddleware, userController.adminFindTeacher);

router.post('/admin/teacher/load', urlencodedParser, authMiddleware, upload_parse.single('file'), userController.adminAddFileOfTeachers);

//-----------------------------------GET STUDENTS BY CLASS TO TEACHER---------------------------------------------------
router.post('/admin/teacher/student/get', urlencodedParser, authMiddleware, userController.adminTeachersStudents);

//----------------------------------------FIND STUDENT FOR TEACHER------------------------------------------------------
router.post('/admin/teacher/student/find', urlencodedParser, authMiddleware, userController.adminTeacherStudentFind);

router.post('/admin/teacher/student/add', urlencodedParser, authMiddleware, userController.adminAddStudentToTeacher);

router.post('/admin/teacher/student/del', urlencodedParser, authMiddleware, userController.adminDelStudentToTeacher);

router.post('/admin/teacher/students/add/class', urlencodedParser, authMiddleware, userController.adminAddClassToTeacher);

//============================================ADMIN TIMETABLE===========================================================

//-----------------------------------------------GET TIMETABLE----------------------------------------------------------
router.post('/admin/timetable/get', urlencodedParser, authMiddleware, userController.adminGetTimetable);

//------------------------------------------------ADD SUBJECT-----------------------------------------------------------
router.post('/admin/timetable/addSubject', urlencodedParser, authMiddleware, userController.adminAddSubject);

//-----------------------------------------------GET SUBJECTS-----------------------------------------------------------
router.get('/admin/timetable/getSubject', urlencodedParser, authMiddleware, userController.adminGetSubject);

//-----------------------------------------------DELETE SUBJECT---------------------------------------------------------
router.post('/admin/timetable/modal/del', urlencodedParser, authMiddleware, userController.adminModalDel);

//----------------------------------------------CHANGE TIMETABLE--------------------------------------------------------
router.post('/admin/timetable/change', urlencodedParser, authMiddleware, userController.adminTimetableChange);

//------------------------------------------------ADD NEW CLASS---------------------------------------------------------
router.post('/admin/timetable/addClass', urlencodedParser, authMiddleware, userController.adminTimetableAddClass);

//-------------------------------------------------DELETE CLASS---------------------------------------------------------
router.post('/admin/timetable/delClass', urlencodedParser, authMiddleware, userController.adminTimetableDelClass);

//===============================================REFRESH ROUT===========================================================
router.get('/refresh', userController.refresh);

//===============================================LOGOUT ROUT============================================================
router.get('/logout', userController.logout);

//================================================ERROR ROUT============================================================
router.get('/error', userController.error);

//==============================================DOWNLOAD ROUT===========================================================
router.get('/download/:filename', authMiddleware, urlencodedParser, userController.downloadFile);
//router.get('/clear', authMiddleware, userController.clearDB);

module.exports = router;
