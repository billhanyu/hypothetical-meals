DROP TABLE IF EXISTS ProductRunsEntries;
DROP TABLE IF EXISTS ProductRuns;
DROP TABLE IF EXISTS SystemLogs;
DROP TABLE IF EXISTS ProductionLogs;
DROP TABLE IF EXISTS FormulaEntries;
DROP TABLE IF EXISTS Formulas;
DROP TABLE IF EXISTS SpendingLogs;
DROP TABLE IF EXISTS Logs;
DROP TABLE IF EXISTS Inventories;
DROP TABLE IF EXISTS VendorsIngredients;
DROP TABLE IF EXISTS Ingredients;
DROP TABLE IF EXISTS Storages;
DROP TABLE IF EXISTS Vendors;
DROP TABLE IF EXISTS Users;

CREATE TABLE Users(
	id int not null AUTO_INCREMENT,
	username varchar(70) not null,
	oauth BIT DEFAULT 0 not null,
	name varchar(70) not null,
	hash text(1024), 
	salt character(32), 
	user_group enum('admin', 'manager', 'noob') not null,
	removed BIT DEFAULT 0,

	PRIMARY KEY (id),
	UNIQUE (username, oauth)
);

CREATE TABLE Vendors(
	id int not null AUTO_INCREMENT,
	name varchar(70) not null UNIQUE,
	contact varchar(255) not null,
	code varchar(255) not null UNIQUE,
	removed BIT DEFAULT 0,

	PRIMARY KEY (id)
);

CREATE TABLE Storages(
	id int not null AUTO_INCREMENT,
	name enum('freezer', 'refrigerator', 'warehouse') UNIQUE,
	capacity double not null,
	
	PRIMARY KEY (id)
);

CREATE TABLE Ingredients(
	id int not null AUTO_INCREMENT,
	name varchar(70) not null UNIQUE,
	package_type enum('sack', 'pail', 'drum', 'supersack', 'truckload', 'railcar') not null,
	storage_id int not null,
	native_unit varchar(70) not null,
	num_native_units double not null,
	intermediate BIT DEFAULT 0,
	worst_duration BIGINT DEFAULT 0 not null,
	total_weighted_duration BIGINT DEFAULT 0 not null,
	total_num_native_units double DEFAULT 0 not null,
	removed BIT DEFAULT 0,

	FOREIGN KEY (storage_id) REFERENCES Storages(id),
	PRIMARY KEY (id)
);

CREATE TABLE VendorsIngredients(
	id int not null AUTO_INCREMENT,
	ingredient_id int not null,
	price double not null,
	vendor_id int not null,
	removed BIT DEFAULT 0,

	FOREIGN KEY (ingredient_id) REFERENCES Ingredients(id),
	FOREIGN KEY (vendor_id) REFERENCES Vendors(id),
	UNIQUE (ingredient_id, vendor_id),
	PRIMARY KEY (id)
);

CREATE TABLE Inventories(
	id int not null AUTO_INCREMENT,
	ingredient_id int not null,
	num_packages double not null default 0,
	lot varchar(500) not null,
	vendor_id int not null,
	created_at timestamp DEFAULT now() not null,

	FOREIGN KEY (ingredient_id) REFERENCES Ingredients(id),
	FOREIGN KEY (vendor_id) REFERENCES Vendors(id),
	PRIMARY KEY (id)
);

CREATE TABLE Logs(
	id int not null AUTO_INCREMENT,
	user_id int not null,
	vendor_ingredient_id int not null,
	quantity int not null,
	created_at timestamp DEFAULT now() not null,
 
	FOREIGN KEY (user_id) REFERENCES Users(id),
	FOREIGN KEY (vendor_ingredient_id) REFERENCES VendorsIngredients(id),
	PRIMARY KEY (id)
);

CREATE TABLE SpendingLogs(
	id int not null AUTO_INCREMENT,
	ingredient_id int not null,
	total_weight int not null DEFAULT 0,
	total double not null DEFAULT 0,
	consumed double not null DEFAULT 0,

	FOREIGN KEY (ingredient_id) REFERENCES Ingredients(id),
	PRIMARY KEY (id)
);

CREATE TABLE Formulas(
	id int not null AUTO_INCREMENT,
	intermediate BIT DEFAULT 0,
	-- below are not used for final products
	ingredient_id int,
	-- above are not used for final products
	name varchar(70) not null UNIQUE,
	description text not null,
	num_product int not null,
	removed BIT DEFAULT 0,

	PRIMARY KEY (id)
);

CREATE TABLE FormulaEntries(
	id int not null AUTO_INCREMENT,
	ingredient_id int not null,
	num_native_units double not null,
	formula_id int not null,


	FOREIGN KEY (ingredient_id) REFERENCES Ingredients(id),
	FOREIGN KEY (formula_id) REFERENCES Formulas(id),
	PRIMARY KEY (id)
);

CREATE TABLE ProductionLogs(
	id int not null AUTO_INCREMENT,
	formula_id int not null unique,
	num_product int not null,
	total_cost double not null,

	FOREIGN KEY (formula_id) REFERENCES Formulas(id),
	PRIMARY KEY (id)
);

CREATE TABLE SystemLogs(
	id int not null AUTO_INCREMENT,
	user_id int not null,
	description text not null,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP not null,

	FOREIGN KEY (user_id) REFERENCES Users(id),
	PRIMARY KEY (id)
);

CREATE TABLE ProductRuns(
	id int not null AUTO_INCREMENT,
	formula_id int not null,
	lot VARCHAR(100) not null,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP not null,

	FOREIGN KEY (formula_id) REFERENCES Formulas(id),
	PRIMARY KEY (id)
);

CREATE TABLE ProductRunsEntries(
	id int not null AUTO_INCREMENT,
	productrun_id int not null,
	ingredient_id int not null,
	vendor_id int not null,
	lot VARCHAR(100) not null,

	FOREIGN KEY (productrun_id) REFERENCES ProductRuns(id),
	FOREIGN KEY (ingredient_id) REFERENCES Ingredients(id),
	FOREIGN KEY (vendor_id) REFERENCES Vendors(id),
	PRIMARY KEY (id)
);
