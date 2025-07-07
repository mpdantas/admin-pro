import { useState, useEffect } from 'react';
import { 
  Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  IconButton, Grid, TextField, Chip, Dialog, DialogActions, DialogContent, 
  DialogContentText, DialogTitle, CircularProgress 
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import api from '../services/api';
import ClientPdfDocument from '../components/ClientPdfDocument';

// Ícones
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';

export default function ClientSearchPage() {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [selectedClientData, setSelectedClientData] = useState(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

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

  const filteredClients = clients.filter(client =>
    (client.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (client.cpf?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleRowClick = (clientId) => {
    navigate(`/clients/edit/${clientId}`);
  };

  const handleClickOpenDeleteDialog = (client, event) => {
    event.stopPropagation();
    setClientToDelete(client);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setClientToDelete(null);
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;
    const token = localStorage.getItem('authToken');
    try {
      await api.delete(`/clients/${clientToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Remove o cliente da lista no estado, atualizando a UI
      setClients(clients.filter(client => client.id !== clientToDelete.id));
      alert('Cliente deletado com sucesso!');
    } catch (error) {
      console.error("Erro ao deletar cliente:", error);
      alert('Falha ao deletar cliente.');
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const handleOpenPrintDialog = async (client, event) => {
    event.stopPropagation();
    setPrintDialogOpen(true);
    setIsPdfLoading(true);
    const token = localStorage.getItem('authToken');
    try {
      const response = await api.get(`/clients/${client.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedClientData(response.data);
    } catch (error) {
      console.error("Erro ao buscar dados do cliente para impressão", error);
      alert("Não foi possível carregar os dados do cliente para impressão.");
      setPrintDialogOpen(false);
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleClosePrintDialog = () => {
    setPrintDialogOpen(false);
    setSelectedClientData(null);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>CLIENTES</Typography>
      
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <Button variant="contained" component={RouterLink} to="/clients" fullWidth>Novo Cliente</Button>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
             <TextField fullWidth label="Pesquisar por Nome ou CPF..." variant="outlined" size="small" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={12} md={2}>
             <Button variant="contained" color="success" fullWidth><SearchIcon sx={{ mr: 1 }} />Pesquisar</Button>
          </Grid>
          <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, alignItems: 'center' }}>
             <Chip label={`TOTAL: ${filteredClients.length}`} sx={{ fontWeight: 'bold' }} />
          </Grid>
        </Grid>
      </Paper>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>CPF</TableCell>
              <TableCell>E-mail</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow key={client.id} hover onClick={() => handleRowClick(client.id)} sx={{ cursor: 'pointer' }}>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.cpf}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                  <IconButton component={RouterLink} to={`/clients/edit/${client.id}`} aria-label="edit"><EditIcon /></IconButton>
                  <IconButton onClick={(e) => handleOpenPrintDialog(client, e)} aria-label="print"><PrintIcon /></IconButton>
                  <IconButton onClick={(e) => handleClickOpenDeleteDialog(client, e)} aria-label="delete"><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* DIALOG DE DELEÇÃO */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Você tem certeza que deseja deletar o cliente **{clientToDelete?.name}**? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button onClick={handleDeleteClient} color="error">Deletar</Button>
        </DialogActions>
      </Dialog>
      
      {/* DIALOG DE IMPRESSÃO */}
      <Dialog open={printDialogOpen} onClose={handleClosePrintDialog}>
        <DialogTitle>Gerar Ficha do Cliente</DialogTitle>
        <DialogContent sx={{ minWidth: 400, textAlign: 'center' }}>
          {isPdfLoading ? (
            <Box sx={{ my: 4 }}><CircularProgress /><Typography sx={{ mt: 2 }}>Buscando dados do cliente...</Typography></Box>
          ) : selectedClientData ? (
            <PDFDownloadLink document={<ClientPdfDocument clientData={selectedClientData} />} fileName={`ficha_${selectedClientData.general.name.replace(/\s+/g, '_').toLowerCase()}.pdf`} style={{ textDecoration: 'none', width: '100%' }}>
              {({ loading }) => (
                <Button variant="contained" color="secondary" disabled={loading} fullWidth sx={{ mt: 2, mb: 2 }}>
                  {loading ? 'Gerando PDF...' : 'Baixar Ficha em PDF'}
                </Button>
              )}
            </PDFDownloadLink>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePrintDialog}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}