import { Grid, TextField } from '@mui/material';

export default function VehicleTab({ data, onChange }) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField 
          fullWidth 
          label="Marca" 
          value={data.brand} 
          onChange={(e) => onChange('vehicle', 'brand', e.target.value)} 
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField 
          fullWidth 
          label="Modelo" 
          value={data.model} 
          onChange={(e) => onChange('vehicle', 'model', e.target.value)} 
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField 
          fullWidth 
          label="Ano" 
          type="number" 
          value={data.year} 
          onChange={(e) => onChange('vehicle', 'year', e.target.value)} 
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField 
          fullWidth 
          label="Placa" 
          value={data.plate} 
          onChange={(e) => onChange('vehicle', 'plate', e.target.value)} 
        />
      </Grid>
    </Grid>
  );
}