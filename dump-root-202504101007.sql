  -- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
  --
  -- Host: localhost    Database: root
  -- ------------------------------------------------------
  -- Server version	8.0.41

  /*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
  /*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
  /*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
  /*!50503 SET NAMES utf8mb4 */;
  /*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
  /*!40103 SET TIME_ZONE='+00:00' */;
  /*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
  /*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
  /*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
  /*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

  --
  -- Table structure for table `users`
  --

  /*!40101 SET @saved_cs_client     = @@character_set_client */;
  /*!50503 SET character_set_client = utf8mb4 */;
  CREATE TABLE `users` (
    `id` int NOT NULL AUTO_INCREMENT,
    `first_name` varchar(128) NOT NULL,
    `last_name` varchar(128) NOT NULL,
    `email` varchar(255) NOT NULL,
    `phone` varchar(20) DEFAULT NULL,
    `password_hash` varchar(255) NOT NULL,
    `role` enum('customer','garage_owner','admin') NOT NULL DEFAULT 'customer',
    `last_login` datetime DEFAULT NULL,
    `profile_picture` varchar(255) DEFAULT NULL,
    `createdAt` datetime NOT NULL,
    `updatedAt` datetime NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `email` (`email`),
    UNIQUE KEY `email_2` (`email`),
    UNIQUE KEY `email_3` (`email`)
  ) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
  /*!40101 SET character_set_client = @saved_cs_client */;

  --
  -- Dumping data for table `users`
  --

  LOCK TABLES `users` WRITE;
  /*!40000 ALTER TABLE `users` DISABLE KEYS */;
  INSERT INTO `users` VALUES (1,'Patrik','Csordás','csordaspatrik11@gmail.com','+36303930594','$2b$10$ItUWDa//s4yDljrGqWpmfuKXLeU0yQVgvEuAmzRJrdcI1ueTpoHhO','garage_owner','2025-04-10 06:20:44',NULL,'2025-04-09 16:33:00','2025-04-10 06:20:44');
  /*!40000 ALTER TABLE `users` ENABLE KEYS */;
  UNLOCK TABLES;

  --
  -- Table structure for table `garage_schedule_slots`
  --

  /*!40101 SET @saved_cs_client     = @@character_set_client */;
  /*!50503 SET character_set_client = utf8mb4 */;
  CREATE TABLE `garage_schedule_slots` (
    `id` int NOT NULL AUTO_INCREMENT,
    `garage_id` int NOT NULL,
    `day_of_week` enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
    `start_time` time NOT NULL,
    `end_time` time NOT NULL,
    `max_bookings` int NOT NULL DEFAULT '1',
    `is_active` tinyint(1) NOT NULL DEFAULT '1',
    `createdAt` datetime NOT NULL,
    `updatedAt` datetime NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `garage_schedule_slots_garage_id_day_of_week_start_time_end_time` (`garage_id`,`day_of_week`,`start_time`,`end_time`),
    KEY `garage_schedule_slots_garage_id_day_of_week` (`garage_id`,`day_of_week`),
    CONSTRAINT `garage_schedule_slots_ibfk_1` FOREIGN KEY (`garage_id`) REFERENCES `garages` (`id`) ON DELETE CASCADE
  ) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
  /*!40101 SET character_set_client = @saved_cs_client */;

  --
  -- Dumping data for table `garage_schedule_slots`
  --

  LOCK TABLES `garage_schedule_slots` WRITE;
  /*!40000 ALTER TABLE `garage_schedule_slots` DISABLE KEYS */;
  INSERT INTO `garage_schedule_slots` VALUES (1,1,'monday','08:00:00','09:00:00',1,1,'2025-04-09 16:49:29','2025-04-09 16:54:08'),(2,1,'monday','09:00:00','10:00:00',1,1,'2025-04-09 16:49:39','2025-04-09 16:54:08'),(3,1,'monday','10:00:00','12:00:00',1,1,'2025-04-09 16:49:58','2025-04-09 16:54:08'),(4,1,'monday','12:00:00','13:00:00',1,1,'2025-04-09 16:50:09','2025-04-09 16:54:08'),(5,1,'monday','14:00:00','15:00:00',1,1,'2025-04-09 16:50:39','2025-04-09 16:54:08'),(6,1,'monday','15:00:00','16:00:00',1,1,'2025-04-09 16:51:48','2025-04-09 16:54:08'),(7,1,'monday','16:00:00','17:00:00',1,1,'2025-04-09 16:52:07','2025-04-09 16:54:08'),(8,1,'monday','17:00:00','18:00:00',1,1,'2025-04-09 16:52:24','2025-04-09 16:54:08'),(9,1,'monday','18:00:00','19:00:00',1,1,'2025-04-09 16:52:55','2025-04-09 16:54:08'),(10,1,'monday','19:00:00','20:00:00',1,1,'2025-04-09 16:53:16','2025-04-09 16:54:08'),(11,1,'tuesday','08:00:00','09:00:00',1,1,'2025-04-09 16:53:29','2025-04-09 16:54:08'),(12,1,'tuesday','09:00:00','10:00:00',1,1,'2025-04-09 16:53:29','2025-04-09 16:54:08'),(13,1,'tuesday','10:00:00','12:00:00',1,1,'2025-04-09 16:53:29','2025-04-09 16:54:08'),(14,1,'tuesday','12:00:00','13:00:00',1,1,'2025-04-09 16:53:29','2025-04-09 16:54:08'),(15,1,'tuesday','14:00:00','15:00:00',1,1,'2025-04-09 16:53:29','2025-04-09 16:54:08'),(16,1,'tuesday','15:00:00','16:00:00',1,1,'2025-04-09 16:53:29','2025-04-09 16:54:08'),(17,1,'tuesday','16:00:00','17:00:00',1,1,'2025-04-09 16:53:29','2025-04-09 16:54:08'),(18,1,'tuesday','17:00:00','18:00:00',1,1,'2025-04-09 16:53:29','2025-04-09 16:54:08'),(19,1,'tuesday','18:00:00','19:00:00',1,1,'2025-04-09 16:53:29','2025-04-09 16:54:08'),(20,1,'tuesday','19:00:00','20:00:00',1,1,'2025-04-09 16:53:29','2025-04-09 16:54:08'),(21,1,'wednesday','08:00:00','09:00:00',1,1,'2025-04-09 16:53:34','2025-04-09 16:54:08'),(22,1,'wednesday','09:00:00','10:00:00',1,1,'2025-04-09 16:53:34','2025-04-09 16:54:08'),(23,1,'wednesday','10:00:00','12:00:00',1,1,'2025-04-09 16:53:34','2025-04-09 16:54:08'),(24,1,'wednesday','12:00:00','13:00:00',1,1,'2025-04-09 16:53:34','2025-04-09 16:54:08'),(25,1,'wednesday','14:00:00','15:00:00',1,1,'2025-04-09 16:53:34','2025-04-09 16:54:08'),(26,1,'wednesday','15:00:00','16:00:00',1,1,'2025-04-09 16:53:34','2025-04-09 16:54:08'),(27,1,'wednesday','16:00:00','17:00:00',1,1,'2025-04-09 16:53:34','2025-04-09 16:54:08'),(28,1,'wednesday','17:00:00','18:00:00',1,1,'2025-04-09 16:53:34','2025-04-09 16:54:08'),(29,1,'wednesday','18:00:00','19:00:00',1,1,'2025-04-09 16:53:34','2025-04-09 16:54:08'),(30,1,'wednesday','19:00:00','20:00:00',1,1,'2025-04-09 16:53:34','2025-04-09 16:54:08'),(31,1,'thursday','08:00:00','09:00:00',1,1,'2025-04-09 16:53:37','2025-04-09 16:54:08'),(32,1,'thursday','09:00:00','10:00:00',1,1,'2025-04-09 16:53:37','2025-04-09 16:54:08'),(33,1,'thursday','10:00:00','12:00:00',1,1,'2025-04-09 16:53:37','2025-04-09 16:54:08'),(34,1,'thursday','12:00:00','13:00:00',1,1,'2025-04-09 16:53:37','2025-04-09 16:54:08'),(35,1,'thursday','14:00:00','15:00:00',1,1,'2025-04-09 16:53:37','2025-04-09 16:54:08'),(36,1,'thursday','15:00:00','16:00:00',1,1,'2025-04-09 16:53:37','2025-04-09 16:54:08'),(37,1,'thursday','16:00:00','17:00:00',1,1,'2025-04-09 16:53:37','2025-04-09 16:54:08'),(38,1,'thursday','17:00:00','18:00:00',1,1,'2025-04-09 16:53:37','2025-04-09 16:54:08'),(39,1,'thursday','18:00:00','19:00:00',1,1,'2025-04-09 16:53:37','2025-04-09 16:54:08'),(40,1,'thursday','19:00:00','20:00:00',1,1,'2025-04-09 16:53:37','2025-04-09 16:54:08'),(41,1,'friday','08:00:00','09:00:00',1,1,'2025-04-09 16:53:40','2025-04-09 16:54:08'),(42,1,'friday','09:00:00','10:00:00',1,1,'2025-04-09 16:53:40','2025-04-09 16:54:08'),(43,1,'friday','10:00:00','12:00:00',1,1,'2025-04-09 16:53:40','2025-04-09 16:54:08'),(44,1,'friday','12:00:00','13:00:00',1,1,'2025-04-09 16:53:40','2025-04-09 16:54:08'),(45,1,'friday','14:00:00','15:00:00',1,1,'2025-04-09 16:53:40','2025-04-09 16:54:08'),(46,1,'friday','15:00:00','16:00:00',1,1,'2025-04-09 16:53:40','2025-04-09 16:54:08'),(47,1,'friday','16:00:00','17:00:00',1,1,'2025-04-09 16:53:40','2025-04-09 16:54:08'),(48,1,'friday','17:00:00','18:00:00',1,1,'2025-04-09 16:53:40','2025-04-09 16:54:08'),(49,1,'friday','18:00:00','19:00:00',1,1,'2025-04-09 16:53:40','2025-04-09 16:54:08'),(50,1,'friday','19:00:00','20:00:00',1,1,'2025-04-09 16:53:40','2025-04-09 16:54:08'),(51,1,'saturday','08:00:00','09:00:00',1,0,'2025-04-09 16:53:44','2025-04-09 16:54:08'),(52,1,'saturday','09:00:00','10:00:00',1,0,'2025-04-09 16:53:44','2025-04-09 16:54:08'),(53,1,'saturday','10:00:00','12:00:00',1,0,'2025-04-09 16:53:44','2025-04-09 16:54:08'),(54,1,'saturday','12:00:00','13:00:00',1,0,'2025-04-09 16:53:44','2025-04-09 16:54:08'),(55,1,'saturday','14:00:00','15:00:00',1,0,'2025-04-09 16:53:44','2025-04-09 16:54:08'),(56,1,'saturday','15:00:00','16:00:00',1,0,'2025-04-09 16:53:44','2025-04-09 16:54:08'),(57,1,'saturday','16:00:00','17:00:00',1,0,'2025-04-09 16:53:44','2025-04-09 16:54:08'),(58,1,'saturday','17:00:00','18:00:00',1,0,'2025-04-09 16:53:44','2025-04-09 16:54:08'),(59,1,'saturday','18:00:00','19:00:00',1,0,'2025-04-09 16:53:44','2025-04-09 16:54:08'),(60,1,'saturday','19:00:00','20:00:00',1,0,'2025-04-09 16:53:44','2025-04-09 16:54:08'),(61,2,'monday','08:00:00','09:00:00',2,1,'2025-04-10 06:59:21','2025-04-10 07:01:34'),(62,2,'monday','09:00:00','10:00:00',2,1,'2025-04-10 06:59:28','2025-04-10 07:01:34'),(63,2,'monday','10:00:00','11:00:00',2,1,'2025-04-10 06:59:43','2025-04-10 07:01:34'),(64,2,'monday','11:00:00','12:00:00',2,1,'2025-04-10 06:59:58','2025-04-10 07:01:34'),(65,2,'monday','13:00:00','14:00:00',2,1,'2025-04-10 07:00:23','2025-04-10 07:01:34'),(66,2,'monday','14:00:00','15:00:00',2,1,'2025-04-10 07:00:33','2025-04-10 07:01:34'),(67,2,'monday','15:00:00','16:00:00',2,1,'2025-04-10 07:00:44','2025-04-10 07:01:34'),(68,2,'tuesday','08:00:00','09:00:00',2,1,'2025-04-10 07:01:18','2025-04-10 07:01:34'),(69,2,'tuesday','09:00:00','10:00:00',2,1,'2025-04-10 07:01:18','2025-04-10 07:01:34'),(70,2,'tuesday','10:00:00','11:00:00',2,1,'2025-04-10 07:01:18','2025-04-10 07:01:34'),(71,2,'tuesday','11:00:00','12:00:00',2,1,'2025-04-10 07:01:18','2025-04-10 07:01:34'),(72,2,'tuesday','13:00:00','14:00:00',2,1,'2025-04-10 07:01:18','2025-04-10 07:01:34'),(73,2,'tuesday','14:00:00','15:00:00',2,1,'2025-04-10 07:01:18','2025-04-10 07:01:34'),(74,2,'tuesday','15:00:00','16:00:00',2,1,'2025-04-10 07:01:18','2025-04-10 07:01:34'),(75,2,'wednesday','08:00:00','09:00:00',2,1,'2025-04-10 07:01:20','2025-04-10 07:01:34'),(76,2,'wednesday','09:00:00','10:00:00',2,1,'2025-04-10 07:01:20','2025-04-10 07:01:34'),(77,2,'wednesday','10:00:00','11:00:00',2,1,'2025-04-10 07:01:20','2025-04-10 07:01:34'),(78,2,'wednesday','11:00:00','12:00:00',2,1,'2025-04-10 07:01:20','2025-04-10 07:01:34'),(79,2,'wednesday','13:00:00','14:00:00',2,1,'2025-04-10 07:01:20','2025-04-10 07:01:34'),(80,2,'wednesday','14:00:00','15:00:00',2,1,'2025-04-10 07:01:20','2025-04-10 07:01:34'),(81,2,'wednesday','15:00:00','16:00:00',2,1,'2025-04-10 07:01:20','2025-04-10 07:01:34'),(82,2,'thursday','08:00:00','09:00:00',2,1,'2025-04-10 07:01:23','2025-04-10 07:01:34'),(83,2,'thursday','09:00:00','10:00:00',2,1,'2025-04-10 07:01:23','2025-04-10 07:01:34'),(84,2,'thursday','10:00:00','11:00:00',2,1,'2025-04-10 07:01:23','2025-04-10 07:01:34'),(85,2,'thursday','11:00:00','12:00:00',2,1,'2025-04-10 07:01:23','2025-04-10 07:01:34'),(86,2,'thursday','13:00:00','14:00:00',2,1,'2025-04-10 07:01:23','2025-04-10 07:01:34'),(87,2,'thursday','14:00:00','15:00:00',2,1,'2025-04-10 07:01:23','2025-04-10 07:01:34'),(88,2,'thursday','15:00:00','16:00:00',2,1,'2025-04-10 07:01:23','2025-04-10 07:01:34'),(89,2,'friday','08:00:00','09:00:00',2,1,'2025-04-10 07:01:25','2025-04-10 07:01:34'),(90,2,'friday','09:00:00','10:00:00',2,1,'2025-04-10 07:01:25','2025-04-10 07:01:34'),(91,2,'friday','10:00:00','11:00:00',2,1,'2025-04-10 07:01:25','2025-04-10 07:01:34'),(92,2,'friday','11:00:00','12:00:00',2,1,'2025-04-10 07:01:25','2025-04-10 07:01:34'),(93,2,'friday','13:00:00','14:00:00',2,1,'2025-04-10 07:01:25','2025-04-10 07:01:34'),(94,2,'friday','14:00:00','15:00:00',2,1,'2025-04-10 07:01:25','2025-04-10 07:01:34'),(95,2,'friday','15:00:00','16:00:00',2,1,'2025-04-10 07:01:25','2025-04-10 07:01:34'),(96,2,'saturday','08:00:00','09:00:00',2,1,'2025-04-10 07:01:31','2025-04-10 07:01:34'),(97,2,'saturday','09:00:00','10:00:00',2,1,'2025-04-10 07:01:31','2025-04-10 07:01:34'),(98,2,'saturday','10:00:00','11:00:00',2,1,'2025-04-10 07:01:31','2025-04-10 07:01:34'),(99,2,'saturday','11:00:00','12:00:00',2,1,'2025-04-10 07:01:31','2025-04-10 07:01:34'),(100,2,'saturday','13:00:00','14:00:00',2,1,'2025-04-10 07:01:31','2025-04-10 07:01:34'),(101,2,'saturday','14:00:00','15:00:00',2,0,'2025-04-10 07:01:31','2025-04-10 07:01:34'),(102,2,'saturday','15:00:00','16:00:00',2,0,'2025-04-10 07:01:31','2025-04-10 07:01:34');
  /*!40000 ALTER TABLE `garage_schedule_slots` ENABLE KEYS */;
  UNLOCK TABLES;

  --
  -- Table structure for table `orders`
  --

  /*!40101 SET @saved_cs_client     = @@character_set_client */;
  /*!50503 SET character_set_client = utf8mb4 */;
  CREATE TABLE `orders` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` int NOT NULL,
    `garage_id` int NOT NULL,
    `total_price` decimal(10,2) NOT NULL,
    `order_date` datetime DEFAULT NULL,
    `status` enum('pending','confirmed','completed','canceled') NOT NULL,
    `createdAt` datetime NOT NULL,
    `updatedAt` datetime NOT NULL,
    PRIMARY KEY (`id`),
    KEY `user_id` (`user_id`),
    KEY `garage_id` (`garage_id`),
    CONSTRAINT `orders_ibfk_5` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `orders_ibfk_6` FOREIGN KEY (`garage_id`) REFERENCES `garages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
  /*!40101 SET character_set_client = @saved_cs_client */;

  --
  -- Dumping data for table `orders`
  --

  LOCK TABLES `orders` WRITE;
  /*!40000 ALTER TABLE `orders` DISABLE KEYS */;
  /*!40000 ALTER TABLE `orders` ENABLE KEYS */;
  UNLOCK TABLES;

  --
  -- Table structure for table `appointments`
  --

  /*!40101 SET @saved_cs_client     = @@character_set_client */;
  /*!50503 SET character_set_client = utf8mb4 */;
  CREATE TABLE `appointments` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` int NOT NULL,
    `garage_id` int NOT NULL,
    `schedule_slot_id` int DEFAULT NULL,
    `appointment_time` datetime NOT NULL,
    `status` enum('pending','confirmed','completed','canceled') NOT NULL DEFAULT 'pending',
    `order_id` int NOT NULL,
    `createdAt` datetime NOT NULL,
    `updatedAt` datetime NOT NULL,
    PRIMARY KEY (`id`),
    KEY `user_id` (`user_id`),
    KEY `garage_id` (`garage_id`),
    KEY `schedule_slot_id` (`schedule_slot_id`),
    KEY `order_id` (`order_id`),
    CONSTRAINT `appointments_ibfk_10` FOREIGN KEY (`garage_id`) REFERENCES `garages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `appointments_ibfk_11` FOREIGN KEY (`schedule_slot_id`) REFERENCES `garage_schedule_slots` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `appointments_ibfk_12` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `appointments_ibfk_9` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
  /*!40101 SET character_set_client = @saved_cs_client */;

  --
  -- Dumping data for table `appointments`
  --

  LOCK TABLES `appointments` WRITE;
  /*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
  /*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
  UNLOCK TABLES;

  --
  -- Table structure for table `cart`
  --

  /*!40101 SET @saved_cs_client     = @@character_set_client */;
  /*!50503 SET character_set_client = utf8mb4 */;
  CREATE TABLE `cart` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` int NOT NULL,
    `garage_id` int NOT NULL,
    `createdAt` datetime NOT NULL,
    `updatedAt` datetime NOT NULL,
    PRIMARY KEY (`id`),
    KEY `user_id` (`user_id`),
    KEY `garage_id` (`garage_id`),
    CONSTRAINT `cart_ibfk_5` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `cart_ibfk_6` FOREIGN KEY (`garage_id`) REFERENCES `garages` (`id`) ON DELETE CASCADE
  ) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
  /*!40101 SET character_set_client = @saved_cs_client */;

  --
  -- Dumping data for table `cart`
  --

  LOCK TABLES `cart` WRITE;
  /*!40000 ALTER TABLE `cart` DISABLE KEYS */;
  INSERT INTO `cart` VALUES (1,1,1,'2025-04-09 16:56:06','2025-04-09 16:56:06'),(2,1,1,'2025-04-09 16:56:06','2025-04-09 16:56:06'),(3,1,1,'2025-04-09 16:56:06','2025-04-09 16:56:06');
  /*!40000 ALTER TABLE `cart` ENABLE KEYS */;
  UNLOCK TABLES;

  --
  -- Table structure for table `inventory`
  --

  /*!40101 SET @saved_cs_client     = @@character_set_client */;
  /*!50503 SET character_set_client = utf8mb4 */;
  CREATE TABLE `inventory` (
    `id` int NOT NULL AUTO_INCREMENT,
    `garage_id` int NOT NULL,
    `item_name` varchar(255) NOT NULL,
    `vehicle_type` enum('car','motorcycle','truck') NOT NULL,
    `quantity` int NOT NULL DEFAULT '0',
    `unit_price` decimal(10,2) NOT NULL,
    `description` text COMMENT 'Detailed description of the inventory item',
    `cover_img` varchar(255) DEFAULT NULL COMMENT 'URL to the cover image of the inventory item',
    `additional_img1` varchar(255) DEFAULT NULL COMMENT 'URL to the first additional image',
    `additional_img2` varchar(255) DEFAULT NULL COMMENT 'URL to the second additional image',
    `season` enum('winter','summer','all_season') DEFAULT NULL COMMENT 'Season type for the tyre',
    `width` int DEFAULT NULL COMMENT 'Tyre width in mm',
    `profile` int DEFAULT NULL COMMENT 'Tyre profile/aspect ratio as percentage',
    `diameter` int DEFAULT NULL COMMENT 'Tyre diameter in inches',
    `createdAt` datetime NOT NULL,
    `updatedAt` datetime NOT NULL,
    PRIMARY KEY (`id`),
    KEY `garage_id` (`garage_id`),
    CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`garage_id`) REFERENCES `garages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
  /*!40101 SET character_set_client = @saved_cs_client */;

  --
  -- Dumping data for table `inventory`
  --

  LOCK TABLES `inventory` WRITE;
  /*!40000 ALTER TABLE `inventory` DISABLE KEYS */;
  INSERT INTO `inventory` VALUES (1,1,'Michelin Primacy 4+','car',25,44990.00,'Az élettartam előrehaladtával is biztonságosabb, hosszú távra tervezett MICHELIN PRIMACY 4+ abroncs: megbízható védelem önnek és utasainak, sok-sok kilométeren keresztül.\r\n\r\nMég nagyobb biztonság - hosszú távra tervezve: új MICHELIN nyári abroncs\r\nKopásjelzőig kopott futóval a legjobb fékhatás teljesítmény nedves útfelületen\r\nA legjobb aquaplaning ellenállás\r\nKiváló élettartam\r\nMICHELIN EverGrip futótechnológia\r\n\r\nMég nagyobb biztonság - hosszú távra tervezve\r\nA MICHELIN PRIMACY 4+ hosszú élettartamú abroncs kopásjelzőig kopott futóval végzett nedves fékhatás teszteken a legjobb eredményeket éri el, és kiemelkedő teljesítményt nyújt aquaplaning helyzetekben. A MICHELIN EverGrip technológia legújabb generációs futókeveréke önregeneráló, két különböző keménységű gumit tartalmazó futója gondoskodik róla, hogy az abroncs kopott futóval is biztonságos legyen.\r\n\r\nHosszú élettartam, magabiztos autózás\r\nNe pazarolja idejét arra, hogy az abroncsain aggódik! Élvezze a kiváló élettartamú MICHELIN PRIMACY 4+ abroncs teljesítményét, és az élethosszig tartó biztonságot! Az autózás gondtalan élmény lesz: a MaxTouch Construction technológia gondoskodik a kopásállóságról, és a gyorsulás, fékezés és kanyarodás közben fellépő erők egyenletesebben oszlatja el a futófelületen, ezáltal növelve a futó élettartamát.','/uploads/inventory/inventory-1744218313954-921678251.jpg','/uploads/inventory/inventory-1744218313955-372436648.jpg','/uploads/inventory/inventory-1744218313956-989540373.webp','summer',205,55,16,'2025-04-09 17:05:13','2025-04-09 17:52:30'),(2,1,'Continental WinterContact TS 870','car',10,32990.00,'A havas utak királya, a Continental WinterContact TS 860, amely több mint 20 aranyérmet szerzett, méltó utódra lelt.  A gyártó 5%-kal rövidebb féktávolságot ígér havas és jeges útfelületen, valamint 7%-kal hosszabb élettartamot és 4%-kal alacsonyabb gördülési ellenállást.\r\n\r\nEz már az abroncs első tesztjén is bebizonyosodott. A TÜV SÜD 2021 mérései szerint a 225/45 R17-es méretnél a Continental mind a nedves felületen mért féktávolság, mind a havon való tapadás tekintetében felülmúlta az összes versenytársat.\r\n\r\nA Continental WinterContact TS 870 gumiabroncs előnyei\r\n\r\nA történelem legsikeresebb téli futófelületének hagyományaira épít\r\nRövid féktávolság havas és jeges felületen\r\nRendkívül hosszú élettartam\r\nKiváló védelem aquaplaning ellen\r\nTöbb barázda a havon való jobb kapaszkodás érdekében\r\n\r\nA futófelület 10%-kal több mintázati barázdát tartalmaz, mint sikeres elődje. Éleik mintegy törlőként szolgálnak a puha hó eltávolítására, és kiváló tapadást biztosítanak a téli utakon. Ezenkívül a speciális átvágás segít az erők egyenletesebb átvitelében, javítva az abroncs kanyarstabilitását.\r\n\r\n3D lamellák a rövid féktávolság érdekében\r\n\r\nTovábbi újításnak számítanak a speciális 3D lamellák. Ezek a futófelületen optimális szögben helyezkednek el a hóban vagy latyakban való legjobb kapaszkodáshoz.\r\n\r\nKözépső árok az aquaplaningelleni védelemként\r\n\r\nAz új szerkezet speciális középső árkot tartalmaz. Ez a víz még gyorsabb elvezetését szolgálja, és jobb védelmet nyújt az aquaplaning ellen. A nedves útfelületen való tapadást az újonnan kifejlesztett, magas gyantatartalmú Cool Chili futófelületi keverék is segíti.','/uploads/inventory/inventory-1744219249904-884999186.jpg','/uploads/inventory/inventory-1744219249904-948703995.png',NULL,'winter',195,65,15,'2025-04-09 17:20:49','2025-04-09 17:52:09'),(3,1,'Goodyear Vector 4Seasons Gen-3','car',8,63990.00,'Goodyear gumiabroncs gyár 215/55R17 méretű abroncsát W, azaz maximálisan 270 km/h sebességhez tervezte, emellett 98 vagyis 750kg az üzemszerű terhelhetősége. Ez a négyévszakos gumi a Goodyear vector-4seasons-gen-3 elnevezésű mintázatának segítségével tapad az útra, , erősített oldalfalú személy abroncs. Az EU-cimkézés A-tól G-ig terjedő skáláján, ahol az A a legjobb értékelés, nedves tapadásra B, üzemanyag fogyasztásra B értékelést kapott , míg az abroncs zajszintje 70 dB mely a 2 kategóriába sorolja a gumiabroncsot ebből a szempontból.','/uploads/inventory/inventory-1744219768989-988571277.jpg','/uploads/inventory/inventory-1744219768989-593556475.png',NULL,'all_season',215,55,17,'2025-04-09 17:29:28','2025-04-09 17:51:52'),(4,1,'Bridgestone Turanza T005 XL','car',16,55990.00,'Bridgestone Turanza T005 azoknak a sofőröknek készűt akik magabiztosak és irányítottan szeretnének vezetni a nedves és a száraz utakon. Az úton mutatott fékezési és kanyarodási teljesítményét a legjobbnak. Magasabb futásteljesítményt ér el, mint az elődje. Nedves utakon nagyobb biztonságban, és felkészültebbnek érezheti magát, ha zuhogó esőben kell vezetnie, vagy vízátfolyásokon halad át. A vállrész magas kiemelkedő elemei és a középen található széles rés együttesen gyorsan elvezetik a vizet a futófelületről, és csökkentik ezzel a vízensiklás kockázatát.\r\nFüggetlen abroncs tesztek alapján nedves úton történő fékezés és kanyarodás közben a Turanza T005 jobb teljesítményt nyújt, mint más vezető abroncstípusok. A Turanza T005 a NanoPro-Tech™ technológiát alkalmazó anyagkeverék miatt teljesít jobban, mint a többi abroncs. A kizárólag a Bridgestone által alkalmazott technológia révén a gumi megköti az úton lévő vizet, és jobb tapadást ér el nedves útviszonyoknál.\r\n\r\nOptimalizált futómintázat a még jobb tapadásért nedves úton:\r\n\r\nA Turanza T005 futómintázata révén nagyobb biztonságban, és felkészültebbnek érezheti magát, ha zuhogó esőben kell vezetnie, vagy vízátfolyásokon halad át. A vállrész magas kiemelkedő elemei és a középen található széles rés együttesen gyorsan elvezetik a vizet a futófelületről, és csökkentik ezzel a vízensiklás kockázatát.\r\n\r\nRobosztus felépítés és bordázat:\r\n\r\nA gumiréteg alatt található merev poliészter és acél szerkezet stabilabb kezelhetőséget eredményez, és csökkenti a gördülési ellenállást, aminek köszönhetően az Ön járművének alacsonyabb lesz az üzemanyag-fogyasztása.\r\n\r\nKiváló EU-címkeosztályok:\r\n\r\nA fejlesztések az anyagösszetétellel és a mintázattal együtt hozzájárultak ahhoz, hogy a Turanza T005 kiérdemelhesse az EU „A” címkeosztály megjelölést nedves úton, valamint a „B” minősítést a gördülési ellenállás tekintetében.','/uploads/inventory/inventory-1744220708214-495787630.jpg','/uploads/inventory/inventory-1744220708214-899403102.png',NULL,'summer',225,45,18,'2025-04-09 17:45:08','2025-04-09 17:45:08'),(5,1,'Hankook Ventus Prime4 K135','car',24,34990.00,'A Ventus Prime 4 esetében az új keverék többek között kevesebb kopást és nagyobb futásteljesítményt kíván biztosítani. A Ventus Prime 4 futásteljesítménye 20%-kal nőtt a Ventus Prime 3ashoz képest. Nyári utazások során esővel és viharral is kell számolnia az autósoknak. A Hankook is gondolkodott ezen, és javította a futófelület blokkjait, hogy jobban elvezesse a csapadékot, és főleg, hogy lerövidüljön a fékút.\r\n\r\nAz új Ventus Prime 4 blokkjai kifelé íveltek, ami hatékonyabbá teszi a vízelvezetést az abroncs alatt, és csökkenti a blokkok kopását. A Hankook korábban küzdött az abroncsai zajával. A Ventus Prime 4es mintázata ebből a szempontból is áttörésként értelmezhető, a Low Noise technológia állítólag csökkenti a gumiabroncsok zaját\r\n\r\nAz összetett kialakítás első ránézésre az airless (levegő nélküli) gumiabroncs-technológiát idézi, amelyet több gyártó is fejleszt a klasszikus légtöltésű abroncs helyettesítésére. A blokkok falait visszhangmentes kamra elemei borítják, amely blokkolja a zajt és így alacsony zajszintet biztosít.\r\n\r\n\r\nA Hankook Ventus Prime 4 egy kompakt abroncsnak tűnik, amely ugyanolyan erős lehet a különféle nyári időjárási ingadozások között. A személygépkocsik legszélesebb szegmenséhez tervezték, és 16-tól 20-ig terjedő átmérő méretben gyártják majd, a legnagyobb választék pedig 16 és 17-es átmérőjű.','/uploads/inventory/inventory-1744221098296-621861223.jpg','/uploads/inventory/inventory-1744221098297-15670358.jpg','/uploads/inventory/inventory-1744221098297-153557150.png','summer',205,60,16,'2025-04-09 17:51:38','2025-04-09 17:51:38'),(6,1,'Michelin X Multi Energy Z2','truck',20,386990.00,'Prémium kategóriás hajtott tengelyre való teherabroncs regionális szállításhoz. Alacsony gördülési ellenállása révén csökkenti az üzemanyag-fogyasztást, miközben kiváló futásteljesítményt és tapadást nyújt nedves, havas és száraz úton is. A 3PMSF és M+S jelöléseknek köszönhetően téli körülmények között is jogszerűen használható.','/uploads/inventory/inventory-1744221758632-991694196.jpg','/uploads/inventory/inventory-1744221758633-171213262.webp',NULL,'all_season',315,70,22,'2025-04-09 18:02:38','2025-04-09 18:05:09'),(7,1,'Continental Conti Hybrid HS3','truck',14,269990.00,'A Continental Conti Hybrid HS3 kifejezetten regionális és hosszabb távú szállításra tervezett prémium kormányzott tengelyre (steer) szerelhető abroncs. Kimagasló kopásállóság, kiváló nedves tapadás és alacsony gördülési ellenállás jellemzi, így ideális választás azoknak a flottáknak, amelyek a hatékonyság és a biztonság között keresik az egyensúlyt. A 3PMSF (három hegycsúcs hópehely) és M+S jelölések garantálják a négyévszakos használhatóságot, akár téli körülmények között is.','/uploads/inventory/inventory-1744222847537-473847795.jpg','/uploads/inventory/inventory-1744222563863-333409284.png','/uploads/inventory/inventory-1744222563863-936544021.png','all_season',305,70,19,'2025-04-09 18:16:03','2025-04-09 18:20:47'),(8,1,'Goodyear KMAX S Gen-2','truck',28,229990.00,'„A KMAX S GEN-2 a legnagyobb futásteljesítményű gumiabroncsunk. Míg egyes gumiabroncsok arra lettek tervezve, hogy üzemanyag-megtakarítást nyújtsanak az autópályákon és a regionális utakon, a KMAX S GEN-2 célja, hogy több kilométert biztosítson a befektetéséért – függetlenül az út típusától és az időjárástól.”\r\n\r\nÉrjen el több kilométert a pénzéért – bármilyen úton\r\nA KMAX S GEN-2 egy kitartó szörny. Kiváló tapadást biztosít, és elég strapabíró ahhoz, hogy tovább tartson, legyen szó autópályáról, regionális utakról vagy városi használatról. ','/uploads/inventory/inventory-1744223326237-683976431.jpeg','/uploads/inventory/inventory-1744223326237-349871464.png','/uploads/inventory/inventory-1744223326248-74005949.png','all_season',295,80,22,'2025-04-09 18:28:46','2025-04-09 18:28:46'),(9,1,'Bridgestone Duravis R660 Eco','truck',12,63990.00,'KIEMELKEDŐ FUTÁSTELJESÍTMÉNY\r\nA Duravis R660 konstrukciója garantálja a hosszú élettartamot és a kitűnő kopásállóságot. A magas futásteljesítmény hosszútávon kisebb üzemeltetési költséget jelent, így segítve Önt vállalkozása nyereségességének növelésében.\r\n\r\nKIMAGASLÓ BIZTONSÁG\r\nA jelentősen továbbfejlesztett futófelület megbízható kezelhetőséget tesz lehetővé szélsőségesen változó út- és időjárási viszonyok között. A gondosan megtervezett mintázat gyorsan vezeti el a vizet a kontaktfelületről, így biztosítva rövid fékutat még esős időben is.\r\n\r\nKEDVEZŐBB ÜZEMANYAGFOGYASZTÁS\r\nAz emelkedő üzemanyagárak azt jelentik, hogy az üzemanyag fogyasztásban elért legkisebb javulás is nagy előnyhöz juttathatja Önt vállalkozása jövedelmezőségében. A Duravis R660 Super-S alakú karkaszának köszönhetően csökkenti az üzemanyagfogyasztást.','/uploads/inventory/inventory-1744223672265-793389738.jpg','/uploads/inventory/inventory-1744223672265-697709730.png',NULL,'summer',215,65,16,'2025-04-09 18:34:32','2025-04-09 18:34:32'),(10,1,'Pirelli Chrono Serie 2','truck',6,132990.00,'Kényelmes és biztonságos, minden körülmények között.\r\n\r\nJellemezve az alacsony zajszintér, az abroncsok kiváló teljesítményűek még akkor is, ha dolgozik extrém körülmények között.\r\n\r\nEgy sokoldalú abroncs rövid és hosszú utakon. Kiváló teljesítmény nedves és száraz utakon. Az erős oldalfalak védik a kopástól parkolás közben.','/uploads/inventory/inventory-1744224339996-163271107.webp','/uploads/inventory/inventory-1744224339998-427505250.webp','/uploads/inventory/inventory-1744224340003-565204361.png','summer',235,65,16,'2025-04-09 18:45:40','2025-04-09 18:45:40'),(11,1,'Michelin Road 6','motorcycle',4,59990.00,'Egyértelműen 2022 legjobban várt újdonsága a gyáróriás új sporttúra abroncsa a Michelin Road 6. A legismertebb széria jelenlegi modellje folytatja a hagyományokat és nem célja a trón legfelső fokának átengedése. Kategórián belül továbbra is a legtöbb darabszámban értékesített abroncsot a Michelin Road család biztosítja. Ezt az elsőséget csak úgy őrizhetik meg ha továbbra is prémium minőségű abroncsokat gyártanak a motoros közönségnek. A felhasználók egy előző generációhoz mérten mindig többre vágynak, fontosnak tartják, hogy a magas árért cserébe az elérhető legnagyobb teljesítményt nyújtsa az abroncs bármilyen körülménnyel is találkozzanak az útjuk során. Ezért a gyártó azt garantálja, hogy azonos felhasználás mellett akár 10%-al hosszabb élettartammal rendelkezhetünk, ami az abroncs teljes élettartamára vetítve egy igen kiemelkedő érték. Túrasport abroncs lévén az élettartam mellett a száraz és nedves tapadás az egyik legfontosabb tényező, ezért az úgynevezett „void ratio amit nevezzünk csak egyszerűen mintázottsági aránynak, úgy van kialakítva, hogy bármilyen dőlésszög esetén ez az arány szinte állandó. Ez azt eredményezi, hogy konstans tapadással számolhatunk, ami kiszámíthatóságot eredményez, ezáltal biztonságosan motorozhatunk egy eső áztatta hegyi szerpentinen is vagy a legnagyobb napsütésben forró útfelületen. A MICHELIN X-Sipe Technology a MICHELIN Water Evergrip Technology kombinációja azt szolgálja, hogy az abroncs teljes élettartama során egyenletes teljesítményt nyújtson, legyen szó akár vészfékezésről a vonóerő átadásról vagy egy hírtelen fellépő kitérő manőverről. A nedves tapadás hasonló mértékben javult, mint az élettartam. A „Silica Rain összetétel pedig a tapadását hivatott fokozni abban az üzemállapotban amikor a abroncs teljes szerkezete még nem érte el azt a hőmérsékleti tartományt, ahol már biztonságos és megfelelő tapadással rendelkezik. A gyártó ennél a modellnél alkalmazta először a 2ct+ felépítést az első gumi esetén. Szintén további újítás egy aramid alapú merevítő betét alkalmazása, ami a súlycsökkentést és a nagyobb sebességnél fellépő alakváltozási tényezőt hivatott csökkenteni. A nagy súlyú túragépekre továbbra is a megszokott GT jelölésű változatot kínálja a gyártó. A legújabb felső kategóriás modellekre jellemző magas esztétikai megjelenést továbbra is a Premium Touch oldalfal biztosítja.','/uploads/inventory/inventory-1744226784892-413531943.jpg','/uploads/inventory/inventory-1744226784893-584486731.jpg','/uploads/inventory/inventory-1744226388492-928135127.webp','all_season',120,70,17,'2025-04-09 19:19:48','2025-04-09 19:26:24'),(12,1,'Pirelli DIABLO ROSSO IV','motorcycle',26,58990.00,'Pirelli Diablo Rosso IV sport gumiabroncs\r\nA Pirelli Diablo Rosso IV kiváló minőségű sport gumiabroncs, melyet a Superbike világbajnokság tapasztalatai alapján, univerzális felhasználásra fejlesztettek.\r\nPirelli Diablo Rosso IV: a tökéletes utcai sport abroncs, melyet a legextrémebb körülmények közt fejlesztettek\r\nA Pirelli Diablo Rosso IV tökéletes sport gumiabroncs, melyet a gyártó a Superbike világbajnokság során szerzett tapasztalatai alapján fejlesztett. Megalkotásakor az elsődleges szempont egy igazán univerzális spot abroncs létrehozása volt. Egy olyan gumié, mely akár mindennapos használatra is alkalmas, de ha szükséges, képes a versenypályán szükséges, maximum teljesítményt nyújtani.\r\nCélközönségét tehát leginkább azok az utcai motorosok jelentik, akik sem a teljesítmény, sem a tökéletes tapadás, sem az élettartam terén nem hajlandóak arra, hogy kompromisszumokat kössenek.\r\nA Diablo Rosso IV éppen kiváló irányíthatósággal rendelkezik, és száraz, valamint nedves terepen egyaránt tökéletesen teljesít. Ez leginkább a különleges szilika adaléknak köszönhető, mely a tapadás mellett a gumiabroncs tartósságát is garantálja. De ehhez hozzájárul az egyedi villám mintázat is, mely régóta a Diablo termékcsalád védjegye.\r\nAz abroncs anyagösszetétel elődeihez képest olyan változtatásokon esett át, melyek segítik a mindennapos használhatóságot. A Diablo Rosso IV például rövidebb bemelegedési időt garantál és szélsőséges felhasználás közben történő kémiai változások mértékét is csökkenti.\r\nPirelli: minden körülmények között tökéletes megoldás\r\nAz 1872-ben, Milánóban alapított Pirelli a gumiabroncsok piacán valódi etalonnak számít. A Pirelli által fejlesztett motorgumik a legkelendőbb termékek a piacon, és nem véletlenül.  \r\nA gyártó neve ugyanis garanciát jelent a tökéletes stabilitásra, az általa készített gumik pedig száz százalékosan képesek kielégíteni a motorosok igényeit. Legyen szó akár utcai, akár pályán, akár terepen történő használatról, a Pirelli egyet jelent a tökéletes minőséggel. Ez a gyártó közel 150 éves tapasztalatának és a motorsportok terén szerzett, folyamatosan megújuló tudásának köszönhető.','/uploads/inventory/inventory-1744227085364-482008639.jpg','/uploads/inventory/inventory-1744227085364-486140081.png',NULL,'summer',120,70,17,'2025-04-09 19:31:25','2025-04-09 19:31:25'),(13,1,'METZELER Roadtec 01 SE','motorcycle',16,71990.00,'Az új ROADTEC 01 a Metzeler vezető terméke a sport túrázás kategóriában, amely radiális és X-Ply szerkezeteket kínál, azzal a céllal, hogy növelje a tapadást nedves és alacsony súrlódású felületeken, növelje a futásteljesítményt és magas fokú alkalmazkodóképességet biztosítson különböző motorkerékpárokhoz, vezetési stílusokhoz és körülményekhez.\r\n\r\nAz ROADTEC 01 új, javított vegyületmegoldást kínál, amely javítja a kémiai tapadást és ragasztó tulajdonságokat mindenféle helyzetben. A radiális elsők teljes szilika vegyületet tartalmaznak, amely kiváló kémiai tapadást biztosít a barázdák elrendezésével együtt. A radiális hátsók két komponensű elrendezést mutatnak, ahol a középső sáv körülbelül 20% -át fedi, a maradék 80% egyenlően feloszlik a két váll között. Az ROADTEC 01 X-Ply első és hátsó abroncsok egyedi szénfekete alapú vegyülettel rendelkeznek, amely kiváló tapadást biztosít szárazon és páratlan nedves tapadást.\r\n\r\nAz ROADTEC 01 biztonságot nyújt nedves és alacsony súrlódású felületeken. A Metzeler kifejlesztett egy új futófelületi tervezési koncepciót, amely képes fokozni a mechanikai tapadást, egyértelműen érezhető előnnyel a gyorsítás és a fékezés során. Az első gumiabroncs nagy mennyiségű keresztirányú barázdával rendelkezik, amelyek egyes elemként tapadnak az aszfalthoz, és növelik a vízelvezetést. A hátsó abroncsok hosszú és rövid barázdákat mutatnak ellentétes irányban és különböző funkciókkal.\r\n\r\nAz ROADTEC 01 növelte a futásteljesítményt 10% -kal az ROADTEC Z8 INTERACT -hoz képest. Az innovatív profilok rövid és széles nyomfelületet generálnak, amely csökkenti a vegyület fogyasztását és növeli a kopás egyenletességét. Az ROADTEC 01 érintkezési felülete rövidebb, szélesebb és nagyobb területű, ha összehasonlítjuk az ROADTEC Z8 INTERACT -éval.\r\n\r\nAz ROADTEC 01 stabilitást és pályaprecizitást biztosít. Az ROADTEC 01 szerkezetei rugalmasabb szerkezetűek, lehetővé téve a vegyület deformációját a mechanikai tapadás elősegítése érdekében. A Metzeler kihasználja a teljes technológiai portfólióját különböző alkalmazásokhoz, hogy a legjobb megoldást biztosítsa a termék célnak megfelelő teljesítményre. Mind a radiális, mind az X-Ply szerkezeteket használják, párosítva vagy hajlított vagy 0° acélövekkel Interact technológiával. Az ROADTEC 01 kínálatának minden mérete alápárosítva van az adott szerelvény specifikus igényeinek megfelelően.','/uploads/inventory/inventory-1744227454524-538063116.jpg','/uploads/inventory/inventory-1744227454524-930055631.png',NULL,'winter',180,55,17,'2025-04-09 19:37:34','2025-04-10 07:14:14'),(14,1,'Bridgestone Battlax HyperSport S22','motorcycle',32,53990.00,'Bridgestone Battlax Hypersport S22 gumiabroncs\r\nA Bridgestone Battlax Hypersport S22 utcai sportgumi, mely kiváló kezelhetőségének köszönhetően garantálja, hogy motorkerékpárunkból minden körülmény közt kihozhassuk a maximumot.\r\nBattlax Hypersport S22: tökéletes kezelhetőség és biztonság a nedves utakon is\r\nA Bridgestone Battlax Hypersport S22 a Bridgestone „S, azaz Sport szériájának új tagja, a korábbi tesztgyőztes S21 modell közvetlen utódja. Utcai sportgumi, melyet a legújabb MotoGP-ből származó konstrukciós és keverék technológiák segítségével fejlesztettek.  \r\nAz S22-t kifejezetten arra tervezték, hogy elődeihez hasonlóan minden útviszony mellett képes legyen helytállni. A speciális 3D-s mintázata azonban garantálja azt, hogy nedves útfelületen kiemelkedő teljesítményt nyújtson.  \r\nA kiváló teljesítmény mellett az S22 kiemelkedő kezelhetőséget is kínál. A gyártó nagy figyelmet fektetett az úttal való érintkezésre és a kanyarodásra is, ennek köszönhetően az abroncs nem csak a teljesítmény, de a biztonság fokozásában is hatékony.  \r\nA fejlett anyagmegmunkálás és tervezés garantálja azt, hogy a Bridgestone Battlax Hypersport S22 megfelel a legkomolyabb elvárásoknak is és nem csak hatékony, de tartós megoldást is jelent egyben. Az S21-hez hasonlóan erősebb kopásállóságot és garantáltan hosszabb élettartamot kínál, mint bármelyik egyéb alternatíva a kategóriájában.  \r\nA Bridgestone abroncsokra minden körülmények közt számíthatunk\r\nMotorosként olyan abroncsra van szükségünk, képes motorkerékpárunk műszaki jellemzőit hatékonyan összehangolni vezetői stílusunkkal, ezáltal pedig képes növelni a gép teljesítményét.   A Bridgestone gumiabroncsokat úgy dolgozták ki, hogy minden körülmények közt biztonságosak és hatékonyak legyenek. Használatukkal lehetőségünk van a gépi és az emberi tényezők tökéletes összehangolására.\r\nMinden olyan elvárásnak megfelelnek, melyet egy modern motoros egy tökéletes minőségű abronccsal szemben támaszthat. A kínálatban minden vezetési stílushoz és útviszonyhoz megtalálhatjuk a tökéletesen megfelelő, biztonságos és magas teljesítményt garantáló gumikat.','/uploads/inventory/inventory-1744227963479-80799884.jpg','/uploads/inventory/inventory-1744227963479-71763449.png',NULL,'summer',120,70,17,'2025-04-09 19:46:03','2025-04-09 19:46:49'),(15,1,'Dunlop Sportmax Q5','motorcycle',2,81990.00,'A Dunlop Sportmax Q5 egy csúcsteljesítményű, közúti használatra is engedélyezett motorkerékpár-abroncs, amelyet kifejezetten pályanapokra és sportos vezetésre terveztek. A MotoAmerica versenyzőivel együttműködésben kifejlesztett Q5 modell jelentős fejlesztéseket kínál elődjéhez, a Q4-hez képest, anélkül hogy ez a gumiabroncs élettartamának rovására menne.\r\nFőbb jellemzők:\r\n\r\nFejlett technológia: A Q5 új konstrukciót, profilokat, keverékeket és futófelületi mintázatokat alkalmaz a jobb teljesítmény érdekében.\r\n\r\nGyors bemelegedés: Az abroncs gyorsan eléri az üzemi hőmérsékletet, így nem szükséges gumiabroncs-melegítők használata. ​\r\n\r\nNedves és száraz tapadás: Bár az abroncsot elsősorban száraz körülményekre optimalizálták, megfelelő tapadást biztosít nedves útfelületen is. ','/uploads/inventory/inventory-1744228777343-897089967.jpg','/uploads/inventory/inventory-1744228777343-487098447.jpg','/uploads/inventory/inventory-1744228680789-453687854.png','summer',120,70,17,'2025-04-09 19:58:00','2025-04-09 19:59:37'),(16,2,'Nokian Seasonproof','car',6,39990.00,'Nokian Tyres gumiabroncs gyár 215/60R16 méretű abroncsát V, azaz maximálisan 240 km/h sebességhez tervezte, emellett 99 vagyis 775kg az üzemszerű terhelhetősége. Ez a négyévszakos gumi a Nokian Tyres seasonproof-1 elnevezésű mintázatának segítségével tapad az útra, , erősített oldalfalú személy abroncs. Az EU-cimkézés A-tól G-ig terjedő skáláján, ahol az A a legjobb értékelés, nedves tapadásra B, üzemanyag fogyasztásra B értékelést kapott , míg az abroncs zajszintje 72 dB mely a 2 kategóriába sorolja a gumiabroncsot ebből a szempontból.','/uploads/inventory/inventory-1744266572176-517623020.jpg','/uploads/inventory/inventory-1744266572179-407040193.jpg','/uploads/inventory/inventory-1744266572185-326905459.jpg','all_season',215,60,16,'2025-04-10 06:29:32','2025-04-10 06:29:32'),(17,2,'Falken Ziex ZE310 Ecorun','car',8,29990.00,'A Falken Ziex ZE310 Ecorun egy modern, megbízható nyári gumiabroncs, amelyet úgy terveztek, hogy kompromisszumok nélkül kínáljon kiváló teljesítményt mindennapi használatra.\r\nA Falken márka a középkategóriás abroncsok piacán évek óta bizonyít, a ZE310 Ecorun pedig az egyik legnépszerűbb választás azok körében, akik fontosnak tartják a biztonságot, a kényelmet és az elérhető árat.','/uploads/inventory/inventory-1744266880395-518663734.jpg','/uploads/inventory/inventory-1744266880396-905023598.jpg','/uploads/inventory/inventory-1744266880397-967868517.png','summer',195,65,15,'2025-04-10 06:34:40','2025-04-10 06:34:40'),(18,2,'Kleber Krisalp HP3','car',12,31990.00,'A Kleber Krisalp HP3 egy prémium minőségű téli gumiabroncs, amelyet a Michelin csoport szakértelme és technológiája inspirált. A márka célja, hogy a biztonságot, a teljesítményt és az elérhető árat ötvözze – így született meg a Krisalp HP3 modell, amely tökéletes választás azok számára, akik nem akarnak kompromisszumot kötni a hideg, csúszós hónapokban sem.','/uploads/inventory/inventory-1744267068624-96557025.jpg','/uploads/inventory/inventory-1744267068624-478787373.jpg','/uploads/inventory/inventory-1744267068626-55205157.png','winter',195,65,15,'2025-04-10 06:37:48','2025-04-10 06:37:48'),(19,2,'Barum Bravuris 5HM','car',14,24990.00,'Barum nyári gumiabroncs igényes személyautók számára – 2014-es újdonság! A Bravuris 3HM egy remekül kiegyensúlyozott teljesítménnyel rendelkező abroncs, amely a nagy futásteljesítményt és a megbízható kezelhetőséget tökéletes harmóniában egyesíti.\r\n\r\nÍgy ez a gumiabroncs ideális választás a gazdaságos üzemeltetést és a biztonságos autózást szem előtt tartó vezetők számára.\r\n\r\nMár a neve is tartalmazza a legfontosabb tulajdonságát, ugyanis a ‘HM’ jelölés egyet jelent a nagy futásteljesítménnyel (High Mileage).A Barum abroncsok a Continental európai gyáraiban készülnek.','/uploads/inventory/inventory-1744267269502-771081888.jpg','/uploads/inventory/inventory-1744267269502-147621981.jpg','/uploads/inventory/inventory-1744267346320-618016291.png','summer',205,55,16,'2025-04-10 06:41:09','2025-04-10 06:42:26'),(20,2,'Fulda Conveo Tour 2','truck',10,46990.00,'A Fulda Conveo Tour 2 a kisteherautók és furgonok számára készült strapabíró nyári gumiabroncs, amely a megbízhatóságot, a gazdaságosságot és a hosszú élettartamot helyezi előtérbe. A Fulda – a Goodyear csoport tagjaként – olyan terméket kínál, amely elérhető áron képes prémium közeli teljesítményt nyújtani.\r\n\r\n','/uploads/inventory/inventory-1744268257263-996902953.jpg','/uploads/inventory/inventory-1744268257263-971427217.jpg','/uploads/inventory/inventory-1744267544819-99022209.jpg','summer',195,75,16,'2025-04-10 06:45:44','2025-04-10 06:57:37'),(21,2,'Continental EcoContact 6','car',16,35990.00,'A Continental EcoContact 6 a német precizitás és a környezettudatos fejlesztés tökéletes eredménye. Ha fontos számodra a hosszú élettartam, a kiemelkedő üzemanyag-takarékosság és a kompromisszumok nélküli biztonság, akkor ez az abroncs ideális választás.','/uploads/inventory/inventory-1744268751222-788284040.jpg','/uploads/inventory/inventory-1744268751223-525307621.png',NULL,'winter',195,65,15,'2025-04-10 07:05:51','2025-04-10 07:13:55'),(22,2,'Goodyear EfficientGrip Cargo','truck',24,53990.00,'A Goodyear EfficientGrip Cargo kifejezetten haszongépjárművek számára készült nyári gumi, amely egyszerre kínál kiváló tartósságot és üzemanyag-hatékonyságot. A Goodyear innovatív technológiáinak köszönhetően az abroncs csökkenti az üzemeltetési költségeket, miközben megbízható teljesítményt nyújt a legkeményebb kihívások között is.','/uploads/inventory/inventory-1744268933237-134656719.jpg','/uploads/inventory/inventory-1744268933238-992448968.png',NULL,'summer',215,65,16,'2025-04-10 07:08:53','2025-04-10 07:08:53'),(23,2,'Michelin Agilis+','truck',18,59990.00,'A Michelin Agilis+ a teherabroncsok új generációját képviseli. A Michelin legendás tartósságát ötvözi a kiváló energiahatékonysággal, így ideális választás mindazoknak, akik nem szeretnének kompromisszumot kötni a biztonság, a gazdaságosság és a hosszú élettartam terén.','/uploads/inventory/inventory-1744269027587-212482561.jpg','/uploads/inventory/inventory-1744269027587-836796298.webp',NULL,'winter',215,70,15,'2025-04-10 07:10:27','2025-04-10 07:14:04'),(24,2,'Pirelli Carrier AllSeasons','truck',6,51990.00,'A Pirelli Carrier egy megbízható választás azoknak, akik strapabíró, de komfortos teherabroncsot keresnek. A Pirelli fejlesztései révén az abroncs száraz és nedves körülmények között egyaránt stabilitást és biztonságot nyújt, miközben kiemelkedő élettartammal rendelkezik.','/uploads/inventory/inventory-1744269173333-507298634.jpg','/uploads/inventory/inventory-1744269173333-368466620.png',NULL,'all_season',225,70,15,'2025-04-10 07:12:53','2025-04-10 07:12:53'),(25,2,'BFGoodrich Activan 4S','truck',20,55990.00,'​A BFGoodrich Activan 4S 205/65 R16C 107T egy kiváló minőségű, négyévszakos gumiabroncs, amelyet kifejezetten haszongépjárművek számára terveztek. Ez az abroncs egész évben megbízható teljesítményt nyújt, így nincs szükség szezonális cserére, ami időt és pénzt takarít meg a vállalkozások számára.','/uploads/inventory/inventory-1744269638488-219106544.jpg','/uploads/inventory/inventory-1744269638488-229068561.jpg',NULL,'all_season',205,65,16,'2025-04-10 07:20:38','2025-04-10 07:20:38'),(26,2,'Michelin Pilot Road 5','motorcycle',12,58990.00,'A Michelin Road 5 a sport-túra motorosok egyik legnépszerűbb választása, amely kiváló tapadást és biztonságot nyújt minden időjárási körülmény között. A Michelin legújabb fejlesztéseinek köszönhetően az abroncs kiváló teljesítményt biztosít nedves és száraz úton egyaránt.','/uploads/inventory/inventory-1744270116350-654439765.jpg','/uploads/inventory/inventory-1744270116350-901701746.webp',NULL,'summer',120,70,17,'2025-04-10 07:28:36','2025-04-10 07:28:36'),(27,2,'Pirelli Angel GT II','motorcycle',4,71990.00,'A Pirelli Angel GT II kiválósport-túra abroncs azok számára, akik nem csak megbízható és jól teljesítő, de hosszúéletű megoldást is keresnek egyben.\r\nPirelli Angel GT II: kiváló tapadás, hosszú élettartam\r\nA Pirelli Angel GT II kiemelkedő minőségű sport-túra gumiabroncs, mely a kategória számos fontos jellemzővel bír. Nem csak a saját szegmenség belül az egyik legjobb megoldás, de a Pirelli termékei közt is kimagasló színvonalat képvisel, ami már alapjában véve garancia a minőségre.','/uploads/inventory/inventory-1744270533656-235501824.jpg','/uploads/inventory/inventory-1744270533656-352622688.png',NULL,'summer',180,55,17,'2025-04-10 07:35:33','2025-04-10 07:35:33'),(28,2,'Heidenau K62 Snowtex','motorcycle',2,24990.00,'A Heidenau K62 M+S Snowtex egy kifejezetten téli használatra tervezett robogó gumiabroncs, amely kiváló teljesítményt nyújt hideg és nedves időjárási körülmények között. A 120/70-13 TL 53P méretű változata ideális választás azok számára, akik a téli hónapokban is biztonságosan szeretnének közlekedni robogójukkal.​','/uploads/inventory/inventory-1744271065141-19690441.jpg','/uploads/inventory/inventory-1744271065142-623297900.png',NULL,'winter',130,60,13,'2025-04-10 07:44:25','2025-04-10 07:44:25');
  /*!40000 ALTER TABLE `inventory` ENABLE KEYS */;
  UNLOCK TABLES;

  --
  -- Table structure for table `cart_items`
  --

  /*!40101 SET @saved_cs_client     = @@character_set_client */;
  /*!50503 SET character_set_client = utf8mb4 */;
  CREATE TABLE `cart_items` (
    `id` int NOT NULL AUTO_INCREMENT,
    `cart_id` int NOT NULL,
    `product_type` enum('inventory') NOT NULL,
    `product_id` int NOT NULL,
    `quantity` int NOT NULL,
    `createdAt` datetime NOT NULL,
    `updatedAt` datetime NOT NULL,
    PRIMARY KEY (`id`),
    KEY `cart_id` (`cart_id`),
    CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `cart` (`id`) ON DELETE CASCADE
  ) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
  /*!40101 SET character_set_client = @saved_cs_client */;

  --
  -- Dumping data for table `cart_items`
  --

  LOCK TABLES `cart_items` WRITE;
  /*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
  /*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
  UNLOCK TABLES;

  --
  -- Table structure for table `order_items`
  --

  /*!40101 SET @saved_cs_client     = @@character_set_client */;
  /*!50503 SET character_set_client = utf8mb4 */;
  CREATE TABLE `order_items` (
    `id` int NOT NULL AUTO_INCREMENT,
    `order_id` int NOT NULL,
    `product_type` enum('inventory') NOT NULL,
    `product_id` int NOT NULL,
    `quantity` int NOT NULL,
    `unit_price` decimal(10,2) NOT NULL,
    `createdAt` datetime NOT NULL,
    `updatedAt` datetime NOT NULL,
    PRIMARY KEY (`id`),
    KEY `order_id` (`order_id`),
    CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
  /*!40101 SET character_set_client = @saved_cs_client */;

  --
  -- Dumping data for table `order_items`
  --

  LOCK TABLES `order_items` WRITE;
  /*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
  /*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
  UNLOCK TABLES;

  --
  -- Table structure for table `garages`
  --

  /*!40101 SET @saved_cs_client     = @@character_set_client */;
  /*!50503 SET character_set_client = utf8mb4 */;
  CREATE TABLE `garages` (
    `id` int NOT NULL AUTO_INCREMENT,
    `owner_id` int NOT NULL,
    `name` varchar(255) NOT NULL,
    `location` varchar(255) NOT NULL,
    `contact_info` varchar(255) DEFAULT NULL,
    `description` text,
    `opening_hours` varchar(255) DEFAULT NULL,
    `createdAt` datetime NOT NULL,
    `updatedAt` datetime NOT NULL,
    PRIMARY KEY (`id`),
    KEY `owner_id` (`owner_id`),
    CONSTRAINT `garages_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
  ) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
  /*!40101 SET character_set_client = @saved_cs_client */;

  --
  -- Dumping data for table `garages`
  --

  LOCK TABLES `garages` WRITE;
  /*!40000 ALTER TABLE `garages` DISABLE KEYS */;
  INSERT INTO `garages` VALUES (1,1,'ProGumi Műhely','Balatonszentgyörgy, Bodon u. 65, 8710','+36 30 123 4567','A ProGumi Műhely gyors, precíz és megbízható gumiszervíz, ahol szakértelemmel és korszerű eszközökkel gondoskodunk autódról.\n\n','H-P. 8:00-20:00 Sz-V. Zárva','2025-04-09 16:38:42','2025-04-09 16:47:33'),(2,1,'AbroTech Szerviz','Keszthely, Csapás út 12, 8360','+36 30 456 7891','Az AbroTech Szerviz modern megoldásokat kínál. Megbízható munkával biztosítjuk, hogy Te mindig nyugodtan és biztonságban indulj útnak.','H-P: 8:00-16:00 Sz: 10:00- 14:00 V: Zárva','2025-04-09 16:45:41','2025-04-10 06:58:58');
  /*!40000 ALTER TABLE `garages` ENABLE KEYS */;
  UNLOCK TABLES;
  /*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

  /*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
  /*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
  /*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
  /*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
  /*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
  /*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
  /*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

  -- Dump completed on 2025-04-10 10:07:29
