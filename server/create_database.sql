CREATE TABLE Users(
	id int not null AUTO_INCREMENT,
	name varchar(70) not null,
	hash text(1024) not null, 
	salt character(32) not null, 
	group enum('admin', 'noob'),

	PRIMARY KEY(id)
);

CREATE TABLE Vendors(
	id int not null AUTO_INCREMENT,
	name varchar(70) not null UNIQUE,
	contact varchar(255) not null,
	code varchar(255) not null UNIQUE,

	PRIMARY KEY(id)
);

CREATE TABLE Ingredients(
	id int not null AUTO_INCREMENT,
	name varchar(70) not null,
	package_type enum('sack', 'pail', 'drum', 'supersack', 'truckload', 'railcar') not null,
	storage_id int not null,
	price double not null,
	vendor_id int not null,

	FOREIGN KEY (storage_id) REFERENCES Storages(id),
	FOREIGN KEY (vendor_id) REFERENCES Vendors(id),
	PRIMARY KEY(id)
);

CREATE TABLE Storages(
	id int not null AUTO_INCREMENT,
	name enum('freezer', 'refrigerator', 'warehouse') UNIQUE,
	capacity int not null,
	
	PRIMARY KEY(id)
);

CREATE TABLE Inventories(
	id int not null AUTO_INCREMENT,
	ingredient_id int not null,
	num_packages int not null,


	FOREIGN KEY (ingredient_id) REFERENCES Ingredients(id),
	PRIMARY KEY(id)
);

CREATE TABLE Logs(
	id int not null AUTO_INCREMENT,
	user_id int not null,
	ingredient_id int not null,
	quantitfy int not null,
	created_at timestamp DEFAULT now() not null,
 

	FOREIGN KEY (user_id) REFERENCES Users(id),
	FOREIGN KEY (ingredient_id) REFERENCES Ingredients(id),
	PRIMARY KEY(id)
);


'CREATE TABLE Users('+

	'id int not null AUTO_INCREMENT, '+
	'temporary boolean not null, '+
	'name varchar(70), '+
	'email varchar(255) not null UNIQUE, '+
	'hash text(1024) not null, '+
	'salt character(32) not null, '+

	'binance_api_key character(64), '+
	'binance_secret_key character(64), '+
	'bittrex_api_key character(32), '+
	'bittrex_secret_key character(32), '+

	'bitcoin_public_key character(34), '+
	'ethereum_public_key character(42), '+
	'litecoin_public_key character(34), '+

	'PRIMARY KEY (id))');