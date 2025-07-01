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
// --- ROTAS DE AUTENTICAÇÃO E TESTE ---
// (Estas rotas permanecem as mesmas)
// =================================================================
app.get('/', (req, res) => res.send('API do Admin Pro está funcionando!'));
app.post('/register', async (req, res) => { /* ...código existente sem alteração... */ });
app.post('/login', async (req, res) => { /* ...código existente sem alteração... */ });
app.get('/me', authMiddleware, (req, res) => { /* ...código existente sem alteração... */ });


// =================================================================
// --- ROTAS DE CLIENTES (CRUD ATUALIZADO) ---
// =================================================================

// CREATE - Cadastrar um novo cliente com dados completos
app.post('/clients', authMiddleware, async (req, res) => {
  const { companyId } = req;
  const { general, address, vehicle, observations } = req.body;

  if (!general || !general.name) {
    return res.status(400).json({ message: 'O nome do cliente é obrigatório.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const newClientResult = await client.query(
      `INSERT INTO clients (name, birth_date, cpf, rg, cnh, cnpj, celular, email, observations, company_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [general.name, general.birth_date || null, general.cpf, general.rg, general.cnh, general.cnpj, general.celular, general.email, observations, companyId]
    );
    const newClient = newClientResult.rows[0];

    // Só insere endereço se algum campo de endereço foi preenchido
    if (address && Object.values(address).some(field => field)) {
      await client.query(
        `INSERT INTO addresses (client_id, zip_code, street, number, complement, neighborhood, city, state) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [newClient.id, address.zip_code, address.street, address.number, address.complement, address.neighborhood, address.city, address.state]
      );
    }

    // Só insere veículo se algum campo de veículo foi preenchido
    if (vehicle && Object.values(vehicle).some(field => field)) {
      await client.query(
        `INSERT INTO vehicles (client_id, brand, model, plate, cor, ano_modelo, ano_fabricacao, chassi, renavam) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [newClient.id, vehicle.brand, vehicle.model, vehicle.plate, vehicle.cor, vehicle.ano_modelo || null, vehicle.ano_fabricacao || null, vehicle.chassi, vehicle.renavam]
      );
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

// READ (ALL) - Listar todos os clientes
app.get('/clients', authMiddleware, async (req, res) => {
  const { companyId } = req;
  try {
    const allClients = await pool.query('SELECT id, name, cpf, celular, email FROM clients WHERE company_id = $1 ORDER BY name ASC', [companyId]);
    res.json(allClients.rows);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ message: 'Erro interno ao buscar clientes.' });
  }
});

// READ (SINGLE) - Buscar um único cliente com todos os seus dados
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

    // Monta o objeto de resposta no mesmo formato do nosso formulário do frontend
    const fullClientData = {
      general: {
        name: clientResult.rows[0].name,
        birth_date: clientResult.rows[0].birth_date,
        cpf: clientResult.rows[0].cpf,
        rg: clientResult.rows[0].rg,
        cnh: clientResult.rows[0].cnh,
        cnpj: clientResult.rows[0].cnpj,
        celular: clientResult.rows[0].celular,
        email: clientResult.rows[0].email,
      },
      address: addressResult.rows[0] || {},
      vehicle: vehicleResult.rows[0] || {},
      observations: clientResult.rows[0].observations || ''
    };
    res.json(fullClientData);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ message: 'Erro interno ao buscar cliente.' });
  }
});

// UPDATE - Atualizar um cliente com todos os dados
app.put('/clients/:id', authMiddleware, async (req, res) => {
  const { companyId } = req;
  const { id: clientId } = req.params;
  const { general, address, vehicle, observations } = req.body;

  if (!general || !general.name) { return res.status(400).json({ message: 'O nome do cliente é obrigatório.' }); }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const updatedClientResult = await client.query(
      `UPDATE clients SET name=$1, birth_date=$2, cpf=$3, rg=$4, cnh=$5, cnpj=$6, celular=$7, email=$8, observations=$9 
       WHERE id=$10 AND company_id=$11 RETURNING *`,
      [general.name, general.birth_date || null, general.cpf, general.rg, general.cnh, general.cnpj, general.celular, general.email, observations, clientId, companyId]
    );
    if (updatedClientResult.rows.length === 0) { throw new Error('Cliente não encontrado ou não pertence à empresa.'); }

    if (address) {
      await client.query(
        `INSERT INTO addresses (client_id, zip_code, street, number, complement, neighborhood, city, state) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (client_id) DO UPDATE SET zip_code=EXCLUDED.zip_code, street=EXCLUDED.street, number=EXCLUDED.number, complement=EXCLUDED.complement, neighborhood=EXCLUDED.neighborhood, city=EXCLUDED.city, state=EXCLUDED.state`,
        [clientId, address.zip_code, address.street, address.number, address.complement, address.neighborhood, address.city, address.state]
      );
    }
    if (vehicle) {
      await client.query(
        // Usamos client_id como chave de conflito, assumindo um veículo por cliente.
        // Se um cliente puder ter múltiplos veículos, a lógica aqui e no banco precisaria mudar.
        `INSERT INTO vehicles (client_id, brand, model, plate, cor, ano_modelo, ano_fabricacao, chassi, renavam) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (client_id) DO UPDATE SET brand=EXCLUDED.brand, model=EXCLUDED.model, plate=EXCLUDED.plate, cor=EXCLUDED.cor, ano_modelo=EXCLUDED.ano_modelo, ano_fabricacao=EXCLUDED.ano_fabricacao, chassi=EXCLUDED.chassi, renavam=EXCLUDED.renavam`,
        [clientId, vehicle.brand, vehicle.model, vehicle.plate, vehicle.cor, vehicle.ano_modelo || null, vehicle.ano_fabricacao || null, vehicle.chassi, vehicle.renavam]
      );
    }
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


// DELETE - Deletar um cliente (permanece igual)
app.delete('/clients/:id', authMiddleware, async (req, res) => { /* ...código existente sem alteração... */ });


// --- INICIAR O SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Servidor Admin Pro rodando na porta ${PORT}`);
});