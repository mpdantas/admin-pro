// --- IMPORTS ---
require('dotenv').config(); // ESSA LINHA DEVE SER SEMPRE A PRIMEIRA
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middleware/auth.js');

// --- APP E CONFIGURAÇÕES ---
const app = express();
const PORT = 4000;

// --- MIDDLEWARES ---
app.use(express.json());

// --- CONEXÃO COM O BANCO DE DADOS ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// =================================================================
// --- ROTAS PÚBLICAS E DE TESTE ---
// =================================================================
app.get('/', (req, res) => {
  res.send('API do Admin Pro está funcionando!');
});

// =================================================================
// --- ROTAS DE AUTENTICAÇÃO ---
// =================================================================
app.post('/register', async (req, res) => {
  const { companyName, userEmail, password } = req.body;
  if (!companyName || !userEmail || !password) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const companyResult = await client.query('INSERT INTO companies (name) VALUES ($1) RETURNING id', [companyName]);
    const newCompanyId = companyResult.rows[0].id;
    await client.query('INSERT INTO users (company_id, email, password_hash) VALUES ($1, $2, $3)', [newCompanyId, userEmail, passwordHash]);
    await client.query('COMMIT');
    res.status(201).json({ message: 'Empresa e usuário registrados com sucesso!' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro interno ao registrar. Tente novamente.' });
  } finally {
    client.release();
  }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }
    try {
      const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (userResult.rows.length === 0) {
        return res.status(401).json({ message: 'Credenciais inválidas.' });
      }
      const user = userResult.rows[0];
      const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordMatch) {
        return res.status(401).json({ message: 'Credenciais inválidas.' });
      }
      const token = jwt.sign({ userId: user.id, companyId: user.company_id }, process.env.JWT_SECRET, { expiresIn: '8h' });
      res.json({ token });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ message: 'Erro interno no servidor.' });
    }
  });

// =================================================================
// --- ROTAS PROTEGIDAS ---
// =================================================================
app.get('/me', authMiddleware, (req, res) => {
    res.json({ userId: req.userId, companyId: req.companyId });
});

// -----------------------------------------------------------------
// --- ROTAS DE CLIENTES (CRUD) ---
// -----------------------------------------------------------------

// CREATE - Cadastrar um novo cliente
app.post('/clients', authMiddleware, async (req, res) => {
  const { companyId } = req; 
  const { name, cpf, rg, cnpj, birth_date } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'O nome do cliente é obrigatório.' });
  }
  try {
    const newClient = await pool.query(
      `INSERT INTO clients (name, cpf, rg, cnpj, birth_date, company_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, cpf, rg, cnpj, birth_date, companyId]
    );
    res.status(201).json(newClient.rows[0]);
  } catch (error) {
    console.error('Erro ao cadastrar cliente:', error);
    res.status(500).json({ message: 'Erro interno ao cadastrar cliente.' });
  }
});

// READ - Listar todos os clientes da empresa do usuário logado
app.get('/clients', authMiddleware, async (req, res) => {
  const { companyId } = req;
  try {
    const allClients = await pool.query('SELECT * FROM clients WHERE company_id = $1 ORDER BY name ASC', [companyId]);
    res.json(allClients.rows);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ message: 'Erro interno ao buscar clientes.' });
  }
});

// UPDATE - Atualizar um cliente existente
app.put('/clients/:id', authMiddleware, async (req, res) => {
  const { companyId } = req;
  const { id: clientId } = req.params;
  const { name, cpf, rg, cnpj, birth_date } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'O nome do cliente é obrigatório.' });
  }
  try {
    const updateResult = await pool.query(
      `UPDATE clients SET name = $1, cpf = $2, rg = $3, cnpj = $4, birth_date = $5 WHERE id = $6 AND company_id = $7 RETURNING *`,
      [name, cpf, rg, cnpj, birth_date, clientId, companyId]
    );
    if (updateResult.rows.length === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado ou não pertence à sua empresa.' });
    }
    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ message: 'Erro interno ao atualizar cliente.' });
  }
});

// DELETE - Deletar um cliente
app.delete('/clients/:id', authMiddleware, async (req, res) => {
  const { companyId } = req;
  const { id: clientId } = req.params;
  try {
    const deleteResult = await pool.query('DELETE FROM clients WHERE id = $1 AND company_id = $2 RETURNING *', [clientId, companyId]);
    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado ou não pertence à sua empresa.' });
    }
    res.status(204).send(); 
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ message: 'Erro interno ao deletar cliente.' });
  }
});

// --- INICIAR O SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Servidor Admin Pro rodando na porta ${PORT}`);
});