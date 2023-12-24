const {Schema, model} = require('mongoose');

const teacherSchema = new Schema({
    name: {type: String, unique: false, required: true},
    surname: {type: String, unique: false, required: true},
    lastname: {type: String, unique: false, required: true},
    subject: {type: String, unique: false, required: true},
    classroom: {type: String, unique: false, required: true},
    teacher_id: {type: String, unique: true, required: true},
});

module.exports = model('teacher', teacherSchema);
