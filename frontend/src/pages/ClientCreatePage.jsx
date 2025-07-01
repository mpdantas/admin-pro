import { useState } from 'react';
import { Box, Button, Paper, Typography, Tabs, Tab } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

import GeneralDataTab from '../components/client-form/GeneralDataTab';
import AddressTab from '../components/client-form/AddressTab';
import VehicleTab from '../components/client-form/VehicleTab';
import ObservationsTab from '../components/client-form/ObservationsTab';

// Objeto de estado inicial agora com todos os novos campos
const initialFormData = {
  general: { name: '', birth_date: '', cpf: '', rg: '', cnh: '', cnpj: '', celular: '', email: '' },
  address: { zip_code: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' },
  vehicle: { brand: '', model: '', plate: '', cor: '', ano_modelo: '', ano_fabricacao: '', chassi: '', renavam: '' },
  observations: '',
};

export default function ClientCreatePage() {
  const [formData, setFormData] = useState(initialFormData);
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

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
    try {
      await api.post('/clients', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Cliente salvo com sucesso!');
      navigate('/clients');
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      alert("Falha ao salvar cliente.");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h4" sx={{ mb: 2 }}>Cadastro de Novo Cliente</Typography>
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
        <Button type="submit" variant="contained" size="large">Salvar</Button>
      </Box>
    </Box>
  );
}