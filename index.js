const express = require('express');//importa o express
const cors = require('cors');//importa o cros
const app = express();//referencio o express como app

app.use(express.json());// define o padrao de troca de informacoes

app.use(cors({credentials : true, origin : 'http://localhost:4200'}));// permito chamadas vindas dessa rota padrao do agular

app.use(express.static('public'));


// Rotas
const UserRoutes = require('./routes/User.Routes');
const PetsRoutes = require('./routes/Pets.Routes');

app.use('/users',UserRoutes);
app.use('/pets',PetsRoutes);

//saida da aplicacao
app.listen(5000);