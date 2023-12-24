const {Schema, model} = require('mongoose');

const subjectSchema = new Schema({
    subject: {type: String, required: true}
});

module.exports = model('subject', subjectSchema);