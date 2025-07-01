import React from 'react'; // Precisamos importar o React para criar o componente da máscara
import { Grid, TextField, Box } from '@mui/material';
import { IMaskInput } from 'react-imask'; // Importamos a base da máscara
import axios from 'axios';

// --- Componente customizado para a máscara de CEP ---
const CepMask = React.forwardRef(function CepMask(props, ref) {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="00000-000" // Formato do CEP
      definitions={{
        '#': /[1-9]/,
      }}
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});


export default function AddressTab({ data, onChange }) {
  
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
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid xs={12}>
          <TextField fullWidth label="Endereço / Rua" value={data.street || ''} onChange={(e) => onChange('address', 'street', e.target.value)} />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid xs={12} sm={4}>
           {/* 👇 Aplicamos a máscara aqui 👇 */}
          <TextField
            fullWidth
            label="CEP"
            value={data.zip_code || ''}
            onChange={(e) => onChange('address', 'zip_code', e.target.value)}
            onBlur={handleCepBlur}
            InputProps={{
              inputComponent: CepMask,
            }}
          />
        </Grid>
        <Grid xs={12} sm={4}>
          <TextField fullWidth label="Número" value={data.number || ''} onChange={(e) => onChange('address', 'number', e.target.value)} />
        </Grid>
        <Grid xs={12} sm={4}>
          <TextField fullWidth label="Complemento" value={data.complement || ''} onChange={(e) => onChange('address', 'complement', e.target.value)} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid xs={12} sm={4}>
          <TextField fullWidth label="Bairro" value={data.neighborhood || ''} onChange={(e) => onChange('address', 'neighborhood', e.target.value)} />
        </Grid>
        <Grid xs={12} sm={4}>
          <TextField fullWidth label="Cidade" value={data.city || ''} onChange={(e) => onChange('address', 'city', e.target.value)} />
        </Grid>
        <Grid xs={12} sm={4}>
          <TextField fullWidth label="Estado" value={data.state || ''} onChange={(e) => onChange('address', 'state', e.target.value)} />
        </Grid>
      </Grid>
    </Box>
  );
}