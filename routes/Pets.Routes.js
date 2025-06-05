const router = require('express').Router();
const PetsController = require('../controllers/Pets.Controller');

// Middlewares
const verifyToken = require('../utils/verify-token'); // Verifica se o token JWT é válido
const { imageFilterUpload } = require('../utils/upload-imagens'); // Middleware para upload de imagens

// ================================
// ROTAS PRIVADAS (Requer autenticação)
// ================================

// 📌 Registrar um novo pet (com imagens)
router.post(
  '/register',
  verifyToken,
  imageFilterUpload.array('images'),
  PetsController.Register
);

// 📌 Listar todos os pets do usuário logado
router.get('/mypets',verifyToken,PetsController.getAllUserPets);

// 📌 Listar todas as adoções feitas pelo usuário logado
router.get('/myadoptions',verifyToken,PetsController.getAllUserAdoptions);

// 📌 Atualizar informações de um pet por ID (com imagens)
router.patch('/:id',verifyToken,imageFilterUpload.array('images'),PetsController.updatePet);

// 📌 Deletar um pet pelo ID (somente se for o dono)
router.delete('/:id',verifyToken,PetsController.removePetById);

// 📌 Completar Adocao
router.patch('/conclude/:id' , verifyToken , PetsController.concludeAdoption);

// 📌 Agendar Avaliacao do adotante
router.patch('/schedule/:id', verifyToken , PetsController.schedule);


// ================================
// ROTAS PÚBLICAS (Não requerem autenticação)
// ================================

// 📌 Obter todos os pets cadastrados
router.get('/',PetsController.getAll);

// 📌 Obter um pet específico pelo ID
router.get('/:id',PetsController.getPetById);



// ================================
// Exporta o módulo de rotas
// ================================
module.exports = router;
