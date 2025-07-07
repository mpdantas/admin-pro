import React from 'react';
import { Grid, TextField, Typography, Box } from '@mui/material';
import { IMaskInput } from 'react-imask';

// --- Componentes de Máscara (Agora completos) ---

const CpfMask = React.forwardRef(function CpfMask(props, ref) {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="000.000.000-00"
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});

const CnpjMask = React.forwardRef(function CnpjMask(props, ref) {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="00.000.000/0000-00"
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});

const CelularMask = React.forwardRef(function CelularMask(props, ref) {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="(00) 00000-0000"
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});


export default function GeneralDataTab({ data, onChange }) {
  
  // Formata a data de cadastro para exibição
  const registrationDate = data.created_at 
    ? new Date(data.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
      })
    : 'N/A';

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid xs={12} sm={8}>
          <TextField fullWidth required label="Nome" value={data.name || ''} onChange={(e) => onChange('general', 'name', e.target.value)} />
        </Grid>
        <Grid xs={12} sm={4}>
          <TextField
            fullWidth
            label="Data de Cadastro"
            value={registrationDate}
            InputProps={{ readOnly: true }}
            variant="filled"
            size="small"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid xs={12} sm={4}>
          <TextField fullWidth label="CPF" value={data.cpf || ''} onChange={(e) => onChange('general', 'cpf', e.target.value)} InputProps={{ inputComponent: CpfMask }} />
        </Grid>
        <Grid xs={12} sm={4}>
          <TextField fullWidth label="RG" value={data.rg || ''} onChange={(e) => onChange('general', 'rg', e.target.value)} />
        </Grid>
        <Grid xs={12} sm={4}>
          <TextField fullWidth label="CNPJ" value={data.cnpj || ''} onChange={(e) => onChange('general', 'cnpj', e.target.value)} InputProps={{ inputComponent: CnpjMask }} />
        </Grid>
      </Grid>
      
      <Grid container spacing={2}>
        <Grid xs={12} sm={6}>
          <TextField fullWidth label="CNH" value={data.cnh || ''} onChange={(e) => onChange('general', 'cnh', e.target.value)} />
        </Grid>
        <Grid xs={12} sm={6}>
          <TextField fullWidth label="Data de Nascimento" type="date" value={data.birth_date || ''} onChange={(e) => onChange('general', 'birth_date', e.target.value)} InputLabelProps={{ shrink: true }} />
        </Grid>
      </Grid>
      
      <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
        Contatos
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid xs={12}>
          <TextField fullWidth label="Celular" value={data.celular || ''} onChange={(e) => onChange('general', 'celular', e.target.value)} InputProps={{ inputComponent: CelularMask }} />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
         <Grid xs={12}>
          <TextField fullWidth label="E-mail" type="email" value={data.email || ''} onChange={(e) => onChange('general', 'email', e.target.value)} />
        </Grid>
      </Grid>
    </Box>
  );
}