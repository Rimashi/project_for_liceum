const Router = require('express').Router;
const userController = require('../controllers/user-controller');
const pageController = require('../controllers/page-controller');
const adminController = require('../controllers/admin-controller');
const router = new Router();
const urlencodedParser = require('express').urlencoded({extended: false});
const authMiddleware = require('../middlewares/auth-middleware');
const redirectMid = require('../middlewares/redirect-middleware');
const userFilesUploader = require('../middlewares/upload_from_users-middleware');
const toParseUploader = require('../middlewares/upload_to_parse-middleware');

const userFile = userFilesUploader();
const parseFile = toParseUploader();

//===================================================ROUTS==============================================================

//===============================================REGISTRATION===========================================================
router.post('/registration', urlencodedParser, userController.registration);

//================================================INDEX PAGE============================================================

//--------------------------------------------------PAGE----------------------------------------------------------------
router.get('/', redirectMid, pageController.indexPage);

//------------------------------------------------SINGING UP------------------------------------------------------------
router.post('/login', urlencodedParser, userController.login);

//===============================================INFO PAGE==============================================================

//--------------------------------------------------PAGE----------------------------------------------------------------
router.get('/info', pageController.infoPage);

//================================================RATING PAGE===========================================================

//--------------------------------------------------PAGE-------------------------------------------------------------
router.get('/rating', authMiddleware, pageController.getRating);

//---------------------------------------------GET USER RATING----------------------------------------------------------
router.post('/rating/change', urlencodedParser, authMiddleware, pageController.getRating);

//---------------------------------------------GET CLASS RATING---------------------------------------------------------
router.post('/rating/change/class', urlencodedParser, authMiddleware, pageController.getClassesRating);

//==============================================TIMETABLE PAGE==========================================================

//--------------------------------------------------PAGE----------------------------------------------------------------
router.get('/schedule', pageController.timetable);

//------------------------------------------GET TIMETABLE FOR CLASS/ALL-------------------------------------------------
router.get('/schedule/get', pageController.get_timetable);

//=====================================================MAP==============================================================

//--------------------------------------------------PAGE----------------------------------------------------------------
router.get('/map', pageController.map);

//=================================================HELP PAGE============================================================

//--------------------------------------------------PAGE----------------------------------------------------------------
router.get('/help', pageController.helpPage);

//=================================================SUBJECT PAGE=========================================================

//--------------------------------------------------PAGE----------------------------------------------------------------
router.get('/subject', authMiddleware, pageController.subjects);

//-------------------------------------------GET DATA FOR SUBJECT PAGE--------------------------------------------------
router.get('/subject/get', authMiddleware, pageController.getAllForSubjectPage);

//===================================================USERS==============================================================

//===============================================STUDENT PAGE===========================================================

//--------------------------------------------------PAGE----------------------------------------------------------------
router.get('/student', authMiddleware, pageController.studentPage);

//----------------------------------------------HOMEWORK MODAL----------------------------------------------------------
router.get('/homework/subject', urlencodedParser, authMiddleware, userController.studentModal);

//--------------------------------------------GET DATE BY SUBJECT-------------------------------------------------------
router.get('/homework/date', urlencodedParser, authMiddleware, userController.studentModalDate);

//------------------------------------------------SEND HOMETASK---------------------------------------------------------
router.post('/homework/send', urlencodedParser, userFile.array('files', 3), authMiddleware, userController.HometaskSend);

//===============================================LEADER PAGE============================================================

//--------------------------------------------------PAGE----------------------------------------------------------------
router.get('/leader', authMiddleware, pageController.leaderPage);

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

//--------------------------------------------------PAGE----------------------------------------------------------------
router.get('/admin', authMiddleware, pageController.adminPage);

//----------------------------------------------ADMIN HELP PAGE---------------------------------------------------------
router.get('/admin/help', authMiddleware, pageController.adminHelpPage);

//================================================USERS PART============================================================

//------------------------------------------------FIND USER-------------------------------------------------------------
router.post('/admin/users/find', urlencodedParser, authMiddleware, adminController.adminPageUsersFind);

