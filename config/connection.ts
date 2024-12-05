import mysql from 'mysql2/promise';

const poolConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,  // Espera por uma conexão disponível
  connectionLimit: 10,       // Limite de conexões simultâneas no pool
  queueLimit: 0,             // Sem limite de requisições na fila
};

const pool = mysql.createPool(poolConfig);

export default async function getConnection(): Promise<mysql.PoolConnection> {
  return await pool.getConnection(); // Pega uma conexão do pool
}
