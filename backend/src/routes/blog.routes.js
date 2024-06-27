const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware'); // Middleware für Authentifizierung
const {
    getAllBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
    requestReview,
    submitReview,
    searchBlogs
} = require('../controllers/blog.controller');

// Routen für Blog-Operationen
router.route('/')
    .get(getAllBlogs) // Alle Blogs abrufen
    .post(protect, createBlog); // Blog erstellen (nur für authentifizierte Nutzer)

router.route('/search')
    .get(searchBlogs); // Route für die Suche nach Blogs

router.route('/:id')
    .get(getBlogById) // Einzelnen Blog abrufen
    .put(protect, updateBlog) // Blog aktualisieren (nur für authentifizierte Nutzer)
    .delete(protect, deleteBlog); // Blog löschen (nur für authentifizierte Nutzer)

// Routen für den Review-Prozess
router.route('/:id/review/request')
    .post(protect, requestReview); // Review anfragen

router.route('/:id/review/submit')
    .post(protect, submitReview); // Review einreichen

module.exports = router;
