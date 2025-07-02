let mongoose = require('mongoose');
let groupSchema = require('../schemas/group');

module.exports = mongoose.model('Group', groupSchema);