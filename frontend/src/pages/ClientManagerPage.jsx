import { useState, useEffect } from 'react';
import { Box, Button, Paper, Typography, Tabs, Tab, CircularProgress, Grid } from '@mui/material';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import * as yup from 'yup';

import api from '../services/api';
import GeneralDataTab from '../components/client-form/GeneralDataTab';
import AddressTab from '../components/client-form/AddressTab';
import VehicleTab from '../components/client-form/VehicleTab';
import ObservationsTab from '../components/client-form/ObservationsTab';
import ClientPdfDocument from '../components/ClientPdfDocument';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

// --- ESQUEMA DE VALIDAÇÃO COM YUP ---
const validationSchema = yup.object({
  general: yup.object({
    name: yup.string().required('O nome é obrigatório.'),
    email: yup.string().email('Formato de e-mail inválido.').required('O e-mail é obrigatório.'),
    celular: yup.string().matches(/^\(\d{2}\) \d{5}-\d{4}$/, { message: 'Formato de celular inválido.', excludeEmptyString: true }),
    cpf: yup.string().matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, { message: 'Formato de CPF inválido.', excludeEmptyString: true }),
    cnpj: yup.string().matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, { message: 'Formato de CNPJ inválido.', excludeEmptyString: true }),
  }),
  address: yup.object({
    zip_code: yup.string().matches(/^\d{5}-\d{3}$/, { message: 'Formato de CEP inválido.', excludeEmptyString: true }),
  }),
  vehicle: yup.object({
     plate: yup.string().required('A placa do veículo é obrigatória.'),
  }),
  observations: yup.string(),
});

// --- ESTADO INICIAL DO FORMULÁRIO ---
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
  const [errors, setErrors] = useState({});

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
        .catch(error => { console.error("Erro ao buscar dados do cliente:", error); alert("Não foi possível carregar os dados do cliente."); })
        .finally(() => { setLoading(false); });
    }
  }, [id, mode]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleInputChange = (tab, field, value) => {
    const errorPath = field ? `${tab}.${field}` : tab;
    if (errors[errorPath]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorPath];
        return newErrors;
      });
    }

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
    try {
      setErrors({});
      await validationSchema.validate(formData, { abortEarly: false });

      const token = localStorage.getItem('authToken');
      const method = mode === 'edit' ? 'put' : 'post';
      const url = mode === 'edit' ? `/clients/${id}` : '/clients';
      await api[method](url, formData, { headers: { Authorization: `Bearer ${token}` } });
      alert(`Cliente ${mode === 'edit' ? 'atualizado' : 'salvo'} com sucesso!`);
      navigate('/clients/search');

    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const newErrors = {};
        err.inner.forEach((error) => { newErrors[error.path] = error.message; });
        setErrors(newErrors);
        alert("Por favor, corrija os erros indicados no formulário.");
      } else {
        console.error("Erro ao salvar cliente:", err);
        alert("Falha ao salvar cliente.");
      }
    }
  };

  const pageTitle = mode === 'edit' ? 'Editar Cliente' : 'Cadastro de Clientes';

  if (loading) { return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>; }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">{pageTitle}</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {mode === 'edit' && formData.general.name && (
            <PDFDownloadLink document={<ClientPdfDocument clientData={formData} />} fileName={`ficha_${formData.general.name.replace(/\s+/g, '_').toLowerCase()}.pdf`} style={{ textDecoration: 'none' }}>
              {({ loading }) => (<Button variant="contained" color="secondary" disabled={loading} startIcon={<PictureAsPdfIcon />}> {loading ? 'Gerando...' : 'Imprimir Ficha'} </Button>)}
            </PDFDownloadLink>
          )}
          <Button variant="outlined" component={RouterLink} to="/clients/search">Listar / Pesquisar</Button>
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
          {activeTab === 0 && <GeneralDataTab data={formData.general} onChange={handleInputChange} errors={errors} />}
          {activeTab === 1 && <AddressTab data={formData.address} onChange={handleInputChange} errors={errors} />}
          {activeTab === 2 && <VehicleTab data={formData.vehicle} onChange={handleInputChange} errors={errors} />}
          {activeTab === 3 && <ObservationsTab data={formData.observations} onChange={handleInputChange} errors={errors} />}
        </Box>
      </Paper>
      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button type="submit" variant="contained" size="large">{mode === 'edit' ? 'Salvar Alterações' : 'Salvar Cliente'}</Button>
        <Button variant="outlined" size="large" onClick={() => { setFormData(initialFormData); navigate('/clients'); }}>Novo</Button>
      </Box>
    </Box>
  );
}