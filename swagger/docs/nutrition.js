/**
 * @swagger
 * components:
 *   schemas:
 *     Nutrition:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID matching the fruit ID
 *         fruit_name:
 *           type: string
 *           description: Name of the fruit
 *         calories:
 *           type: number
 *           format: float
 *           description: Calories per 100g
 *         protein:
 *           type: number
 *           format: float
 *           description: Protein content in grams per 100g
 *         carbohydrates:
 *           type: number
 *           format: float
 *           description: Carbohydrates content in grams per 100g
 *         sugar:
 *           type: number
 *           format: float
 *           description: Sugar content in grams per 100g
 *         fiber:
 *           type: number
 *           format: float
 *           description: Dietary fiber content in grams per 100g
 *         fat:
 *           type: number
 *           format: float
 *           description: Fat content in grams per 100g
 *         vitamin_c:
 *           type: number
 *           format: float
 *           description: Vitamin C content in milligrams per 100g
 *         potassium:
 *           type: number
 *           format: float
 *           description: Potassium content in milligrams per 100g
 *         calcium:
 *           type: number
 *           format: float
 *           description: Calcium content in milligrams per 100g
 *         iron:
 *           type: number
 *           format: float
 *           description: Iron content in milligrams per 100g
 *         serving_size:
 *           type: string
 *           description: Typical serving size description
 *         health_benefits:
 *           type: array
 *           items:
 *             type: string
 *           description: List of health benefits
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Last update timestamp

 *   parameters:
 *     FruitIdPath:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: integer
 *       description: Fruit ID to get nutrition information for

 *   responses:
 *     NotFound:
 *       description: Nutrition information not found for the given fruit ID
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string

 *     ValidationError:
 *       description: Validation error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string

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
 *   name: Nutrition
 *   description: Fruit nutrition information API
 */

/**
 * @swagger
 * /api/nutrition/{id}:
 *   get:
 *     summary: Get nutrition information for a fruit
 *     description: Retrieve detailed nutritional information for a specific fruit by its ID
 *     tags: [Nutrition]
 *     parameters:
 *       - $ref: '#/components/parameters/FruitIdPath'
 *     responses:
 *       200:
 *         description: Nutrition information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Nutrition'
 *             examples:
 *               appleNutrition:
 *                 summary: Apple nutrition information
 *                 value:
 *                   id: 1
 *                   fruit_name: "Apple"
 *                   calories: 52
 *                   protein: 0.3
 *                   carbohydrates: 14
 *                   sugar: 10
 *                   fiber: 2.4
 *                   fat: 0.2
 *                   vitamin_c: 4.6
 *                   potassium: 107
 *                   calcium: 6
 *                   iron: 0.1
 *                   serving_size: "1 medium apple (182g)"
 *                   health_benefits:
 *                     - "Rich in fiber and vitamin C"
 *                     - "Supports heart health"
 *                     - "May aid in weight loss"
 *                   created_at: "2023-10-01T10:00:00Z"
 *                   updated_at: "2023-10-01T11:00:00Z"
 *               bananaNutrition:
 *                 summary: Banana nutrition information
 *                 value:
 *                   id: 2
 *                   fruit_name: "Banana"
 *                   calories: 89
 *                   protein: 1.1
 *                   carbohydrates: 22.8
 *                   sugar: 12.2
 *                   fiber: 2.6
 *                   fat: 0.3
 *                   vitamin_c: 8.7
 *                   potassium: 358
 *                   calcium: 5
 *                   iron: 0.3
 *                   serving_size: "1 medium banana (118g)"
 *                   health_benefits:
 *                     - "High in potassium"
 *                     - "Good source of vitamin B6"
 *                     - "Supports digestive health"
 *                   created_at: "2023-10-01T10:00:00Z"
 *                   updated_at: null
 *       400:
 *         description: Invalid fruit ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid fruit id"
 *       404:
 *         description: Nutrition information not found for the specified fruit ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Nutrition not found"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */