INSERT INTO Users (id, username, oauth, name, hash, salt, user_group) VALUES (1, 'bill', 0, 'Bill', 'hash', 'salt', 'admin');
INSERT INTO Users (id, username, oauth, name, hash, salt, user_group) VALUES (2, 'eri101', 0, 'Eric', 'hash', 'salt', 'noob');
/* Password for the following two users is: "a" */
INSERT INTO Users (id, username, oauth, name, hash, salt, user_group) VALUES (3, 'admin', 0, 'mike krzyzewski', '07784ccf56ce9d8740bf3598f682c30d848c6bbcf874861ea943a86cf3f5b8d79c34007cb172c9b53b1b8947ad891bcac8872a9adebe061e1a8291297e5b9536f5f1b4e6e3a6d7211387411e9b6ad90ca1e682bcd4e49231c71b15b8983c87bafa4e5a4a53a576aeec8721414474bd9839d9dee659ca2bc4fa240b7dd240ddd1abb6e9947530a9207d46a9595a11c7327933c306b1555f200635333705214b937601cc886b301f019951e26979026cc2bfdaa486e51abdbccdc545303c033f2a0d8074dfebb32da77cd748e27bf4c4fc3a596ce0094894fe6f4ae5b2a20a2409b842ed88e26f15294f8af43e0b4c2ebf12f06cf7e9121694675a71dc1d838f584c96373355fbbdc13c144e811daa125511568967cee529c3be8c80f6ef9522ebaccf572b0cd7b860c4ffe56a6cca87628e7b6be4745cf0baba82456eddc76d46a091611537b79c1d575935bf1ad0c59b694cd5281477867ec8232710849e038ab16f8c767bc93b05323bee37195331df8385f55531ada3c698fbdc1be62eb093c1be261e0f1cd5f51fc94de4e64530a9580febad4f4dd16a243dc2867a79dede712c1421188d3f6ae00b623c2ab03cce248fd29f9309c849cc87d08210dde2b7cd3c706b5fb88498cc29b24b1b4e625bb73f3bfe29b38f2a957035bb20486e19cc17a77adee024733778422130a19809f260f571fc382ec37d6aea86cf722809',
 '8279215f80da2a516d1917c72faf8d23', 'admin');
INSERT INTO Users (id, username, oauth, name, hash, salt, user_group) VALUES (4, 'noob', 0, 'mike wazowski', '07784ccf56ce9d8740bf3598f682c30d848c6bbcf874861ea943a86cf3f5b8d79c34007cb172c9b53b1b8947ad891bcac8872a9adebe061e1a8291297e5b9536f5f1b4e6e3a6d7211387411e9b6ad90ca1e682bcd4e49231c71b15b8983c87bafa4e5a4a53a576aeec8721414474bd9839d9dee659ca2bc4fa240b7dd240ddd1abb6e9947530a9207d46a9595a11c7327933c306b1555f200635333705214b937601cc886b301f019951e26979026cc2bfdaa486e51abdbccdc545303c033f2a0d8074dfebb32da77cd748e27bf4c4fc3a596ce0094894fe6f4ae5b2a20a2409b842ed88e26f15294f8af43e0b4c2ebf12f06cf7e9121694675a71dc1d838f584c96373355fbbdc13c144e811daa125511568967cee529c3be8c80f6ef9522ebaccf572b0cd7b860c4ffe56a6cca87628e7b6be4745cf0baba82456eddc76d46a091611537b79c1d575935bf1ad0c59b694cd5281477867ec8232710849e038ab16f8c767bc93b05323bee37195331df8385f55531ada3c698fbdc1be62eb093c1be261e0f1cd5f51fc94de4e64530a9580febad4f4dd16a243dc2867a79dede712c1421188d3f6ae00b623c2ab03cce248fd29f9309c849cc87d08210dde2b7cd3c706b5fb88498cc29b24b1b4e625bb73f3bfe29b38f2a957035bb20486e19cc17a77adee024733778422130a19809f260f571fc382ec37d6aea86cf722809',
 '8279215f80da2a516d1917c72faf8d23', 'noob');
