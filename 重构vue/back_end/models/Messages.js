let mongoose = require('mongoose');
let messageSchema = require('../schemas/messages');

module.exports = mongoose.model('Message', messageSchema);