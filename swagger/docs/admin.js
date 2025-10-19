/**
 * @swagger
 * components:
 *   schemas:
 *     AdminAccount:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Account ID
 *         handle:
 *           type: string
 *           description: Username/handle
 *         email:
 *           type: string
 *           format: email
 *           description: Email address
 *         avatar:
 *           type: string
 *           nullable: true
 *           description: Profile picture URL
 *         payment_method:
 *           type: object
 *           nullable: true
 *           description: Payment method information
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Account creation date
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update date
 *         deleted_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Soft delete timestamp
 *         banned_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Ban timestamp
 *         ban_reason:
 *           type: string
 *           nullable: true
 *           description: Reason for ban
 * 
 *     AdminLog:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Log entry ID
 *         admin_id:
 *           type: integer
 *           description: ID of admin who performed action
 *         action:
 *           type: string
 *           description: Action performed (DELETE_ACCOUNT, RESTORE_ACCOUNT, BAN_ACCOUNT, etc.)
 *         target_type:
 *           type: string
 *           description: Type of target (account, recipe, etc.)
 *         target_id:
 *           type: integer
 *           nullable: true
 *           description: ID of the target
 *         details:
 *           type: object
 *           description: Additional action details
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Action timestamp
 * 
 *     Pagination:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           description: Current page number
 *         limit:
 *           type: integer
 *           description: Number of items per page
 *         total:
 *           type: integer
 *           description: Total number of items
 *         totalPages:
 *           type: integer
 *           description: Total number of pages
 * 
 *     AdminStats:
 *       type: object
 *       properties:
 *         totalAccounts:
 *           type: integer
 *           description: Total number of active accounts
 *         totalRecipes:
 *           type: integer
 *           description: Total number of recipes
 *         totalFruitStands:
 *           type: integer
 *           description: Total number of fruit stands
 *         totalComments:
 *           type: integer
 *           description: Total number of comments
 * 
 *     StatsResponse:
 *       type: object
 *       properties:
 *         stats:
 *           $ref: '#/components/schemas/AdminStats'
 *         recentActions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AdminLog'
 * 
 *     AccountsResponse:
 *       type: object
 *       properties:
 *         accounts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AdminAccount'
 *         pagination:
 *           $ref: '#/components/schemas/Pagination'
 * 
 *     LogsResponse:
 *       type: object
 *       properties:
 *         logs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AdminLog'
 *         pagination:
 *           $ref: '#/components/schemas/Pagination'
 * 
 *     BanRequest:
 *       type: object
 *       properties:
 *         reason:
 *           type: string
 *           description: Reason for banning the account
 * 
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         deletedId:
 *           type: integer
 *           description: ID of the affected account
 * 
 *     BanResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         bannedId:
 *           type: integer
 *         reason:
 *           type: string
 * 
 *   parameters:
 *     AccountId:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: integer
 *       description: Account ID
 * 
 *     PageQuery:
 *       in: query
 *       name: page
 *       schema:
 *         type: integer
 *         minimum: 1
 *         default: 1
 *       description: Page number for pagination
 * 
 *     LimitQuery:
 *       in: query
 *       name: limit
 *       schema:
 *         type: integer
 *         minimum: 1
 *         maximum: 100
 *         default: 20
 *       description: Number of items per page
 * 
 *     SearchQuery:
 *       in: query
 *       name: search
 *       schema:
 *         type: string
 *       description: Search term for accounts (handle or email)
 * 
 *     StatusQuery:
 *       in: query
 *       name: status
 *       schema:
 *         type: string
 *         enum: [active, deleted]
 *         default: active
 *       description: Filter accounts by status
 * 
 *     ActionQuery:
 *       in: query
 *       name: action
 *       schema:
 *         type: string
 *       description: Filter admin logs by action type
 * 
 *   responses:
 *     Unauthorized:
 *       description: Admin authentication required
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 * 
 *     Forbidden:
 *       description: Insufficient permissions
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 * 
 *     NotFound:
 *       description: Resource not found
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
 */

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative management API (requires admin privileges)
 */

/**
 * @swagger
 * /api/admin/accounts:
 *   get:
 *     summary: Get all accounts with pagination and filters
 *     description: Retrieve a paginated list of user accounts with search and status filtering (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *       - $ref: '#/components/parameters/SearchQuery'
 *       - $ref: '#/components/parameters/StatusQuery'
 *     responses:
 *       200:
 *         description: Accounts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccountsResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/admin/accounts/{id}:
 *   delete:
 *     summary: Soft delete user account
 *     description: Soft delete a user account by setting deleted_at timestamp (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AccountId'
 *     responses:
 *       200:
 *         description: Account soft deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/admin/accounts/{id}/restore:
 *   post:
 *     summary: Restore soft-deleted account
 *     description: Restore a previously soft-deleted user account (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AccountId'
 *     responses:
 *       200:
 *         description: Account restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/admin/accounts/{id}/ban:
 *   post:
 *     summary: Ban user account
 *     description: Ban a user account with optional reason (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AccountId'
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BanRequest'
 *     responses:
 *       200:
 *         description: Account banned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BanResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get admin dashboard statistics
 *     description: Retrieve system statistics and recent admin actions for dashboard (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatsResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/admin/logs:
 *   get:
 *     summary: Get admin action logs
 *     description: Retrieve paginated admin action logs with optional filtering (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *       - $ref: '#/components/parameters/ActionQuery'
 *     responses:
 *       200:
 *         description: Admin logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LogsResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         description: Internal server error
 */