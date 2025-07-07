import { TextField } from '@mui/material';

export default function ObservationsTab({ data, onChange, errors }) {
  // Como esta aba só tem um campo, o 'data' que recebemos é a própria string de observações
  return (
    <TextField
      fullWidth
      label="Observações Gerais"
      multiline
      rows={6} // Define a altura do campo de texto
      value={data || ''}
      // O 'field' é nulo aqui pois não há sub-campos como na aba 'general'
      onChange={(e) => onChange('observations', null, e.target.value)}
      // Preparado para receber erros de validação no futuro
      error={!!errors.observations}
      helperText={errors.observations}
    />
  );
}