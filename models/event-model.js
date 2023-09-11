const {Schema, model} = require('mongoose');

const EventSchema = new Schema({
    place: {type: String, unique: false, required: true},
    text: {type: String, unique: false, required: true},
    date: {type: String, unique: false, required: true}
});

module.exports = model('Event', EventSchema);