let mongoose = require('mongoose');
let groupmsgSchema = require('../schemas/groupmsg');

module.exports = mongoose.model('Groupmsg', groupmsgSchema);