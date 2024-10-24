const express = require('express');
const VerifyAdmin = require('../middlewares/VerifyAdmin');
const UserController = require('../controllers/UserController');

const router = express.Router();

router.post('/register', UserController.registerUser);
router.post('/login', UserController.loginUser);
router.get('/:id', VerifyAdmin, UserController.getUser);
router.post('/list', VerifyAdmin, UserController.userlist);
router.post('/create-admin', VerifyAdmin, UserController.createAdmin);
router.post('/update-user', VerifyAdmin, UserController.updateUser);
router.post('/create-role', VerifyAdmin, UserController.createRole);
router.post('/assign-role', VerifyAdmin, UserController.updateAssignRole);
router.post('/enable-desable', VerifyAdmin, UserController.enableDesableUser);

module.exports = router;