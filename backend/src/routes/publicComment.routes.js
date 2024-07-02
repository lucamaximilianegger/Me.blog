const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
    addPublicComment,
    getPublicComments,
    updatePublicComment,
    deletePublicComment,
    addPublicReply,
    likePublicComment,
    pinPublicComment,
    togglePublicComments
} = require('../controllers/publicComment.controller');

/**
 * @swagger
 * /api/public-comments/{blogId}:
 *   post:
 *     summary: Fügt einen neuen öffentlichen Kommentar hinzu
 *     tags: [Public Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Kommentar erfolgreich hinzugefügt
 *       401:
 *         description: Nicht autorisiert
 *       404:
 *         description: Blog nicht gefunden
 */
router.post('/:blogId', protect, addPublicComment);

/**
 * @swagger
 * /api/public-comments/{blogId}:
 *   get:
 *     summary: Ruft alle öffentlichen Kommentare eines Blogs ab
 *     tags: [Public Comments]
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste der Kommentare
 *       404:
 *         description: Blog nicht gefunden
 */
router.get('/:blogId', getPublicComments);

/**
 * @swagger
 * /api/public-comments/{commentId}:
 *   put:
 *     summary: Aktualisiert einen öffentlichen Kommentar
 *     tags: [Public Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Kommentar erfolgreich aktualisiert
 *       401:
 *         description: Nicht autorisiert
 *       404:
 *         description: Kommentar nicht gefunden
 *   delete:
 *     summary: Löscht einen öffentlichen Kommentar
 *     tags: [Public Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kommentar erfolgreich gelöscht
 *       401:
 *         description: Nicht autorisiert
 *       404:
 *         description: Kommentar nicht gefunden
 */
router.put('/:commentId', protect, updatePublicComment);
router.delete('/:commentId', protect, deletePublicComment);

/**
 * @swagger
 * /api/public-comments/{commentId}/replies:
 *   post:
 *     summary: Fügt eine Antwort zu einem öffentlichen Kommentar hinzu
 *     tags: [Public Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Antwort erfolgreich hinzugefügt
 *       401:
 *         description: Nicht autorisiert
 *       404:
 *         description: Kommentar nicht gefunden
 */
router.post('/:commentId/replies', protect, addPublicReply);

/**
 * @swagger
 * /api/public-comments/{commentId}/like:
 *   post:
 *     summary: Liked oder Unlikes einen öffentlichen Kommentar
 *     tags: [Public Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like-Status erfolgreich geändert
 *       401:
 *         description: Nicht autorisiert
 *       404:
 *         description: Kommentar nicht gefunden
 */
router.post('/:commentId/like', protect, likePublicComment);

/**
 * @swagger
 * /api/public-comments/{commentId}/pin:
 *   post:
 *     summary: Pinnt oder Unpinnt einen öffentlichen Kommentar
 *     tags: [Public Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pin-Status erfolgreich geändert
 *       401:
 *         description: Nicht autorisiert
 *       404:
 *         description: Kommentar nicht gefunden
 */
router.post('/:commentId/pin', protect, pinPublicComment);

/**
 * @swagger
 * /api/public-comments/toggle/{blogId}:
 *   post:
 *     summary: Aktiviert oder deaktiviert Kommentare für einen Blog
 *     tags: [Public Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kommentar-Status erfolgreich geändert
 *       401:
 *         description: Nicht autorisiert
 *       404:
 *         description: Blog nicht gefunden
 */
router.post('/toggle/:blogId', protect, togglePublicComments);

module.exports = router;