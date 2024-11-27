-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Nov 27, 2024 at 01:17 PM
-- Server version: 10.11.9-MariaDB
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u928500783_calendar`
--

-- --------------------------------------------------------

--
-- Table structure for table `FamilyMember`
--

CREATE TABLE `FamilyMember` (
  `id` int(11) NOT NULL,
  `firstname` text DEFAULT NULL,
  `lastname` text DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `FamilyMember`
--

INSERT INTO `FamilyMember` (`id`, `firstname`, `lastname`, `parent_id`) VALUES
(1, 'Arliss', 'Vollbrecht', NULL),
(2, 'Mike', 'Vollbrecht', 1),
(3, 'Kim', 'Vollbrecht', 1),
(4, 'Joe', 'Vollbrecht', 1),
(5, 'Tom', 'Vollbrecht', 1),
(6, 'Bob', 'Vollbrecht', 1),
(7, 'Thane', 'Vollbrecht', 2),
(8, 'Olivia', 'Vollbrecht', 2),
(9, 'Mallory', 'Vollbrecht', 2),
(10, 'Jake', 'Vollbrecht', 3),
(11, 'Charles', 'Vollbrecht', 3),
(12, 'Art', 'Vollbrecht', 4),
(13, 'Sam', 'Vollbrecht', 4),
(14, 'Wil', 'Vollbrecht', 4),
(15, 'Colleen', 'Vollbrecht', 5),
(16, 'Cara', 'Vollbrecht', 5),
(17, 'Becca', 'Vollbrecht', 6),
(18, 'Rachel', 'Vollbrecht', 6),
(19, 'Alex', 'Vollbrecht', 6),
(20, 'Jimmy', 'Vollbrecht', 6);

-- --------------------------------------------------------

--
-- Table structure for table `VacationDates`
--

CREATE TABLE `VacationDates` (
  `id` int(11) NOT NULL,
  `cango` tinyint(1) DEFAULT NULL,
  `startdate` date DEFAULT NULL,
  `enddate` date DEFAULT NULL,
  `familymemberid` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `FamilyMember`
--
ALTER TABLE `FamilyMember`
  ADD PRIMARY KEY (`id`),
  ADD KEY `parent_id` (`parent_id`);

--
-- Indexes for table `VacationDates`
--
ALTER TABLE `VacationDates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `familymemberid` (`familymemberid`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `FamilyMember`
--
ALTER TABLE `FamilyMember`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `VacationDates`
--
ALTER TABLE `VacationDates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `FamilyMember`
--
ALTER TABLE `FamilyMember`
  ADD CONSTRAINT `FamilyMember_ibfk_1` FOREIGN KEY (`parent_id`)
  REFERENCES `FamilyMember` (`id`);

--
-- Constraints for table `VacationDates`
--
ALTER TABLE `VacationDates`
  ADD CONSTRAINT `VacationDates_ibfk_1` FOREIGN KEY (`familymemberid`) 
  REFERENCES `FamilyMember` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
