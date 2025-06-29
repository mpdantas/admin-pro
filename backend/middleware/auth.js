const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // 1. Pega o cabeçalho de autorização da requisição
  const authHeader = req.headers['authorization'];

  // 2. Verifica se o cabeçalho existe
  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido.' });
  }

  // 3. O token vem no formato "Bearer <token>". Vamos separar em duas partes.
  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({ message: 'Erro no formato do token.' });
  }

  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ message: 'Token mal formatado.' });
  }

  // 4. Verifica se o token (o "crachá") é válido
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token inválido ou expirado.' });
    }

    // Se o token for válido, salvamos o ID do usuário e da empresa na requisição
    // para que as próximas rotas possam usar essa informação.
    req.userId = decoded.userId;
    req.companyId = decoded.companyId;

    // Libera a passagem para a rota final
    return next();
  });
};