const User = require('../model/User'); // Importa o modelo de usuário
const jwt = require('jsonwebtoken'); // Importa o jwt

// Função para buscar usuário pelo token
const getUserByToken = async (token) => {
    try {
        // Verifico se o token foi recebido
        if (!token) {
            throw new Error("Acesso Negado"); // Lança um erro para ser tratado pelo chamador
        }

        // Verifico e decodifico o token
        const verificado = jwt.verify(token, "secretkey");

        // Extraio o ID do usuário do token
        const userId = verificado.id;

        // Busco o usuário no banco de dados
        const user = await User.findOne({ _id: userId }).select('-password'); // Removo a senha do retorno

        // Retorno o Usuario
        return user; // Se não encontrar, retorna `null`
        
    } catch (error) {
        throw new Error("Token inválido ou erro ao buscar usuário");
    }
};

module.exports = getUserByToken;