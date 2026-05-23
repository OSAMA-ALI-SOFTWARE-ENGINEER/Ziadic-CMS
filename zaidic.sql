-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 23, 2026 at 09:12 PM
-- Server version: 8.4.3
-- PHP Version: 8.4.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `zaidic`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `subject_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject_id` bigint UNSIGNED DEFAULT NULL,
  `event` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `properties` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint UNSIGNED NOT NULL,
  `parent_id` bigint UNSIGNED DEFAULT NULL,
  `type` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'listing',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `seo_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seo_description` text COLLATE utf8mb4_unicode_ci,
  `seo_keywords` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `canonical_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `og_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `og_description` text COLLATE utf8mb4_unicode_ci,
  `og_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `robots` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `parent_id`, `type`, `name`, `slug`, `description`, `icon`, `sort_order`, `is_active`, `seo_title`, `seo_description`, `seo_keywords`, `canonical_url`, `og_title`, `og_description`, `og_image`, `robots`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, NULL, 'listing', 'Arts and Culture', 'arts-and-culture', NULL, NULL, 0, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-23 15:21:22', '2026-05-23 15:21:22', NULL),
(2, NULL, 'listing', 'Dining and Restaurants', 'dining-and-restaurants', NULL, NULL, 0, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-23 15:21:22', '2026-05-23 15:21:22', NULL),
(3, NULL, 'listing', 'Sports and Fitness', 'sports-and-fitness', NULL, NULL, 0, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-23 15:21:23', '2026-05-23 15:21:23', NULL),
(4, NULL, 'listing', 'Shopping and Retail', 'shopping-and-retail', NULL, NULL, 0, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-23 15:21:23', '2026-05-23 15:21:23', NULL),
(5, NULL, 'listing', 'Travel and Exploration', 'travel-and-exploration', NULL, NULL, 0, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-23 15:21:23', '2026-05-23 15:21:23', NULL),
(6, NULL, 'listing', 'Entertainment and Nightlife', 'entertainment-and-nightlife', NULL, NULL, 0, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-23 15:21:23', '2026-05-23 15:21:23', NULL),
(7, NULL, 'listing', 'Wedding and Event Location', 'wedding-and-event-location', NULL, NULL, 0, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-23 15:21:23', '2026-05-23 15:21:23', NULL),
(8, NULL, 'listing', 'Car Rental', 'car-rental', NULL, NULL, 0, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-23 15:21:23', '2026-05-23 15:21:23', NULL),
(9, NULL, 'blog', 'City Life', 'city-life', NULL, NULL, 0, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-23 15:21:23', '2026-05-23 15:21:23', NULL),
(10, NULL, 'blog', 'Travelling', 'travelling', NULL, NULL, 0, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-23 15:21:23', '2026-05-23 15:21:23', NULL),
(11, NULL, 'blog', 'Artistry', 'artistry', NULL, NULL, 0, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-23 15:21:23', '2026-05-23 15:21:23', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `cities`
--

CREATE TABLE `cities` (
  `id` bigint UNSIGNED NOT NULL,
  `country_id` bigint UNSIGNED DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state_region` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `code` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `seo_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seo_description` text COLLATE utf8mb4_unicode_ci,
  `seo_keywords` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `canonical_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `og_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `og_description` text COLLATE utf8mb4_unicode_ci,
  `og_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `robots` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cities`
--

