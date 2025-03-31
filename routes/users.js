var express = require('express');
var router = express.Router();
var userControllers = require('../controllers/users');
let { check_authentication, check_authorization } = require("../utils/check_auth");
const constants = require('../utils/constants');

// GET: Chỉ mod được lấy danh sách user, không lấy user chính mình
router.get('/', check_authentication, check_authorization(['mod']), async function (req, res, next) {
  try {
    let users = await userControllers.getAllUsers();
    users = users.filter(user => user.id !== req.user.id); // Loại bỏ chính user
    res.send({ success: true, data: users });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', check_authentication, check_authorization(['mod']), async function (req, res, next) {
  try {
    if (req.params.id === req.user.id) {
      return res.status(403).send({ success: false, message: 'Không thể xem thông tin của chính mình' });
    }
    let user = await userControllers.getUserById(req.params.id);
    res.status(200).send({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// POST: Chỉ admin được tạo user
router.post('/', check_authentication, check_authorization(['admin']), async function (req, res, next) {
  try {
    let { username, password, email, role } = req.body;
    let newUser = await userControllers.createAnUser(username, password, email, role);
    res.status(200).send({ success: true, message: newUser });
  } catch (error) {
    res.status(404).send({ success: false, message: error.message });
  }
});

// PUT: Chỉ admin được cập nhật user
router.put('/:id', check_authentication, check_authorization(['admin']), async function (req, res, next) {
  try {
    let updatedUser = await userControllers.updateAnUser(req.params.id, req.body);
    res.status(200).send({ success: true, message: updatedUser });
  } catch (error) {
    next(error);
  }
});

// DELETE: Chỉ admin được xóa user
router.delete('/:id', check_authentication, check_authorization(['admin']), async function (req, res, next) {
  try {
    let deleteUser = await userControllers.deleteAnUser(req.params.id);
    res.status(200).send({ success: true, message: deleteUser });
  } catch (error) {
    next(error);
  }
});

module.exports = router;