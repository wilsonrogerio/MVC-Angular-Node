const { error } = require('console');
const multer = require('multer'); // Importa o Multer, biblioteca do Express para upload de imagens
const path = require('path'); // Importa Path, módulo nativo do Node.js para manipulação de caminhos

// Configuração do armazenamento das imagens
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folder = ""; // Define a pasta de destino com base na URL da requisição

        if (req.baseUrl.includes('users')) {
            folder = "users"; // Se a requisição estiver relacionada a usuários, salva na pasta 'users'
        } else if (req.baseUrl.includes('pets')) {
            folder = "pets"; // Se estiver relacionada a pets, salva na pasta 'pets'
        }

        cb(null, `public/images/${folder}`); // Define o caminho final do armazenamento
    },
    filename: function (req, file, cb) {
        // Define um nome único para o arquivo usando a data atual + número aleatório + extensão original
        cb(null, Date.now() + String(Math.floor(Math.random() * 1000)) + path.extname(file.originalname));
    }

});

// Configuração do filtro e limite para upload de imagens
const imageFilterUpload = multer({
    storage: imageStorage, // Define o armazenamento configurado acima
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite de tamanho: 5MB
    fileFilter(req, file, cb) {
        // Verifica se o arquivo enviado é PNG ou JPG
        if (!file.originalname.match(/\.(png|jpg)$/)) {
            return cb(new Error("Apenas formatos PNG ou JPG são permitidos")); // Retorna erro caso o formato seja inválido
        }
        cb(undefined, true); // Se for válido, permite o upload
    }
});

// Exporta a configuração do Multer para ser usada em outras partes do código
module.exports = { imageFilterUpload };
