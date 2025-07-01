// frontend/src/components/Footer.jsx
import { Box, Typography, Link } from '@mui/material';

export default function Footer() {
  // Pega o ano atual dinamicamente. Ele sempre estará atualizado!
  const currentYear = new Date().getFullYear(); 

  return (
    <Box
      component="footer"
      sx={{
        py: 2, // padding no eixo Y (vertical)
        px: 2, // padding no eixo X (horizontal)
        mt: 'auto', // margem no topo automática (ESSA É A MÁGICA!)
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
        textAlign: 'center'
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {'Copyright © '}
        {/* Sinta-se à vontade para trocar este link pelo seu GitHub ou site */}
        <Link color="inherit" href="https://github.com/seu-usuario">
          MD Tech Engenharia
        </Link>{' '}
        {currentYear}
        {'. Todos os direitos reservados.'}
      </Typography>
    </Box>
  );
}