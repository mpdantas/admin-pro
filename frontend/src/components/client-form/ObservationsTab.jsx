import { TextField } from '@mui/material';

export default function ObservationsTab({ data, onChange }) {
  return (
    <TextField
      fullWidth
      label="Observações Gerais"
      multiline
      rows={6}
      value={data}
      onChange={(e) => onChange('observations', null, e.target.value)}
    />
  );
}