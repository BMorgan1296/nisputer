CREATE DATABASE IF NOT EXISTS `nisputer` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `nisputer`;

CREATE TABLE IF NOT EXISTS `accounts` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL UNIQUE,
  `password` varchar(256) NOT NULL,
  `email` varchar(100) NOT NULL,
  `lat` varchar(50) DEFAULT '0',
  `lon` varchar(50) DEFAULT '0',
  `ign` varchar(1) DEFAULT '0',
  `recvTime` varchar(512) DEFAULT '0',  
  `aes_key` varchar(50) DEFAULT '0'
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

ALTER TABLE `accounts` ADD PRIMARY KEY (`id`);
ALTER TABLE `accounts` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;