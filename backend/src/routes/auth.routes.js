const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { registerUser, confirmEmail, loginUser, refreshToken, confirmAccountDeletion, requestAccountDeletion, cancelAccountDeletion } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const csrfProtection = require('csurf')({ cookie: true });

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts from this IP, please try again later.'
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registriert einen neuen Benutzer
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Benutzer erfolgreich registriert
 *       400:
 *         description: Ungültige Eingabedaten
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /api/auth/email-confirmation/{token}:
 *   get:
 *     summary: Bestätigt die E-Mail-Adresse eines Benutzers
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: E-Mail erfolgreich bestätigt
 *       400:
 *         description: Ungültiger oder abgelaufener Token
 */
router.get('/email-confirmation/:token', confirmEmail);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authentifiziert einen Benutzer
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Erfolgreich eingeloggt
 *       401:
 *         description: Authentifizierung fehlgeschlagen
 *       429:
 *         description: Zu viele Anmeldeversuche
 */
router.post('/login', loginLimiter, loginUser);

/**
 * @swagger
 * /api/auth/token/refresh:
 *   post:
 *     summary: Erneuert den Zugriffstoken
 *     tags: [Authentication]
 *     security:
 *       - csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Neuer Zugriffstoken generiert
 *       401:
 *         description: Ungültiger Refresh-Token
 */
router.post('/token/refresh', csrfProtection, refreshToken);

/**
 * @swagger
 * /api/auth/account-deletion/request:
 *   post:
 *     summary: Beantragt die Löschung des Benutzerkontos
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     responses:
 *       200:
 *         description: Kontolöschung beantragt
 *       401:
 *         description: Nicht autorisiert
 */
router.post('/account-deletion/request', protect, csrfProtection, requestAccountDeletion);

/**
 * @swagger
 * /api/auth/account-deletion/confirm/{token}:
 *   get:
 *     summary: Bestätigt die Löschung des Benutzerkontos
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kontolöschung bestätigt
 *       400:
 *         description: Ungültiger oder abgelaufener Token
 */
router.get('/account-deletion/confirm/:token', confirmAccountDeletion);

/**
 * @swagger
 * /api/auth/account-deletion/cancel:
 *   post:
 *     summary: Bricht die Löschung des Benutzerkontos ab
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     responses:
 *       200:
 *         description: Kontolöschung abgebrochen
 *       401:
 *         description: Nicht autorisiert
 */
router.post('/account-deletion/cancel', protect, csrfProtection, cancelAccountDeletion);

module.exports = router;