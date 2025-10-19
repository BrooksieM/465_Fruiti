/**
 * @swagger
 * components:
 *   schemas:
 *     Article:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID of the article
 *         title:
 *           type: string
 *           description: Article title
 *         content:
 *           type: string
 *           description: Article content/text
 *         author:
 *           type: string
 *           nullable: true
 *           description: Author name
 *         excerpt:
 *           type: string
 *           nullable: true
 *           description: Short excerpt or summary
 *         image_url:
 *           type: string
 *           nullable: true
 *           description: Featured image URL
 *         published_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Publication timestamp
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
 *     ArticlesResponse:
 *       type: object
 *       properties:
 *         count:
 *           type: integer
 *           description: Number of articles returned
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Article'
 * 
 *   parameters:
 *     ArticleIdsQuery:
 *       in: query
 *       name: ids
 *       schema:
 *         type: string
 *       description: Comma-separated list of article IDs to fetch (order preserved)
 *       example: "1,2,3"
 * 
 *     ArticleIdPath:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: integer
 *       description: Article ID
 * 
 *   responses:
 *     NotFound:
 *       description: Article not found
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
 *   name: Articles
 *   description: Article management and retrieval API
 */

/**
 * @swagger
 * /api/articles:
 *   get:
 *     summary: Get articles
 *     description: |
 *       Retrieve articles from the system.
 *       - Without query parameters: Returns all articles ordered by creation date (newest first)
 *       - With 'ids' parameter: Returns specific articles by ID (order preserved from query)
 *     tags: [Articles]
 *     parameters:
 *       - $ref: '#/components/parameters/ArticleIdsQuery'
 *     responses:
 *       200:
 *         description: Articles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ArticlesResponse'
 *             examples:
 *               allArticles:
 *                 summary: All articles response
 *                 value:
 *                   count: 2
 *                   data:
 *                     - id: 1
 *                       title: "Healthy Eating Tips"
 *                       content: "Lorem ipsum dolor sit amet..."
 *                       author: "John Doe"
 *                       excerpt: "Discover healthy eating habits"
 *                       image_url: "https://example.com/image1.jpg"
 *                       published_at: "2023-10-01T12:00:00Z"
 *                       created_at: "2023-10-01T10:00:00Z"
 *                       updated_at: "2023-10-01T11:00:00Z"
 *                     - id: 2
 *                       title: "Seasonal Fruits Guide"
 *                       content: "Consectetur adipiscing elit..."
 *                       author: "Jane Smith"
 *                       excerpt: "Learn about seasonal fruits"
 *                       image_url: "https://example.com/image2.jpg"
 *                       published_at: "2023-10-02T12:00:00Z"
 *                       created_at: "2023-10-02T10:00:00Z"
 *                       updated_at: null
 *               specificArticles:
 *                 summary: Specific articles by IDs
 *                 value:
 *                   count: 2
 *                   data:
 *                     - id: 2
 *                       title: "Seasonal Fruits Guide"
 *                       content: "Consectetur adipiscing elit..."
 *                       author: "Jane Smith"
 *                       excerpt: "Learn about seasonal fruits"
 *                       image_url: "https://example.com/image2.jpg"
 *                       published_at: "2023-10-02T12:00:00Z"
 *                       created_at: "2023-10-02T10:00:00Z"
 *                       updated_at: null
 *                     - id: 1
 *                       title: "Healthy Eating Tips"
 *                       content: "Lorem ipsum dolor sit amet..."
 *                       author: "John Doe"
 *                       excerpt: "Discover healthy eating habits"
 *                       image_url: "https://example.com/image1.jpg"
 *                       published_at: "2023-10-01T12:00:00Z"
 *                       created_at: "2023-10-01T10:00:00Z"
 *                       updated_at: "2023-10-01T11:00:00Z"
 *       400:
 *         description: Invalid article IDs format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "ids must be a comma-separated list of integers"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/articles/{id}:
 *   get:
 *     summary: Get article by ID
 *     description: Retrieve a single article by its ID
 *     tags: [Articles]
 *     parameters:
 *       - $ref: '#/components/parameters/ArticleIdPath'
 *     responses:
 *       200:
 *         description: Article retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *             examples:
 *               articleExample:
 *                 summary: Example article
 *                 value:
 *                   id: 1
 *                   title: "Healthy Eating Tips"
 *                   content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
 *                   author: "John Doe"
 *                   excerpt: "Discover healthy eating habits for a better lifestyle"
 *                   image_url: "https://example.com/image1.jpg"
 *                   published_at: "2023-10-01T12:00:00Z"
 *                   created_at: "2023-10-01T10:00:00Z"
 *                   updated_at: "2023-10-01T11:00:00Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */