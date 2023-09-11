const {Schema, model} = require('mongoose');

const TimetableSchema = new Schema({
    class: {type: String, unique: false, required: true},
    monday: {type: String, unique: false, required: true},
    tuesday: {type: String, unique: false, required: true},
    wednesday: {type: String, unique: false, required: true},
    thursday: {type: String, unique: false, required: true},
    friday: {type: String, unique: false, required: true},
    saturday: {type: String, unique: false, required: true}//скорее всего предметы разделять либо / либо _ подумать
});

module.exports = model('Timetable', TimetableSchema);