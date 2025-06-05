const router = require('express').Router();
const UserController = require('../controllers/User.Controller');

// Middlewares de Verificacao
const verifyToken = require('../utils/verify-token'); // verifica se o token esta validado
const { imageFilterUpload } = require('../utils/upload-imagens'); // Funcao de upload de imagens

//rotas protegidas - privadas
router.patch('/edit/:id',verifyToken ,imageFilterUpload.single('imagem')
,UserController.editUser);

// rotas publicas
router.post('/register',UserController.Register);
router.post('/login',UserController.login);
router.get('/check-user',UserController.checkUser);
router.get('/:id',UserController.getUserById);

module.exports = router;