//подключения

require('dotenv').config()
const express = require("express");
const path = require("path");
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const router = require('./router/index_router');
const bodyParser = require("body-parser");
const errorMid = require('./middlewares/error-middleware');
const userModel = require('./models/user-model');
const bcrypt = require("bcrypt");
//----------------------------------------------------------------------------------------------------------------------
//основные константы

const app = express();
const jsonParser = express.json();

const createPath = (page) => path.resolve(__dirname, 'views', `${page}.ejs`);

const port = process.env.PORT || 3000;
const url = 'mongodb://127.0.0.1:27017/liceum-app';

//установка движков и прочее--------------------------------------------------------------------------------------------

app.use(cookieParser());
app.use(cors());
app.use(jsonParser);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use('/', router);
app.engine('ejs', require('ejs-locals'));
app.set('views', __dirname + '/partials');
app.set("view engine", "ejs");
//app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, 'views')));
//app.use(express.static(`${__dirname}/views`));

app.use(errorMid);
app.use(function (req, res) {
    return res.status(404).render(createPath('error'), {
        status: 404,
        message: "Запрашиваемый ресурс не найден"
    });
});

//----------------------------------------------------------------------------------------------------------------------
//database connection
async function main() {
    try {
        await mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
        const is_admin_here = await userModel.findOne({login: "admin"});
        const pass = process.env.ADMIN_PASS;
        const hashpassword = await bcrypt.hash(pass.toString(), 5);
        if (!is_admin_here) {
            await userModel.create({
                name: "admin",
                surname: "admin",
                login: "admin",
                password: hashpassword,
                class: "all",
                status: "admin",
                rating: 0,
                ban: "",
                isChangePass: true
            })
            console.log('Пользователь admin был создан');
        } else {
            console.log('Пользователь admin уже существует');
        }

        app.listen(port, () => console.log("server work"));
    } catch (e) {
        console.log(e);
    }
}

//end work--------------------------------------------------------------------------------------------------------------
main(); // is work

process.on("SIGINT", async () => {

    await mongoose.disconnect();
    console.log("Приложение завершило работу");
    process.exit();
});



