import React from 'react'; // Precisamos importar o React
import { Grid, TextField, Select, MenuItem, InputLabel, FormControl, Box } from '@mui/material';
import { IMaskInput } from 'react-imask'; // E a base da máscara

// Lista de marcas para o dropdown
const carBrands = [
  "Fiat", "Chevrolet", "Volkswagen", "Ford", "Hyundai", "Toyota", "Honda", "Renault", 
  "Jeep", "Nissan", "Citroën", "Peugeot", "Mitsubishi", "Mercedes-Benz","Yamaha","BMW", "Audi",
  "Outra"
];

// --- Componente customizado para a máscara de Placa Dinâmica ---
const PlacaMask = React.forwardRef(function PlacaMask(props, ref) {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      // Definimos as duas máscaras possíveis
      mask={[
        { mask: 'AAA-0000' }, // Máscara antiga
        { mask: 'AAA0A00' }  // Máscara padrão Mercosul
      ]}
      // Definimos o que significa 'A' (letra) e '0' (número)
      definitions={{
        'A': /[a-zA-Z]/,
        '0': /[0-9]/,
      }}
      prepare={(str) => str.toUpperCase()} // Sempre converte para maiúsculo
      // Função que decide qual máscara usar
      dispatch={(appended, dynamicMasked) => {
        // Se o que está sendo digitado é uma letra e o comprimento sem máscara é 4
        // (indicando o 5º caractere, que diferencia os padrões), usa a máscara antiga.
        // NOTA: Esta lógica é um pouco simplificada, mas cobre a maioria dos casos de digitação.
        if (dynamicMasked.unmaskedValue.length === 4 && /[a-zA-Z]/.test(appended)) {
          return dynamicMasked.compiledMasks[0]; // Máscara antiga
        }
        // Para todos os outros casos (incluindo colar um valor pronto), usa a Mercosul como padrão.
        return dynamicMasked.compiledMasks[1]; // Máscara Mercosul
      }}
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});


export default function VehicleTab({ data, onChange }) {
  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid xs={12} sm={6}>
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
        <Grid xs={12} sm={6}>
          <TextField fullWidth label="Modelo" value={data.model || ''} onChange={(e) => onChange('vehicle', 'model', e.target.value)} />
        </Grid>
      </Grid>
      
      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid xs={12} sm={6}>
          {/* 👇 Aplicamos a nova máscara inteligente aqui 👇 */}
          <TextField
            fullWidth
            label="Placa"
            value={data.plate || ''}
            onChange={(e) => onChange('vehicle', 'plate', e.target.value)}
            InputProps={{
              inputComponent: PlacaMask,
            }}
          />
        </Grid>
        <Grid xs={12} sm={6}>
          <TextField fullWidth label="Cor" value={data.cor || ''} onChange={(e) => onChange('vehicle', 'cor', e.target.value)} />
        </Grid>
      </Grid>

      {/* ... O resto do formulário continua igual ... */}
      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid xs={12} sm={6}><TextField fullWidth label="Ano Fabricação" type="number" value={data.ano_fabricacao || ''} onChange={(e) => onChange('vehicle', 'ano_fabricacao', e.target.value)} /></Grid>
        <Grid xs={12} sm={6}><TextField fullWidth label="Ano Modelo" type="number" value={data.ano_modelo || ''} onChange={(e) => onChange('vehicle', 'ano_modelo', e.target.value)} /></Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid xs={12} sm={6}><TextField fullWidth label="Chassi" value={data.chassi || ''} onChange={(e) => onChange('vehicle', 'chassi', e.target.value)} /></Grid>
        <Grid xs={12} sm={6}><TextField fullWidth label="Renavam" value={data.renavam || ''} onChange={(e) => onChange('vehicle', 'renavam', e.target.value)} /></Grid>
      </Grid>
    </Box>
  );
}