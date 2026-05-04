CREATE ROLE diego WITH LOGIN PASSWORD 'diego261510';


GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO diego;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO diego;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL ON TABLES TO diego;

CREATE TABLE livros (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  autor VARCHAR(255) NOT NULL,
  ano_publicacao INTEGER,
  disponivel BOOLEAN DEFAULT true
);


INSERT INTO livros (titulo, autor, ano_publicacao, disponivel) VALUES
('Dom Casmurro', 'Machado de Assis', 1899, true),
('Memórias Póstumas de Brás Cubas', 'Machado de Assis', 1881, true),
('O Alquimista', 'Paulo Coelho', 1988, true),
('A Hora da Estrela', 'Clarice Lispector', 1977, false),
('Capitães da Areia', 'Jorge Amado', 1937, true),
('Grande Sertão: Veredas', 'João Guimarães Rosa', 1956, true),
('O Pequeno Príncipe', 'Antoine de Saint-Exupéry', 1943, false),
('1984', 'George Orwell', 1949, true),
('Orgulho e Preconceito', 'Jane Austen', 1813, true),
('O Senhor dos Anéis', 'J.R.R. Tolkien', 1954, true);

ALTER TABLE livros 
ALTER COLUMN ano_publicacao SET NOT NULL;
