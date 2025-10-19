/**
 * @swagger
 * components:
 *   schemas:
 *     FruitStand:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - city
 *         - state
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID of the fruit stand
 *         name:
 *           type: string
 *           description: Name of the fruit stand
 *         address:
 *           type: string
 *           description: Street address
 *         city:
 *           type: string
 *           description: City
 *         state:
 *           type: string
 *           description: State
 *         zip:
 *           type: string
 *           description: ZIP code
 *         phone:
 *           type: string
 *           description: Phone number
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 * 
 *     FruitStandCreate:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - city
 *         - state
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the fruit stand
 *         address:
 *           type: string
 *           description: Street address
 *         city:
 *           type: string
 *           description: City
 *         state:
 *           type: string
 *           description: State
 *         zip:
 *           type: string
 *           description: ZIP code
 *         phone:
 *           type: string
 *           description: Phone number
 * 
 *     FruitStandUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the fruit stand
 *         address:
 *           type: string
 *           description: Street address
 *         city:
 *           type: string
 *           description: City
 *         state:
 *           type: string
 *           description: State
 *         zip:
 *           type: string
 *           description: ZIP code
 *         phone:
 *           type: string
 *           description: Phone number
 * 
 *     Rating:
 *       type: object
 *       required:
 *         - rating
 *       properties:
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: Rating value (1-5)
 *         user_id:
 *           type: string
 *           description: User ID who submitted the rating
 *         comment:
 *           type: string
 *           description: Optional comment with the rating
 * 
 *     AddressResponse:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Fruit stand name
 *         fullAddress:
 *           type: string
 *           description: Full formatted address
 *         addressComponents:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             zip:
 *               type: string
 * 
 *   responses:
 *     NotFound:
 *       description: Fruit stand not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 * 
 *     ValidationError:
 *       description: Validation error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 * 
 *     ServerError:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 */

/**
 * @swagger
 * tags:
 *   name: Fruit Stands
 *   description: Fruit stand management API
 */

/**
 * @swagger
 * /api/fruitstands/search:
 *   get:
 *     summary: Search for fruit stands by location
 *     description: Search fruit stands by city, state, or address
 *     tags: [Fruit Stands]
 *     parameters:
 *       - in: query
 *         name: location
 *         required: true
 *         schema:
 *           type: string
 *         description: City, state, or address to search for
 *     responses:
 *       200:
 *         description: Successful search
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 location:
 *                   type: string
 *                 fruitStands:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FruitStand'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/fruitstands:
 *   post:
 *     summary: Create a new fruit stand
 *     description: Add a new fruit stand to the database
 *     tags: [Fruit Stands]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FruitStandCreate'
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
 *                   $ref: '#/components/schemas/FruitStand'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/fruitstands:
 *   get:
 *     summary: Get all fruit stands
 *     description: Retrieve a list of all fruit stands
 *     tags: [Fruit Stands]
 *     responses:
 *       200:
 *         description: List of fruit stands retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FruitStand'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/fruitstands/{id}:
 *   get:
 *     summary: Get fruit stand by ID
 *     description: Retrieve detailed information about a specific fruit stand
 *     tags: [Fruit Stands]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Fruit stand ID
 *     responses:
 *       200:
 *         description: Fruit stand details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FruitStand'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/fruitstands/{id}:
 *   put:
 *     summary: Update a fruit stand
 *     description: Update information for an existing fruit stand
 *     tags: [Fruit Stands]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Fruit stand ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FruitStandUpdate'
 *     responses:
 *       200:
 *         description: Fruit stand updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 fruitStand:
 *                   $ref: '#/components/schemas/FruitStand'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/fruitstands/{id}:
 *   delete:
 *     summary: Delete a fruit stand
 *     description: Remove a fruit stand from the database
 *     tags: [Fruit Stands]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Fruit stand ID
 *     responses:
 *       200:
 *         description: Fruit stand deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deletedId:
 *                   type: integer
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/fruitstands/{id}/rating:
 *   post:
 *     summary: Rate a fruit stand
 *     description: Submit a rating and optional comment for a fruit stand
 *     tags: [Fruit Stands]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Fruit stand ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Rating'
 *     responses:
 *       200:
 *         description: Rating submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 rating:
 *                   type: object
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/fruitstands/{id}/address:
 *   get:
 *     summary: Get fruit stand address
 *     description: Retrieve address information formatted for mapping services
 *     tags: [Fruit Stands]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Fruit stand ID
 *     responses:
 *       200:
 *         description: Address retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AddressResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */