//подключения

require('dotenv').config()
const express = require("express");
const path = require("path");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const router = require('./router/index_router');
const bodyParser = require("body-parser");

//----------------------------------------------------------------------------------------------------------------------
//основные константы

const app = express();
const jsonParser = express.json();

const createPath = (page) => path.resolve(__dirname, 'views', `${page}.ejs`);

const urlencodedParser = express.urlencoded({extended: false});
const port = process.env.PORT || 3000;
const url = 'mongodb://127.0.0.1:27017/test';

//установка движков и прочее--------------------------------------------------------------------------------------------

app.use(cookieParser());
app.use(cors());
app.use(jsonParser);
app.use(bodyParser.json());
app.use('/', router);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(`${__dirname}/views`));


//----------------------------------------------------------------------------------------------------------------------
//database connection
async function main() {
    try {
        await mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
        app.listen(port, () => console.log("server work"));
    } catch (e) {
        console.log(e);
    }
};

//end work--------------------------------------------------------------------------------------------------------------
main(); // is work

process.on("SIGINT", async () => {

    await mongoose.disconnect();
    console.log("Приложение завершило работу");
    process.exit();
});



