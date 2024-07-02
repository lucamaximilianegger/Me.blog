const express = require('express');
const router = express.Router();
const { getAllTags } = require('../controllers/tag.controller');

/**
 * @swagger
 * /api/tags:
 *   get:
 *     summary: Ruft alle Tags ab
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: Liste aller Tags
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *       500:
 *         description: Serverfehler
 */
router.route('/').get(getAllTags);

module.exports = router;