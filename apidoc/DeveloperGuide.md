# Developer Guide

## Getting Started

Requirements:  Node.js, MySQL

 1. Install packages using `npm install` in the root directory
 2. Install the frontend packages using `npm install` after `cd frontend`

### Website
Running the website locally
 1. In the terminal from the root directory `npm start`
 2. `cd frontend` and `npm run react-dev`
 3. The website should load [here](http://localhost:1717/)

## Tech Stack

 - React & React Router 4
 - Node.js & Express
 - MySQL Database

## Overview
Kung Foods' application uses React & React Router 4 and Node.js & Express for the web application. The `server.js` file includes all the routes for `GET, PUT, POST, and DELETE` requests. The API details are documented in the API Documents. To view the API docs, `gitbook install`, and `gitbook serve`.

## Database

### User

 - **Id**
 - Username 
 - Name 
 - Hash 
 - Salt
 - Oauth 
 - User Group (authorization level)
 - Removed

### Vendor
 - **Id** 
 - Name 
 - Contact:  Alphanumeric freight
 - Carrier code (unique, case-insensitive)
 - Removed

### Storages
- **Id**
- Name (enum)
	- Refrigerator, freezer, warehouse
- Capacity

### Ingredient
 - **Id**
 - Name
 - *Storage id*
 - Package Type (enum)
	 - Sack
	 - Pail
	 - Drum
	 - Supersack
	 - Truckload
	 - Railcar
 - Native unit (lb, fluid ounces, etc).
 - Number of native units (Quantity of native units in packaage)
 - Intermediate
 - Worst duration time
 - Total weighted duration time
 - Total number of native units
 - Removed
 
### Vendor Ingredients
 - **Id**
 - *Ingredient id*
 - Price
 - *Vendor id*
 - Removed
	 
### Inventories
 - **Id**
 - *Ingredient id*
 - Package type
 - Number of packages
 - Lot
 - *Vendor id*
 - Created at

### Formulas
 - **Id**
 - Intermediate
 - *ingredient id* (if is intermediate product)
 - Name
 - Description
 - Number of products
 - Removed

### FormulaEntries
 - **Id**
 - *ingredient_id*
 - Number of native units
 - *Formula id*

### Logs

 - **Id**
 - *User id*
 - *Vendor ingredient id*
 - Quantity (in pounds)
 - Created at (time stamp)

### Spending Logs

 - **Id**
 - *Ingredient id*
 - Total (Spending in money)
 - Total Weight (Weight of product bought)
 - Consumed (Weight of product used)
 - Created at (time stamp)

### Production Logs

 - **Id**
 - *Formula id*
 - Number of products (Total number of product produced)
 - Total cost

### System Logs
 - **Id**
 - *User id*
 - Description (refers to actions taken and entities involved)
 - Created at (time stamp)

### Product Runs
 - **Id**
 - *Formula id*
 - Number of products
 - *User id*
 - lot
 - Created at

### Product Runs Entries
 - **Id**
 - *Product run id*
 - *Ingredient id*
 - *Vendor id*
 - Number of native units
 - Lot

*Primary key in bold
**Foreign key in italics
	 
## Testing
Testing is done using [Chai](http://chaijs.com/api/) and [Mocha](https://mochajs.org/#getting-started) and cover all endpoints in the backend. Bulk import testing was done using [SuperTest](https://github.com/visionmedia/supertest). 
### Running Tests
Tests are under the `/tests` folder. Use `npm test` from the root folder in the command line to run all tests. 
