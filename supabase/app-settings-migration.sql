-- ============================================================
-- App Settings Table
-- Stores editable configuration (like the Airbnb portal password)
-- so admins can update values from the UI without redeploying.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid REFERENCES public.users(id)
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Admins can read & write all settings
DROP POLICY IF EXISTS "Admins can manage app settings" ON public.app_settings;
CREATE POLICY "Admins can manage app settings"
  ON public.app_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Seed initial password (change 'spring2026' if your env var has a different value)
INSERT INTO public.app_settings (key, value)
VALUES ('airbnb_marketing_password', 'spring2026')
ON CONFLICT (key) DO NOTHING;
