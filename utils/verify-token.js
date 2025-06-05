const jwt = require('jsonwebtoken'); // Importo o jwt
const getToken = require('./get-token'); // Importo a função de obter o token

// Middleware de verificação de token para rotas privadas
const verifyToken = (req, res, next) => {
    // Verifico se o cabeçalho de autorização está presente
    if (!req.headers.authorization) {
        return res.status(401).json({ message: "Acesso Negado" });
    }

    // Extraio o token da requisição
    const token = getToken(req);
    if (!token) {
        return res.status(401).json({ message: "Acesso Negado" });
    }

    // Verifico se o token é válido
    try {
        const verificado = jwt.verify(token, "secretkey");

        // Adiciono os dados do usuário à requisição para uso posterior
        req.user = verificado;

        // Chamo `next()` para permitir que a requisição continue para a próxima rota
        return next();
        
    } catch (err) {
        return res.status(401).json({ message: "Token Inválido", error: err.message });
    }
};

module.exports = verifyToken;