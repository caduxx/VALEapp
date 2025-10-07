/*
  # Add IP and device tracking fields

  1. New Fields Added
    - `justified_by_ip` (text) - IP address of the device
    - `justified_by_device` (text) - Device information (user agent)
    - `justified_by_location` (text) - Geographic location if available
    - `device_type` (text) - mobile, desktop, tablet
    - `screen_resolution` (text) - Screen resolution
    - `timezone` (text) - User timezone

  2. Tables Updated
    - `vouchers` table - for active vouchers
    - `vales_justificados` table - for permanent storage

  3. Security
    - Fields are optional (nullable)
    - No sensitive data stored
    - Compliant with LGPD requirements
*/

-- Add tracking fields to vouchers table
ALTER TABLE vouchers 
ADD COLUMN IF NOT EXISTS justified_by_ip text,
ADD COLUMN IF NOT EXISTS justified_by_device text,
ADD COLUMN IF NOT EXISTS justified_by_location text,
ADD COLUMN IF NOT EXISTS device_type text,
ADD COLUMN IF NOT EXISTS screen_resolution text,
ADD COLUMN IF NOT EXISTS timezone text;

-- Add tracking fields to vales_justificados table
ALTER TABLE vales_justificados 
ADD COLUMN IF NOT EXISTS justified_by_ip text,
ADD COLUMN IF NOT EXISTS justified_by_device text,
ADD COLUMN IF NOT EXISTS justified_by_location text,
ADD COLUMN IF NOT EXISTS device_type text,
ADD COLUMN IF NOT EXISTS screen_resolution text,
ADD COLUMN IF NOT EXISTS timezone text;

-- Add indexes for better performance on tracking queries
CREATE INDEX IF NOT EXISTS idx_vouchers_justified_by_ip ON vouchers(justified_by_ip);
CREATE INDEX IF NOT EXISTS idx_vales_justificados_justified_by_ip ON vales_justificados(justified_by_ip);
CREATE INDEX IF NOT EXISTS idx_vouchers_device_type ON vouchers(device_type);
CREATE INDEX IF NOT EXISTS idx_vales_justificados_device_type ON vales_justificados(device_type);