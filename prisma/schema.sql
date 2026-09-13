-- ==============================================================================
-- สคริปต์สร้างฐานข้อมูลและตาราง (DDL เพียวๆ ไม่มีข้อมูลตัวอย่าง)
-- บริษัท ดีถาวรการบัญชี จำกัด (Deethavorn Accounting Co., Ltd.)
-- รองรับ: MySQL 8.0+ / MariaDB 10.5+ | Character Set: utf8mb4
-- ==============================================================================

-- 1. สร้างฐานข้อมูล
CREATE DATABASE IF NOT EXISTS `wealthi1_deethavorn` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `wealthi1_deethavorn`;

-- ------------------------------------------------------------------------------
-- 2. ตารางเว็บไซต์หน้าบ้าน (Public Web Leads & Content)
-- ------------------------------------------------------------------------------

-- ตารางผู้ติดต่อขอคำปรึกษาผ่านแบบฟอร์มหน้าเว็บ
CREATE TABLE IF NOT EXISTS `contact_leads` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `message` TEXT NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'NEW',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตารางบทความคลังความรู้
CREATE TABLE IF NOT EXISTS `articles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `summary` VARCHAR(500) DEFAULT NULL,
  `content` LONGTEXT NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `cover_image` VARCHAR(255) DEFAULT NULL,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตารางคำถามที่พบบ่อย (FAQ)
CREATE TABLE IF NOT EXISTS `faqs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `question` VARCHAR(255) NOT NULL,
  `answer` TEXT NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. ตารางระบบหลังบ้าน (RBAC & Authentication)
-- ------------------------------------------------------------------------------

-- ตารางสิทธิ์ผู้ใช้งาน (RBAC Matrix Roles)
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `description` VARCHAR(255) DEFAULT NULL,
  `permissions` JSON NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตารางผู้ใช้งานระบบหลังบ้าน
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `role_id` INT NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. ตารางทะเบียนบริษัท และรายชื่อผู้ติดต่อย่อย (Company Directory)
-- ------------------------------------------------------------------------------

-- ตารางรายชื่อบริษัทลูกค้า (Reusable Master)
CREATE TABLE IF NOT EXISTS `companies` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(200) NOT NULL UNIQUE,
  `tax_id` VARCHAR(20) DEFAULT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตารางรายชื่อผู้ติดต่อย่อยในแต่ละบริษัท (1 บริษัทมีหลายคน: การเงิน, บัญชี, กรรมการ)
CREATE TABLE IF NOT EXISTS `company_contacts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `role_title` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `line_id` VARCHAR(100) DEFAULT NULL,
  `is_primary` TINYINT(1) NOT NULL DEFAULT 0,
  `notes` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_contacts_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. ตารางวิธีชำระเงิน, บันทึกภาษี และประวัติการทวงถาม (Tax Payments & Dunning)
-- ------------------------------------------------------------------------------

-- ตารางช่องทางการชำระเงิน (บัตรเครดิตสำนักงาน, โอน, เงินสด)
CREATE TABLE IF NOT EXISTS `payment_methods` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `card_last_digits` VARCHAR(4) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตารางบันทึกการจ่ายภาษีแทนลูกค้า (ภ.ง.ด.51, ภ.ง.ด.1/3/53, ภ.พ.30)
CREATE TABLE IF NOT EXISTS `tax_payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL,
  `payment_method_id` INT NOT NULL,
  `tax_type` VARCHAR(30) NOT NULL,
  `tax_year` VARCHAR(10) NOT NULL,
  `tax_month` VARCHAR(10) DEFAULT NULL,
  `payment_date` DATE NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `reference_no` VARCHAR(100) DEFAULT NULL,
  `billing_status` VARCHAR(20) NOT NULL DEFAULT 'UNBILLED',
  `reimbursed_at` DATETIME DEFAULT NULL,
  `note` TEXT DEFAULT NULL,
  `created_by_id` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_tax_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_tax_payment_method` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_tax_user` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  INDEX `idx_tax_type_year` (`tax_type`, `tax_year`),
  INDEX `idx_tax_company` (`company_id`),
  INDEX `idx_tax_method` (`payment_method_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตารางบันทึกประวัติการทวงถาม/ติดตามยอดค้างชำระ (Dunning & Collection Activity Log)
CREATE TABLE IF NOT EXISTS `follow_up_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL,
  `contact_id` INT DEFAULT NULL,
  `tax_payment_id` INT DEFAULT NULL,
  `channel` VARCHAR(30) NOT NULL,
  `result` VARCHAR(50) NOT NULL,
  `promised_date` DATE DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_by_id` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_log_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_log_contact` FOREIGN KEY (`contact_id`) REFERENCES `company_contacts` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_log_tax` FOREIGN KEY (`tax_payment_id`) REFERENCES `tax_payments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_log_user` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  INDEX `idx_log_company` (`company_id`),
  INDEX `idx_log_contact` (`contact_id`),
  INDEX `idx_log_tax` (`tax_payment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
