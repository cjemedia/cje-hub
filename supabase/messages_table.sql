-- Messages table for client-admin chat
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'admin')),
  sender_id UUID,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_client_id ON messages(client_id);
CREATE INDEX IF NOT EXISTS idx_messages_project_id ON messages(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Clients can view their own messages
CREATE POLICY "Clients can view own messages"
  ON messages FOR SELECT
  USING (auth.uid() = client_id);

-- RLS Policy: Clients can create messages for themselves
CREATE POLICY "Clients can create own messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = client_id AND sender_type = 'client');

-- RLS Policy: Admins can view all messages
CREATE POLICY "Admins can view all messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = auth.uid()
      AND clients.role = 'admin'
    )
  );

-- RLS Policy: Admins can create messages
CREATE POLICY "Admins can create messages"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = auth.uid()
      AND clients.role = 'admin'
    )
  );

-- RLS Policy: Clients can update read status of their messages
CREATE POLICY "Clients can update own messages"
  ON messages FOR UPDATE
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

