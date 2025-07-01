// src/components/client-form/GeneralDataTab.jsx
import { Grid, TextField } from '@mui/material';

export default function GeneralDataTab({ data, onChange }) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}><TextField fullWidth required label="Nome Completo" value={data.name} onChange={(e) => onChange('general', 'name', e.target.value)} /></Grid>
      <Grid item xs={12} sm={6}><TextField fullWidth label="CPF" value={data.cpf} onChange={(e) => onChange('general', 'cpf', e.target.value)} /></Grid>
      <Grid item xs={12} sm={6}><TextField fullWidth label="RG" value={data.rg} onChange={(e) => onChange('general', 'rg', e.target.value)} /></Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Data de Nascimento"
          type="date"
          value={data.birth_date || ''} // Usamos || '' para evitar erros se o valor for nulo
          onChange={(e) => onChange('general', 'birth_date', e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
    </Grid>
  );
}