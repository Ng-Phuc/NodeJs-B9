var express = require('express');
var router = express.Router();
let productSchema = require('../schemas/product');
let categorySchema = require('../schemas/category');
const { checkRole } = require('../middlewares/auth');

function BuildQuery(query) {
  let result = {};
  if (query.name) {
    result.name = new RegExp(query.name, 'i');
  }
  result.price = {};
  result.price.$gte = query.price?.$gte ? Number(query.price.$gte) : 0;
  result.price.$lte = query.price?.$lte ? Number(query.price.$lte) : 10000;
  return result;
}

// GET: Không yêu cầu đăng nhập
router.get('/', async function (req, res) {
  let products = await productSchema.find(BuildQuery(req.query)).populate({
    path: 'category',
    select: 'name',
  });
  res.status(200).send({ success: true, data: products });
});

router.get('/:id', async function (req, res) {
  try {
    let product = await productSchema.findById(req.params.id);
    res.status(200).send({ success: true, data: product });
  } catch (error) {
    res.status(404).send({ success: false, message: error.message });
  }
});

// POST: Chỉ mod được tạo sản phẩm
router.post('/', checkRole('mod'), async function (req, res) {
  try {
    let { name, price = 0, quantity = 0, category } = req.body;
    let getCategory = await categorySchema.findOne({ name: category });
    if (!getCategory) {
      return res.status(404).send({ success: false, message: 'category sai' });
    }
    let newProduct = new productSchema({ name, price, quantity, category: getCategory._id });
    await newProduct.save();
    res.status(200).send({ success: true, data: newProduct });
  } catch (error) {
    res.status(404).send({ success: false, message: error.message });
  }
});

// PUT: Chỉ mod được cập nhật sản phẩm
router.put('/:id', checkRole('mod'), async function (req, res) {
  try {
    let product = await productSchema.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ success: false, message: 'ID không tồn tại' });
    }
    Object.assign(product, req.body);
    await product.save();
    res.status(200).send({ success: true, data: product });
  } catch (error) {
    res.status(404).send({ success: false, message: error.message });
  }
});

// DELETE: Chỉ admin được xóa sản phẩm
router.delete('/:id', checkRole('admin'), async function (req, res) {
  try {
    let product = await productSchema.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ success: false, message: 'ID không tồn tại' });
    }
    product.isDeleted = true;
    await product.save();
    res.status(200).send({ success: true, data: product });
  } catch (error) {
    res.status(404).send({ success: false, message: error.message });
  }
});

module.exports = router;