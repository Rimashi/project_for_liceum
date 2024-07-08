const {Schema, model} = require('mongoose');

const NotificationSchema = new Schema({
    text: {type: String, unique: false, required: true},
    class: {type: String, unique: false, required: true},
    date: {type: String, unique: false, required: true}
});

module.exports = model('Notification', NotificationSchema);
