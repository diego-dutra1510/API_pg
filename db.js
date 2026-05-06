import pkg from 'pg';

const { Pool } = pkg;

const pool = new Pool({
    user: 'diego',
    password: 'diego261510',
    host: 'localhost',
    database: 'postgres',
    port: 5433
});

export default pool;