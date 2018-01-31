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
	username varchar(70) not null UNIQUE,
	name varchar(70) not null,
	hash text(1024) not null, 
	salt character(32) not null, 
	user_group enum('admin', 'noob') not null,

	PRIMARY KEY (id)
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
	capacity int not null,
	
	PRIMARY KEY (id)
);

CREATE TABLE Ingredients(
	id int not null AUTO_INCREMENT,
	name varchar(70) not null,
	storage_id int not null,
	removed BIT DEFAULT 0,

	FOREIGN KEY (storage_id) REFERENCES Storages(id),
	PRIMARY KEY (id)
);

CREATE TABLE VendorsIngredients(
	id int not null AUTO_INCREMENT,
	ingredient_id int not null,
	package_type enum('sack', 'pail', 'drum', 'supersack', 'truckload', 'railcar') not null,
	price double not null,
	vendor_id int not null,
	removed BIT DEFAULT 0,

	FOREIGN KEY (ingredient_id) REFERENCES Ingredients(id),
	FOREIGN KEY (vendor_id) REFERENCES Vendors(id),
	PRIMARY KEY (id)
);

CREATE TABLE Inventories(
	id int not null AUTO_INCREMENT,
	ingredient_id int not null,
	storage_weight int not null,
	total_weight int not null,

	FOREIGN KEY (ingredient_id) REFERENCES Ingredients(id),
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
	total double not null,
	consumed double not null,

	FOREIGN KEY (ingredient_id) REFERENCES Ingredients(id),
	PRIMARY KEY (id)
);