//-----------------------------------------GET LIST OF CLASSES----------------------------------------------------------
router.get('/admin/users/class', urlencodedParser, authMiddleware, adminController.adminUsersClass);

//-------------------------------GET FILE WITH USERS SURNAME AND PASSWORD-----------------------------------------------
router.get('/admin/users/get/file', urlencodedParser, authMiddleware, adminController.adminUsersFileGet);

//---------------------------------------------CHANGE CLASS FOR USER----------------------------------------------------
router.post('/admin/users/class/change', urlencodedParser, authMiddleware, adminController.adminUsersClassChange);

//----------------------------------------GET LIST OF USERS BY CLASS----------------------------------------------------
router.post('/admin/users/list', urlencodedParser, authMiddleware, adminController.adminUsersList);

//----------------------------------------------RESET PASSWORD----------------------------------------------------------
router.post('/admin/user/password', urlencodedParser, authMiddleware, adminController.adminUserPassword);

//-----------------------------------------------DELETE USER------------------------------------------------------------
router.post('/admin/user/delete', urlencodedParser, authMiddleware, adminController.adminUserDelete);

//-----------------UPLOAD FILE OF USERS TO LOAD A LOT USERS TO SERVER AND GET FILE WITH THEM----------------------------
router.post('/admin/users/load', urlencodedParser, authMiddleware, parseFile.single('file'), adminController.adminAddFileOfStudents);

//-------------------------------------------CHANGE USER'S STATUS-------------------------------------------------------
router.post('/admin/user/status', urlencodedParser, authMiddleware, adminController.adminUserStatus);

//---------------------------------------------GENERATE PASSWORD--------------------------------------------------------
router.get('/admin/addmodal/getpass', urlencodedParser, authMiddleware, adminController.adminGeneratePass);

//==============================================ADMIN EVENTS============================================================

//-----------------------------------------------GET ALL EVENTS---------------------------------------------------------
router.get('/admin/events/get', urlencodedParser, authMiddleware, adminController.adminEventsGet);

//------------------------------------------------DELETE EVENT----------------------------------------------------------
router.post('/admin/events/del', urlencodedParser, authMiddleware, adminController.adminEventsDel);

//--------------------------------------------------ADD EVENT-----------------------------------------------------------
router.post('/admin/events/add', urlencodedParser, authMiddleware, adminController.adminEventAdd);

//==========================================ADMIN NOTIFICATIONS=========================================================

//--------------------------------------------GET NOTIFICATIONS---------------------------------------------------------
router.post('/admin/notice/get', urlencodedParser, authMiddleware, adminController.adminNoticeGet);

//-------------------------------------------DELETE NOTIFICATION--------------------------------------------------------
router.post('/admin/notice/del', urlencodedParser, authMiddleware, adminController.adminNoticeDel);

//----------------------------------------------ADD NOTIFICATION--------------------------------------------------------
router.post('/admin/notice/add', urlencodedParser, authMiddleware, adminController.adminNoticeAdd);

//==============================================ADMIN TEACHER===========================================================

//---------------------------------------------GET ALL TEACHERS---------------------------------------------------------
router.get('/admin/teacher/get', urlencodedParser, authMiddleware, adminController.adminGetTeachers);

//------------------------------------GET ALL STUDENTS FOR TEACHER------------------------------------------------------

//---------------------------------------GET SUBJECTS FOR TEACHER-------------------------------------------------------
router.post('/admin/teacher/subject/get', urlencodedParser, authMiddleware, adminController.adminGetTeachersSubjects);

//-------------------------GET LIST OF SUBJECT TO ADD SUBJECT TO TEACHER AFTER------------------------------------------
router.post('/admin/teacher/othersubject/get', urlencodedParser, authMiddleware, adminController.adminGetOtherSubjects);

//----------------------------------------ADD NEW SUBJECT TO TEACHER----------------------------------------------------
router.post('/admin/teacher/subject/add', urlencodedParser, authMiddleware, adminController.adminAddSubjectTeacher);

