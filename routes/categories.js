var express = require('express');
var router = express.Router();
let categorySchema = require('../schemas/category');
const { checkRole } = require('../middlewares/auth');

// GET: Không yêu cầu đăng nhập
router.get('/', async function (req, res) {
  let categories = await categorySchema.find({});
  res.status(200).send({ success: true, data: categories });
});

router.get('/:id', async function (req, res) {
  try {
    let category = await categorySchema.findById(req.params.id);
    res.status(200).send({ success: true, data: category });
  } catch (error) {
    res.status(404).send({ success: false, message: error.message });
  }
});

// POST: Chỉ mod được tạo danh mục
router.post('/', checkRole('mod'), async function (req, res) {
  try {
    let newCategory = new categorySchema({ name: req.body.name });
    await newCategory.save();
    res.status(200).send({ success: true, data: newCategory });
  } catch (error) {
    res.status(404).send({ success: false, message: error.message });
  }
});

// PUT: Chỉ mod được cập nhật danh mục
router.put('/:id', checkRole('mod'), async function (req, res) {
  try {
    let category = await categorySchema.findById(req.params.id);
    if (!category) {
      return res.status(404).send({ success: false, message: 'ID không tồn tại' });
    }
    category.name = req.body.name || category.name;
    await category.save();
    res.status(200).send({ success: true, data: category });
  } catch (error) {
    res.status(404).send({ success: false, message: error.message });
  }
});

// DELETE: Chỉ admin được xóa danh mục
router.delete('/:id', checkRole('admin'), async function (req, res) {
  try {
    let category = await categorySchema.findById(req.params.id);
    if (!category) {
      return res.status(404).send({ success: false, message: 'ID không tồn tại' });
    }
    category.isDeleted = true;
    await category.save();
    res.status(200).send({ success: true, data: category });
  } catch (error) {
    res.status(404).send({ success: false, message: error.message });
  }
});

module.exports = router;