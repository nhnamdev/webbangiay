import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import crypto from 'crypto'

function supabaseMysqlPlugin(env) {
  let pool;

  const getPool = async () => {
    if (!pool) {
      const mysql = await import('mysql2/promise');
      pool = mysql.default.createPool({
        host: env.VITE_MYSQL_HOST || 'localhost',
        port: parseInt(env.VITE_MYSQL_PORT || '3306'),
        user: env.VITE_MYSQL_USER || 'root',
        password: env.VITE_MYSQL_PASSWORD || '',
        database: env.VITE_MYSQL_DATABASE || 'zestfootdb',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
    }
    return pool;
  };

  const getBody = (req) => {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : null);
        } catch (err) {
          reject(err);
        }
      });
    });
  };

  const sendJson = (res, data, status = 200) => {
    res.writeHead(status, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': '*'
    });
    res.end(JSON.stringify(data));
  };

  return {
    name: 'supabase-mysql-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost');

        // CORS Preflight
        if (req.method === 'OPTIONS') {
          res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': '*'
          });
          res.end();
          return;
        }

        // 1. Check if request is a Supabase Auth endpoint
        if (url.pathname.startsWith('/auth/v1/')) {
          try {
            const db = await getPool();
            const action = url.pathname.replace('/auth/v1/', '');

            if (req.method === 'POST' && action === 'signup') {
              const body = await getBody(req);
              const userId = crypto.randomUUID();
              await db.query(
                'INSERT INTO profiles (id, full_name, points, spin_tickets) VALUES (?, ?, 200, 0)',
                [userId, body.options?.data?.full_name || body.email.split('@')[0]]
              );
              sendJson(res, {
                user: { id: userId, email: body.email, app_metadata: {}, user_metadata: body.options?.data || {} },
                session: { access_token: 'mock-token', refresh_token: 'mock-refresh-token', user: { id: userId, email: body.email } }
              });
              return;
            }

            if (req.method === 'POST' && action.startsWith('token')) {
              const body = await getBody(req);
              const [profiles] = await db.query('SELECT * FROM profiles LIMIT 1');
              const userId = profiles && profiles[0] ? profiles[0].id : crypto.randomUUID();
              const email = body.email || 'user@example.com';
              sendJson(res, {
                access_token: 'mock-token',
                token_type: 'bearer',
                expires_in: 3600,
                refresh_token: 'mock-refresh-token',
                user: {
                  id: userId,
                  email: email,
                  app_metadata: { role: 'user' },
                  user_metadata: { full_name: profiles && profiles[0] ? profiles[0].full_name : 'Mock User' }
                }
              });
              return;
            }

            if (req.method === 'GET' && action === 'user') {
              const [profiles] = await db.query('SELECT * FROM profiles LIMIT 1');
              const userId = profiles && profiles[0] ? profiles[0].id : crypto.randomUUID();
              sendJson(res, {
                id: userId,
                email: 'user@example.com',
                app_metadata: { role: 'user' },
                user_metadata: { full_name: profiles && profiles[0] ? profiles[0].full_name : 'Mock User' }
              });
              return;
            }

            if (req.method === 'POST' && action === 'logout') {
              sendJson(res, {});
              return;
            }

            // Fallback for other auth actions
            sendJson(res, {});
            return;
          } catch (err) {
            console.error('[Supabase Auth Proxy Error]:', err);
            sendJson(res, { error: err.message }, 500);
            return;
          }
        }

        // 2. Check if request is a Supabase Rest endpoint
        if (url.pathname.startsWith('/rest/v1/')) {
          try {
            const db = await getPool();
            const table = url.pathname.replace('/rest/v1/', '');

            // 2.1 Handle RPC Match Products (Vector Search for Chatbot)
            if (req.method === 'POST' && table === 'rpc/match_products') {
              const body = await getBody(req);
              const { query_embedding, match_threshold, match_count } = body;
              const [products] = await db.query('SELECT * FROM products');

              const matched = products
                .map(p => {
                  let embedding = p.embedding;
                  if (typeof embedding === 'string') {
                    try { embedding = JSON.parse(embedding); } catch (e) { embedding = null; }
                  }
                  if (!embedding || !Array.isArray(embedding)) {
                    return { ...p, similarity: 0 };
                  }
                  let similarity = 0;
                  for (let i = 0; i < Math.min(embedding.length, query_embedding.length); i++) {
                    similarity += embedding[i] * query_embedding[i];
                  }
                  return { ...p, similarity };
                })
                .filter(p => p.similarity >= match_threshold)
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, match_count);

              sendJson(res, matched);
              return;
            }

            // 2.2 Handle POST Insert
            if (req.method === 'POST') {
              const body = await getBody(req);
              const rowsToInsert = Array.isArray(body) ? body : [body];
              const insertedRows = [];

              for (const row of rowsToInsert) {
                const keys = Object.keys(row);
                const values = keys.map(k => {
                  const val = row[k];
                  if (val && (typeof val === 'object' || Array.isArray(val))) {
                    return JSON.stringify(val);
                  }
                  return val;
                });

                const columnsClause = keys.map(k => `\`${k}\``).join(', ');
                const placeholders = keys.map(() => '?').join(', ');
                const [result] = await db.query(
                  `INSERT INTO \`${table}\` (${columnsClause}) VALUES (${placeholders})`,
                  values
                );

                const queryId = row.id !== undefined ? row.id : result.insertId;
                const [inserted] = await db.query(`SELECT * FROM \`${table}\` WHERE id = ?`, [queryId]);
                if (inserted && inserted[0]) {
                  insertedRows.push(inserted[0]);
                }
              }
              sendJson(res, insertedRows);
              return;
            }

            // 2.3 Handle PATCH Update
            if (req.method === 'PATCH') {
              const body = await getBody(req);
              const updateKeys = Object.keys(body);
              const updateVals = updateKeys.map(k => {
                const val = body[k];
                if (val && (typeof val === 'object' || Array.isArray(val))) {
                  return JSON.stringify(val);
                }
                return val;
              });

              const setClause = updateKeys.map(k => `\`${k}\` = ?`).join(', ');

              const conditions = [];
              const params = [];
              for (const [key, val] of url.searchParams.entries()) {
                if (['select', 'limit', 'offset', 'order'].includes(key)) continue;
                if (val.startsWith('eq.')) {
                  conditions.push(`\`${key}\` = ?`);
                  params.push(val.slice(3));
                }
              }

              let patchSql = `UPDATE \`${table}\` SET ${setClause}`;
              if (conditions.length > 0) {
                patchSql += ` WHERE ${conditions.join(' AND ')}`;
              }

              await db.query(patchSql, [...updateVals, ...params]);

              let selectSql = `SELECT * FROM \`${table}\``;
              if (conditions.length > 0) {
                selectSql += ` WHERE ${conditions.join(' AND ')}`;
              }
              const [updated] = await db.query(selectSql, params);
              sendJson(res, updated);
              return;
            }

            // 2.4 Handle GET Select
            if (req.method === 'GET') {
              let sql = `SELECT * FROM \`${table}\``;
              const conditions = [];
              const params = [];

              for (const [key, val] of url.searchParams.entries()) {
                if (['select', 'limit', 'offset', 'order'].includes(key)) continue;

                if (val.startsWith('eq.')) {
                  const rawVal = val.slice(3);
                  if (rawVal === 'true') {
                    conditions.push(`\`${key}\` = 1`);
                  } else if (rawVal === 'false') {
                    conditions.push(`\`${key}\` = 0`);
                  } else if (rawVal === 'null') {
                    conditions.push(`\`${key}\` IS NULL`);
                  } else {
                    conditions.push(`\`${key}\` = ?`);
                    params.push(rawVal);
                  }
                } else if (val.startsWith('neq.')) {
                  const rawVal = val.slice(4);
                  if (rawVal === 'null') {
                    conditions.push(`\`${key}\` IS NOT NULL`);
                  } else {
                    conditions.push(`\`${key}\` != ?`);
                    params.push(rawVal);
                  }
                } else if (val.startsWith('cs.')) {
                  const rawVal = val.slice(3);
                  conditions.push(`JSON_CONTAINS(\`${key}\`, ?)`);
                  params.push(rawVal);
                }
              }

              if (conditions.length > 0) {
                sql += ` WHERE ${conditions.join(' AND ')}`;
              }

              const order = url.searchParams.get('order');
              if (order) {
                const [col, dir] = order.split('.');
                sql += ` ORDER BY \`${col}\` ${dir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'}`;
              }

              const limit = url.searchParams.get('limit');
              if (limit) {
                sql += ` LIMIT ${parseInt(limit)}`;
              }

              const offset = url.searchParams.get('offset');
              if (offset) {
                sql += ` OFFSET ${parseInt(offset)}`;
              }

              const [rows] = await db.query(sql, params);

              // Handle single object response (.single())
              const acceptHeader = req.headers['accept'] || '';
              const isSingle = acceptHeader.includes('vnd.pgrst.object+json');
              if (isSingle) {
                sendJson(res, rows[0] || null);
              } else {
                sendJson(res, rows);
              }
              return;
            }

            sendJson(res, { error: 'Method not supported by proxy' }, 405);
            return;
          } catch (err) {
            console.error('[Supabase REST Proxy Error]:', err);
            sendJson(res, { error: err.message }, 500);
            return;
          }
        }

        next();
      });
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      supabaseMysqlPlugin(env)
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './')
      }
    }
  }
})