INSERT INTO `cities` (`id`, `country_id`, `name`, `slug`, `state_region`, `code`, `description`, `seo_title`, `seo_description`, `seo_keywords`, `canonical_url`, `og_title`, `og_description`, `og_image`, `robots`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'Vlore, AL', 'vlore-al', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-05-23 15:21:22', '2026-05-23 15:21:22', NULL),
(2, 1, 'Tirana, AL', 'tirana-al', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-05-23 15:21:22', '2026-05-23 15:21:22', NULL),
(3, 2, 'Prizren, KS', 'prizren-ks', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-05-23 15:21:22', '2026-05-23 15:21:22', NULL),
(4, 3, 'Skopje, MK', 'skopje-mk', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-05-23 15:21:22', '2026-05-23 15:21:22', NULL),
(5, 4, 'Berlin, DE', 'berlin-de', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-05-23 15:21:22', '2026-05-23 15:21:22', NULL),
(6, 5, 'Salzburg, AT', 'salzburg-at', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-05-23 15:21:22', '2026-05-23 15:21:22', NULL),
(7, 6, 'Luzern, CH', 'luzern-ch', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-05-23 15:21:22', '2026-05-23 15:21:22', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'new',
  `assigned_to` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `countries`
--

CREATE TABLE `countries` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `iso2` char(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `iso3` char(3) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_code` varchar(16) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `countries`
--

INSERT INTO `countries` (`id`, `name`, `iso2`, `iso3`, `phone_code`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Albania', 'AL', 'ALB', NULL, 1, '2026-05-23 15:21:22', '2026-05-23 15:21:22'),
(2, 'Kosovo', 'XK', 'XKX', NULL, 1, '2026-05-23 15:21:22', '2026-05-23 15:21:22'),
(3, 'North Macedonia', 'MK', 'MKD', NULL, 1, '2026-05-23 15:21:22', '2026-05-23 15:21:22'),
(4, 'Germany', 'DE', 'DEU', NULL, 1, '2026-05-23 15:21:22', '2026-05-23 15:21:22'),
(5, 'Austria', 'AT', 'AUT', NULL, 1, '2026-05-23 15:21:22', '2026-05-23 15:21:22'),
(6, 'Switzerland', 'CH', 'CHE', NULL, 1, '2026-05-23 15:21:22', '2026-05-23 15:21:22');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faqs`
--

CREATE TABLE `faqs` (
  `id` bigint UNSIGNED NOT NULL,
  `faqable_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `faqable_id` bigint UNSIGNED DEFAULT NULL,
  `question` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `listings`
--

CREATE TABLE `listings` (
  `id` bigint UNSIGNED NOT NULL,
  `owner_id` bigint UNSIGNED DEFAULT NULL,
  `city_id` bigint UNSIGNED DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `excerpt` text COLLATE utf8mb4_unicode_ci,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `business_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `published_at` timestamp NULL DEFAULT NULL,
  `approved_by` bigint UNSIGNED DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `seo_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seo_description` text COLLATE utf8mb4_unicode_ci,
  `seo_keywords` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `canonical_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `og_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `og_description` text COLLATE utf8mb4_unicode_ci,
  `og_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `robots` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `listings`
--

INSERT INTO `listings` (`id`, `owner_id`, `city_id`, `title`, `slug`, `excerpt`, `description`, `business_name`, `email`, `phone`, `website_url`, `address`, `latitude`, `longitude`, `status`, `is_featured`, `published_at`, `approved_by`, `approved_at`, `seo_title`, `seo_description`, `seo_keywords`, `canonical_url`, `og_title`, `og_description`, `og_image`, `robots`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 1, 'Bursa Modern Art Museum', 'bursa-modern-art-museum', 'A polished cultural destination with contemporary exhibits.', 'A CMS-managed listing ready for frontend API consumption.', 'Bursa Modern Art Museum', NULL, NULL, NULL, '234 Culinary Street, Foodie Haven', NULL, NULL, 'published', 1, '2026-05-23 15:21:23', 1, '2026-05-23 15:21:23', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-23 15:21:23', '2026-05-23 15:21:23', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `listing_approvals`
--

CREATE TABLE `listing_approvals` (
  `id` bigint UNSIGNED NOT NULL,
  `listing_id` bigint UNSIGNED NOT NULL,
  `submitted_by` bigint UNSIGNED DEFAULT NULL,
  `reviewed_by` bigint UNSIGNED DEFAULT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `listing_category`
--

CREATE TABLE `listing_category` (
  `listing_id` bigint UNSIGNED NOT NULL,
  `category_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `listing_category`
--

INSERT INTO `listing_category` (`listing_id`, `category_id`) VALUES
(1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `listing_contacts`
--

CREATE TABLE `listing_contacts` (
  `id` bigint UNSIGNED NOT NULL,
  `listing_id` bigint UNSIGNED NOT NULL,
  `type` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `value` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `listing_facilities`
--

CREATE TABLE `listing_facilities` (
  `id` bigint UNSIGNED NOT NULL,
  `listing_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `listing_hours`
--

CREATE TABLE `listing_hours` (
  `id` bigint UNSIGNED NOT NULL,
  `listing_id` bigint UNSIGNED NOT NULL,
  `day_of_week` tinyint UNSIGNED NOT NULL,
  `opens_at` time DEFAULT NULL,
  `closes_at` time DEFAULT NULL,
  `is_closed` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `listing_images`
--

CREATE TABLE `listing_images` (
  `id` bigint UNSIGNED NOT NULL,
  `listing_id` bigint UNSIGNED NOT NULL,
  `media_id` bigint UNSIGNED DEFAULT NULL,
  `path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alt_text` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `caption` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `listing_tag`
--

CREATE TABLE `listing_tag` (
  `listing_id` bigint UNSIGNED NOT NULL,
  `tag_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `listing_tag`
--

INSERT INTO `listing_tag` (`listing_id`, `tag_id`) VALUES
(1, 1),
(1, 2);

-- --------------------------------------------------------

--
-- Table structure for table `media`
--

CREATE TABLE `media` (
  `id` bigint UNSIGNED NOT NULL,
  `model_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint UNSIGNED NOT NULL,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `collection_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `disk` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `conversions_disk` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `size` bigint UNSIGNED NOT NULL,
  `manipulations` json NOT NULL,
  `custom_properties` json NOT NULL,
  `generated_conversions` json NOT NULL,
  `responsive_images` json NOT NULL,
  `order_column` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(9, '2026_05_14_000001_create_users_table', 1),
(10, '2026_05_14_000002_create_permission_tables', 1),
(11, '2026_05_14_000003_create_sanctum_and_media_tables', 1),
(12, '2026_05_14_000004_create_queue_and_notification_tables', 1),
(13, '2026_05_14_000010_create_taxonomy_tables', 1),
(14, '2026_05_14_000020_create_listing_tables', 1),
(15, '2026_05_14_000030_create_cms_content_tables', 1),
(16, '2026_05_14_000040_create_commerce_and_system_tables', 1);

-- --------------------------------------------------------

--
-- Table structure for table `model_has_permissions`
--

CREATE TABLE `model_has_permissions` (
  `permission_id` bigint UNSIGNED NOT NULL,
  `model_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `model_has_roles`
--

CREATE TABLE `model_has_roles` (
  `role_id` bigint UNSIGNED NOT NULL,
  `model_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `model_has_roles`
--

INSERT INTO `model_has_roles` (`role_id`, `model_type`, `model_id`) VALUES
(1, 'App\\Models\\User', 1);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notifiable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notifiable_id` bigint UNSIGNED NOT NULL,
  `data` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pages`
--

CREATE TABLE `pages` (
  `id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `template` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` json DEFAULT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `published_at` timestamp NULL DEFAULT NULL,
  `seo_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seo_description` text COLLATE utf8mb4_unicode_ci,
  `seo_keywords` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `canonical_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `og_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `og_description` text COLLATE utf8mb4_unicode_ci,
  `og_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `robots` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pages`
--

INSERT INTO `pages` (`id`, `title`, `slug`, `template`, `content`, `status`, `published_at`, `seo_title`, `seo_description`, `seo_keywords`, `canonical_url`, `og_title`, `og_description`, `og_image`, `robots`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Home', 'home', 'home', '{\"headline\": \"Home\"}', 'published', '2026-05-23 15:21:23', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-23 15:21:23', '2026-05-23 15:21:23', NULL),
(2, 'About', 'about', 'about', '{\"headline\": \"About\"}', 'published', '2026-05-23 15:21:23', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-23 15:21:23', '2026-05-23 15:21:23', NULL),
(3, 'Contact', 'contact', 'contact', '{\"headline\": \"Contact\"}', 'published', '2026-05-23 15:21:23', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-23 15:21:23', '2026-05-23 15:21:23', NULL),
(4, 'Pricing', 'pricing', 'pricing', '{\"headline\": \"Pricing\"}', 'published', '2026-05-23 15:21:23', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-23 15:21:23', '2026-05-23 15:21:23', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `listing_id` bigint UNSIGNED DEFAULT NULL,
  `plan_id` bigint UNSIGNED DEFAULT NULL,
  `provider` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider_reference` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` char(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `paid_at` timestamp NULL DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guard_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 'users.view', 'web', '2026-05-23 15:21:22', '2026-05-23 15:21:22'),
(2, 'users.create', 'web', '2026-05-23 15:21:22', '2026-05-23 15:21:22'),
(3, 'users.update', 'web', '2026-05-23 15:21:22', '2026-05-23 15:21:22'),
(4, 'users.delete', 'web', '2026-05-23 15:21:22', '2026-05-23 15:21:22'),
(5, 'roles.view', 'web', '2026-05-23 15:21:22', '2026-05-23 15:21:22'),
(6, 'roles.create', 'web', '2026-05-23 15:21:22', '2026-05-23 15:21:22'),
(7, 'roles.update', 'web', '2026-05-23 15:21:22', '2026-05-23 15:21:22'),
(8, 'roles.delete', 'web', '2026-05-23 15:21:22', '2026-05-23 15:21:22'),
(9, 'listings.view', 'web', '2026-05-23 15:21:22', '2026-05-23 15:21:22'),
(10, 'listings.create', 'web', '2026-05-23 15:21:22', '2026-05-23 15:21:22'),
(11, 'listings.update', 'web', '2026-05-23 15:21:22', '2026-05-23 15:21:22'),
(12, 'listings.delete', 'web', '2026-05-23 15:21:22', '2026-05-23 15:21:22'),
(13, 'listings.approve', 'web', '2026-05-23 15:21:22', '2026-05-23 15:21:22'),
(14, 'listings.publish', 'web', '2026-05-23 15:21:22', '2026-05-23 15:21:22'),
(15, 'categories.manage', 'web', '2026-05-23 15:21:22', '2026-05-23 15:21:22'),
(16, 'posts.manage', 'web', '2026-05-23 15:21:22', '2026-05-23 15:21:22'),
(17, 'pages.manage', 'web', '2026-05-23 15:21:22', '2026-05-23 15:21:22'),
(18, 'services.manage', 'web', '2026-05-23 15:21:22', '2026-05-23 15:21:22'),
(19, 'media.manage', 'web', '2026-05-23 15:21:22', '2026-05-23 15:21:22'),
(20, 'settings.manage', 'web', '2026-05-23 15:21:22', '2026-05-23 15:21:22'),
(21, 'payments.view', 'web', '2026-05-23 15:21:22', '2026-05-23 15:21:22'),
(22, 'payments.refund', 'web', '2026-05-23 15:21:22', '2026-05-23 15:21:22');

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `plans`
--

CREATE TABLE `plans` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `currency` char(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `billing_cycle` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'one_time',
  `features` json DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `plans`
--

INSERT INTO `plans` (`id`, `name`, `slug`, `description`, `price`, `currency`, `billing_cycle`, `features`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Free', 'free', NULL, 0.00, 'USD', 'one_time', '[\"Basic listing\", \"Manual approval\"]', 1, '2026-05-23 15:21:23', '2026-05-23 15:21:23', NULL),
(2, 'Premium', 'premium', NULL, 49.00, 'USD', 'one_time', '[\"Featured listing\", \"Gallery\", \"Priority approval\"]', 1, '2026-05-23 15:21:23', '2026-05-23 15:21:23', NULL),
(3, 'Business', 'business', NULL, 99.00, 'USD', 'one_time', '[\"Multiple listings\", \"Analytics ready\", \"Priority support\"]', 1, '2026-05-23 15:21:23', '2026-05-23 15:21:23', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `id` bigint UNSIGNED NOT NULL,
  `author_id` bigint UNSIGNED DEFAULT NULL,
  `category_id` bigint UNSIGNED DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `excerpt` text COLLATE utf8mb4_unicode_ci,
  `content` longtext COLLATE utf8mb4_unicode_ci,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `published_at` timestamp NULL DEFAULT NULL,
  `seo_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seo_description` text COLLATE utf8mb4_unicode_ci,
  `seo_keywords` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `canonical_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `og_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `og_description` text COLLATE utf8mb4_unicode_ci,
  `og_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `robots` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `author_id`, `category_id`, `title`, `slug`, `excerpt`, `content`, `status`, `published_at`, `seo_title`, `seo_description`, `seo_keywords`, `canonical_url`, `og_title`, `og_description`, `og_image`, `robots`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 9, 'Diverse Communities: Celebrating the Tapestry of City Life.', 'diverse-communities-celebrating-the-tapestry-of-city-life', 'Celebrating the tapestry of city life through local discovery.', 'CMS-managed blog content ready for frontend API consumption.', 'published', '2026-05-23 15:22:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-23 15:22:00', '2026-05-23 15:22:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `post_tag`
--

CREATE TABLE `post_tag` (
  `post_id` bigint UNSIGNED NOT NULL,
  `tag_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `post_tag`
--

INSERT INTO `post_tag` (`post_id`, `tag_id`) VALUES
(1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guard_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 'super-admin', 'web', '2026-05-23 15:21:22', '2026-05-23 15:21:22'),
(2, 'admin', 'web', '2026-05-23 15:21:22', '2026-05-23 15:21:22'),
(3, 'staff', 'web', '2026-05-23 15:21:22', '2026-05-23 15:21:22'),
(4, 'client', 'web', '2026-05-23 15:21:22', '2026-05-23 15:21:22');

-- --------------------------------------------------------

--
-- Table structure for table `role_has_permissions`
--

CREATE TABLE `role_has_permissions` (
  `permission_id` bigint UNSIGNED NOT NULL,
  `role_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_has_permissions`
--

INSERT INTO `role_has_permissions` (`permission_id`, `role_id`) VALUES
(1, 1),
(2, 1),
(3, 1),
(4, 1),
(5, 1),
(6, 1),
(7, 1),
(8, 1),
(9, 1),
(10, 1),
(11, 1),
(12, 1),
(13, 1),
(14, 1),
(15, 1),
(16, 1),
(17, 1),
(18, 1),
(19, 1),
(20, 1),
(21, 1),
(22, 1),
(1, 2),
(2, 2),
(3, 2),
(4, 2),
(5, 2),
(6, 2),
(7, 2),
(9, 2),
(10, 2),
(11, 2),
(12, 2),
(13, 2),
(14, 2),
(15, 2),
(16, 2),
(17, 2),
(18, 2),
(19, 2),
(20, 2),
(21, 2),
(22, 2);

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `excerpt` text COLLATE utf8mb4_unicode_ci,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `published_at` timestamp NULL DEFAULT NULL,
  `seo_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seo_description` text COLLATE utf8mb4_unicode_ci,
  `seo_keywords` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `canonical_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `og_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `og_description` text COLLATE utf8mb4_unicode_ci,
  `og_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `robots` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `title`, `slug`, `excerpt`, `description`, `status`, `sort_order`, `published_at`, `seo_title`, `seo_description`, `seo_keywords`, `canonical_url`, `og_title`, `og_description`, `og_image`, `robots`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Directory Listing', 'directory-listing', 'Directory Listing service for Kukaqka.', NULL, 'published', 0, '2026-05-23 15:21:23', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-23 15:21:23', '2026-05-23 15:21:23', NULL),
(2, 'Business Promotion', 'business-promotion', 'Business Promotion service for Kukaqka.', NULL, 'published', 1, '2026-05-23 15:21:23', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-23 15:21:23', '2026-05-23 15:21:23', NULL),
(3, 'City Discovery', 'city-discovery', 'City Discovery service for Kukaqka.', NULL, 'published', 2, '2026-05-23 15:21:23', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-23 15:21:23', '2026-05-23 15:21:23', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` bigint UNSIGNED NOT NULL,
  `group` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general',
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` json DEFAULT NULL,
  `type` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'string',
  `is_public` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `group`, `key`, `value`, `type`, `is_public`, `created_at`, `updated_at`) VALUES
(1, 'site', 'name', '\"Kukaqka\"', 'string', 1, '2026-05-23 15:21:23', '2026-05-23 15:21:23'),
(2, 'site', 'url', '\"http://kukaqka.com\"', 'string', 1, '2026-05-23 15:21:23', '2026-05-23 15:21:23'),
(3, 'seo', 'default_title', '\"Kukaqka Directory\"', 'string', 1, '2026-05-23 15:21:23', '2026-05-23 15:21:23');

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `plan_id` bigint UNSIGNED NOT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `starts_at` timestamp NULL DEFAULT NULL,
  `ends_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tags`
--

CREATE TABLE `tags` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tags`
--

INSERT INTO `tags` (`id`, `name`, `slug`, `type`, `created_at`, `updated_at`) VALUES
(1, 'Featured', 'featured', NULL, '2026-05-23 15:21:23', '2026-05-23 15:21:23'),
(2, 'Popular', 'popular', NULL, '2026-05-23 15:21:23', '2026-05-23 15:21:23'),
(3, 'New', 'new', NULL, '2026-05-23 15:21:23', '2026-05-23 15:21:23'),
(4, 'Family Friendly', 'family-friendly', NULL, '2026-05-23 15:21:23', '2026-05-23 15:21:23'),
(5, 'Premium', 'premium', NULL, '2026-05-23 15:21:23', '2026-05-23 15:21:23');

-- --------------------------------------------------------

--
-- Table structure for table `team_members`
--

CREATE TABLE `team_members` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `designation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` longtext COLLATE utf8mb4_unicode_ci,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `social_links` json DEFAULT NULL,
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `seo_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seo_description` text COLLATE utf8mb4_unicode_ci,
  `seo_keywords` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `canonical_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `og_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `og_description` text COLLATE utf8mb4_unicode_ci,
  `og_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `robots` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `team_members`
--

INSERT INTO `team_members` (`id`, `name`, `slug`, `designation`, `bio`, `email`, `phone`, `social_links`, `sort_order`, `is_active`, `seo_title`, `seo_description`, `seo_keywords`, `canonical_url`, `og_title`, `og_description`, `og_image`, `robots`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Alexandra Rodriguez', 'alexandra-rodriguez', 'Directory Manager', 'CMS-ready team profile for the public website.', NULL, NULL, NULL, 0, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-23 15:21:23', '2026-05-23 15:21:23', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `last_login_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `email_verified_at`, `password`, `status`, `last_login_at`, `remember_token`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Super Admin', 'admin@kukaqka.com', NULL, '2026-05-23 15:21:22', '$2y$12$/wPtUm0rpDyE7DhWeQ.iSOm8/tz8sSAve5fQ3DsR4i//2LNfkgPMS', 'active', NULL, NULL, '2026-05-23 15:21:22', '2026-05-23 15:21:22', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `activity_logs_user_id_foreign` (`user_id`),
  ADD KEY `activity_logs_subject_type_subject_id_index` (`subject_type`,`subject_id`),
  ADD KEY `activity_logs_event_index` (`event`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_type_slug_unique` (`type`,`slug`),
  ADD KEY `categories_parent_id_foreign` (`parent_id`),
  ADD KEY `categories_type_index` (`type`),
  ADD KEY `categories_sort_order_index` (`sort_order`),
  ADD KEY `categories_is_active_index` (`is_active`);

--
-- Indexes for table `cities`
--
ALTER TABLE `cities`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cities_slug_unique` (`slug`),
  ADD KEY `cities_country_id_foreign` (`country_id`),
  ADD KEY `cities_state_region_index` (`state_region`),
  ADD KEY `cities_is_active_index` (`is_active`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `contact_messages_assigned_to_foreign` (`assigned_to`),
  ADD KEY `contact_messages_email_index` (`email`),
  ADD KEY `contact_messages_status_index` (`status`);

--
-- Indexes for table `countries`
--
ALTER TABLE `countries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `countries_iso2_unique` (`iso2`),
  ADD UNIQUE KEY `countries_iso3_unique` (`iso3`),
  ADD KEY `countries_is_active_index` (`is_active`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `faqs`
--
ALTER TABLE `faqs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `faqs_faqable_type_faqable_id_index` (`faqable_type`,`faqable_id`),
  ADD KEY `faqs_sort_order_index` (`sort_order`),
  ADD KEY `faqs_is_active_index` (`is_active`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `listings`
--
ALTER TABLE `listings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `listings_slug_unique` (`slug`),
  ADD KEY `listings_owner_id_foreign` (`owner_id`),
  ADD KEY `listings_city_id_foreign` (`city_id`),
  ADD KEY `listings_approved_by_foreign` (`approved_by`),
  ADD KEY `listings_status_city_id_index` (`status`,`city_id`),
  ADD KEY `listings_status_published_at_index` (`status`,`published_at`),
  ADD KEY `listings_business_name_index` (`business_name`),
  ADD KEY `listings_status_index` (`status`),
  ADD KEY `listings_is_featured_index` (`is_featured`),
  ADD KEY `listings_published_at_index` (`published_at`);

--
-- Indexes for table `listing_approvals`
--
ALTER TABLE `listing_approvals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `listing_approvals_listing_id_foreign` (`listing_id`),
  ADD KEY `listing_approvals_submitted_by_foreign` (`submitted_by`),
  ADD KEY `listing_approvals_reviewed_by_foreign` (`reviewed_by`),
  ADD KEY `listing_approvals_status_index` (`status`),
  ADD KEY `listing_approvals_reviewed_at_index` (`reviewed_at`);

--
-- Indexes for table `listing_category`
--
ALTER TABLE `listing_category`
  ADD PRIMARY KEY (`listing_id`,`category_id`),
  ADD KEY `listing_category_category_id_foreign` (`category_id`);

--
-- Indexes for table `listing_contacts`
--
ALTER TABLE `listing_contacts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `listing_contacts_listing_id_foreign` (`listing_id`),
  ADD KEY `listing_contacts_type_index` (`type`),
  ADD KEY `listing_contacts_sort_order_index` (`sort_order`);

--
-- Indexes for table `listing_facilities`
--
ALTER TABLE `listing_facilities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `listing_facilities_listing_id_foreign` (`listing_id`),
  ADD KEY `listing_facilities_sort_order_index` (`sort_order`);

--
-- Indexes for table `listing_hours`
--
ALTER TABLE `listing_hours`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `listing_hours_listing_id_day_of_week_unique` (`listing_id`,`day_of_week`);

--
-- Indexes for table `listing_images`
--
ALTER TABLE `listing_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `listing_images_listing_id_foreign` (`listing_id`),
  ADD KEY `listing_images_media_id_foreign` (`media_id`),
  ADD KEY `listing_images_sort_order_index` (`sort_order`),
  ADD KEY `listing_images_is_featured_index` (`is_featured`);

--
-- Indexes for table `listing_tag`
--
ALTER TABLE `listing_tag`
  ADD PRIMARY KEY (`listing_id`,`tag_id`),
  ADD KEY `listing_tag_tag_id_foreign` (`tag_id`);

--
-- Indexes for table `media`
--
ALTER TABLE `media`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `media_uuid_unique` (`uuid`),
  ADD KEY `media_model_type_model_id_index` (`model_type`,`model_id`),
  ADD KEY `media_order_column_index` (`order_column`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  ADD KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  ADD KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`,`notifiable_id`);

--
-- Indexes for table `pages`
--
ALTER TABLE `pages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pages_slug_unique` (`slug`),
  ADD KEY `pages_template_index` (`template`),
  ADD KEY `pages_status_index` (`status`),
  ADD KEY `pages_published_at_index` (`published_at`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payments_user_id_foreign` (`user_id`),
  ADD KEY `payments_listing_id_foreign` (`listing_id`),
  ADD KEY `payments_plan_id_foreign` (`plan_id`),
  ADD KEY `payments_provider_index` (`provider`),
  ADD KEY `payments_provider_reference_index` (`provider_reference`),
  ADD KEY `payments_status_index` (`status`),
  ADD KEY `payments_paid_at_index` (`paid_at`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `plans`
--
ALTER TABLE `plans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `plans_slug_unique` (`slug`),
  ADD KEY `plans_billing_cycle_index` (`billing_cycle`),
  ADD KEY `plans_is_active_index` (`is_active`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `posts_slug_unique` (`slug`),
  ADD KEY `posts_author_id_foreign` (`author_id`),
  ADD KEY `posts_category_id_foreign` (`category_id`),
  ADD KEY `posts_status_published_at_index` (`status`,`published_at`),
  ADD KEY `posts_status_index` (`status`),
  ADD KEY `posts_published_at_index` (`published_at`);

--
-- Indexes for table `post_tag`
--
ALTER TABLE `post_tag`
  ADD PRIMARY KEY (`post_id`,`tag_id`),
  ADD KEY `post_tag_tag_id_foreign` (`tag_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`role_id`),
  ADD KEY `role_has_permissions_role_id_foreign` (`role_id`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `services_slug_unique` (`slug`),
  ADD KEY `services_status_index` (`status`),
  ADD KEY `services_sort_order_index` (`sort_order`),
  ADD KEY `services_published_at_index` (`published_at`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `settings_group_key_unique` (`group`,`key`),
  ADD KEY `settings_group_index` (`group`),
  ADD KEY `settings_is_public_index` (`is_public`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subscriptions_user_id_foreign` (`user_id`),
  ADD KEY `subscriptions_plan_id_foreign` (`plan_id`),
  ADD KEY `subscriptions_status_index` (`status`),
  ADD KEY `subscriptions_ends_at_index` (`ends_at`);

--
-- Indexes for table `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tags_slug_unique` (`slug`),
  ADD KEY `tags_type_index` (`type`);

--
-- Indexes for table `team_members`
--
ALTER TABLE `team_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `team_members_slug_unique` (`slug`),
  ADD KEY `team_members_sort_order_index` (`sort_order`),
  ADD KEY `team_members_is_active_index` (`is_active`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `users_phone_index` (`phone`),
  ADD KEY `users_status_index` (`status`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `cities`
--
ALTER TABLE `cities`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `countries`
--
ALTER TABLE `countries`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faqs`
--
ALTER TABLE `faqs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `listings`
--
ALTER TABLE `listings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `listing_approvals`
--
ALTER TABLE `listing_approvals`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `listing_contacts`
--
ALTER TABLE `listing_contacts`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `listing_facilities`
--
ALTER TABLE `listing_facilities`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `listing_hours`
--
ALTER TABLE `listing_hours`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `listing_images`
--
ALTER TABLE `listing_images`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `media`
--
ALTER TABLE `media`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `pages`
--
ALTER TABLE `pages`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `plans`
--
ALTER TABLE `plans`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tags`
--
ALTER TABLE `tags`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `team_members`
--
ALTER TABLE `team_members`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `cities`
--
ALTER TABLE `cities`
  ADD CONSTRAINT `cities_country_id_foreign` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD CONSTRAINT `contact_messages_assigned_to_foreign` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `listings`
--
ALTER TABLE `listings`
  ADD CONSTRAINT `listings_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `listings_city_id_foreign` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `listings_owner_id_foreign` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `listing_approvals`
--
ALTER TABLE `listing_approvals`
  ADD CONSTRAINT `listing_approvals_listing_id_foreign` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `listing_approvals_reviewed_by_foreign` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `listing_approvals_submitted_by_foreign` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `listing_category`
--
ALTER TABLE `listing_category`
  ADD CONSTRAINT `listing_category_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `listing_category_listing_id_foreign` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `listing_contacts`
--
ALTER TABLE `listing_contacts`
  ADD CONSTRAINT `listing_contacts_listing_id_foreign` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `listing_facilities`
--
ALTER TABLE `listing_facilities`
  ADD CONSTRAINT `listing_facilities_listing_id_foreign` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `listing_hours`
--
ALTER TABLE `listing_hours`
  ADD CONSTRAINT `listing_hours_listing_id_foreign` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `listing_images`
--
ALTER TABLE `listing_images`
  ADD CONSTRAINT `listing_images_listing_id_foreign` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `listing_images_media_id_foreign` FOREIGN KEY (`media_id`) REFERENCES `media` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `listing_tag`
--
ALTER TABLE `listing_tag`
  ADD CONSTRAINT `listing_tag_listing_id_foreign` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `listing_tag_tag_id_foreign` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_listing_id_foreign` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payments_plan_id_foreign` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_author_id_foreign` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `posts_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `post_tag`
--
ALTER TABLE `post_tag`
  ADD CONSTRAINT `post_tag_post_id_foreign` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `post_tag_tag_id_foreign` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `subscriptions_plan_id_foreign` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `subscriptions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
