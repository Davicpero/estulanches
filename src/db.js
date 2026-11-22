import pg from 'pg';

pg.types.setTypeParser(1700, (valor) => parseFloat(valor));

export const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'estulanches',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  max: 10,
});

export function query(sql, parametros) {
  return pool.query(sql, parametros);
}
