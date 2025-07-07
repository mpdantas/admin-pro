import React from 'react';
import { Grid, TextField, Box } from '@mui/material';
import { IMaskInput } from 'react-imask';
import axios from 'axios';

const CepMask = React.forwardRef(function CepMask(props, ref) {
  const { onChange, ...other } = props;
  return (<IMaskInput {...other} mask="00000-000" inputRef={ref} onAccept={(value) => onChange({ target: { name: props.name, value } })} overwrite />);
});

export default function AddressTab({ data, onChange, errors }) { // Recebemos a prop 'errors'
  const handleCepBlur = async (event) => {
    const cep = event.target.value.replace(/\D/g, '');
    if (cep.length !== 8) return;
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      if (!response.data.erro) {
        onChange('address', 'street', response.data.logradouro);
        onChange('address', 'neighborhood', response.data.bairro);
        onChange('address', 'city', response.data.localidade);
        onChange('address', 'state', response.data.uf);
      }
    } catch (error) { console.error("Erro ao buscar CEP:", error); }
  };

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth label="Endereço / Rua" name="address.street"
            value={data.street || ''} onChange={(e) => onChange('address', 'street', e.target.value)}
            error={!!errors['address.street']} helperText={errors['address.street']}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth label="CEP" name="address.zip_code"
            value={data.zip_code || ''} onChange={(e) => onChange('address', 'zip_code', e.target.value)}
            onBlur={handleCepBlur} InputProps={{ inputComponent: CepMask }}
            error={!!errors['address.zip_code']} helperText={errors['address.zip_code']}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="Número" name="address.number" value={data.number || ''} onChange={(e) => onChange('address', 'number', e.target.value)} error={!!errors['address.number']} helperText={errors['address.number']} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="Complemento" name="address.complement" value={data.complement || ''} onChange={(e) => onChange('address', 'complement', e.target.value)} error={!!errors['address.complement']} helperText={errors['address.complement']} />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="Bairro" name="address.neighborhood" value={data.neighborhood || ''} onChange={(e) => onChange('address', 'neighborhood', e.target.value)} error={!!errors['address.neighborhood']} helperText={errors['address.neighborhood']} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="Cidade" name="address.city" value={data.city || ''} onChange={(e) => onChange('address', 'city', e.target.value)} error={!!errors['address.city']} helperText={errors['address.city']} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="Estado" name="address.state" value={data.state || ''} onChange={(e) => onChange('address', 'state', e.target.value)} error={!!errors['address.state']} helperText={errors['address.state']} />
        </Grid>
      </Grid>
    </Box>
  );
}