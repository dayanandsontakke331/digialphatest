const jwt = require('jsonwebtoken')
const UserModel = require('../models/User.js');

async function VerifyAdmin(req, res, next) {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ status: 'failed', message: 'Unauthorized User, No Token' });
    }

    const token = authorization.split(' ')[1];

    try {
        const { id } = jwt.verify(token, "!@#@!#$#@#$%^");
        const user = await UserModel.findById(id).select('-password').populate('role');
        if (user && user.role.name == 'User') {
            return res.status(401).json({ status: 'failed', message: 'Unauthorized User' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ status: 'failed', message: 'Unauthorized User' });
    }
}

module.exports = VerifyAdmin;
