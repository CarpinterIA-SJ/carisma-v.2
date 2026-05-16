-- Track when the user accepted the LGPD privacy policy and terms of use
-- at signup. Null means consent was never recorded (legacy users or seeded
-- accounts predating the LGPD flow).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS lgpd_consent_at TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.lgpd_consent_at IS
  'Timestamp when the user accepted the LGPD privacy policy and terms of use during signup. Null = consent never recorded.';
