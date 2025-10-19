/**
 * @swagger
 * components:
 *   schemas:
 *     Recipe:
 *       type: object
 *       required:
 *         - name
 *         - ingredients
 *         - instructions
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID of the recipe
 *         name:
 *           type: string
 *           description: Name of the recipe
 *         ingredients:
 *           type: string
 *           description: List of ingredients and quantities
 *         instructions:
 *           type: string
 *           description: Step-by-step cooking instructions
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Last update timestamp
 * 
 *     RecipeCreate:
 *       type: object
 *       required:
 *         - name
 *         - ingredients
 *         - instructions
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the recipe
 *         ingredients:
 *           type: string
 *           description: List of ingredients and quantities
 *         instructions:
 *           type: string
 *           description: Step-by-step cooking instructions
 * 
 *     RecipeUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Updated name of the recipe
 *         ingredients:
 *           type: string
 *           description: Updated list of ingredients
 *         instructions:
 *           type: string
 *           description: Updated cooking instructions
 * 
 *     RecipeResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         recipe:
 *           $ref: '#/components/schemas/Recipe'
 * 
 *     DeleteResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         deletedId:
 *           type: integer
 * 
 *   parameters:
 *     RecipeIdPath:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: integer
 *       description: Recipe ID
 * 
 *   responses:
 *     NotFound:
 *       description: Recipe not found
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
 *   name: Recipes
 *   description: Recipe management API
 */

/**
 * @swagger
 * /api/recipes:
 *   post:
 *     summary: Create a new recipe
 *     description: Add a new recipe to the database
 *     tags: [Recipes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecipeCreate'
 *           examples:
 *             fruitSalad:
 *               summary: Fruit Salad Recipe
 *               value:
 *                 name: "Tropical Fruit Salad"
 *                 ingredients: "2 bananas, 1 mango, 1 cup strawberries, 1 cup pineapple chunks, 1 tbsp honey, 1 tbsp lime juice"
 *                 instructions: "1. Chop all fruits into bite-sized pieces\n2. Mix honey and lime juice in a small bowl\n3. Toss fruits with the honey-lime dressing\n4. Chill for 30 minutes before serving"
 *             smoothie:
 *               summary: Berry Smoothie Recipe
 *               value:
 *                 name: "Mixed Berry Smoothie"
 *                 ingredients: "1 cup mixed berries, 1 banana, 1 cup yogurt, 1/2 cup orange juice, 1 tbsp honey"
 *                 instructions: "1. Combine all ingredients in a blender\n2. Blend until smooth\n3. Add more liquid if needed\n4. Serve immediately"
 *     responses:
 *       201:
 *         description: Recipe created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recipe'
 *             examples:
 *               createdRecipe:
 *                 value:
 *                   id: 1
 *                   name: "Tropical Fruit Salad"
 *                   ingredients: "2 bananas, 1 mango, 1 cup strawberries, 1 cup pineapple chunks, 1 tbsp honey, 1 tbsp lime juice"
 *                   instructions: "1. Chop all fruits into bite-sized pieces\n2. Mix honey and lime juice in a small bowl\n3. Toss fruits with the honey-lime dressing\n4. Chill for 30 minutes before serving"
 *                   created_at: "2023-10-01T10:00:00Z"
 *                   updated_at: null
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required fields"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/recipes:
 *   get:
 *     summary: Get all recipes
 *     description: Retrieve a list of all recipes, ordered by creation date (newest first)
 *     tags: [Recipes]
 *     responses:
 *       200:
 *         description: Recipes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Recipe'
 *             examples:
 *               recipeList:
 *                 value:
 *                   - id: 2
 *                     name: "Mixed Berry Smoothie"
 *                     ingredients: "1 cup mixed berries, 1 banana, 1 cup yogurt, 1/2 cup orange juice, 1 tbsp honey"
 *                     instructions: "1. Combine all ingredients in a blender\n2. Blend until smooth\n3. Add more liquid if needed\n4. Serve immediately"
 *                     created_at: "2023-10-02T10:00:00Z"
 *                     updated_at: null
 *                   - id: 1
 *                     name: "Tropical Fruit Salad"
 *                     ingredients: "2 bananas, 1 mango, 1 cup strawberries, 1 cup pineapple chunks, 1 tbsp honey, 1 tbsp lime juice"
 *                     instructions: "1. Chop all fruits into bite-sized pieces\n2. Mix honey and lime juice in a small bowl\n3. Toss fruits with the honey-lime dressing\n4. Chill for 30 minutes before serving"
 *                     created_at: "2023-10-01T10:00:00Z"
 *                     updated_at: "2023-10-01T15:00:00Z"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/recipes/{id}:
 *   get:
 *     summary: Get recipe by ID
 *     description: Retrieve detailed information about a specific recipe
 *     tags: [Recipes]
 *     parameters:
 *       - $ref: '#/components/parameters/RecipeIdPath'
 *     responses:
 *       200:
 *         description: Recipe retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recipe'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/recipes/{id}:
 *   put:
 *     summary: Update a recipe
 *     description: Update information for an existing recipe (partial update supported)
 *     tags: [Recipes]
 *     parameters:
 *       - $ref: '#/components/parameters/RecipeIdPath'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecipeUpdate'
 *           examples:
 *             updateExample:
 *               summary: Update recipe ingredients
 *               value:
 *                 ingredients: "2 bananas, 1 mango, 1 cup strawberries, 1 cup pineapple chunks, 1 tbsp honey, 1 tbsp lime juice, 1/4 cup shredded coconut"
 *                 instructions: "1. Chop all fruits into bite-sized pieces\n2. Mix honey and lime juice in a small bowl\n3. Toss fruits with the honey-lime dressing\n4. Sprinkle with shredded coconut\n5. Chill for 30 minutes before serving"
 *     responses:
 *       200:
 *         description: Recipe updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecipeResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/recipes/{id}:
 *   delete:
 *     summary: Delete a recipe
 *     description: Remove a recipe from the database
 *     tags: [Recipes]
 *     parameters:
 *       - $ref: '#/components/parameters/RecipeIdPath'
 *     responses:
 *       200:
 *         description: Recipe deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */