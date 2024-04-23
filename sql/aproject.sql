-- Create the database
CREATE DATABASE IF NOT EXISTS aproject;
USE aproject;

-- Create the users table (utf-8 encoding for special names)
CREATE TABLE IF NOT EXISTS users (
  uid INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  password VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  email VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (uid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create the projects table
CREATE TABLE IF NOT EXISTS projects (
  pid INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL,
  phase ENUM('design','development','testing','deployment','complete') DEFAULT NULL,
  description VARCHAR(500) DEFAULT NULL,
  uid INT(10) UNSIGNED NOT NULL,
  PRIMARY KEY (pid),
  FOREIGN KEY (uid) REFERENCES users(uid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO users (username, password, email) VALUES
('techUser1', '$2a$10$GomWl1F4HqdI0CM3VeaRuebYoY0/J1EXV.rKOlG.6Os3C8.mw0kIq', 'techUser1@mail.com'),
('blockchainDev', '$2a$10$q9VEeUhAdPYqzRWoy7xcmee1vH5wXcwOh92IyQLR4XO3RCemJYxQi', 'blockchainDev@mail.com'),
('cyberSecPro', '$2a$10$EyawAbZh6WsQxPAcv9DxU.1Vnwx2BzMwiUVMINONeU1TsgyX/KVOm', 'cyberSecPro@mail.com'),
('dataCenterMgr', '$2a$10$BumJuQYnlcR/AMACbcdKiOjLLfZSIZ.lfmK1/H3cJ1umzH2P7z8AS', 'dataCenterMgr@mail.com'),
('ecommerceSpec', '$2a$10$/uslaMn.ZvbdewaXpZjUoekDgm5UHQfx95oZ1Tljph7JcDLPPU6LW', 'ecommerceSpec@mail.com'),
('fintechAppDev', '$2a$10$REOIF3sShuTE5MzEZ1NQE.y49riXYXBlGmPZI.vtHTiiZL5Rq5mr6', 'fintechAppDev@mail.com'),
('gameDevMaster', '$2a$10$rMNX2Rr3sj7RkaaJuoc/9uN6ZG/6iL5XXxOgref2Z4.OsUjjX3nou', 'gameDevMaster@mail.com'),
('healthcareAnalyst', '$2a$10$5aqNkbbAtZxXfDoQ01T5dOuUAMn/yB8ImEu5VneCFY.Q1HrJ8whdO', 'healthcareAnalyst@mail.com'),
('iotIntegrator', '$2a$10$KgWT1WhiVLLc1N9m4ImKluZh8Lul08bI3tQKt9M/5T/nHiLwtZC8a', 'iotIntegrator@mail.com'),
('javaMicroserviceDev', '$2a$10$yV/0ZwVmp9ZrgCnt3ThM6.ie2lbSsmYjm6MMgBb5KHVQQTqBV23OG', 'javaMicroserviceDev@mail.com');

INSERT INTO projects (title, start_date, end_date, phase, description, uid) VALUES
('AI Optimization', '2023-01-01', '2023-06-01', 'design', 'Optimizing AI algorithms for better performance', 1),
('Blockchain Development', '2023-02-01', '2023-07-01', 'development', 'Developing a new blockchain for secure transactions', 2),
('Cybersecurity Enhancement', '2023-03-01', '2023-08-01', 'testing', 'Enhancing cybersecurity measures for our network', 3),
('Data Center Upgrade', '2023-04-01', '2023-09-01', 'design', 'Upgrading our data center with new servers and software', 4),
('E-commerce Platform', '2023-05-01', '2023-10-01', 'development', 'Building a new e-commerce platform for online sales', 5),
('Fintech Application', '2023-06-01', '2023-11-01', 'testing', 'Developing a fintech application for mobile banking', 6),
('Game Development', '2023-07-01', '2023-12-01', 'design', 'Designing a new multiplayer online game', 7),
('Healthcare Analytics', '2023-08-01', '2024-01-01', 'development', 'Building an analytics platform for healthcare data', 8),
('IoT Integration', '2023-09-01', '2024-02-01', 'testing', 'Integrating IoT devices into our existing infrastructure', 9),
('Java Microservices', '2023-10-01', '2024-03-01', 'design', 'Designing and developing Java microservices for our application', 10);