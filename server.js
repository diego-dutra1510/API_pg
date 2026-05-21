import express from 'express';
import cors from 'cors';
import pool from './db.js'; // ⚠️ precisa da extensão .js

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Funcionando')
})




app.post('/clientes', async (req, res) => {

    const { Nome, Email } = req.body

    if (!Nome?.trim() || !Email?.trim()) {
        return res.status(400).send('nome e email são obrigatórios')
    }

    try {
        const result = await pool.query(
            `INSERT INTO clientes 
            (nome, email) 
            VALUES ($1, $2)
            RETURNING id, nome, email`,
            [Nome, Email]
        )


        res.status(201).json(result.rows[0])
    } catch (err) {

        console.log(err)
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

app.get('/clientes/:id/pedidos', async (req, res) => {
    const { id } = req.params

    try {
        const clienteExiste = await pool.query(
            `SELECT id, nome FROM clientes WHERE id = $1`,
            [id]
        )

        if (clienteExiste.rows.length === 0) {
            return res.status(404).send('Cliente não encontrado')
        }

        const result = await pool.query(
            `SELECT 
                pedidos.*,
                clientes.nome AS cliente_nome
            FROM pedidos
            JOIN clientes ON pedidos.cliente_id = clientes.id
            WHERE clientes.id = $1`,
            [id]
        )

        res.json(result.rows)
    } catch (err) {
        console.error(err)
        res.status(500).send('Erro interno do servidor')
    }
})


app.put('/clientes/:Id', async (req, res) => {
    const { Id } = req.params
    const { Nome, Email } = req.body

    if (!Id) {
        return res.status(400).send('ID é obrigatório')
    }

    try {
        const result = await pool.query(
            `UPDATE clientes
            SET nome = $1,
            email = $2
            WHERE id = $3
            RETURNING *`,
            [Nome, Email, Id]
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
app.delete('/clientes/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `DELETE FROM clientes WHERE id = $1`,
            [req.params.id]
        )

        if (result.rowCount === 0) {
            return res.status(404).send('Cliente não encontrado')
        }

        res.send('Cliente excluído com sucesso')
    } catch (err) {
        console.error(err)
        res.status(500).send('Erro interno do servidor')
    }
})

app.post('/pedidos', async (req, res) => {

    const { cliente_id, produtos } = req.body

    if (!cliente_id || !produtos || produtos.length === 0) {
        return res.status(400).send('Dados inválidos')
    }

    const client = await pool.connect()

    try {

        await client.query('BEGIN')

        const pedidoResult = await client.query(
            `INSERT INTO pedidos (cliente_id)
             VALUES ($1)
             RETURNING *`,
            [cliente_id]
        )

        const pedido = pedidoResult.rows[0]

        for (const item of produtos) {

            const produtoDB = await client.query(
                `SELECT * FROM produtos WHERE id = $1`,
                [item.produto_id]
            )

            if (produtoDB.rows.length === 0) {
                throw new Error(`Produto ${item.produto_id} não encontrado`)
            }

            const produto = produtoDB.rows[0]

            await client.query(
                `INSERT INTO pedido_produtos
                (pedido_id, produto_id, quantidade, valor_unitario)
                VALUES ($1, $2, $3, $4)`,
                [
                    pedido.id,
                    item.produto_id,
                    item.quantidade,
                    produto.valor_unitario
                ]
            )

            await client.query(
                `UPDATE produtos
                SET quantidade = quantidade - $1
                WHERE id = $2`,
                [item.quantidade, item.produto_id]
            )
        }

        await client.query('COMMIT')

        res.status(201).json({
            message: 'Pedido criado',
            pedido
        })

    } catch (err) {

        await client.query('ROLLBACK')

        console.error(err)

        res.status(500).send(err.message)

    } finally {

        client.release()
    }
})


app.get('/pedidos', async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                pedidos.id AS pedido_id,
                pedidos.status,
                pedidos.created_at,

                clientes.nome AS cliente_nome,

                produtos.nome AS produto_nome,
                pedido_produtos.quantidade,
                pedido_produtos.valor_unitario

            FROM pedidos

            JOIN clientes
                ON clientes.id = pedidos.cliente_id

            JOIN pedido_produtos
                ON pedido_produtos.pedido_id = pedidos.id

            JOIN produtos
                ON produtos.id = pedido_produtos.produto_id

            ORDER BY pedidos.id
        `)

        res.json(result.rows)

    } catch (err) {

        console.error(err)

        res.status(500).send('Erro interno')
    }
})

app.post('/produtos', async (req, res) => {

    const { nome, valor_unitario, quantidade } = req.body

    if (
        !nome?.trim() ||
        valor_unitario == null ||
        quantidade == null
    ) {
        return res.status(400).send('Dados inválidos')
    }

    try {

        const result = await pool.query(
            `INSERT INTO produtos
            (nome, valor_unitario, quantidade)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [nome, valor_unitario, quantidade]
        )

        res.status(201).json(result.rows[0])

    } catch (err) {

        console.error(err)
        res.status(500).send('Erro interno')
    }
})

app.get('/produtos', async (req, res) => {

    const { id } = req.query

    try {

        let query = 'SELECT * FROM produtos'
        let values = []

        if (id) {
            query += ' WHERE id = $1'
            values.push(id)
        }

        query += ' ORDER BY id'

        const result = await pool.query(
            query,
            values
        )

        res.json(result.rows)

    } catch (err) {

        console.error(err)
        res.status(500).send('Erro interno')
    }
})


app.put('/produtos/:id', async (req, res) => {

    const { id } = req.params
    const {
        nome,
        valor_unitario,
        quantidade
    } = req.body

    try {

        const result = await pool.query(
            `UPDATE produtos
            SET nome = $1,
                valor_unitario = $2,
                quantidade = $3
            WHERE id = $4
            RETURNING *`,
            [
                nome,
                valor_unitario,
                quantidade,
                id
            ]
        )

        if (result.rows.length === 0) {
            return res
                .status(404)
                .send('Produto não encontrado')
        }

        res.json(result.rows[0])

    } catch (err) {

        console.error(err)
        res.status(500).send('Erro interno')
    }
})


app.delete('/produtos/:id', async (req, res) => {

    try {

        const result = await pool.query(
            `DELETE FROM produtos
            WHERE id = $1`,
            [req.params.id]
        )

        if (result.rowCount === 0) {
            return res
                .status(404)
                .send('Produto não encontrado')
        }

        res.send('Produto excluído')

    } catch (err) {

        console.error(err)
        res.status(500).send('Erro interno')
    }
})

app.put('/pedidos/:id/status', async (req, res) => {

    const { id } = req.params;

    const { status } = req.body;

    if (!status?.trim()) {
        return res
            .status(400)
            .send('Status é obrigatório');
    }

    try {

        const result = await pool.query(
            `
            UPDATE pedidos
            SET status = $1
            WHERE id = $2
            RETURNING *
            `,
            [status, id]
        );

        if (result.rows.length === 0) {
            return res
                .status(404)
                .send('Pedido não encontrado');
        }

        res.json(result.rows[0]);

    } catch (err) {

        console.error(err);

        res.status(500)
            .send('Erro interno');
    }
});

app.get('/pedidos', async (req, res) => {

    const { status } = req.query;

    try {

        let query = `
            SELECT
                pedidos.id AS pedido_id,
                pedidos.status,
                pedidos.created_at,

                clientes.nome AS cliente_nome,

                produtos.nome AS produto_nome,
                pedido_produtos.quantidade,
                pedido_produtos.valor_unitario

            FROM pedidos

            JOIN clientes
                ON clientes.id = pedidos.cliente_id

            JOIN pedido_produtos
                ON pedido_produtos.pedido_id = pedidos.id

            JOIN produtos
                ON produtos.id =
                pedido_produtos.produto_id
        `;

        const values = [];

        if (status) {

            query += `
                WHERE pedidos.status = $1
            `;

            values.push(status);
        }

        query += `
            ORDER BY pedidos.id
        `;

        const result = await pool.query(
            query,
            values
        );

        res.json(result.rows);

    } catch (err) {

        console.error(err);

        res.status(500)
            .send('Erro interno');
    }
});


app.listen(3000, () => {
    console.log('Livros abertos na porta 3000')
})