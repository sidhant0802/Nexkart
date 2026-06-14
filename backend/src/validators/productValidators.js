// validators/productValidator.js
const Yup = require('yup');

const createProductSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string().max(2000, 'Description is too long'),
  mrpPrice: Yup.number().required('MRP Price is required').positive('MRP Price must be a positive number'),
  sellingPrice: Yup.number().required('Selling Price is required').positive('Selling Price must be a positive number'),
  color: Yup.string().required('Color is required'),
  images: Yup.array().of(Yup.string().url('Must be a valid URL')).max(5000, 'Too many images'),
  category: Yup.string().required('Category is required'),
  category2: Yup.string().required('Category2 is required'),
  category3: Yup.string().required('Category3 is required'),
  sizes: Yup.string().required('Sizes is required'),
});

module.exports = {
  createProductSchema,
};
