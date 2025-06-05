// arquivo que define o padrao de informacoes do usuario que sera salvo no bacno
const mongoose = require('../db/conn');
const {Schema} = mongoose;

const Pet = mongoose.model(
    'Pet',
    new Schema({
         name:{
            type: String,
            require : true,
         },
         age:{
            type: Number,
            require: true,
         },
         weight:{
            type: Number,
            require: true,
         },
         color:{
            type: String,
            require : true,
         },
         images:{
            type: Array,
            require: true
         },
         available:{
            type: Boolean
         },
         user: Object,
         adopter: Object
    },
    // opcao de salvar a data em que as informacoes foram criadas e salvas no banco de dados
    {timestamps: true}// <--- isso habilita createdAt e updatedAt
),
    
);
module.exports = Pet;
