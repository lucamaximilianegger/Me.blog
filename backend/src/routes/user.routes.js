const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const csrfProtection = require('csurf')({ cookie: true });

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Ruft das Profil des aktuellen Benutzers ab
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Benutzerprofil erfolgreich abgerufen
 *       401:
 *         description: Nicht autorisiert
 *   put:
 *     summary: Aktualisiert das Profil des aktuellen Benutzers
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Benutzerprofil erfolgreich aktualisiert
 *       400:
 *         description: Ungültige Eingabedaten
 *       401:
 *         description: Nicht autorisiert
 */
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, csrfProtection, upload.single('profileImage'), updateUserProfile);

module.exports = router;