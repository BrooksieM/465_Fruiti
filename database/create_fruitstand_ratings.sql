-- Create fruitstand_ratings table for storing ratings and reviews of fruit stands

CREATE TABLE IF NOT EXISTS fruitstand_ratings (
    id SERIAL PRIMARY KEY,
    stand_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(stand_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_fruitstand_ratings_stand_id ON fruitstand_ratings(stand_id);
CREATE INDEX IF NOT EXISTS idx_fruitstand_ratings_user_id ON fruitstand_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_fruitstand_ratings_created_at ON fruitstand_ratings(created_at DESC);

ALTER TABLE fruitstand_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view fruitstand ratings"
    ON fruitstand_ratings FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own fruitstand ratings"
    ON fruitstand_ratings FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own fruitstand ratings"
    ON fruitstand_ratings FOR UPDATE
    USING (true);

CREATE POLICY "Users can delete their own fruitstand ratings"
    ON fruitstand_ratings FOR DELETE
    USING (true);
