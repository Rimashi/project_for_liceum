const {Schema, model} = require('mongoose');

const HometaskSchema = new Schema({
    surname: {type: String, unique: true, required: true},
    text: {type: String, unique: false, required: true},
    class: {type: String, unique: false, required: true},
    subject: {type: String, unique: false, required: true},
    date: {type: String, unique: false, required: true}
});

module.exports = model('Hometask', HometaskSchema);