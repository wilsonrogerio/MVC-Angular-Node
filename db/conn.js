const mongoose = require('mongoose');

//funcao que conecta ao banco de dados
async function Main() {
    await mongoose.connect('mongodb://localhost:27017/getapet');
    console.log('conexcao feita ao mongoose')
}
//caso haja um erro eu indico no console
Main().catch((err) => console.error("Erro ao conectar ao MongoDB:", err));

module.exports = mongoose;