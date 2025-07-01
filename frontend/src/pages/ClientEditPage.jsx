import { useState, useEffect } from 'react';
import { Box, Button, Paper, Typography, Tabs, Tab, CircularProgress } from '@mui/material';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import api from '../services/api';

import GeneralDataTab from '../components/client-form/GeneralDataTab';
import AddressTab from '../components/client-form/AddressTab';
import VehicleTab from '../components/client-form/VehicleTab';
import ObservationsTab from '../components/client-form/ObservationsTab';

// O mesmo objeto de estado inicial completo
const initialFormData = {
  general: { name: '', birth_date: '', cpf: '', rg: '', cnh: '', cnpj: '', celular: '', email: '' },
  address: { zip_code: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' },
  vehicle: { brand: '', model: '', plate: '', cor: '', ano_modelo: '', ano_fabricacao: '', chassi: '', renavam: '' },
  observations: '',
};

export default function ClientEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState(initialFormData);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    api.get(`/clients/${id}`, { headers: { Authorization: `Bearer ${token}` }})
      .then(response => {
        const { general, address, vehicle } = response.data;
        // Preenche o formulário com os dados recebidos, garantindo que não haja valores nulos
        setFormData({
          general: { ...initialFormData.general, ...general },
          address: { ...initialFormData.address, ...address },
          vehicle: { ...initialFormData.vehicle, ...vehicle },
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
  }, [id]);

  const handleTabChange = (event, newValue) => setActiveTab(newValue);

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
    try {
      await api.put(`/clients/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Cliente atualizado com sucesso!');
      navigate('/clients');
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      alert("Falha ao atualizar cliente.");
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h4" sx={{ mb: 2 }}>Editar Cliente</Typography>
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
        <Button type="submit" variant="contained" size="large">Salvar Alterações</Button>
        <Button variant="outlined" size="large" component={RouterLink} to="/clients">Cancelar</Button>
      </Box>
    </Box>
  );
}