//----------------------------------------DELETE SUBJECT FROM TEACHER---------------------------------------------------
router.post('/admin/teacher/subject/del', urlencodedParser, authMiddleware, adminController.adminDelSubjectTeacher);

//---------------------------------------------ADD NEW TEACHER----------------------------------------------------------
router.post('/admin/teacher/add', urlencodedParser, authMiddleware, adminController.adminAddTeacher);

//---------------------------------------------DELETE TEACHER-----------------------------------------------------------
router.post('/admin/teacher/del', urlencodedParser, authMiddleware, adminController.adminDelTeacher);

//---------------------------------------FIND TEACHER BY SURNAME--------------------------------------------------------
router.post('/admin/teacher/find', urlencodedParser, authMiddleware, adminController.adminFindTeacher);

//---------------------------------------UPLOAD FILE WITH TEACHERS------------------------------------------------------
router.post('/admin/teacher/load', urlencodedParser, authMiddleware, parseFile.single('file'), adminController.adminAddFileOfTeachers);

//-----------------------------------GET STUDENTS BY CLASS TO TEACHER---------------------------------------------------
router.post('/admin/teacher/student/get', urlencodedParser, authMiddleware, adminController.adminTeachersStudents);

//----------------------------------------FIND STUDENT FOR TEACHER------------------------------------------------------
router.post('/admin/teacher/student/find', urlencodedParser, authMiddleware, adminController.adminTeacherStudentFind);

//------------------------------------------ADD STUDENT TO TEACHER------------------------------------------------------
router.post('/admin/teacher/student/add', urlencodedParser, authMiddleware, adminController.adminAddStudentToTeacher);

//--------------------------------------DELETE STUDENT FROM TEACHER-----------------------------------------------------
router.post('/admin/teacher/student/del', urlencodedParser, authMiddleware, adminController.adminDelStudentToTeacher);

//-------------------------------------ADD ALL CLASS OF STUDENTS TO TEACHER---------------------------------------------
router.post('/admin/teacher/students/add/class', urlencodedParser, authMiddleware, adminController.adminAddClassToTeacher);

//============================================ADMIN TIMETABLE===========================================================

//-----------------------------------------------GET TIMETABLE----------------------------------------------------------
router.post('/admin/timetable/get', urlencodedParser, authMiddleware, adminController.adminGetTimetable);

//------------------------------------------------ADD SUBJECT-----------------------------------------------------------
router.post('/admin/timetable/addSubject', urlencodedParser, authMiddleware, adminController.adminAddSubject);

//-----------------------------------------------GET SUBJECTS-----------------------------------------------------------
router.get('/admin/timetable/getSubject', urlencodedParser, authMiddleware, adminController.adminGetSubject);

//-----------------------------------------------DELETE SUBJECT---------------------------------------------------------
router.post('/admin/timetable/modal/del', urlencodedParser, authMiddleware, adminController.adminModalDel);

//----------------------------------------------CHANGE TIMETABLE--------------------------------------------------------
router.post('/admin/timetable/change', urlencodedParser, authMiddleware, adminController.adminTimetableChange);

//------------------------------------------------ADD NEW CLASS---------------------------------------------------------
router.post('/admin/timetable/addClass', urlencodedParser, authMiddleware, adminController.adminTimetableAddClass);

//-------------------------------------------------DELETE CLASS---------------------------------------------------------
router.post('/admin/timetable/delClass', urlencodedParser, authMiddleware, adminController.adminTimetableDelClass);

//-------------------------------------------REGISTRATE NEW TIMETABLE---------------------------------------------------
router.get('/schedule/reg', adminController.timetable_reg);

//===============================================REFRESH ROUT===========================================================
router.get('/refresh', pageController.refresh);

//===============================================LOGOUT ROUT============================================================
router.get('/logout', userController.logout);

//================================================ERROR ROUT============================================================
router.get('/error', pageController.error);

//==============================================DOWNLOAD ROUT===========================================================
router.get('/download/:filename', authMiddleware, urlencodedParser, pageController.downloadFile);

module.exports = router;
