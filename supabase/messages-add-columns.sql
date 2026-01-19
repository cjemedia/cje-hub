-- Add deleted_at and edited_at columns to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE;

-- Create index for deleted_at to improve query performance
CREATE INDEX IF NOT EXISTS idx_messages_deleted_at ON messages(deleted_at) WHERE deleted_at IS NULL;
