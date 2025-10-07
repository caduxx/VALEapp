/*
  # Fix Qtde_Diferença constraint

  1. Changes
    - Remove restrictive check constraint on Qtde_Diferença
    - Allow values from 0 to 9999 instead of 1 to 999
    - Handle negative differences and larger quantities

  2. Security
    - Maintain data integrity with reasonable limits
    - Allow zero and negative values for corrections
*/

-- Remove the existing restrictive constraint
ALTER TABLE vouchers DROP CONSTRAINT IF EXISTS vouchers_qtde_diferenca_check;

-- Add a more flexible constraint that allows:
-- - Zero values (for corrections)
-- - Negative values (for returns/adjustments) 
-- - Larger positive values (up to 9999)
ALTER TABLE vouchers ADD CONSTRAINT vouchers_qtde_diferenca_check 
  CHECK (("Qtde_Diferença" >= -9999) AND ("Qtde_Diferença" <= 9999));

-- Update any existing records that might have NULL values
UPDATE vouchers 
SET "Qtde_Diferença" = 1 
WHERE "Qtde_Diferença" IS NULL;