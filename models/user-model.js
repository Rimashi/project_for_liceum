const {Schema, model} = require('mongoose');

const UserSchema = new Schema({
    name: {type: String, unique: false, required: true},
    surname: {type: String, unique: false, required: true},
    login: {type: String, unique: true, required: false},
    password: {type: String, unique: false, required: true},
    class: {type: String, unique: false, required: true},
    status: {type: String, unique: false, required: true},
    teachers_id: {type: String, unique: false, required: false},
    rating: {type: Number, unique: false, required: true},
    ban: {type: String, unique: false, required: false},
    isChangePass: {type: Boolean, unique: false, required: false}
});

module.exports = model('User', UserSchema);
