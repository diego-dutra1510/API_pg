import express from 'express';
import cors from 'cors';
import pool from './db.js'; // ⚠️ precisa da extensão .js

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Funcionando')
})

app.get('/livros', async (req, res) => {
    const { autor } = req.query

    try {
        let query = 'SELECT * FROM livros'
        let values = []

        if (autor && autor.trim() !== '') {
            query += ' WHERE autor ILIKE $1'
            values.push(`%${autor}%`)
        }

        const result = await pool.query(query, values)

        res.json(result.rows)
    } catch (err) {
        console.error(err)
        res.status(500).send('Erro interno')
    }
})

app.get('/livros/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, titulo, autor, ano_publicacao, disponivel 
             FROM livros 
             WHERE id = $1`,
            [req.params.id]
        )

        if (result.rows.length === 0) {
            return res.status(404).send('Livro não encontrado')
        }

        res.json(result.rows[0])
    } catch (err) {
        console.error(err)
        res.status(500).send('Erro interno do servidor')
    }
})

app.post('/livros', async (req, res) => {
    const { titulo, autor, ano_publicacao } = req.body

    if (!titulo?.trim() || !autor?.trim()) {
        return res.status(400).send('titulo e autor são obrigatórios')
    }

    try {
        const result = await pool.query(
            `INSERT INTO livros 
            (titulo, autor, ano_publicacao) 
            VALUES ($1, $2, $3)
            RETURNING id, titulo, autor, ano_publicacao`,
            [titulo, autor, ano_publicacao || null]
        )

        res.status(201).json(result.rows[0])
    } catch (err) {
        console.error(err)

        res.status(500).send('Erro interno do servidor')
    }
})

app.post('/clientes', async (req, res) => {

    const { nome, email } = req.body

    if (!nome?.trim() || !email?.trim()) {
        return res.status(400).send('nome e email são obrigatórios')
    }

    try {
        const result = await pool.query(
            `INSERT INTO clientes 
            (nome, email) 
            VALUES ($1, $2)
            RETURNING id, nome, email`,
            [nome, email]
        )

        res.status(201).json(result.rows[0])
    } catch (err) {
        if (err.code = "23505") {
            res.status(409).send('Email já cadastrado.')
        }

        res.status(500).send('Erro interno do servidor')
    }


})

app.get('/clientes', async (req, res) => {
    const { id } = req.query

    try {
        let query = 'SELECT * FROM clientes'
        let values = []

        if (id) {
            query += ' WHERE id = $1'
            values.push(id)
        }

        const result = await pool.query(query, values)

        res.json(result.rows)
    } catch (err) {
        console.error(err)

        res.status(500).send('Erro interno')
    }
})


app.put('/clientes/:id', async (req, res) => {
    const { id } = req.params
    const { nome, email } = req.body

    if (!id) {
        return res.status(400).send('ID é obrigatório')
    }

    try {
        const result = await pool.query(
            `UPDATE clientes
             SET nome = $1,
                 email = $2
             WHERE id = $3
             RETURNING *`,
            [nome, email, id]
        )

        if (result.rows.length === 0) {
            return res.status(404).send('Cliente não encontrado')
        }

        res.json(result.rows[0])

    } catch (err) {

        if (err.code = "23505") {
            res.status(409).send('Email já cadastrado.')
        }

        res.status(500).send('Erro interno do servidor')
    }
})

// Excluir um usuário
app.delete('/livros/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `DELETE FROM livros WHERE id = $1`,
            [req.params.id]
        )

        if (result.rowCount === 0) {
            return res.status(404).send('Livro não encontrado')
        }

        res.send('Livro excluído com sucesso')
    } catch (err) {
        console.error(err)
        res.status(500).send('Erro interno do servidor')
    }
})


app.put('/livros/:id', async (req, res) => {
    const { id } = req.params
    const { titulo, autor, ano_publicacao, disponivel } = req.body

    if (!id) {
        return res.status(400).send('ID é obrigatório')
    }

    try {
        const result = await pool.query(
            `UPDATE livros
             SET titulo = $1,
                 autor = $2,
                 ano_publicacao = $3,
                 disponivel = $4
             WHERE id = $5
             RETURNING *`,
            [titulo, autor, ano_publicacao, disponivel, id]
        )

        if (result.rows.length === 0) {
            return res.status(404).send('Livro não encontrado')
        }

        res.json(result.rows[0])

    } catch (err) {
        console.error(err)
        res.status(500).send('Erro interno do servidor')
    }
})

app.listen(3000, () => {
    console.log('Livros abertos na porta 3000')
})