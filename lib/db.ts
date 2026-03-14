import mysql, { type Pool, type RowDataPacket } from "mysql2/promise";

type DbUser = {
  id: number;
  name: string;
  email: string;
  aura: number;
};

type DbEvent = {
  id: number;
  fromUserName: string | null;
  toUserName: string;
  amount: number;
  reason: string | null;
  createdAt: string;
};

const connectionUrl = process.env.DATABASE_URL;

let pool: Pool | null = null;
let initialized = false;

function getPool() {
  if (!connectionUrl) {
    throw new Error("DATABASE_URL is not set. Add it in your Railway service variables.");
  }

  if (!pool) {
    pool = mysql.createPool({
      uri: connectionUrl,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: process.env.MYSQL_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    });
  }

  return pool;
}

async function initDb() {
  if (initialized) return;

  const db = getPool();

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(190) NOT NULL UNIQUE,
      aura INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS aura_events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      from_user_id INT NULL,
      to_user_id INT NOT NULL,
      amount INT NOT NULL,
      reason VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_from_user FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE SET NULL,
      CONSTRAINT fk_to_user FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  initialized = true;
}

export async function registerUser(name: string, email: string) {
  await initDb();
  const db = getPool();

  const [existing] = await db.query<RowDataPacket[]>(
    "SELECT id, name, email, aura FROM users WHERE email = ? LIMIT 1",
    [email],
  );

  if (existing.length > 0) {
    return existing[0] as DbUser;
  }

  const [result] = await db.query<mysql.ResultSetHeader>(
    "INSERT INTO users (name, email, aura) VALUES (?, ?, 0)",
    [name, email],
  );

  return {
    id: result.insertId,
    name,
    email,
    aura: 0,
  } satisfies DbUser;
}

export async function getUsers() {
  await initDb();
  const db = getPool();
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT id, name, email, aura FROM users ORDER BY aura DESC, created_at ASC",
  );
  return rows as DbUser[];
}

export async function giveAura(fromUserId: number | null, toUserId: number, amount: number, reason: string) {
  await initDb();
  const db = getPool();
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [toUser] = await conn.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE id = ? LIMIT 1",
      [toUserId],
    );

    if (toUser.length === 0) {
      throw new Error("Recipient user not found.");
    }

    if (fromUserId !== null) {
      const [fromUser] = await conn.query<RowDataPacket[]>(
        "SELECT id FROM users WHERE id = ? LIMIT 1",
        [fromUserId],
      );
      if (fromUser.length === 0) {
        throw new Error("Sender user not found.");
      }
    }

    await conn.query("UPDATE users SET aura = aura + ? WHERE id = ?", [amount, toUserId]);

    await conn.query(
      "INSERT INTO aura_events (from_user_id, to_user_id, amount, reason) VALUES (?, ?, ?, ?)",
      [fromUserId, toUserId, amount, reason || null],
    );

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function getRecentEvents(limit = 15) {
  await initDb();
  const db = getPool();

  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT
      e.id,
      fu.name AS fromUserName,
      tu.name AS toUserName,
      e.amount,
      e.reason,
      DATE_FORMAT(e.created_at, '%Y-%m-%d %H:%i:%s') AS createdAt
    FROM aura_events e
    LEFT JOIN users fu ON fu.id = e.from_user_id
    INNER JOIN users tu ON tu.id = e.to_user_id
    ORDER BY e.created_at DESC
    LIMIT ?`,
    [limit],
  );

  return rows as DbEvent[];
}
