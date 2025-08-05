-- Verify and fix database constraints for bi-weekly frequency

-- Check current table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_preferences' AND column_name = 'frequency';

-- Check current constraints
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'user_preferences'::regclass;

-- Drop existing constraint if it exists
ALTER TABLE user_preferences DROP CONSTRAINT IF EXISTS user_preferences_frequency_check;

-- Add the correct constraint
ALTER TABLE user_preferences ADD CONSTRAINT user_preferences_frequency_check 
CHECK (frequency IN ('daily', 'weekly', 'biweekly'));

-- Verify the constraint was added
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'user_preferences'::regclass AND conname = 'user_preferences_frequency_check';

-- Test the constraint with valid values
INSERT INTO user_preferences (user_id, categories, frequency, email) 
VALUES ('00000000-0000-0000-0000-000000000000', ARRAY['test'], 'biweekly', 'test@example.com')
ON CONFLICT (user_id) DO NOTHING;

-- Clean up test data
DELETE FROM user_preferences WHERE user_id = '00000000-0000-0000-0000-000000000000';

-- Show final table structure
\d user_preferences; 