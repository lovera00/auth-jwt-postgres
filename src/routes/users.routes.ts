import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../infrastructure/postgres';
import { JsonWebTokenError } from 'jsonwebtoken';
import User from '../domain/User';

const router = Router();

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 12);

  try {
    const result = await pool.query('INSERT INTO sistema.users (username, password) VALUES ($1, $2) RETURNING id_users', [username, hashedPassword]);
    const userId = result.rows[0].id_users;

    res.status(201).json({ userId });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error, error: '+error });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM sistema.users WHERE username = $1 and status = true', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const userLogin:User = new User(result.rows[0].id_users, result.rows[0].username, result.rows[0].password, result.rows[0].status, result.rows[0].create_at, result.rows[0].update_at);

    if (!userLogin || !bcrypt.compareSync(password, userLogin.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const secret = process.env.JWT_SECRET ?? 'defaultSecret';
    const accessToken = jwt.sign({ userId: userLogin.id_users }, secret, { expiresIn: process.env.JWT_EXPIRES });

    const refreshToken = jwt.sign({ userId: userLogin.id_users }, process.env.REFRESH_TOKEN_SECRET ?? 'defaultRefreshSecret', { expiresIn: '7d' });

    res.json({ accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/token', (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET ?? 'defaultRefreshSecret', (err: JsonWebTokenError | null, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Token is not valid' });
    }

    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET ?? 'defaultSecret', { expiresIn: process.env.JWT_EXPIRES });
    res.json({ accessToken });
  });
});


export default router;
