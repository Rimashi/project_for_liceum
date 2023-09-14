const Router = require('express').Router;
const userController = require('../controllers/user-controller');
const router = new Router();
const urlencodedParser = require('express').urlencoded({extended: false});
const {body} = require('express-validator');
const authMiddleware = require('../middlewares/auth-middleware');
const redirectMid = require('../middlewares/redirect-middleware');
//----------------------------------------------------------------------------------------------------------------------

router.get('/registration', urlencodedParser, userController.registration);

//index-----------------------------------------------------------------------------------------------------------------

router.get('/index', redirectMid, userController.indexPage);

router.post('/index', urlencodedParser,
    userController.login);

//info------------------------------------------------------------------------------------------------------------------


router.get('/info', userController.infoPage);

router.post('/info',
    urlencodedParser,
    userController.login);

//timetable-------------------------------------------------------------------------------------------------------------

router.get('/schedule', userController.timetable);

router.post('/schedule', urlencodedParser, userController.login);

router.get('/schedule/get', userController.get_timetable);

router.get('/schedule/reg', userController.timetable_reg);


//map-------------------------------------------------------------------------------------------------------------------

router.get('/map', userController.map);

//subjects--------------------------------------------------------------------------------------------------------------

router.get('/subject',
    authMiddleware,
    userController.subjects);

//mains-----------------------------------------------------------------------------------------------------------------

//student-----------------------------------------

router.get('/student', authMiddleware, userController.studentPage);

router.post('/student', urlencodedParser, authMiddleware, userController.studentPagePost);

router.get('/student/modal', urlencodedParser, authMiddleware, userController.studentModal);

router.get('/student/modal/date', urlencodedParser, authMiddleware, userController.studentModalDate);

//leader------------------------------------------

router.get('/leader', authMiddleware, userController.leaderPage);

router.post('/leader', urlencodedParser, authMiddleware, userController.leaderPagePost);

//router.post('/leader', urlencodedParser, authMiddleware, userController.leaderEvents);

//admin-------------------------------------------

router.get('/admin', authMiddleware, userController.adminPage);

//tokens----------------------------------------------------------------------------------------------------------------

router.get('/refresh', userController.refresh);

//logout----------------------------------------------------------------------------------------------------------------

router.get('/logout', userController.logout);

router.get('/clear', authMiddleware, userController.clearDB);

module.exports = router;
