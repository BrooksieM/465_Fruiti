/**
 * @swagger
 * components:
 *   schemas:
 *     SubscriptionPlan:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - duration
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID of the subscription plan
 *         name:
 *           type: string
 *           description: Name of the subscription plan
 *         price:
 *           type: number
 *           format: float
 *           description: Monthly price in dollars
 *         duration:
 *           type: string
 *           description: Duration of the subscription (e.g., "monthly", "yearly")
 *         description:
 *           type: string
 *           description: Description of the plan features
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
 *     SubscriptionCreate:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - duration
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the subscription plan
 *         price:
 *           type: number
 *           format: float
 *           description: Monthly price in dollars
 *         duration:
 *           type: string
 *           description: Duration of the subscription
 *         description:
 *           type: string
 *           description: Description of the plan features
 * 
 *     SubscriptionUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Updated name of the subscription plan
 *         price:
 *           type: number
 *           format: float
 *           description: Updated monthly price
 *         duration:
 *           type: string
 *           description: Updated duration
 *         description:
 *           type: string
 *           description: Updated description
 * 
 *     SellerApplication:
 *       type: object
 *       required:
 *         - userId
 *         - businessName
 *         - businessType
 *         - subscriptionPlanId
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID of the application
 *         user_id:
 *           type: integer
 *           description: ID of the user applying
 *         business_name:
 *           type: string
 *           description: Name of the business
 *         business_type:
 *           type: string
 *           description: Type of business (e.g., "fruit_stand", "farm", "distributor")
 *         description:
 *           type: string
 *           description: Business description
 *         subscription_plan_id:
 *           type: integer
 *           description: ID of the selected subscription plan
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           description: Application status
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 * 
 *     SellerPayment:
 *       type: object
 *       required:
 *         - applicationId
 *         - paymentMethod
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID of the payment record
 *         application_id:
 *           type: integer
 *           description: ID of the seller application
 *         payment_method:
 *           type: string
 *           description: Payment method (e.g., "credit_card", "paypal", "bank_transfer")
 *         payment_details:
 *           type: object
 *           description: Payment method details
 *         status:
 *           type: string
 *           enum: [pending, completed, failed]
 *           description: Payment status
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 * 
 *     SubscriptionsResponse:
 *       type: object
 *       properties:
 *         count:
 *           type: integer
 *           description: Number of subscription plans
 *         subscriptions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SubscriptionPlan'
 * 
 *     SubscriptionResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         plan:
 *           $ref: '#/components/schemas/SubscriptionPlan'
 * 
 *     ApplicationResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         application:
 *           $ref: '#/components/schemas/SellerApplication'
 * 
 *     PaymentResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         payment:
 *           $ref: '#/components/schemas/SellerPayment'
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
 *     SubscriptionIdPath:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: integer
 *       description: Subscription plan ID
 * 
 *   responses:
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
 *   - name: Seller Subscriptions
 *     description: Subscription plan management for sellers
 *   - name: Seller Applications
 *     description: Seller application management
 *   - name: Seller Payments
 *     description: Payment processing for seller applications
 */

