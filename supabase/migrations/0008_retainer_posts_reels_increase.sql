-- Bumps Posts and Reels by 2 across every Digital Retainer tier.
--
-- Was Posts 8/12/16 and Reels 4/6/8 (Launch/Growth/Scale). Now 10/14/18 and
-- 6/8/10.

UPDATE pricing_features
   SET values = '{"launch":"10","growth":"14","scale":"18"}'::jsonb
 WHERE family = 'retainer'
   AND label  = 'Posts';

UPDATE pricing_features
   SET values = '{"launch":"6","growth":"8","scale":"10"}'::jsonb
 WHERE family = 'retainer'
   AND label  = 'Reels';
