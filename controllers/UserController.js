const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require("../models/User");
const RoleModel = require("../models/Roles");
const Permissions = require("../models/Permissions");
const { role_permissions } = require('../config/customs');

exports.registerUser = async (req, res) => {
    try {
        console.log("role_permissions", role_permissions)
        const { firstName, lastName, email, phone, enabled, password, confirmPassword, role } = req.body;

        let user = await UserModel.findOne({ $or: [{ email }, { phone }] });
        
        if (user) {
            return res.json({ error: "User is already registered with phone or email" });
        }

        if (password !== confirmPassword) {
            return res.json({ error: "Password and confirm password not match" });
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);
        let userRole = await RoleModel.findOne({ name: role });

        if (role === 'Admin' && userRole) {
            return res.json({ error: "You do not have permission to create account" });
        }

        if (!userRole) {
            const permission = await Permissions.create({
                permissions: role === 'Admin' ? role_permissions : []
            });

            userRole = await RoleModel.create({
                name: role || 'User',
                permissions: permission._id
            });
        }

        const createUser = await UserModel.create({
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone,
            enabled: enabled,
            password: hashedPassword,
            role: userRole._id
        });

        return res.json({ data: createUser });

    } catch (error) {
        return res.json({ error: error.message });
    }
}

exports.createRole = async (req, res) => {
    const { name, permissions } = req.body;

    try {
        if (!name) {
            return res.json({ error: "missing data in request" })
        }

        if (!permissions.length) {
            return res.json({ error: "Select permissions" });
        }

        const alreadyRole = await RoleModel.findOne({ name: req.body.name })
        if (alreadyRole) {
            return res.json({ error: "Role with this name is already created" })
        }

        const rolePermission = await Permissions.create({
            permissions: permissions
        })

        await RoleModel.create({
            name: name,
            role: rolePermission._id
        });

        return res.json({ message: "Role created" });
    } catch (error) {
        console.log("permissions", permissions);
        return res.json({ error: error.message })
    }

}

exports.updateAssignRole = async (req, res) => {
    const { id, roleId } = req.body;

    try {
        const adminUser = await UserModel.findById(id);

        if (!adminUser) {
            return res.json({ error: 'User not found' });
        }

        const updateRole = await UserModel.updateOne({ _id: id }, { $set: { role: roleId } });

        if (updateRole.nModified === 0) {
            return res.json({ error: 'Role update failed or no changes made' });
        }

        return res.json({ message: 'Role updated successfully' });
    } catch (error) {
        console.error(error);
        return res.json({ error: 'Server error' });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { phone, email, password } = req.body;
        if (!phone && !email) {
            return res.json({ error: "Invalid user credentials" });
        }

        let user = await UserModel.findOne({
            $or: [
                { email: req.body.email },
                { phone: req.body.phone }
            ]
        });

        if (!user) {
            return res.json({ error: "Invalid user or phone." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ error: "Invalid password" });
        }

        const payload = {
            userId: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        };

        let accessToken = jwt.sign(payload, "!@#@!#$#@#$%^", { expiresIn: '30m' });
        // if we are using the refresh token functionality in the client side.
        let refreshToken = jwt.sign(payload, "!@#@!#$#@#$%^", { expiresIn: '1h' });

        return res.json({ ...payload, accessToken, refreshToken });
    } catch (error) {
        return res.json({ error: error.message });
    }
}

exports.getUser = async (req, res) => {
    const id = req.params.id;
    console.log("id", id)
    if (!id) {
        return res.json({ error: 'Missing data in request' });
    }

    const user = await UserModel.findById(id);

    if (!user) {
        return res.json({ error: "Requested user invalid" });
    }

    return res.json({ data: user })
}

exports.enableDesableUser = async (req, res) => {
    const { id, enabled } = req.body;

    const user = await UserModel.findById(id)

    if (user) {
        await UserModel.updateOne({ _id: id }, { $set: { enabled: enabled } });
        return res.json({ message: `User is ${enabled ? "enabled" : "desabled"}` })
    }

    return res.json({ message: "Invalid request data" })
}

exports.updateUser = async (req, res) => {
    const { id, firstName, lastName, email, phone } = req.body;

    // send the valus if fields are updated only else empty string
    let setQuery = {};
    if (firstName) setQuery.firstName = firstName;
    if (lastName) setQuery.lastName = lastName;
    if (email) setQuery.email = email;
    if (phone) setQuery.phone = phone;

    if (!Object.keys(setQuery).length) {
        return res.json({ error: "data is not selected for the update" })
    }

    console.log("setQuery", setQuery)

    const updateUser = await UserModel.updateOne({ _id: id }, { $set: setQuery })

    if (updateUser) {
        return res.json({ message: "User updated" });
    }

    return res.json({ error: "User not updated" });
}

exports.userlist = async (req, res) => {
    let query = {};
    const searchFields = ["firstName", "lastName", "email", "phone"];

    for (let i = 0; i < searchFields.length; i++) {
        const field = searchFields[i];
        if (req.body[field] && req.body[field].trim() !== "") {
            query[field] = { $regex: new RegExp(req.body[field], 'i') }
        }
    }

    console.log("query", query)
    const roleQuery = req.body.role ? { name: req.body.role } : {};
    console.log("roleQuery", roleQuery);

    const users = await UserModel.find(query).populate({
        path: 'role',
        match: roleQuery,
        populate: {
            path: 'permissions',
            model: 'permissions'
        }
    });

    return res.json({ data: users });
};

exports.createAdmin = async (req, res) => {
    const { firstName, lastName, email, phone, password, confirmPassword, roleId } = req.body;

    try {

        if (password !== confirmPassword) {
            return res.json({ error: "Password and confirm password is not same" });
        }

        let alreadyRegistered = await UserModel.findOne({
            $or: [
                { email: email },
                { phone: phone }
            ]
        });

        if (alreadyRegistered) {
            return res.json({ error: "Admin already registered using email or phone" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const adminUser = await UserModel.create({
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone,
            password: hashedPassword,
            role: roleId,
            enabled: true
        });

        return res.json({ message: "Admin account created", data: adminUser });
    } catch (error) {
        console.error(error);
        return res.json({ error: error.message });
    }
};

