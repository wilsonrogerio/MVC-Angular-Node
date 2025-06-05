// arquivo que define o padrao de informacoes do usuario que sera salvo no bacno
const mongoose = require('../db/conn');
const {Schema} = mongoose;

const User = mongoose.model(
    'User',
    new Schema({
         name: {
            type : String,
            require : true
        },
        email: {
            type : String,
            require : true
        },
        password : {
            type : String,
            require : true
        },
        imagem : {
            type : String
        }
        
    },
    // opcao de salvar a data em que as informacoes foram criadas e salvas no banco de dados
    {timestamps: true}
),
    
);
module.exports = User;
