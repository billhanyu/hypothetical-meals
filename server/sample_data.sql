INSERT INTO Users (id, username, name, hash, salt, user_group) VALUES (1, 'BillSucks123', 'Bill', 'hash', 'salt', 'admin');
INSERT INTO Users (id, username, name, hash, salt, user_group) VALUES (2, 'EricIsTheBest1', 'Eric', 'hash', 'salt', 'noob');
INSERT INTO Users (id, username, name, hash, salt, user_group) VALUES (3, 'username123', 'mike wazowski', '1c09747a4c8668e62150217cb2a907ffb0c87f0095b024f2ee0a0fb8976c9ecb91c52acc045eab6c53a1b10802b0d7737d65cdceab5b1f4ad1e4113fc4d420d0b2a8c93972bad067c593ce1bc559bc3f4325ec6462fe08cdbd856f169b6087fcafa09da29c62ad759407e9108e824100e6387b868045fc2957a1ccaeb2b2b50ed4d48bdd4ffcf2388e084f92865bdae59dc400f731b629cb2243c3dfa086810b0ea43c9f07c90e5573a0de31be2c4086531c1286dc0ed5e6a2da046b56938387f0d339256af7c003afd65fb15b4c303d22a54baf1dd0889583f6b8c0e47037bc2c783eb048b2f336c38951627907d6dfd1aa4f4f4b59c167dcf7187fb7a8665919d59d2addf0fa41732aa79d78533a5da185b4038a5bf71cb9b45c106457b301601580abc8066634e017ca33c37fb15638001b3572e8bc21ddcc5543d60a30bb1e5aabd8d8f77ec6e0ef6df7c71d79c50ab678f87c38c20a4955636c0ba1dd89be102ba525812ccbc85041e9636af4a8a752e87af272534e9a04d22ac49416635a08ef5aba4ba0eca5c2e7cb460871723a3455f1ca62171c17e55353d7de5b67ce3fa85a2c44f4ed2c261a3a5e9259f687de49540d8ec6967a4ccf74e27cdbd040f6a256374c7d1685bf476cf3265b870a3cc9e7e9f6f3178de3373881cce83df0d2d6184e1b2219c7c10ab49736f740f3867e83a2fd5a619cdf1102d6c06286',
 '9c44e56204c85aac6fda8de3a63f8a53', 'admin');
INSERT INTO Vendors (id, name, contact, code) VALUES (1, 'Duke', 'contact', 'code_duke');
INSERT INTO Vendors (id, name, contact, code) VALUES (2, 'UNC', 'contact', 'code_unc');
INSERT INTO Storages (id, name, capacity) VALUES (1, 'freezer', 20);
INSERT INTO Storages (id, name, capacity) VALUES (2, 'refrigerator', 20);
INSERT INTO Ingredients (id, name, storage_id) VALUES (1, 'poop', 1);
INSERT INTO Ingredients (id, name, storage_id) VALUES (2, 'beans', 1);
INSERT INTO Ingredients (id, name, storage_id) VALUES (3, 'boop', 1);
INSERT INTO VendorsIngredients (id, ingredient_id, package_type, price, vendor_id) VALUES (1, 1, 'sack', 10, 1);
INSERT INTO VendorsIngredients (id, ingredient_id, package_type, price, vendor_id) VALUES (2, 2, 'pail', 20, 1);
INSERT INTO VendorsIngredients (id, ingredient_id, package_type, price, vendor_id) VALUES (3, 3, 'pail', 30, 1);
INSERT INTO Inventories (id, ingredient_id, storage_weight, total_weight) VALUES(1, 1, 5, 10);
INSERT INTO Inventories (id, ingredient_id, storage_weight, total_weight) VALUES (2, 2, 15, 20);
INSERT INTO Logs (id, user_id, vendor_ingredient_id, quantity) VALUES (1, 1, 1, 18);
INSERT INTO Logs (id, user_id, vendor_ingredient_id, quantity) VALUES (2, 1, 3, 5);
INSERT INTO SpendingLogs (id, ingredient_id, total, consumed) VALUES (1, 1, 100, 50);
