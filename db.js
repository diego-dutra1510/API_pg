const { Pool } = require('pg')

const pool = new Pool({
    user: 'diego',
    password: 'diego261510',
    host: 'localhost',
    database: 'postgres',
    port: '5433'
})

module.exports = pool