INSERT INTO Users (id, username, oauth, name, user_group) VALUES (5, 'eri101', 1, 'Eric Song', 'noob');
INSERT INTO Users (id, username, oauth, name, hash, salt, user_group) VALUES (6, 'christine', 0, 'Christine Zhou', '07784ccf56ce9d8740bf3598f682c30d848c6bbcf874861ea943a86cf3f5b8d79c34007cb172c9b53b1b8947ad891bcac8872a9adebe061e1a8291297e5b9536f5f1b4e6e3a6d7211387411e9b6ad90ca1e682bcd4e49231c71b15b8983c87bafa4e5a4a53a576aeec8721414474bd9839d9dee659ca2bc4fa240b7dd240ddd1abb6e9947530a9207d46a9595a11c7327933c306b1555f200635333705214b937601cc886b301f019951e26979026cc2bfdaa486e51abdbccdc545303c033f2a0d8074dfebb32da77cd748e27bf4c4fc3a596ce0094894fe6f4ae5b2a20a2409b842ed88e26f15294f8af43e0b4c2ebf12f06cf7e9121694675a71dc1d838f584c96373355fbbdc13c144e811daa125511568967cee529c3be8c80f6ef9522ebaccf572b0cd7b860c4ffe56a6cca87628e7b6be4745cf0baba82456eddc76d46a091611537b79c1d575935bf1ad0c59b694cd5281477867ec8232710849e038ab16f8c767bc93b05323bee37195331df8385f55531ada3c698fbdc1be62eb093c1be261e0f1cd5f51fc94de4e64530a9580febad4f4dd16a243dc2867a79dede712c1421188d3f6ae00b623c2ab03cce248fd29f9309c849cc87d08210dde2b7cd3c706b5fb88498cc29b24b1b4e625bb73f3bfe29b38f2a957035bb20486e19cc17a77adee024733778422130a19809f260f571fc382ec37d6aea86cf722809',
 '8279215f80da2a516d1917c72faf8d23', 'manager');
INSERT INTO Vendors (id, name, contact, code) VALUES (1, 'Duke', 'contact', 'code_duke');
INSERT INTO Vendors (id, name, contact, code) VALUES (2, 'UNC', 'contact', 'code_unc');
INSERT INTO Storages (id, name, capacity) VALUES (1, 'freezer', 2000);
INSERT INTO Storages (id, name, capacity) VALUES (2, 'refrigerator', 20);
INSERT INTO Storages (id, name, capacity) VALUES (3, 'warehouse', 500);
INSERT INTO Ingredients (id, name, storage_id, native_unit) VALUES (1, 'poop', 1, 'pounds');
INSERT INTO Ingredients (id, name, storage_id, native_unit) VALUES (2, 'beans', 1, 'pounds');
INSERT INTO Ingredients (id, name, storage_id, native_unit) VALUES (3, 'boop', 1, 'kg');
INSERT INTO Ingredients (id, name, storage_id, native_unit) VALUES (4, 'loop', 2, 'g');
INSERT INTO VendorsIngredients (id, ingredient_id, package_type, num_native_units, price, vendor_id) VALUES (1, 1, 'sack', 10, 10, 1);
INSERT INTO VendorsIngredients (id, ingredient_id, package_type, num_native_units, price, vendor_id) VALUES (2, 2, 'pail', 15, 20, 1);
INSERT INTO VendorsIngredients (id, ingredient_id, package_type, num_native_units, price, vendor_id) VALUES (3, 3, 'pail', 20, 30, 1);
INSERT INTO VendorsIngredients (id, ingredient_id, package_type, num_native_units, price, vendor_id) VALUES (4, 4, 'sack', 35, 30, 2);
INSERT INTO Inventories (id, ingredient_id, package_type, num_packages) VALUES(1, 1, 'sack', 10);
INSERT INTO Inventories (id, ingredient_id, package_type, num_packages) VALUES (2, 2, 'sack', 20);
INSERT INTO Inventories (id, ingredient_id, package_type, num_packages) VALUES (3, 2, 'truckload', 2);
INSERT INTO Logs (id, user_id, vendor_ingredient_id, quantity) VALUES (1, 1, 1, 18);
INSERT INTO Logs (id, user_id, vendor_ingredient_id, quantity) VALUES (2, 1, 3, 5);
INSERT INTO SpendingLogs (id, ingredient_id, total_weight, total, consumed) VALUES (1, 1, 500, 5000, 50);
INSERT INTO Formulas (id, name, description, num_product) VALUES (1, 'cake', 'A simple cake', 1);
INSERT INTO Formulas (id, name, description, num_product) VALUES (2, 'shit', 'just shit', 10);
INSERT INTO FormulaEntries (id, ingredient_id, num_native_units, formula_id) VALUES (1, 3, 1, 1);
INSERT INTO FormulaEntries (id, ingredient_id, num_native_units, formula_id) VALUES (2, 4, 2, 1);
INSERT INTO FormulaEntries (id, ingredient_id, num_native_units, formula_id) VALUES (3, 1, 3, 2);
INSERT INTO FormulaEntries (id, ingredient_id, num_native_units, formula_id) VALUES (4, 2, 4, 2);