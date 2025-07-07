import { useState, useEffect } from 'react';
import { 
  Box, Button, Paper, Typography, Tabs, Tab, CircularProgress, Grid 
} from '@mui/material';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer'; // ⬅️ Importamos o componente de link do PDF
import api from '../services/api';

// Importando os componentes
import GeneralDataTab from '../components/client-form/GeneralDataTab';
import AddressTab from '../components/client-form/AddressTab';
import VehicleTab from '../components/client-form/VehicleTab';
import ObservationsTab from '../components/client-form/ObservationsTab';
import ClientPdfDocument from '../components/ClientPdfDocument'; // ⬅️ Importamos nosso "molde" de PDF
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';


const initialFormData = {
  general: { name: '', birth_date: '', cpf: '', rg: '', cnh: '', cnpj: '', celular: '', email: '' },
  address: { zip_code: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' },
  vehicle: { brand: '', model: '', plate: '', cor: '', ano_modelo: '', ano_fabricacao: '', chassi: '', renavam: '' },
  observations: '',
};

export default function ClientManagerPage({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState(initialFormData);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(mode === 'edit');

  useEffect(() => {
    if (mode === 'edit' && id) {
      const token = localStorage.getItem('authToken');
      setLoading(true);
      api.get(`/clients/${id}`, { headers: { Authorization: `Bearer ${token}` }})
        .then(response => {
          const { general, address, vehicle } = response.data;
          const birthDate = general.birth_date ? general.birth_date.split('T')[0] : '';
          
          setFormData({
            general: { ...initialFormData.general, ...general, birth_date: birthDate },
            address: { ...initialFormData.address, ...(address || {}) },
            vehicle: { ...initialFormData.vehicle, ...(vehicle || {}) },
            observations: general.observations || '',
          });
        })
        .catch(error => {
          console.error("Erro ao buscar dados do cliente:", error);
          alert("Não foi possível carregar os dados do cliente.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, mode]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleInputChange = (tab, field, value) => {
    if (tab === 'observations') {
      setFormData(prev => ({ ...prev, observations: value }));
    } else {
      setFormData(prev => ({
        ...prev,
        [tab]: { ...prev[tab], [field]: value }
      }));
    }
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('authToken');
    const method = mode === 'edit' ? 'put' : 'post';
    const url = mode === 'edit' ? `/clients/${id}` : '/clients';

    try {
      await api[method](url, formData, { headers: { Authorization: `Bearer ${token}` } });
      alert(`Cliente ${mode === 'edit' ? 'atualizado' : 'salvo'} com sucesso!`);
      navigate('/clients/search');
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      alert("Falha ao salvar cliente.");
    }
  };

  const pageTitle = mode === 'edit' ? 'Editar Cliente' : 'Cadastro de Clientes';

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">{pageTitle}</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* O botão de imprimir só aparece no modo de edição e se os dados já foram carregados */}
          {mode === 'edit' && formData.general.name && (
            <PDFDownloadLink
              document={<ClientPdfDocument clientData={formData} />}
              fileName={`ficha_${formData.general.name.replace(/\s+/g, '_').toLowerCase()}.pdf`}
              style={{ textDecoration: 'none' }} // Remove o sublinhado do link
            >
              {({ loading }) => (
                <Button 
                  variant="contained" 
                  color="secondary" 
                  disabled={loading}
                  startIcon={<PictureAsPdfIcon />}
                >
                  {loading ? 'Gerando...' : 'Imprimir Ficha'}
                </Button>
              )}
            </PDFDownloadLink>
          )}

          <Button variant="outlined" component={RouterLink} to="/clients/search">
            Listar / Pesquisar
          </Button>
        </Box>
      </Box>

      <Paper elevation={3}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Geral" />
          <Tab label="Endereço" />
          <Tab label="Dados do Veículo" />
          <Tab label="Observações" />
        </Tabs>
        <Box sx={{ p: 3 }}>
          {activeTab === 0 && <GeneralDataTab data={formData.general} onChange={handleInputChange} />}
          {activeTab === 1 && <AddressTab data={formData.address} onChange={handleInputChange} />}
          {activeTab === 2 && <VehicleTab data={formData.vehicle} onChange={handleInputChange} />}
          {activeTab === 3 && <ObservationsTab data={formData.observations} onChange={handleInputChange} />}
        </Box>
      </Paper>
      
      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button type="submit" variant="contained" size="large">
          {mode === 'edit' ? 'Salvar Alterações' : 'Salvar Cliente'}
        </Button>
        <Button variant="outlined" size="large" onClick={() => {
            setFormData(initialFormData);
            navigate('/clients');
          }}>
          Novo
        </Button>
      </Box>
    </Box>
  );
}