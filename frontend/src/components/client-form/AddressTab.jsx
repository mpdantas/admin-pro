import { Grid, TextField } from '@mui/material';

export default function AddressTab({ data, onChange }) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={4}>
        <TextField 
          fullWidth 
          label="CEP" 
          value={data.zip_code} 
          onChange={(e) => onChange('address', 'zip_code', e.target.value)} 
        />
      </Grid>
      <Grid item xs={12} sm={8}>
        <TextField 
          fullWidth 
          label="Rua / Logradouro" 
          value={data.street} 
          onChange={(e) => onChange('address', 'street', e.target.value)} 
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField 
          fullWidth 
          label="Número" 
          value={data.number} 
          onChange={(e) => onChange('address', 'number', e.target.value)} 
        />
      </Grid>
      <Grid item xs={12} sm={8}>
        <TextField 
          fullWidth 
          label="Bairro" 
          value={data.neighborhood} 
          onChange={(e) => onChange('address', 'neighborhood', e.target.value)} 
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField 
          fullWidth 
          label="Cidade" 
          value={data.city} 
          onChange={(e) => onChange('address', 'city', e.target.value)} 
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField 
          fullWidth 
          label="Estado (UF)" 
          value={data.state} 
          onChange={(e) => onChange('address', 'state', e.target.value)} 
        />
      </Grid>
    </Grid>
  );
}