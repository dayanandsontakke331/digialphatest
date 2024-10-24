const mongoose = require('mongoose');

const permissionsSchema = new mongoose.Schema({
    permissions: { type: [mongoose.Schema.Types.Mixed], default: [] }
}, { timestamps: true });

const Permissions = mongoose.model('permissions', permissionsSchema);

module.exports = Permissions;   