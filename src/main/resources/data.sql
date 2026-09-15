-- Jeu de données de démonstration ShopNow (H2).
-- L'identifiant 382 est volontaire : il est utilisé par le test Selenium du TP
-- (donnée de test stable, cf. data-testid "produit-382").
INSERT INTO produit (id, nom, description, categorie, prix) VALUES
  (101, 'Clavier mécanique RGB', 'Clavier mécanique rétroéclairé, switches rouges', 'Informatique', 79.90),
  (102, 'Souris sans fil', 'Souris optique sans fil, 1600 DPI', 'Informatique', 29.50),
  (103, 'Écran 24 pouces', 'Moniteur Full HD 1920x1080, HDMI', 'Informatique', 139.00),
  (150, 'Casque circum-aural', 'Casque audio à réduction de bruit passive', 'Audio', 59.90),
  (151, 'Enceinte Bluetooth', 'Enceinte portable étanche, 10 h d''autonomie', 'Audio', 49.99),
  (200, 'T-shirt coton', 'T-shirt coton bio, coupe classique', 'Mode', 19.90),
  (201, 'Sac à dos urbain', 'Sac 20 L, compartiment ordinateur 15 pouces', 'Mode', 45.00),
  (300, 'Montre connectée', 'Montre étanche, suivi d''activité et cardio', 'Sport', 119.00),
  (301, 'Bouteille isotherme', 'Bouteille inox 750 ml, 24 h froid', 'Sport', 24.90),
  (382, 'Casque gaming Bluetooth', 'Casque gaming sans fil, micro détachable, 7.1', 'Audio', 89.99),
  (400, 'Lampe de bureau LED', 'Lampe LED dimmable, bras articulé', 'Maison', 34.50),
  (401, 'Cafetière filtre', 'Cafetière 1,2 L, arrêt automatique', 'Maison', 39.90);
