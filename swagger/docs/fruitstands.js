// POST endpoint to create a new fruit stand
/**
 * @swagger
 * /api/fruitstands:
 *   post:
 *     summary: Create a new fruit stand
 *     description: Adds a new fruit stand to the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - city
 *               - state
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the fruit stand
 *               address:
 *                 type: string
 *                 description: Street address
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zip:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Fruit stand created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 fruitStand:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     address:
 *                       type: string
 */