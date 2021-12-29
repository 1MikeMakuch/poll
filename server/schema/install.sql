drop database if exists poll ;
CREATE DATABASE IF NOT EXISTS poll DEFAULT CHARSET=utf8;

drop user poll;
CREATE USER 'poll'@'%' IDENTIFIED BY 'poll';
GRANT ALL PRIVILEGES ON poll.* to 'poll'@'%' WITH GRANT OPTION;

USE poll;

SOURCE schema.sql;
