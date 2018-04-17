-- MySQL dump 10.13  Distrib 5.7.18, for macos10.12 (x86_64)
--
-- Host: localhost    Database: meals
-- ------------------------------------------------------
-- Server version	5.7.18

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `FinalProductInventories`
--

DROP TABLE IF EXISTS `FinalProductInventories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `FinalProductInventories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `productrun_id` int(11) NOT NULL,
  `formula_id` int(11) NOT NULL,
  `num_packages` int(11) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `productrun_id` (`productrun_id`),
  KEY `formula_id` (`formula_id`),
  CONSTRAINT `finalproductinventories_ibfk_1` FOREIGN KEY (`productrun_id`) REFERENCES `ProductRuns` (`id`),
  CONSTRAINT `finalproductinventories_ibfk_2` FOREIGN KEY (`formula_id`) REFERENCES `Formulas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `FinalProductInventories`
--

LOCK TABLES `FinalProductInventories` WRITE;
/*!40000 ALTER TABLE `FinalProductInventories` DISABLE KEYS */;
/*!40000 ALTER TABLE `FinalProductInventories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `FormulaEntries`
--

DROP TABLE IF EXISTS `FormulaEntries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `FormulaEntries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ingredient_id` int(11) NOT NULL,
  `num_native_units` double NOT NULL,
  `formula_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ingredient_id` (`ingredient_id`),
  KEY `formula_id` (`formula_id`),
  CONSTRAINT `formulaentries_ibfk_1` FOREIGN KEY (`ingredient_id`) REFERENCES `Ingredients` (`id`),
  CONSTRAINT `formulaentries_ibfk_2` FOREIGN KEY (`formula_id`) REFERENCES `Formulas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `FormulaEntries`
--

