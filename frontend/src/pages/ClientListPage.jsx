import { useState, useEffect } from 'react';
import { Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function ClientListPage() {
  const [clients, setClients] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchClients() {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const response = await api.get('/clients', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClients(response.data);
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
        localStorage.removeItem('authToken');
        navigate('/login');
      }
    }
    fetchClients();
  }, [navigate]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">
          Cadastro de Clientes
        </Typography>
        <Button variant="contained" component={Link} to="/clients/new">
          Novo Cliente
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>CPF</TableCell>
              <TableCell>E-mail</TableCell> {/* Trocamos Data de Nascimento por E-mail para ser mais útil na lista */}
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* A chave é garantir que o .map comece logo após o TableBody */}
            {clients.map((client) => (
              <TableRow key={client.id} hover> {/* Adicionamos 'hover' para um efeito visual */}
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.cpf}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell align="right">
                  <IconButton component={Link} to={`/clients/edit/${client.id}`} aria-label="edit">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => alert(`Deletar o cliente ${client.name} (não implementado)`)} aria-label="delete">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}