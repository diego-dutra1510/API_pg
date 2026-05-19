CREATE ROLE diego WITH LOGIN PASSWORD 'diego261510';




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

ALTER TABLE livros ADD COLUMN img TEXT 	default 'https://www.cometanet.com.br/lv-e-assim-que-acaba-capa-dura-ed-colecionador' NOT NULL;

UPDATE livros set img = 'https://images.tcdn.com.br/img/img_prod/1272692/lv_e_assim_que_acaba_capa_dura_ed_colecionador_1819_1_e9b28ec32791cc5e9287d142b8065393.jpg';



CREATE TABLE clientes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE pedidos (
  id SERIAL PRIMARY KEY,
  produto VARCHAR(255) NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pendente',
  cliente_id INTEGER REFERENCES clientes(id)
);

SELECT conname
FROM pg_constraint
WHERE conrelid = 'pedidos'::regclass;

ALTER TABLE pedidos
DROP CONSTRAINT pedidos_cliente_id_fkey;

ALTER TABLE pedidos
ADD CONSTRAINT fk_pedidos_cliente
FOREIGN KEY (cliente_id)
REFERENCES clientes(id)
ON DELETE CASCADE;



INSERT INTO clientes (nome, email) VALUES
('João Silva', 'joao.silva@email.com'),
('Maria Oliveira', 'maria.oliveira@email.com'),
('Carlos Souza', 'carlos.souza@email.com'),
('Ana Pereira', 'ana.pereira@email.com'),
('Fernanda Lima', 'fernanda.lima@email.com'),
('Ricardo Alves', 'ricardo.alves@email.com'),
('Patrícia Gomes', 'patricia.gomes@email.com'),
('Lucas Martins', 'lucas.martins@email.com'),
('Juliana Rocha', 'juliana.rocha@email.com'),
('Bruno Costa', 'bruno.costa@email.com');


GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO diego;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO diego;