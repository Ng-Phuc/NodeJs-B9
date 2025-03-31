var express = require('express');
var router = express.Router();
const roleSchema = require('../schemas/role');
const { check_authentication, check_authorization } = require("../utils/check_auth");

// GET: Không yêu cầu đăng nhập
router.get('/', async function (req, res, next) {
  try {
    let roles = await roleSchema.find({});
    res.send({
      success: true,
      data: roles
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
    });
  }
});

// POST: Chỉ admin được tạo role
router.post('/', check_authentication, check_authorization(['admin']), async function (req, res, next) {
  try {
    let body = req.body;
    let newRole = new roleSchema({
      name: body.name
    });
    await newRole.save();
    res.status(200).send({
      success: true,
      data: newRole
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
    });
  }
});

// PUT: Chỉ admin được cập nhật role
router.put('/:id', check_authentication, check_authorization(['admin']), async function (req, res, next) {
  try {
    let role = await roleSchema.findById(req.params.id);
    if (!role) {
      return res.status(404).send({
        success: false,
        message: 'Role không tồn tại'
      });
    }
    role.name = req.body.name || role.name;
    await role.save();
    res.status(200).send({
      success: true,
      data: role
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
    });
  }
});

// DELETE: Chỉ admin được xóa role
router.delete('/:id', check_authentication, check_authorization(['admin']), async function (req, res, next) {
  try {
    let role = await roleSchema.findById(req.params.id);
    if (!role) {
      return res.status(404).send({
        success: false,
        message: 'Role không tồn tại'
      });
    }
    await roleSchema.findByIdAndDelete(req.params.id);
    res.status(200).send({
      success: true,
      message: 'Role đã được xóa'
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
