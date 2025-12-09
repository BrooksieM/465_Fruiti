# Recipe Rating System - Database Setup Guide

## Overview

This guide will help you set up the database table required for the recipe rating feature in your Supabase database.

---

## Database Table Required

You need to create the `recipe_ratings` table in your Supabase database.

---

## Recipe Ratings Table

### Table Name: `recipe_ratings`

```sql
CREATE TABLE recipe_ratings (
    id BIGSERIAL PRIMARY KEY,
    recipe_id BIGINT NOT NULL REFERENCES recipe_new(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(recipe_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_recipe_ratings_recipe ON recipe_ratings(recipe_id);
CREATE INDEX idx_recipe_ratings_user ON recipe_ratings(user_id);
CREATE INDEX idx_recipe_ratings_created ON recipe_ratings(created_at DESC);
```

### Column Descriptions:

- `id`: Primary key (auto-incrementing)
- `recipe_id`: References the `id` column in the `recipe_new` table (the recipe being rated)
- `user_id`: References the `id` column in the `accounts` table (the user submitting the rating)
- `rating`: Integer between 1-5 (enforced by CHECK constraint)
- `comment`: Optional text comment/review
- `created_at`: Timestamp when the rating was created
- `updated_at`: Timestamp when the rating was last updated
- `UNIQUE(recipe_id, user_id)`: Ensures one rating per user per recipe (users can update their ratings)

### Indexes:

Three indexes are created to optimize query performance:
1. `idx_recipe_ratings_recipe`: Speeds up queries that fetch all ratings for a specific recipe
2. `idx_recipe_ratings_user`: Speeds up queries that fetch all ratings by a specific user
3. `idx_recipe_ratings_created`: Speeds up sorting ratings by creation date

---

## How to Create the Table in Supabase

