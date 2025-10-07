/*
  # Fix promax_unico column type

  1. Changes
    - Change `promax_unico` column type from `smallint` to `integer` in vouchers table
    - This allows values larger than 32767 (smallint max)
    
  2. Security
    - No RLS changes needed
*/

-- Change promax_unico from smallint to integer to support larger values
ALTER TABLE vouchers ALTER COLUMN promax_unico TYPE integer;