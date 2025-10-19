/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - recipe_id
 *         - text
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID of the comment
 *         recipe_id:
 *           type: integer
 *           description: ID of the recipe this comment belongs to
 *         author_id:
 *           type: integer
 *           nullable: true
 *           description: ID of the user who wrote the comment
 *         text:
 *           type: string
 *           description: Comment text content
 *         likes:
 *           type: integer
 *           description: Number of likes the comment has received
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
 *     CommentCreate:
 *       type: object
 *       required:
 *         - text
 *       properties:
 *         text:
 *           type: string
 *           description: Comment text content
 *         authorId:
 *           type: integer
 *           nullable: true
 *           description: ID of the user creating the comment
 * 
 *     CommentUpdate:
 *       type: object
 *       required:
 *         - text
 *       properties:
 *         text:
 *           type: string
 *           description: Updated comment text
 * 
 *     CommentResponse:
 *       type: object
 *       properties:
 *         recipeId:
 *           type: integer
 *         comment:
 *           $ref: '#/components/schemas/Comment'
 * 
 *     LikeResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Comment ID
 *         likes:
 *           type: integer
 *           description: Updated like count
 * 
 *     DeleteResponse:
 *       type: object
 *       properties:
 *         recipeId:
 *           type: integer
 *         deleted:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 * 
 *     CommentStats:
 *       type: object
 *       properties:
 *         recipeId:
 *           type: integer
 *         totalComments:
 *           type: integer
 *           description: Total number of comments for the recipe
 *         totalLikes:
 *           type: integer
 *           description: Total likes across all comments
 *         averageLikes:
 *           type: number
 *           format: float
 *           description: Average likes per comment
 * 
 *   parameters:
 *     RecipeIdQuery:
 *       in: query
 *       name: recipe
 *       required: true
 *       schema:
 *         type: integer
 *       description: Recipe ID
 * 
 *     CommentIdQuery:
 *       in: query
 *       name: comment
 *       schema:
 *         type: integer
 *       description: Comment ID (for single comment operations)
 * 
 *   responses:
 *     NotFound:
 *       description: Recipe or comment not found
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
 *   name: Comments
 *   description: Recipe comment management API
 */

/**
 * @swagger
 * /api/comments/__ping:
 *   get:
 *     summary: Health check endpoint
 *     description: Simple ping endpoint for development and health checks
 *     tags: [Comments]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 */

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Create a new comment
 *     description: Add a new comment to a recipe
 *     tags: [Comments]
 *     parameters:
 *       - $ref: '#/components/parameters/RecipeIdQuery'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentCreate'
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommentResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/comments:
 *   get:
 *     summary: Get comments for a recipe
 *     description: Retrieve all comments for a recipe or a specific comment
 *     tags: [Comments]
 *     parameters:
 *       - $ref: '#/components/parameters/RecipeIdQuery'
 *       - $ref: '#/components/parameters/CommentIdQuery'
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Comment'
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/comments:
 *   put:
 *     summary: Update a comment
 *     description: Update the text of an existing comment
 *     tags: [Comments]
 *     parameters:
 *       - $ref: '#/components/parameters/RecipeIdQuery'
 *       - $ref: '#/components/parameters/CommentIdQuery'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentUpdate'
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/comments:
 *   delete:
 *     summary: Delete a comment
 *     description: Remove a comment from a recipe
 *     tags: [Comments]
 *     parameters:
 *       - $ref: '#/components/parameters/RecipeIdQuery'
 *       - $ref: '#/components/parameters/CommentIdQuery'
 *     responses:
 *       200:
 *         description: Comment deleted successfully
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

/**
 * @swagger
 * /api/comments/like:
 *   put:
 *     summary: Like a comment
 *     description: Increment the like count for a comment
 *     tags: [Comments]
 *     parameters:
 *       - $ref: '#/components/parameters/RecipeIdQuery'
 *       - $ref: '#/components/parameters/CommentIdQuery'
 *     responses:
 *       200:
 *         description: Comment liked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LikeResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/comments/stats:
 *   get:
 *     summary: Get comment statistics
 *     description: Retrieve statistics about comments for a recipe (total comments, likes, averages)
 *     tags: [Comments]
 *     parameters:
 *       - $ref: '#/components/parameters/RecipeIdQuery'
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommentStats'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */