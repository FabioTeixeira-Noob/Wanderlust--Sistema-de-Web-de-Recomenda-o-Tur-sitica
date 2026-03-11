-- ============================================================
--  WANDERLUST — Base de Dados (versão completa)
-- ============================================================

CREATE DATABASE IF NOT EXISTS wanderlust
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE wanderlust;

-- ── Utilizadores ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(120)  NOT NULL,
  email      VARCHAR(180)  NOT NULL UNIQUE,
  password   VARCHAR(255)  NOT NULL,
  location   VARCHAR(80)   DEFAULT NULL,
  created_at DATETIME      DEFAULT CURRENT_TIMESTAMP
);

-- ── Favoritos ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id        INT UNSIGNED NOT NULL,
  destination_id INT UNSIGNED NOT NULL,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_fav (user_id, destination_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Preferências ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS preferences (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL UNIQUE,
  categories JSON         DEFAULT NULL,
  budget     VARCHAR(20)  DEFAULT 'medio',
  climate    VARCHAR(30)  DEFAULT 'tropical',
  distance   TINYINT      DEFAULT 12,
  updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Viagens planeadas ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trips (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id            INT UNSIGNED NOT NULL,
  destination_id     INT UNSIGNED NOT NULL,
  destination_name   VARCHAR(120) NOT NULL,
  date_from          DATE         NOT NULL,
  date_to            DATE         NOT NULL,
  adults             TINYINT      DEFAULT 2,
  children           TINYINT      DEFAULT 0,
  services           JSON         DEFAULT NULL,    -- ex: ["transporte","alojamento"]
  accommodation_type VARCHAR(40)  DEFAULT NULL,
  activity_level     VARCHAR(20)  DEFAULT 'moderado',
  notes              TEXT         DEFAULT NULL,
  estimated_price    VARCHAR(40)  DEFAULT NULL,
  reference          VARCHAR(12)  NOT NULL UNIQUE, -- ex: WL-A3F9C2
  created_at         DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Adicionar coluna role (executar se já tiver a tabela users) ──
-- ALTER TABLE users ADD COLUMN role VARCHAR(10) NOT NULL DEFAULT 'user' AFTER location;

-- ── Ou incluída diretamente na criação (versão nova) ──────────────
-- Se estiver a criar a BD de raiz, substitua a tabela users por esta:
-- CREATE TABLE IF NOT EXISTS users (
--   id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
--   name       VARCHAR(120)  NOT NULL,
--   email      VARCHAR(180)  NOT NULL UNIQUE,
--   password   VARCHAR(255)  NOT NULL,
--   location   VARCHAR(80)   DEFAULT NULL,
--   role       VARCHAR(10)   NOT NULL DEFAULT 'user',   -- 'user' | 'admin'
--   created_at DATETIME      DEFAULT CURRENT_TIMESTAMP
-- );

-- ── Promover um utilizador a admin ───────────────────────────────
-- UPDATE users SET role = 'admin' WHERE email = 'o-seu@email.com';
