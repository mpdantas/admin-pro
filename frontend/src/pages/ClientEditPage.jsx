// src/pages/ClientEditPage.jsx
import { useState, useEffect } from 'react';
import { Box, Button, Paper, Typography, Tabs, Tab, CircularProgress } from '@mui/material';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import api from '../services/api';

import GeneralDataTab from '../components/client-form/GeneralDataTab';
import AddressTab from '../components/client-form/AddressTab';
import VehicleTab from '../components/client-form/VehicleTab';
import ObservationsTab from '../components/client-form/ObservationsTab';

const initialFormData = {
  general: { name: '', cpf: '', rg: '', birth_date: '' },
  address: { zip_code: '', street: '', number: '', neighborhood: '', city: '', state: '' },
  vehicle: { brand: '', model: '', year: '', plate: '' },
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
        const client = response.data;
        setFormData({
          general: { 
            name: client.name || '', 
            cpf: client.cpf || '', 
            rg: client.rg || '', 
            birth_date: client.birth_date ? client.birth_date.split('T')[0] : '' // Formata a data
          },
          address: initialFormData.address, // Lógica para buscar endereço virá depois
          vehicle: initialFormData.vehicle,   // Lógica para buscar veículo virá depois
          observations: client.observations || '',
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // AGORA COM A LÓGICA CORRETA
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
  
  // AGORA COM A LÓGICA CORRETA
  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('authToken');
    
    // ATENÇÃO: A rota PUT que temos no backend hoje é a simples.
    // Vamos montar o objeto de dados como ela espera.
    const clientDataToUpdate = {
      name: formData.general.name,
      cpf: formData.general.cpf,
      rg: formData.general.rg,
      birth_date: formData.general.birth_date,
      // 'observations' não está na rota PUT simples, vamos ignorá-lo por enquanto
    };

    try {
      await api.put(`/clients/${id}`, clientDataToUpdate, {
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