const jwt = require('jsonwebtoken'); // Importando a biblioteca JWT

const createUserToken = (user, req, res) => {
    // Certifique-se de que 'user' está definido antes de prosseguir
    if (!user || !user.name || !user._id) {
        return res.status(400).json({ message: "Dados do usuário inválidos" });
    }

    // Chamada de jwt.sign e garantindo que a variável 'token' seja usada corretamente
    const token = jwt.sign(
        {
            name: user.name, // Adicionando o nome do usuário ao payload do token
            id: user._id // Adicionando o ID do usuário ao payload do token
        }, 
        "secretkey", // Chave secreta usada para assinar o token (idealmente, deve ser armazenada em uma variável de ambiente)
    );

    // Retornando uma resposta com o token gerado
    res.status(200).json({
        message: "Você está autenticado",
        token: token, // Corrigindo a referência para a variável 'token'
        userId: user._id
    });
};

module.exports = createUserToken; // Exportando a função para uso em outros módulos