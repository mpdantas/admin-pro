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
        alert("Você não está autenticado. Por favor, faça login.");
        navigate('/login');
        return;
      }

      try {
        const response = await api.get('/clients', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setClients(response.data);
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
        alert("Sua sessão pode ter expirado. Por favor, faça login novamente.");
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
              <TableCell>Data de Nascimento</TableCell>
              <TableCell align="right">Ações</TableCell> {/* Nova Coluna */}
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.cpf}</TableCell>
                <TableCell>{new Date(client.birth_date).toLocaleDateString()}</TableCell>
                {/* Novas Ações */}
                <TableCell align="right">
                  <IconButton 
                    component={Link} 
                    to={`/clients/edit/${client.id}`}
                    aria-label="edit"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => alert(`Funcionalidade de deletar o cliente ${client.name} ainda não implementada.`)}
                    aria-label="delete"
                  >
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