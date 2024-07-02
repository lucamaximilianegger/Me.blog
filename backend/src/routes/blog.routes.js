const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
    getAllBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
    // ... andere Blog-bezogene Controller-Funktionen
} = require('../controllers/blog.controller');

// Blog routes
router.route('/')
    .get(getAllBlogs)
    .post(protect, createBlog);

router.route('/:blogId')
    .get(getBlogById)
    .put(protect, updateBlog)
    .delete(protect, deleteBlog);


module.exports = router;