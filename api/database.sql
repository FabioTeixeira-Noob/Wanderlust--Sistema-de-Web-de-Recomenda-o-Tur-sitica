-- ============================================================
--  WANDERLUST — Base de Dados
-- ============================================================

CREATE DATABASE IF NOT EXISTS wanderlust
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE wanderlust;

-- Tabela de utilizadores
CREATE TABLE IF NOT EXISTS users (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(120)  NOT NULL,
  email      VARCHAR(180)  NOT NULL UNIQUE,
  password   VARCHAR(255)  NOT NULL,         -- bcrypt hash
  location   VARCHAR(80)   DEFAULT NULL,
  created_at DATETIME      DEFAULT CURRENT_TIMESTAMP
);
