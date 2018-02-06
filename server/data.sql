/* Passwords: "a" */
INSERT INTO Users (id, username, name, hash, salt, user_group) VALUES (1, 'noob', 'noob', 'b0492f478346a52b26a69ff17efd0dd3ad7c7eb16376fa32eef92ba7e58786ebd7d0632055b33b514cc484907c15b7b76f9f0d3ff1dde006206499e0daa01780a0273bf51fb4bce9920c5c86c8b267f5b5683ab372b6bd7346664f4ddee9a686281c23e4845794d10657e841be01ad60b467fa213ee674a29a0feac4d22956d83d0116611f7d0bbd277c023469e5800e75e980f9b00404c9120acfdc11443e60f58ca7849e0098976adaf52f8235ac0bd771814ede52d52f9c7994c0e14ca735730b0209462fa4320d2e986de2d741bdd9b5b06d8b325c8ae9f9d1c4df1e4086bfb986fb8c952be67645b1fd7f99b40e82ba8f6a04fdf73045c164969ce33d87ad2e05f1930e24d081b79572c3662b818d966ca50eb693ab631f88d07ea038afa0a163e497c3af3f789a7fd0458bcd94fc4ad5e26edcde63250ee0b7eb3d516f45d69f82c84aa0efed11fe7891c434dacbd8a0576f7a8660aa728e595e4066c5515728ba3edd5f9124d4483074956c788ce20ef43b5b6785569055522ac7e6696c0c424b782c4845894c754e7a0d1072f9b34a50bd5fa161dbcbf2e236641c91bba2c8824c9435b45619c9634cbad28fcfdae789360efbf2ec941be7812c8d35123394e2348fad4eb0726e8983cc3f6fab075102e566e12f35d1ce1af0388e4103f0b42c1ad43070d30c22ebbc038d4a9bd89dc129b5e296237405c035367d55',
 '6bf38f50cab9976a94623b74860613e9', 'noob');
INSERT INTO Users (id, username, name, hash, salt, user_group) VALUES (2, 'admin', 'admin', 'b0492f478346a52b26a69ff17efd0dd3ad7c7eb16376fa32eef92ba7e58786ebd7d0632055b33b514cc484907c15b7b76f9f0d3ff1dde006206499e0daa01780a0273bf51fb4bce9920c5c86c8b267f5b5683ab372b6bd7346664f4ddee9a686281c23e4845794d10657e841be01ad60b467fa213ee674a29a0feac4d22956d83d0116611f7d0bbd277c023469e5800e75e980f9b00404c9120acfdc11443e60f58ca7849e0098976adaf52f8235ac0bd771814ede52d52f9c7994c0e14ca735730b0209462fa4320d2e986de2d741bdd9b5b06d8b325c8ae9f9d1c4df1e4086bfb986fb8c952be67645b1fd7f99b40e82ba8f6a04fdf73045c164969ce33d87ad2e05f1930e24d081b79572c3662b818d966ca50eb693ab631f88d07ea038afa0a163e497c3af3f789a7fd0458bcd94fc4ad5e26edcde63250ee0b7eb3d516f45d69f82c84aa0efed11fe7891c434dacbd8a0576f7a8660aa728e595e4066c5515728ba3edd5f9124d4483074956c788ce20ef43b5b6785569055522ac7e6696c0c424b782c4845894c754e7a0d1072f9b34a50bd5fa161dbcbf2e236641c91bba2c8824c9435b45619c9634cbad28fcfdae789360efbf2ec941be7812c8d35123394e2348fad4eb0726e8983cc3f6fab075102e566e12f35d1ce1af0388e4103f0b42c1ad43070d30c22ebbc038d4a9bd89dc129b5e296237405c035367d55',
 '6bf38f50cab9976a94623b74860613e9', 'admin');
INSERT INTO Vendors (id, name, contact, code) VALUES (1, 'Duke', '9848887838', 'code_duke');
INSERT INTO Vendors (id, name, contact, code) VALUES (2, 'UNC', '8883883888', 'code_unc');
INSERT INTO Vendors (id, name, contact, code) VALUES (3, 'Google', '8883883878', 'google');
INSERT INTO Storages (id, name, capacity) VALUES (1, 'freezer', 2000);
INSERT INTO Storages (id, name, capacity) VALUES (2, 'refrigerator', 2000);
INSERT INTO Storages (id, name, capacity) VALUES (3, 'warehouse', 2000);
INSERT INTO Ingredients (id, name, storage_id) VALUES (1, 'poop', 1);
INSERT INTO Ingredients (id, name, storage_id) VALUES (2, 'beans', 2);
INSERT INTO Ingredients (id, name, storage_id) VALUES (3, 'boop', 3);
INSERT INTO Ingredients (id, name, storage_id) VALUES (4, 'potatoes', 1);
INSERT INTO VendorsIngredients (id, ingredient_id, package_type, price, vendor_id) VALUES (1, 1, 'truckload', 1000, 2);
INSERT INTO VendorsIngredients (id, ingredient_id, package_type, price, vendor_id) VALUES (2, 1, 'truckload', 1000, 3);
INSERT INTO VendorsIngredients (id, ingredient_id, package_type, price, vendor_id) VALUES (3, 2, 'pail', 20, 1);
INSERT INTO VendorsIngredients (id, ingredient_id, package_type, price, vendor_id) VALUES (4, 3, 'drum', 30, 3);
INSERT INTO VendorsIngredients (id, ingredient_id, package_type, price, vendor_id) VALUES (5, 4, 'supersack', 50, 1);
INSERT INTO Inventories (id, ingredient_id, package_type, num_packages) VALUES(1, 1, 'truckload', 2);
INSERT INTO Inventories (id, ingredient_id, package_type, num_packages) VALUES (2, 2, 'pail', 20);
INSERT INTO Inventories (id, ingredient_id, package_type, num_packages) VALUES (3, 3, 'drum', 2);
INSERT INTO Logs (id, user_id, vendor_ingredient_id, quantity) VALUES (1, 1, 1, 2);
INSERT INTO Logs (id, user_id, vendor_ingredient_id, quantity) VALUES (2, 1, 3, 20);
INSERT INTO Logs (id, user_id, vendor_ingredient_id, quantity) VALUES (3, 2, 4, 2);
INSERT INTO SpendingLogs (id, ingredient_id, total_weight, total, consumed) VALUES (1, 1, 100000, 2000, 0);
INSERT INTO SpendingLogs (id, ingredient_id, total_weight, total, consumed) VALUES (2, 2, 1000, 400, 0);
INSERT INTO SpendingLogs (id, ingredient_id, total_weight, total, consumed) VALUES (3, 3, 1000, 60, 0);
