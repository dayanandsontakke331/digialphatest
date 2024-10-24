const mongoose = require('mongoose');
const UserModel = require('../models/User');
const RoleModel = require('../models/Roles');
const Permissions = require('../models/Permissions');

async function migration() {
    console.log("Start Time:", Date.now());
    console.log("MIGRATION STARTED!");
    const dbUrl = "mongodb://127.0.0.1:27017/digialpha";

    const db = await mongoose.createConnection(dbUrl, {}).asPromise();
    // console.log('MIGRATION STARTED WITHOUT CLOSING THE PRODUCTION DATABASE CONNECTION!');

    await db.model('User', UserModel.schema).init();
    await db.model('Role', RoleModel.schema).init();
    await db.model('Permissions', Permissions.schema).init();

    await db.close();
    console.log("End Time:", Date.now());
    console.log("DB CLOSED. MIGRATION COMPLETED!");
}

migration();