LOCK TABLES `FormulaEntries` WRITE;
/*!40000 ALTER TABLE `FormulaEntries` DISABLE KEYS */;
INSERT INTO `FormulaEntries` VALUES (3,1,1,2),(4,2,1,2),(5,2,1,3),(6,4,1,3);
/*!40000 ALTER TABLE `FormulaEntries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `FormulaProductionLines`
--

DROP TABLE IF EXISTS `FormulaProductionLines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `FormulaProductionLines` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `formula_id` int(11) NOT NULL,
  `productionline_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `formula_id` (`formula_id`,`productionline_id`),
  KEY `productionline_id` (`productionline_id`),
  CONSTRAINT `formulaproductionlines_ibfk_1` FOREIGN KEY (`formula_id`) REFERENCES `Formulas` (`id`),
  CONSTRAINT `formulaproductionlines_ibfk_2` FOREIGN KEY (`productionline_id`) REFERENCES `Productionlines` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `FormulaProductionLines`
--

LOCK TABLES `FormulaProductionLines` WRITE;
/*!40000 ALTER TABLE `FormulaProductionLines` DISABLE KEYS */;
INSERT INTO `FormulaProductionLines` VALUES (1,2,1),(2,3,2);
/*!40000 ALTER TABLE `FormulaProductionLines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Formulas`
--

DROP TABLE IF EXISTS `Formulas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Formulas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `intermediate` bit(1) DEFAULT b'0',
  `ingredient_id` int(11) DEFAULT NULL,
  `name` varchar(70) NOT NULL,
  `description` text NOT NULL,
  `num_product` int(11) NOT NULL,
  `worst_duration` bigint(20) NOT NULL DEFAULT '0',
  `total_weighted_duration` bigint(20) NOT NULL DEFAULT '0',
  `total_num_products` double NOT NULL DEFAULT '0',
  `removed` bit(1) DEFAULT b'0',
  `isactive` varchar(1) DEFAULT 'Y',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`,`isactive`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Formulas`
--

LOCK TABLES `Formulas` WRITE;
/*!40000 ALTER TABLE `Formulas` DISABLE KEYS */;
INSERT INTO `Formulas` VALUES (1,'\0',NULL,'cake mix','cake mix',10,0,0,0,'',NULL),(2,'',4,'cake mix','cake mix',10,0,0,0,'\0','Y'),(3,'\0',NULL,'cake','cake',10,0,0,0,'\0','Y');
/*!40000 ALTER TABLE `Formulas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Ingredients`
--

DROP TABLE IF EXISTS `Ingredients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Ingredients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(70) NOT NULL,
  `package_type` enum('sack','pail','drum','supersack','truckload','railcar') NOT NULL,
  `storage_id` int(11) NOT NULL,
  `native_unit` varchar(70) NOT NULL,
  `num_native_units` double NOT NULL,
  `intermediate` bit(1) DEFAULT b'0',
  `worst_duration` bigint(20) NOT NULL DEFAULT '0',
  `total_weighted_duration` bigint(20) NOT NULL DEFAULT '0',
  `total_num_native_units` double NOT NULL DEFAULT '0',
  `removed` bit(1) DEFAULT b'0',
  `isactive` varchar(1) DEFAULT 'Y',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`,`isactive`),
  KEY `storage_id` (`storage_id`),
  CONSTRAINT `ingredients_ibfk_1` FOREIGN KEY (`storage_id`) REFERENCES `Storages` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Ingredients`
--

LOCK TABLES `Ingredients` WRITE;
/*!40000 ALTER TABLE `Ingredients` DISABLE KEYS */;
INSERT INTO `Ingredients` VALUES (1,'egg','sack',1,'lb',10,'\0',0,0,0,'\0','Y'),(2,'flour','sack',1,'lb',10,'\0',0,0,0,'\0','Y'),(3,'milk','sack',1,'lb',10,'\0',0,0,0,'\0','Y'),(4,'cake mix','pail',2,'lb',10,'',0,0,0,'\0','Y');
/*!40000 ALTER TABLE `Ingredients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Inventories`
--

DROP TABLE IF EXISTS `Inventories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Inventories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ingredient_id` int(11) NOT NULL,
  `num_packages` double NOT NULL DEFAULT '0',
  `lot` varchar(500) NOT NULL,
  `vendor_id` int(11) NOT NULL,
  `per_package_cost` double NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `arrived` bit(1) DEFAULT b'0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ingredient_id` (`ingredient_id`),
  KEY `vendor_id` (`vendor_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `inventories_ibfk_1` FOREIGN KEY (`ingredient_id`) REFERENCES `Ingredients` (`id`),
  CONSTRAINT `inventories_ibfk_2` FOREIGN KEY (`vendor_id`) REFERENCES `Vendors` (`id`),
  CONSTRAINT `inventories_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `Orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Inventories`
--

LOCK TABLES `Inventories` WRITE;
/*!40000 ALTER TABLE `Inventories` DISABLE KEYS */;
INSERT INTO `Inventories` VALUES (1,1,10,'PENDING',2,10,1,'\0','2018-04-16 21:28:16'),(2,2,10,'PENDING',2,5,1,'\0','2018-04-16 21:28:16'),(3,3,10,'PENDING',3,10,1,'\0','2018-04-16 21:28:16');
/*!40000 ALTER TABLE `Inventories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Orders`
--

DROP TABLE IF EXISTS `Orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Orders`
--

LOCK TABLES `Orders` WRITE;
/*!40000 ALTER TABLE `Orders` DISABLE KEYS */;
INSERT INTO `Orders` VALUES (1,'2018-04-16 21:28:16');
/*!40000 ALTER TABLE `Orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ProductRuns`
--

DROP TABLE IF EXISTS `ProductRuns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ProductRuns` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `formula_id` int(11) NOT NULL,
  `num_product` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `lot` varchar(100) NOT NULL,
  `cost_for_run` double NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed` bit(1) DEFAULT b'0',
  PRIMARY KEY (`id`),
  KEY `formula_id` (`formula_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `productruns_ibfk_1` FOREIGN KEY (`formula_id`) REFERENCES `Formulas` (`id`),
  CONSTRAINT `productruns_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ProductRuns`
--

LOCK TABLES `ProductRuns` WRITE;
/*!40000 ALTER TABLE `ProductRuns` DISABLE KEYS */;
/*!40000 ALTER TABLE `ProductRuns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ProductRunsEntries`
--

DROP TABLE IF EXISTS `ProductRunsEntries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ProductRunsEntries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `productrun_id` int(11) NOT NULL,
  `ingredient_id` int(11) NOT NULL,
  `vendor_id` int(11) NOT NULL,
  `num_native_units` double NOT NULL,
  `lot` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `productrun_id` (`productrun_id`),
  KEY `ingredient_id` (`ingredient_id`),
  KEY `vendor_id` (`vendor_id`),
  CONSTRAINT `productrunsentries_ibfk_1` FOREIGN KEY (`productrun_id`) REFERENCES `ProductRuns` (`id`),
  CONSTRAINT `productrunsentries_ibfk_2` FOREIGN KEY (`ingredient_id`) REFERENCES `Ingredients` (`id`),
  CONSTRAINT `productrunsentries_ibfk_3` FOREIGN KEY (`vendor_id`) REFERENCES `Vendors` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ProductRunsEntries`
--

LOCK TABLES `ProductRunsEntries` WRITE;
/*!40000 ALTER TABLE `ProductRunsEntries` DISABLE KEYS */;
/*!40000 ALTER TABLE `ProductRunsEntries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ProductionLogs`
--

DROP TABLE IF EXISTS `ProductionLogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ProductionLogs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `formula_id` int(11) NOT NULL,
  `num_product` int(11) NOT NULL,
  `total_cost` double NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `formula_id` (`formula_id`),
  CONSTRAINT `productionlogs_ibfk_1` FOREIGN KEY (`formula_id`) REFERENCES `Formulas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ProductionLogs`
--

LOCK TABLES `ProductionLogs` WRITE;
/*!40000 ALTER TABLE `ProductionLogs` DISABLE KEYS */;
/*!40000 ALTER TABLE `ProductionLogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Productionlines`
--

DROP TABLE IF EXISTS `Productionlines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Productionlines` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(70) NOT NULL,
  `description` text,
  `isactive` varchar(1) DEFAULT 'Y',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`,`isactive`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Productionlines`
--

LOCK TABLES `Productionlines` WRITE;
/*!40000 ALTER TABLE `Productionlines` DISABLE KEYS */;
INSERT INTO `Productionlines` VALUES (1,'LineA','lineA','Y','2018-04-16 21:28:47'),(2,'LineB','lineB','Y','2018-04-16 21:29:01');
/*!40000 ALTER TABLE `Productionlines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ProductionlinesOccupancies`
--

DROP TABLE IF EXISTS `ProductionlinesOccupancies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ProductionlinesOccupancies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `productionline_id` int(11) NOT NULL,
  `productrun_id` int(11) NOT NULL,
  `formula_id` int(11) NOT NULL,
  `intermediate_inventory_id` int(11) DEFAULT NULL,
  `start_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `end_time` timestamp NULL DEFAULT NULL,
  `busy` bit(1) DEFAULT b'1',
  PRIMARY KEY (`id`),
  KEY `formula_id` (`formula_id`),
  KEY `productrun_id` (`productrun_id`),
  KEY `productionline_id` (`productionline_id`),
  CONSTRAINT `productionlinesoccupancies_ibfk_1` FOREIGN KEY (`formula_id`) REFERENCES `Formulas` (`id`),
  CONSTRAINT `productionlinesoccupancies_ibfk_2` FOREIGN KEY (`productrun_id`) REFERENCES `ProductRuns` (`id`),
  CONSTRAINT `productionlinesoccupancies_ibfk_3` FOREIGN KEY (`productionline_id`) REFERENCES `Productionlines` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ProductionlinesOccupancies`
--

LOCK TABLES `ProductionlinesOccupancies` WRITE;
/*!40000 ALTER TABLE `ProductionlinesOccupancies` DISABLE KEYS */;
/*!40000 ALTER TABLE `ProductionlinesOccupancies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Sales`
--

DROP TABLE IF EXISTS `Sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Sales` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `formula_id` int(11) NOT NULL,
  `num_packages` int(11) NOT NULL DEFAULT '0',
  `total_cost` double NOT NULL DEFAULT '0',
  `total_revenue` double NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `formula_id` (`formula_id`),
  CONSTRAINT `sales_ibfk_1` FOREIGN KEY (`formula_id`) REFERENCES `Formulas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Sales`
--

LOCK TABLES `Sales` WRITE;
/*!40000 ALTER TABLE `Sales` DISABLE KEYS */;
/*!40000 ALTER TABLE `Sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SpendingLogs`
--

DROP TABLE IF EXISTS `SpendingLogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `SpendingLogs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ingredient_id` int(11) NOT NULL,
  `total_weight` int(11) NOT NULL DEFAULT '0',
  `total` double NOT NULL DEFAULT '0',
  `consumed` double NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `ingredient_id` (`ingredient_id`),
  CONSTRAINT `spendinglogs_ibfk_1` FOREIGN KEY (`ingredient_id`) REFERENCES `Ingredients` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SpendingLogs`
--

LOCK TABLES `SpendingLogs` WRITE;
/*!40000 ALTER TABLE `SpendingLogs` DISABLE KEYS */;
INSERT INTO `SpendingLogs` VALUES (1,1,100,100,0),(2,2,100,50,0),(3,3,100,100,0);
/*!40000 ALTER TABLE `SpendingLogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Storages`
--

DROP TABLE IF EXISTS `Storages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Storages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` enum('freezer','refrigerator','warehouse') DEFAULT NULL,
  `capacity` double NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Storages`
--

LOCK TABLES `Storages` WRITE;
/*!40000 ALTER TABLE `Storages` DISABLE KEYS */;
INSERT INTO `Storages` VALUES (1,'freezer',1000000),(2,'refrigerator',1000000),(3,'warehouse',1000000);
/*!40000 ALTER TABLE `Storages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SystemLogs`
--

DROP TABLE IF EXISTS `SystemLogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `SystemLogs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `systemlogs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SystemLogs`
--

LOCK TABLES `SystemLogs` WRITE;
/*!40000 ALTER TABLE `SystemLogs` DISABLE KEYS */;
INSERT INTO `SystemLogs` VALUES (1,1,'Ingredient {egg=ingredient_id=1} added.','2018-04-16 21:22:49'),(2,1,'Vendor {Duke=vendor_id=2} added.','2018-04-16 21:23:17'),(3,1,'Vendor {UNC=vendor_id=3} added.','2018-04-16 21:23:27'),(4,1,'Ingredient {flour=ingredient_id=2} added.','2018-04-16 21:23:50'),(5,1,'Ingredient {milk=ingredient_id=3} added.','2018-04-16 21:24:19'),(6,1,'Added vendor {Duke=vendor_id=2} for ingredient {egg=ingredient_id=1} at price 10 per package.','2018-04-16 21:24:38'),(7,1,'Added vendor {UNC=vendor_id=3} for ingredient {egg=ingredient_id=1} at price 15 per package.','2018-04-16 21:24:47'),(8,1,'Added vendor {Duke=vendor_id=2} for ingredient {flour=ingredient_id=2} at price 5 per package.','2018-04-16 21:24:58'),(9,1,'Added vendor {UNC=vendor_id=3} for ingredient {flour=ingredient_id=2} at price 10 per package.','2018-04-16 21:25:04'),(10,1,'Added vendor {Duke=vendor_id=2} for ingredient {milk=ingredient_id=3} at price 15 per package.','2018-04-16 21:25:17'),(11,1,'Added vendor {UNC=vendor_id=3} for ingredient {milk=ingredient_id=3} at price 10 per package.','2018-04-16 21:25:25'),(12,1,'Formula {cake mix=formula_id=1} added.','2018-04-16 21:26:02'),(13,1,'Formula {cake mix=formula_id=1} deleted.','2018-04-16 21:26:50'),(14,1,'Intermediate product {cake mix=ingredient_id=4} added.','2018-04-16 21:27:21'),(15,1,'Formula {cake mix=formula_id=2} added.','2018-04-16 21:27:21'),(16,1,'Formula {cake=formula_id=3} added.','2018-04-16 21:27:48'),(17,1,'Ordered 10 packages of {egg=ingredient_id=1} from {Duke=vendor_id=2}, 10 packages of {flour=ingredient_id=2} from {Duke=vendor_id=2}, 10 packages of {milk=ingredient_id=3} from {UNC=vendor_id=3}.','2018-04-16 21:28:16'),(18,1,'Created production line {LineA=productionline_id=1} .','2018-04-16 21:28:47'),(19,1,'Added formula {cake mix=formula_id=2} to production line {LineA=productionline_id=1}.','2018-04-16 21:28:52'),(20,1,'Created production line {LineB=productionline_id=2} .','2018-04-16 21:29:01'),(21,1,'Added formula {cake=formula_id=3} to production line {LineB=productionline_id=2}.','2018-04-16 21:29:04');
/*!40000 ALTER TABLE `SystemLogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(70) NOT NULL,
  `oauth` bit(1) NOT NULL DEFAULT b'0',
  `name` varchar(70) NOT NULL,
  `hash` text,
  `salt` char(32) DEFAULT NULL,
  `user_group` enum('admin','manager','noob') NOT NULL DEFAULT 'noob',
  `removed` bit(1) DEFAULT b'0',
  `isactive` varchar(1) DEFAULT 'Y',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`,`oauth`,`isactive`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (1,'admin','\0','Administrator','9317a720e045fb39bfe530b698ca6f861cf0499c48606deb4490a1a3e6eb412b3081826c1fa7a262921a1fd13c956423f5924221e72e4b37ee652d7ab7fc743e533ee96f0f8a11c23f043d8732854825bcbcd619fd9bdc7a1f9594868a4dae1b771e13f5156ad5ec5efc70273c8d401f6cea180b63e07ba777f7be6436925be59a43fd9c98e55a75766d3801d2659dcdd4ed6d03b3c7d883756178655783c43024c6d3d74f0da21b082068b7ca9cfd9450630ee737076a80f4b3b399e461a95d9b1d79a8df7020daf9c6ef7be1655b1ef02bff84144064c085b02068a5370564383a06d268cf08b986b83e627ee46d40fdb5e6f680265401c1dccf2f4525e373452bc5f26b5ddb58208503bc0e445a554ccdb9d3145db50ce03a9caa1dc95d973ba856c424d57be5226b824baaeca007afe21a4ecbdc1bdbefbe50aa0677e0f7464d348202bba248311d8445f2433cdae3ec740763dc26ef9f4732fdea7ebfcf53451bc6d82b1e9ad2289d59a5639be282e9c35d99802bd934540b6ed499f44e2920b947ea4c381b5fefeb73eb27e3522ddc78d34fa0eca91c026729b3333ddc8ba05337707155ea90151aa3d0996945178c5e6982d98e25072a9aa39abe42728d107777913bd5be0e8f8fb3f2788ed9eb13c8e46a32de3b6f1c8102cc2e3ad5316ee5a37e9514916435568eca3b403067e2107459fe64c986eca34a38ff48fe','138af8edecc78710b040658d90332108','admin','\0','Y');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Vendors`
--

DROP TABLE IF EXISTS `Vendors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Vendors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(70) NOT NULL,
  `contact` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `removed` bit(1) DEFAULT b'0',
  `isactive` varchar(1) DEFAULT 'Y',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`,`isactive`),
  UNIQUE KEY `code` (`code`,`isactive`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Vendors`
--

LOCK TABLES `Vendors` WRITE;
/*!40000 ALTER TABLE `Vendors` DISABLE KEYS */;
INSERT INTO `Vendors` VALUES (1,'Self-produced','N/A','N/A','\0','Y'),(2,'Duke','123','code_duke','\0','Y'),(3,'UNC','456','code_unc','\0','Y');
/*!40000 ALTER TABLE `Vendors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `VendorsIngredients`
--

DROP TABLE IF EXISTS `VendorsIngredients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `VendorsIngredients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ingredient_id` int(11) NOT NULL,
  `price` double NOT NULL,
  `vendor_id` int(11) NOT NULL,
  `removed` bit(1) DEFAULT b'0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ingredient_id` (`ingredient_id`,`vendor_id`),
  KEY `vendor_id` (`vendor_id`),
  CONSTRAINT `vendorsingredients_ibfk_1` FOREIGN KEY (`ingredient_id`) REFERENCES `Ingredients` (`id`),
  CONSTRAINT `vendorsingredients_ibfk_2` FOREIGN KEY (`vendor_id`) REFERENCES `Vendors` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `VendorsIngredients`
--

LOCK TABLES `VendorsIngredients` WRITE;
/*!40000 ALTER TABLE `VendorsIngredients` DISABLE KEYS */;
INSERT INTO `VendorsIngredients` VALUES (1,1,10,2,'\0'),(2,1,15,3,'\0'),(3,2,5,2,'\0'),(4,2,10,3,'\0'),(5,3,15,2,'\0'),(6,3,10,3,'\0');
/*!40000 ALTER TABLE `VendorsIngredients` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-04-16 17:31:25
