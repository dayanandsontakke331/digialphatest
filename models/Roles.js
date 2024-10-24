const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    permissions: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'permissions' }
    ]
}, {
    timestamps: true
});


const RoleModel = mongoose.model('roles', RoleSchema);
module.exports = RoleModel;