const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, unique: true },
    phone: { type: String, unique: true },
    enabled: { type: Boolean, default: true },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'roles' },
    password: { type: String, required: true }
}, {
    timestamps: true
});

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;