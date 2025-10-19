// =======================
// GET /api/fruitstands/search
// =======================
/**
 * @swagger
 * /api/fruitstands/search:
 *   get:
 *     summary: Search for fruit stands by location
 *     description: Returns a list of fruit stands that match a location query (city, state, or address).
 *     parameters:
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         required: true
 *         description: The location (city, state, or address) to search for.
 *     responses:
 *       200:
 *         description: List of matching fruit stands
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
 *                     type: object
 *                     properties:
 *                       id: { type: integer }
 *                       name: { type: string }
 *                       address: { type: string }
 *                       city: { type: string }
 *                       state: { type: string }
 *                       zip: { type: string }
 *                       phone: { type: string }
 *       400:
 *         description: Missing or invalid query parameter
 *       500:
 *         description: Internal server error
 */


// =======================
// POST /api/fruitstands
// =======================
/**
 * @swagger
 * /api/fruitstands:
 *   post:
 *     summary: Create a new fruit stand
 *     description: Adds a new fruit stand to the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, address, city, state]
 *             properties:
 *               name: { type: string, description: "Name of the fruit stand" }
 *               address: { type: string }
 *               city: { type: string }
 *               state: { type: string }
 *               zip: { type: string }
 *               phone: { type: string }
 *     responses:
 *       201:
 *         description: Fruit stand created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */


// =======================
// DELETE /api/fruitstands/{id}
// =======================
/**
 * @swagger
 * /api/fruitstands/{id}:
 *   delete:
 *     summary: Delete a fruit stand by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the fruit stand to delete.
 *     responses:
 *       200:
 *         description: Fruit stand deleted successfully
 *       400:
 *         description: Invalid fruit stand ID
 *       404:
 *         description: Fruit stand not found
 *       500:
 *         description: Internal server error
 */


// =======================
// PUT /api/fruitstands/{id}
// =======================
/**
 * @swagger
 * /api/fruitstands/{id}:
 *   put:
 *     summary: Update a fruit stand by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the fruit stand to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               address: { type: string }
 *               city: { type: string }
 *               state: { type: string }
 *               zip: { type: string }
 *               phone: { type: string }
 *     responses:
 *       200:
 *         description: Fruit stand updated successfully
 *       400:
 *         description: Invalid input or ID
 *       404:
 *         description: Fruit stand not found
 *       500:
 *         description: Internal server error
 */


// =======================
// GET /api/fruitstands/{id}
// =======================
/**
 * @swagger
 * /api/fruitstands/{id}:
 *   get:
 *     summary: Get a fruit stand by ID
 *     description: Retrieves detailed information for a specific fruit stand.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the fruit stand to retrieve.
 *     responses:
 *       200:
 *         description: Fruit stand details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: integer }
 *                 name: { type: string }
 *                 address: { type: string }
 *                 city: { type: string }
 *                 state: { type: string }
 *                 zip: { type: string }
 *                 phone: { type: string }
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Fruit stand not found
 *       500:
 *         description: Internal server error
 */


// =======================
// POST /api/fruitstands/{id}/rating
// =======================
/**
 * @swagger
 * /api/fruitstands/{id}/rating:
 *   post:
 *     summary: Submit a rating for a fruit stand
 *     description: Allows a user to rate a fruit stand between 1 and 5.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the fruit stand to rate.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating]
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               user_id: { type: string }
 *               comment: { type: string }
 *     responses:
 *       200:
 *         description: Rating submitted successfully
 *       400:
 *         description: Invalid input or rating
 *       404:
 *         description: Fruit stand not found
 *       500:
 *         description: Internal server error
 */


// =======================
// GET /api/fruitstands/{id}/address
// =======================
/**
 * @swagger
 * /api/fruitstands/{id}/address:
 *   get:
 *     summary: Get a fruit stand's address
 *     description: Retrieves the address details of a fruit stand for display or mapping.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the fruit stand.
 *     responses:
 *       200:
 *         description: Address information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name: { type: string }
 *                 fullAddress: { type: string }
 *                 addressComponents:
 *                   type: object
 *                   properties:
 *                     street: { type: string }
 *                     city: { type: string }
 *                     state: { type: string }
 *                     zip: { type: string }
 *       400:
 *         description: Invalid fruit stand ID
 *       404:
 *         description: Fruit stand not found
 *       500:
 *         description: Internal server error
 */


// =======================
// GET /api/fruitstands
// =======================
/**
 * @swagger
 * /api/fruitstands:
 *   get:
 *     summary: Retrieve all fruit stands
 *     description: Returns a list of all fruit stands in the database, ordered by most recent.
 *     responses:
 *       200:
 *         description: List of fruit stands
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer }
 *                   name: { type: string }
 *                   address: { type: string }
 *                   city: { type: string }
 *                   state: { type: string }
 *                   zip: { type: string }
 *                   phone: { type: string }
 *       500:
 *         description: Internal server error
 */
