// --- IMPORTS ---
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middleware/auth.js');

// --- APP E CONFIGURAÇÕES ---
const app = express();
const PORT = 4000;

// --- MIDDLEWARES ---
app.use(express.json());
app.use(cors());

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

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      message: 'Conexão com o banco de dados bem-sucedida!',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    res.status(500).json({ message: 'Falha ao conectar com o banco de dados.' });
  }
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
  console.log('--- ROTA /login ATINGIDA! ---');
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

// CREATE - Cadastrar um novo cliente com debug
app.post('/clients', authMiddleware, async (req, res) => {
  const { companyId } = req;
  const { general, address, vehicle, observations } = req.body;

  if (!general || !general.name) {
    return res.status(400).json({ message: 'O nome do cliente é obrigatório.' });
  }

  // Definindo a query e os parâmetros em variáveis separadas para o debug
  const queryText = `INSERT INTO clients (name, birth_date, cpf, rg, cnh, cnpj, celular, email, observations, company_id, created_at) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) 
                     RETURNING *`;
  const queryParams = [general.name, general.birth_date || null, general.cpf, general.rg, general.cnh, general.cnpj, general.celular, general.email, observations, companyId];

  // O CONSOLE.LOG MAIS IMPORTANTE PARA NOSSO TESTE
  console.log("--- EXECUTANDO QUERY DE CRIAÇÃO DE CLIENTE ---");
  console.log("QUERY:", queryText);
  console.log("PARAMS:", queryParams);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const newClientResult = await client.query(queryText, queryParams);
    const newClient = newClientResult.rows[0];

    if (address && Object.values(address).some(field => field)) {
      await client.query(`INSERT INTO addresses (client_id, zip_code, street, number, complement, neighborhood, city, state) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [newClient.id, address.zip_code, address.street, address.number, address.complement, address.neighborhood, address.city, address.state]);
    }
    if (vehicle && Object.values(vehicle).some(field => field)) {
      await client.query(`INSERT INTO vehicles (client_id, brand, model, plate, cor, ano_modelo, ano_fabricacao, chassi, renavam) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [newClient.id, vehicle.brand, vehicle.model, vehicle.plate, vehicle.cor, vehicle.ano_modelo || null, vehicle.ano_fabricacao || null, vehicle.chassi, vehicle.renavam]);
    }
    
    await client.query('COMMIT');
    res.status(201).json(newClient);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao cadastrar cliente completo:', error);
    res.status(500).json({ message: 'Erro interno ao cadastrar cliente.' });
  } finally {
    client.release();
  }
});

// READ (ALL)
app.get('/clients', authMiddleware, async (req, res) => {
  const { companyId } = req;
  try {
    const allClients = await pool.query('SELECT id, name, cpf, celular, email, created_at FROM clients WHERE company_id = $1 ORDER BY name ASC', [companyId]);
    res.json(allClients.rows);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ message: 'Erro interno ao buscar clientes.' });
  }
});

// READ (SINGLE)
app.get('/clients/:id', authMiddleware, async (req, res) => {
  const { companyId } = req;
  const { id: clientId } = req.params;
  try {
    const clientQuery = 'SELECT * FROM clients WHERE id = $1 AND company_id = $2';
    const addressQuery = 'SELECT * FROM addresses WHERE client_id = $1';
    const vehicleQuery = 'SELECT * FROM vehicles WHERE client_id = $1';
    const clientResult = await pool.query(clientQuery, [clientId, companyId]);
    if (clientResult.rows.length === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado.' });
    }
    const addressResult = await pool.query(addressQuery, [clientId]);
    const vehicleResult = await pool.query(vehicleQuery, [clientId]);
    const clientDb = clientResult.rows[0];
    const fullClientData = {
      general: { ...clientDb },
      address: addressResult.rows[0] || {},
      vehicle: vehicleResult.rows[0] || {},
      observations: clientDb.observations || ''
    };
    res.json(fullClientData);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ message: 'Erro interno ao buscar cliente.' });
  }
});

// UPDATE
app.put('/clients/:id', authMiddleware, async (req, res) => {
  const { companyId } = req;
  const { id: clientId } = req.params;
  const { general, address, vehicle, observations } = req.body;
  if (!general || !general.name) { return res.status(400).json({ message: 'O nome do cliente é obrigatório.' }); }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const updatedClientResult = await client.query(`UPDATE clients SET name=$1, birth_date=$2, cpf=$3, rg=$4, cnh=$5, cnpj=$6, celular=$7, email=$8, observations=$9 WHERE id=$10 AND company_id=$11 RETURNING *`, [general.name, general.birth_date || null, general.cpf, general.rg, general.cnh, general.cnpj, general.celular, general.email, observations, clientId, companyId]);
    if (updatedClientResult.rows.length === 0) { throw new Error('Cliente não encontrado ou não pertence à empresa.'); }
    if (address) { await client.query(`INSERT INTO addresses (client_id, zip_code, street, number, complement, neighborhood, city, state) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (client_id) DO UPDATE SET zip_code=EXCLUDED.zip_code, street=EXCLUDED.street, number=EXCLUDED.number, complement=EXCLUDED.complement, neighborhood=EXCLUDED.neighborhood, city=EXCLUDED.city, state=EXCLUDED.state`, [clientId, address.zip_code, address.street, address.number, address.complement, address.neighborhood, address.city, address.state]); }
    if (vehicle) { await client.query(`INSERT INTO vehicles (client_id, brand, model, plate, cor, ano_modelo, ano_fabricacao, chassi, renavam) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (client_id) DO UPDATE SET brand=EXCLUDED.brand, model=EXCLUDED.model, plate=EXCLUDED.plate, cor=EXCLUDED.cor, ano_modelo=EXCLUDED.ano_modelo, ano_fabricacao=EXCLUDED.ano_fabricacao, chassi=EXCLUDED.chassi, renavam=EXCLUDED.renavam`, [clientId, vehicle.brand, vehicle.model, vehicle.plate, vehicle.cor, vehicle.ano_modelo || null, vehicle.ano_fabricacao || null, vehicle.chassi, vehicle.renavam]); }
    await client.query('COMMIT');
    res.json(updatedClientResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ message: 'Erro interno ao atualizar cliente.' });
  } finally {
    client.release();
  }
});

// DELETE
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