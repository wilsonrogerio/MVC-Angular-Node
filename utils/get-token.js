const getToken = (req) => {
    // Verifico se o cabecalho esta preenchido
    if (!req.headers.authorization) {
        throw new Error("Cabeçalho de autorização não encontrado");
    }
    // Extraio o token
    const authToken = req.headers.authorization.split(" ")[1];
    
    const token = authToken;

    return token;
};
module.exports = getToken;