/**
 * @swagger
 * /api/seller_subscriptions:
 *   get:
 *     summary: Get all subscription plans
 *     description: Retrieve a list of all available seller subscription plans, ordered by price
 *     tags: [Seller Subscriptions]
 *     responses:
 *       200:
 *         description: Subscription plans retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionsResponse'
 *             examples:
 *               subscriptionPlans:
 *                 value:
 *                   count: 3
 *                   subscriptions:
 *                     - id: 1
 *                       name: "Basic Seller"
 *                       price: 19.99
 *                       duration: "monthly"
 *                       description: "Basic features for small fruit stands"
 *                       created_at: "2023-10-01T10:00:00Z"
 *                       updated_at: null
 *                     - id: 2
 *                       name: "Pro Seller"
 *                       price: 49.99
 *                       duration: "monthly"
 *                       description: "Advanced features for established businesses"
 *                       created_at: "2023-10-01T10:00:00Z"
 *                       updated_at: "2023-10-15T14:30:00Z"
 *                     - id: 3
 *                       name: "Enterprise"
 *                       price: 99.99
 *                       duration: "monthly"
 *                       description: "Full features for large distributors"
 *                       created_at: "2023-10-01T10:00:00Z"
 *                       updated_at: null
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/seller_subscriptions/{id}:
 *   get:
 *     summary: Get subscription plan by ID
 *     description: Retrieve detailed information about a specific subscription plan
 *     tags: [Seller Subscriptions]
 *     parameters:
 *       - $ref: '#/components/parameters/SubscriptionIdPath'
 *     responses:
 *       200:
 *         description: Subscription plan retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/seller_subscriptions:
 *   post:
 *     summary: Create a new subscription plan
 *     description: Create a new seller subscription plan (Admin only)
 *     tags: [Seller Subscriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubscriptionCreate'
 *           examples:
 *             basicPlan:
 *               summary: Basic Seller Plan
 *               value:
 *                 name: "Starter Seller"
 *                 price: 14.99
 *                 duration: "monthly"
 *                 description: "Perfect for new fruit vendors"
 *     responses:
 *       201:
 *         description: Subscription plan created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/seller_subscriptions/{id}:
 *   put:
 *     summary: Update subscription plan
 *     description: Update an existing subscription plan (Admin only)
 *     tags: [Seller Subscriptions]
 *     parameters:
 *       - $ref: '#/components/parameters/SubscriptionIdPath'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubscriptionUpdate'
 *     responses:
 *       200:
 *         description: Subscription plan updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/seller_subscriptions/{id}:
 *   delete:
 *     summary: Delete subscription plan
 *     description: Delete a subscription plan (Admin only)
 *     tags: [Seller Subscriptions]
 *     parameters:
 *       - $ref: '#/components/parameters/SubscriptionIdPath'
 *     responses:
 *       200:
 *         description: Subscription plan deleted successfully
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
 * /api/seller_applications:
 *   post:
 *     summary: Submit seller application
 *     description: Submit a new seller application with business information and subscription selection
 *     tags: [Seller Applications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - businessName
 *               - businessType
 *               - subscriptionPlanId
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user applying
 *               businessName:
 *                 type: string
 *                 description: Name of the business
 *               businessType:
 *                 type: string
 *                 description: Type of business
 *               description:
 *                 type: string
 *                 description: Business description
 *               subscriptionPlanId:
 *                 type: integer
 *                 description: Selected subscription plan ID
 *           examples:
 *             fruitStandApp:
 *               summary: Fruit Stand Application
 *               value:
 *                 userId: 123
 *                 businessName: "Sunny Day Fruit Stand"
 *                 businessType: "fruit_stand"
 *                 description: "Family-owned fruit stand selling fresh local produce"
 *                 subscriptionPlanId: 1
 *     responses:
 *       201:
 *         description: Seller application submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/seller_application:
 *   get:
 *     summary: Get seller application page
 *     description: Retrieve seller application page information and instructions
 *     tags: [Seller Applications]
 *     responses:
 *       200:
 *         description: Application page information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 instructions:
 *                   type: string
 */

/**
 * @swagger
 * /api/seller_payments:
 *   post:
 *     summary: Submit payment information
 *     description: Submit payment information for a seller application
 *     tags: [Seller Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - applicationId
 *               - paymentMethod
 *             properties:
 *               applicationId:
 *                 type: integer
 *                 description: ID of the seller application
 *               paymentMethod:
 *                 type: string
 *                 description: Payment method type
 *               paymentDetails:
 *                 type: object
 *                 description: Payment method specific details
 *           examples:
 *             creditCardPayment:
 *               summary: Credit Card Payment
 *               value:
 *                 applicationId: 456
 *                 paymentMethod: "credit_card"
 *                 paymentDetails:
 *                   cardNumber: "**** **** **** 1234"
 *                   expiryDate: "12/25"
 *                   cardholderName: "John Doe"
 *     responses:
 *       201:
 *         description: Payment information submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/seller_payment:
 *   get:
 *     summary: Get payment page
 *     description: Retrieve payment page information and instructions
 *     tags: [Seller Payments]
 *     responses:
 *       200:
 *         description: Payment page information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 instructions:
 *                   type: string
 */