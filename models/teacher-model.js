const { Schema, model } = require('mongoose');


const teacherSchema = new Schema({
    name: { type: String, unique: false, required: true },
    surname: { type: String, unique: false, required: true },
    lastname: { type: String, unique: false, required: true },
    subjects: { type: [String], unique: false, required: true },
    classroom: { type: String, unique: false, required: true },
    students: { type: Object, default: {} }  // Объект для хранения информации о студентах
});

module.exports = model('teacher', teacherSchema);
