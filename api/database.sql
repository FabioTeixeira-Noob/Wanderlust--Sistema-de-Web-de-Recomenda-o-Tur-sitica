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

-- ── Pontos turísticos ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS destinations (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120)  NOT NULL,
  location    VARCHAR(120)  NOT NULL,
  description TEXT          NOT NULL,
  price       VARCHAR(60)   NOT NULL,          -- ex: "80.000 – 250.000 Kz"
  price_num   INT UNSIGNED  DEFAULT 0,         -- valor médio para ordenação
  rating      DECIMAL(2,1)  DEFAULT 4.5,
  reviews     INT UNSIGNED  DEFAULT 0,
  climate     VARCHAR(60)   DEFAULT '',
  categories  JSON          DEFAULT NULL,      -- ex: ["praia","natureza"]
  image       VARCHAR(500)  DEFAULT '',
  badge       VARCHAR(60)   DEFAULT '',
  match_score TINYINT       DEFAULT 80,        -- % de compatibilidade base
  active      TINYINT(1)    DEFAULT 1,         -- 0 = inativo / oculto
  created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP
);

-- ── Destinos turísticos ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS destinations (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(140)  NOT NULL,
  location    VARCHAR(120)  NOT NULL,
  description TEXT          NOT NULL,
  price       VARCHAR(60)   NOT NULL,
  price_num   INT UNSIGNED  DEFAULT 0,
  rating      DECIMAL(2,1)  DEFAULT 4.5,
  reviews     INT UNSIGNED  DEFAULT 0,
  climate     VARCHAR(60)   DEFAULT '',
  categories  JSON          DEFAULT NULL,   -- ex: ["natureza","aventura"]
  image       VARCHAR(500)  NOT NULL,
  badge       VARCHAR(60)   DEFAULT '',
  match_score TINYINT       DEFAULT 80,
  created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP
);

-- ── Dados iniciais (12 destinos) ─────────────────────────────
INSERT IGNORE INTO destinations (id,name,location,description,price,price_num,rating,reviews,climate,categories,image,badge,match_score) VALUES
(1,'Quedas de Kalandula','Malanje · Angola','Uma das maiores quedas de água de África (105 m de altura), com névoa constante e arco-íris. Experiência épica de natureza bruta.','180.000 – 320.000 Kz',250000,4.8,1200,'Tropical / Úmido','["natureza","aventura"]','https://tse3.mm.bing.net/th/id/OIP.fyf_lM0sdmEPygs6V0idkQHaE8?rs=1&pid=ImgDetMain&o=7&rm=3','Maravilha Natural',96),
(2,'Ilha do Mussulo','Luanda · Angola','Praia paradisíaca com areia branca, águas cristalinas e resorts tranquilos. Perfeito para relaxar perto da capital.','80.000 – 250.000 Kz',150000,4.7,2800,'Tropical','["praia","natureza"]','https://welcometoangola.co.ao/wp-content/uploads/2021/06/Ilha-de-Luanda....jpg','Paraíso Próximo',94),
(3,'Miradouro da Lua','Luanda · Angola','Formações rochosas esculpidas pela erosão com visual lunar dramático. Melhor ao pôr do sol com vista para o Atlântico.','40.000 – 90.000 Kz',65000,4.6,1800,'Árido / Costeiro','["natureza","aventura"]','https://tse1.mm.bing.net/th/id/OIP.oPzoJQn7LfnnXMiSGZqjNgHaD3?rs=1&pid=ImgDetMain&o=7&rm=3','Único em África',92),
(4,'Fenda da Tundavala','Huíla · Angola','Falésia impressionante a 1200 m de altura com vista panorâmica do planalto. Uma das 7 Maravilhas Naturais de Angola.','150.000 – 380.000 Kz',260000,4.8,950,'Frio / Montanhoso','["natureza","aventura","montanha"]','https://farm3.static.flickr.com/2880/13717657563_b549ff52d1_b.jpg','Miradouro Épico',90),
(5,'Parque Nacional da Kissama','Bengo · Angola','Safari acessível com elefantes, girafas, búfalos e aves. O parque mais próximo de Luanda com vida selvagem rica.','120.000 – 280.000 Kz',200000,4.6,1100,'Tropical / Seco','["natureza","aventura"]','https://tse3.mm.bing.net/th/id/OIP.CjzimibxMIQMCI8Um_brJgHaEt?rs=1&pid=ImgDetMain&o=7&rm=3','Safari Angolano',89),
(6,'Cabo Ledo','Kwanza Sul · Angola','Praias virgens, falésias vermelhas e um dos melhores spots de surf de África. Ideal para aventura costeira.','100.000 – 220.000 Kz',160000,4.7,820,'Tropical','["praia","aventura"]','https://tse2.mm.bing.net/th/id/OIP.HXvFon4azcyeMZ0BrKqEYwHaE8?rs=1&pid=ImgDetMain&o=7&rm=3','Surf & Relax',87),
(7,'Serra da Leba','Huíla · Angola','Estrada sinuosa icónica com vistas montanhosas deslumbrantes. Uma das paisagens rodoviárias mais bonitas de África.','140.000 – 350.000 Kz',245000,4.8,760,'Frio / Montanhoso','["natureza","aventura","montanha"]','https://tse1.mm.bing.net/th/id/OIP.lyROZImB4YPUT0mV0sSl5QHaEi?rs=1&pid=ImgDetMain&o=7&rm=3','Estrada Panorâmica',85),
(8,'Pedras Negras de Pungo Andongo','Malanje · Angola','Formações rochosas gigantes com lendas locais e vistas incríveis. Local místico e fotogénico.','160.000 – 300.000 Kz',230000,4.7,680,'Tropical','["natureza","histórico"]','https://medicareclub.ao/image/cache/catalog/guia/malange/pungo%20adongo/img_1413-e1444063786601-1240x827.jpg','Místico',83),
(9,'Parque Nacional do Iona','Namibe · Angola','Deserto costeiro com dunas, flamingos, zebras e paisagens únicas no extremo sul.','220.000 – 450.000 Kz',335000,4.6,540,'Árido / Desértico','["natureza","aventura"]','https://medicareclub.ao/image/cache/catalog/guia/namibe/iona%204%20foto%20pedro%20carreno-1240x827.jpg','Deserto Selvagem',81),
(10,'Fortaleza de São Miguel','Luanda · Angola','Fortaleza colonial do séc. XVI com vistas panorâmicas da baía e museu histórico.','30.000 – 80.000 Kz',55000,4.5,1500,'Tropical','["histórico","cultural"]','https://th.bing.com/th/id/R.c9ebb7d5ebf5491c124c8db030a11d03?rik=9a8R8XWXK62AmA&pid=ImgRaw&r=0','Património',88),
(11,'Baía Azul','Benguela · Angola','Praia de areia dourada e águas calmas no sul — uma das mais bonitas do país.','110.000 – 260.000 Kz',185000,4.7,920,'Tropical','["praia"]','https://www.almadeviajante.com/wp-content/uploads/baia-azul-benguela-958x640.jpg','Praia Secreta',86),
(12,'Cristo Rei do Lubango','Huíla · Angola','Estátua imponente com vista 360° sobre a cidade e planalto. Ponto alto cultural e panorâmico.','90.000 – 200.000 Kz',145000,4.6,1100,'Frio / Montanhoso','["cultural","histórico"]','https://i.pinimg.com/originals/f7/3e/4b/f73e4b369d48b38d699637d1672e8802.jpg','Miradouro Urbano',82);
