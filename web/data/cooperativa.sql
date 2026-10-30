-- Base de datos de ejemplo: Cooperativa Huerta de Murcia
CREATE TABLE socio (
  id_socio   INTEGER PRIMARY KEY,
  nombre     VARCHAR(50) NOT NULL,
  municipio  VARCHAR(30) NOT NULL,
  fecha_alta DATE NOT NULL
);

CREATE TABLE producto (
  id_producto INTEGER PRIMARY KEY,
  nombre      VARCHAR(30) NOT NULL,
  categoria   VARCHAR(30) NOT NULL,
  precio_kg   DECIMAL(5,2) NOT NULL CHECK (precio_kg > 0)
);

CREATE TABLE entrega (
  id_entrega  INTEGER PRIMARY KEY,
  id_socio    INTEGER NOT NULL REFERENCES socio(id_socio),
  id_producto INTEGER NOT NULL REFERENCES producto(id_producto),
  fecha       DATE NOT NULL,
  kilos       INTEGER NOT NULL CHECK (kilos > 0)
);

INSERT INTO socio VALUES
  (1, 'Ana Martínez',   'Murcia',    '2019-02-11'),
  (2, 'José López',     'Lorca',     '2020-05-03'),
  (3, 'Carmen Sánchez', 'Cartagena', '2021-09-20'),
  (4, 'Pedro Ruiz',     'Murcia',    '2022-01-15'),
  (5, 'Lucía Gómez',    'Cieza',     '2025-11-30');

INSERT INTO producto VALUES
  (1, 'Limón',       'Cítrico',        0.60),
  (2, 'Naranja',     'Cítrico',        0.45),
  (3, 'Pimiento',    'Hortaliza',      1.20),
  (4, 'Alcachofa',   'Hortaliza',      1.80),
  (5, 'Melocotón',   'Fruta de hueso', 1.50),
  (6, 'Albaricoque', 'Fruta de hueso', 2.10);

INSERT INTO entrega VALUES
  (1, 1, 1, '2026-03-02', 500),
  (2, 1, 3, '2026-03-05', 200),
  (3, 2, 2, '2026-03-05', 800),
  (4, 2, 4, '2026-03-10', 150),
  (5, 3, 1, '2026-03-12', 300),
  (6, 3, 5, '2026-06-20', 400),
  (7, 4, 3, '2026-03-15', 250),
  (8, 4, 4, '2026-03-18', 100),
  (9, 1, 5, '2026-06-25', 350);