1. Go to your Supabase project dashboard at [https://app.supabase.com](https://app.supabase.com)
2. Click on **"SQL Editor"** in the left sidebar
3. Click **"New Query"**
4. Copy and paste the SQL code above (including the indexes)
5. Click **"Run"** to execute the query

You should see a success message indicating that the table and indexes were created.

---

## Row Level Security (RLS) Policies (Optional but Recommended)

For added security, you can enable Row Level Security and create policies to control access to ratings:

```sql
-- Enable RLS on the table
ALTER TABLE recipe_ratings ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can view ratings
CREATE POLICY "Anyone can view recipe ratings"
ON recipe_ratings FOR SELECT
USING (true);

-- Policy 2: Authenticated users can insert ratings
CREATE POLICY "Authenticated users can insert recipe ratings"
ON recipe_ratings FOR INSERT
WITH CHECK (auth.uid()::bigint = user_id);

-- Policy 3: Users can update their own ratings
CREATE POLICY "Users can update their own recipe ratings"
ON recipe_ratings FOR UPDATE
USING (auth.uid()::bigint = user_id)
WITH CHECK (auth.uid()::bigint = user_id);

-- Policy 4: Users can delete their own ratings
CREATE POLICY "Users can delete their own recipe ratings"
ON recipe_ratings FOR DELETE
USING (auth.uid()::bigint = user_id);
```

### RLS Policy Explanations:

1. **SELECT Policy**: Allows anyone (authenticated or not) to read ratings
2. **INSERT Policy**: Only allows authenticated users to create ratings for themselves
3. **UPDATE Policy**: Users can only update their own ratings
4. **DELETE Policy**: Users can only delete their own ratings

---

## Verification

After creating the table, verify it was created successfully by running this query:

```sql
SELECT * FROM recipe_ratings LIMIT 1;
```

This should return 0 rows (since the table is empty) but no errors. If you see an error, double-check that the table was created correctly.

---

## Testing the Recipe Rating Feature

1. **Navigate to the Recipe Page**
   - Go to your application and click on "Recipes" in the navigation

2. **View Recipe Cards**
   - Each recipe card should display either:
     - Star rating with average score and count (e.g., "4.5 (12)")
     - "No ratings yet" if the recipe has no ratings

3. **Open Recipe Detail Modal**
   - Click on any recipe card to open the detail modal
   - The modal should display:
     - Average rating with stars
     - Total number of ratings
     - List of recent ratings with comments (up to 5 most recent)
     - Rating submission form (if logged in and not viewing your own recipe)

4. **Submit a Test Rating**
   - Make sure you're logged in
   - Open a recipe that you didn't create
   - Select a star rating (1-5 stars)
   - Optionally add a comment
   - Click "Submit Rating"
   - The page will reload and your rating should appear

5. **Update Your Rating**
   - If you submit another rating for the same recipe, it will update your previous rating
   - The page will reload to show the updated rating

---

## Features Implemented

### ✅ Backend API Endpoints

- `POST /api/recipes/:recipeId/rating` - Submit or update a recipe rating
- `GET /api/recipes/:recipeId/ratings` - Fetch all ratings for a recipe

### ✅ Frontend Components

- **Recipe Cards**: Display average rating and count on each recipe card
- **Recipe Modal**: Full rating display with:
  - Average rating summary
  - List of ratings with user comments
  - Interactive star rating input
  - Comment text area
  - Submit button
- **Star Display**: Visual star ratings (filled, half-filled, and empty stars)

### ✅ Business Logic

- **One Rating Per User**: Each user can only have one rating per recipe (enforced by database UNIQUE constraint)
- **Rating Updates**: Users can update their existing ratings
- **Owner Restriction**: Users cannot rate their own recipes
- **Authentication Required**: Must be logged in to submit ratings
- **Validation**: Rating must be between 1-5 stars

### ✅ User Experience

- **Visual Feedback**: Hover effects on star buttons
- **Clear Messaging**:
  - Login prompt for non-authenticated users
  - Message indicating users can't rate their own recipes
- **Success/Error Notifications**: Alert messages for rating submissions
- **Relative Date Display**: Shows "Today", "Yesterday", "X days ago", etc.
- **Rating Statistics**: Shows average rating rounded to 1 decimal place

---

## API Endpoints Documentation

### Submit/Update Recipe Rating

**Endpoint:** `POST /api/recipes/:recipeId/rating`

**Request Body:**
```json
{
  "rating": 5,
  "user_id": 123,
  "comment": "This recipe is amazing!"
}
```

**Response (Success):**
```json
{
  "message": "Rating submitted successfully",
  "rating": {
    "id": 1,
    "recipe_id": 42,
    "user_id": 123,
    "rating": 5,
    "comment": "This recipe is amazing!",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
- `400`: Invalid recipe ID, missing fields, or invalid rating value
- `403`: User attempting to rate their own recipe
- `404`: Recipe not found
- `500`: Internal server error

### Get Recipe Ratings

**Endpoint:** `GET /api/recipes/:recipeId/ratings`

**Response:**
```json
{
  "ratings": [
    {
      "id": 1,
      "recipe_id": 42,
      "user_id": 123,
      "user_handle": "johndoe",
      "rating": 5,
      "comment": "This recipe is amazing!",
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:30:00Z"
    }
  ],
  "averageRating": 4.5,
  "totalRatings": 12
}
```

---

## Troubleshooting

### Issue: "Table does not exist" error

**Solution:** Make sure you ran the CREATE TABLE SQL statement in Supabase SQL Editor and it executed successfully.

### Issue: Ratings not appearing on recipe cards

**Solution:**
1. Check browser console for any JavaScript errors
2. Verify the API endpoint `/api/recipes/:recipeId/ratings` is returning data
3. Make sure `ratingService.js` is loaded before `recipe.js` in the HTML

### Issue: "You cannot rate your own recipe" message appears incorrectly

**Solution:**
1. Clear browser localStorage and log in again
2. Check that `user_id` in localStorage matches the `user_id` in the database

### Issue: Ratings not saving

**Solution:**
1. Check browser console for error messages
2. Verify user is logged in (check localStorage for 'user' object)
3. Make sure the `recipe_ratings` table exists in your database
4. Check that the foreign key constraints are set up correctly

---

## Next Steps

After setting up the rating system for recipes, you can:

1. **Test thoroughly**: Try rating multiple recipes with different user accounts
2. **Add sorting**: Sort recipes by rating on the recipe page
3. **Add filtering**: Filter recipes by minimum rating
4. **Add analytics**: Track which recipes have the highest ratings
5. **Implement fruit stand ratings**: Use the same pattern to add ratings for fruit stands

---

## Need Help?

If you encounter any issues during setup:

1. Check the browser console for JavaScript errors
2. Check the Network tab in DevTools to see API responses
3. Review the Supabase logs for database errors
4. Verify all file paths are correct in the HTML includes

---

## Summary

You've successfully implemented a complete rating system for recipes! Users can now:

- ⭐ View average ratings on recipe cards
- 📊 See detailed rating statistics in recipe modals
- ✍️ Submit ratings with optional comments
- 🔄 Update their existing ratings
- 👀 Read other users' reviews

The system is built with proper database constraints, authentication checks, and a clean, responsive UI.
