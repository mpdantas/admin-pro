import React, { useState } from 'react';
import { Grid, TextField, Select, MenuItem, InputLabel, FormControl, Box, RadioGroup, FormControlLabel, Radio, FormLabel } from '@mui/material';
import { IMaskInput } from 'react-imask';

const carBrands = [ "Fiat", "Chevrolet", "Volkswagen", "Ford", "Hyundai", "Toyota", "Honda", "Renault", "Jeep", "Nissan", "Citroën", "Peugeot", "Mitsubishi", "Mercedes-Benz", "BMW", "Audi", "Outra" ];

const PlacaMask = React.forwardRef(function PlacaMask(props, ref) {
  const { onChange, plateType, ...other } = props;
  const mask = plateType === 'mercosul' ? 'AAA0A00' : 'AAA-0000';
  return (<IMaskInput {...other} mask={mask} definitions={{ 'A': /[a-zA-Z]/, '0': /[0-9]/ }} prepare={(str) => str.toUpperCase()} inputRef={ref} onAccept={(value) => onChange({ target: { name: props.name, value } })} overwrite />);
});

export default function VehicleTab({ data, onChange, errors }) {
  // 👇 A linha que provavelmente estava faltando.
  // Este estado controla qual tipo de placa (Mercosul ou Antiga) está selecionado.
  const [plateType, setPlateType] = useState('mercosul');

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth sx={{ minWidth: 120 }}>
            <InputLabel id="brand-select-label">Marca</InputLabel>
            <Select
              labelId="brand-select-label"
              label="Marca"
              value={data.brand || ''}
              onChange={(e) => onChange('vehicle', 'brand', e.target.value)}
            >
              {carBrands.map(brand => (<MenuItem key={brand} value={brand}>{brand}</MenuItem>))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Modelo" value={data.model || ''} onChange={(e) => onChange('vehicle', 'model', e.target.value)} />
        </Grid>
      </Grid>
      
      <Grid container spacing={3} sx={{ mb: 2, alignItems: 'center' }}>
        <Grid item xs={12} sm={6}>
          <FormControl>
            <FormLabel id="plate-type-radio-group-label">Padrão da Placa</FormLabel>
            <RadioGroup
              row
              aria-labelledby="plate-type-radio-group-label"
              name="plate-type-radio-group"
              value={plateType}
              onChange={(e) => setPlateType(e.target.value)}
            >
              <FormControlLabel value="mercosul" control={<Radio />} label="Mercosul" />
              <FormControlLabel value="antiga" control={<Radio />} label="Antiga" />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
           <TextField
            fullWidth
            label="Placa"
            name="vehicle.plate"
            value={data.plate || ''}
            onChange={(e) => onChange('vehicle', 'plate', e.target.value)}
            InputProps={{
              inputComponent: PlacaMask,
              inputProps: { plateType: plateType }
            }}
            error={!!errors['vehicle.plate']}
            helperText={errors['vehicle.plate']}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Cor" value={data.cor || ''} onChange={(e) => onChange('vehicle', 'cor', e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Ano Fabricação" type="number" value={data.ano_fabricacao || ''} onChange={(e) => onChange('vehicle', 'ano_fabricacao', e.target.value)} />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Ano Modelo" type="number" value={data.ano_modelo || ''} onChange={(e) => onChange('vehicle', 'ano_modelo', e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Renavam" value={data.renavam || ''} onChange={(e) => onChange('vehicle', 'renavam', e.target.value)} />
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField fullWidth label="Chassi" value={data.chassi || ''} onChange={(e) => onChange('vehicle', 'chassi', e.target.value)} />
        </Grid>
      </Grid>
    </Box>
  );
}