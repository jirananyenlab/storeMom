-- 01-table.sql - Create database schema
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema storemom
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `storemom` DEFAULT CHARACTER SET utf8mb3 ;
USE `storemom` ;

-- -----------------------------------------------------
-- Table `storemom`.`customer`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `storemom`.`customer` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `fname` VARCHAR(45) NOT NULL,
  `lname` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC))
ENGINE = InnoDB
AUTO_INCREMENT = 10
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `storemom`.`orders`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `storemom`.`orders` (
  `orderId` INT NOT NULL AUTO_INCREMENT,
  `totalAmount` INT NULL DEFAULT NULL,
  `customer_id` INT NOT NULL,
  `orderDate` DATETIME NULL DEFAULT NULL,
  `profit` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`orderId`),
  UNIQUE INDEX `orderId_UNIQUE` (`orderId` ASC),
  INDEX `fk_order_customer_idx` (`customer_id` ASC),
  CONSTRAINT `fk_order_customer`
    FOREIGN KEY (`customer_id`)
    REFERENCES `storemom`.`customer` (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `storemom`.`product`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `storemom`.`product` (
  `productId` INT NOT NULL AUTO_INCREMENT,
  `productName` VARCHAR(45) NOT NULL,
  `quantityInStock` INT NULL DEFAULT NULL,
  `price` INT NOT NULL,
  `volume` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`productId`))
ENGINE = InnoDB
AUTO_INCREMENT = 8
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `storemom`.`orderdetail`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `storemom`.`orderdetail` (
  `orderDetailId` INT NOT NULL AUTO_INCREMENT,
  `quantityOrdered` INT NULL DEFAULT NULL,
  `priceEach` INT NULL DEFAULT NULL,
  `productId` INT NOT NULL,
  `orderId` INT NOT NULL,
  PRIMARY KEY (`orderDetailId`),
  UNIQUE INDEX `orderDetailId_UNIQUE` (`orderDetailId` ASC),
  INDEX `fk_orderDetail_product1_idx` (`productId` ASC),
  INDEX `fk_orderdetail_order1_idx` (`orderId` ASC),
  CONSTRAINT `fk_orderdetail_order1`
    FOREIGN KEY (`orderId`)
    REFERENCES `storemom`.`orders` (`orderId`),
  CONSTRAINT `fk_orderDetail_product1`
    FOREIGN KEY (`productId`)
    REFERENCES `storemom`.`product` (`productId`))
ENGINE = InnoDB
AUTO_INCREMENT = 7
DEFAULT CHARACTER SET = utf8mb3;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
