const Pet = require('../model/Pets');
const Pets = require('../model/Pets'); // Importa o Model dos Pets

//Funcoes Vindas dos Utils | Helpers
const ObjectId = require('mongoose').Types.ObjectId // Importa um helper de verificacao de id - mongoose
const getToken = require('../utils/get-token'); // Importa funcao de verificar o token
const getUserByToken = require('../utils/get-user-by-token'); // Verifica as Informacoes do usuario pleo token
const verifyToken = require('../utils/verify-token');

module.exports = class PetsController {
    // Registra o pet no sistema
    static async Register(req, res) {
        // Mapeando os campos obrigatórios com suas respectivas mensagens de erro
        const camposObrigatorios = {
            name: "Nome é obrigatório",
            age: "Idade é obrigatório",
            weight: "Peso é obrigatório",
            color: "Cor é obrigatória",
            // available: "Disponibilidade é obrigatória",
        };
        // Verificando se algum campo obrigatório está faltando na requisição
        for (const campo in camposObrigatorios) {
            if (!req.body[campo]) {
                return res.status(422).json({ message: camposObrigatorios[campo] });
            }
        };
        const images = req.files // Recebo as imagens vindas do corpo da requisicao
        // Verifico se as imagens vieram ou nao estao vazias
        if (!images || images.length === 0) {
            return res.status(422).json({ message: "As imagens são obrigatórias" });
        }
        // Extraindo dados do corpo da requisição para facilitar o uso
        const { name, age, weight, color } = req.body;

        const available = true;

        //Verifico qual é o usuário que enviou as informações
        const token = getToken(req);//Chamo e verificacao de token , passando oque venho na req
        const user = await getUserByToken(token); // Resgato as informacoes do usuario, pelo token recebido


        // 🔍 Verifica se o usuário foi encontrado no sistema
        if (!user) {
            return res.status(401).json({ message: "Acesso negado: Usuário não autenticado" });
        }

        // Criacao do Pet
        const Pet = new Pets({
            name,
            age,
            weight,
            color,
            images: [],
            user: { // Informações sobre o dono do pet, extraídas do token
                _id: user._id,
                name: user.name,
                phone: user.phone,
                imagem: user.imagem
            },
            available
        });
        // Adiciona os nomes dos arquivos de imagem ao array do pet
        images.forEach((image) => {
            Pet.images.push(image.filename);
        });

        //Salvando pet no Banco de dados
        try {
            const newPet = await Pet.save(); // salvo o pet
            res.status(200).json({ message: 'Pet salvo com sucesso', newPet });// retorno o status com os dados do pet

        } catch (error) {
            // Caso algo errado aconteca
            return res.status(500).json({ message: "Erro ao cadastrar o Pet: " + error.message });
        }
    }
    // Rota de resgatar os pets do sistema
    static async getAll(req, res) {
        try {
            const pets = await Pets.find()
                .sort('-createdAt')        // Do mais recente ao mais antigo
                .select('-__v');           // (Opcional) Remove o campo técnico __v do retorno

            res.status(200).json({ pets });
        } catch (error) {
            console.error('Erro ao buscar os pets:', error); // log para depuração
            res.status(500).json({ error: 'Erro ao buscar os pets' });
        }
    }
    //Resgatar todos os Pets de cada Usuario
    static async getAllUserPets(req, res) {
        //Resgato o usuario pelo token
        const token = getToken(req);
        const user = await getUserByToken(token);

        //busco o pet do usuario verificado
        try {
            const pets = await Pets.find({ 'user._id': user._id })// resgato os pets de cada usuario
                .sort('-createdAt')        // Do mais recente ao mais antigo
                .select('-__v');           // (Opcional) Remove o campo técnico __v do retorno

            res.status(200).json({ pets });
        } catch (error) {
            console.error('Erro ao buscar os pets:', error); // log para depuração
            res.status(500).json({ error: 'Erro ao buscar os pets' });
        }
    }
    //Resgata as adocoes de cada usuario
    static async getAllUserAdoptions(req, res) {
        //Resgato o usuario pelo token
        const token = getToken(req);
        const user = await getUserByToken(token);

        //busco o pet do usuario verificado
        try {
            const pets = await Pets.find({ 'adopter._id': user._id })// resgato os pets de cada usuario
                .sort('-createdAt')        // Do mais recente ao mais antigo
                .select('-__v');           // (Opcional) Remove o campo técnico __v do retorno

            res.status(200).json({ pets });
        } catch (error) {
            console.error('Erro ao buscar os pets:', error); // log para depuração
            res.status(500).json({ error: 'Erro ao buscar os pets' });
        }
    }
    //Resgata o Pet pelo id
    static async getPetById(req, res) {
        // Resgata o id da request
        const id = req.params.id;
        // Valida se o ID tem um formato válido de ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'ID de pet inválido' });
        }
        //Resgato as informacoes do pet caso ele exista
        try {
            const pet = await Pets.findOne({ _id: id }).select('-__v');

            if (!pet) {
                return res.status(404).json({ error: 'Pet não encontrado' });
            }

            res.status(200).json({ pet });
        } catch (error) {
            console.error('Erro ao buscar o pet:', error);
            res.status(500).json({ error: 'Erro interno ao buscar o pet' });
        }
    }
    //Remove o pet do usuario logado
    static async removePetById(req, res) {
        // Resgata o id da request
        const id = req.params.id;
        // Valida se o ID tem um formato válido de ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'ID de pet inválido' });
        }
        //Resgato as informacoes do pet caso ele exista
        const pet = await Pets.findOne({ _id: id }).select('-__v');

        if (!pet) {
            return res.status(404).json({ error: 'Pet não encontrado' });
        }

        //Resgato o usuario pelo token
        const token = getToken(req);
        const user = await getUserByToken(token);
        //Checo se o pet pertence ao usuario logado
        if (pet.user._id.toString() !== user._id.toString()) {
            return res.status(403).json({ message: 'Acesso negado. Este pet não pertence a você.' });
        }
        // remove o pet caso as validacoes estevam corretas
        try {
            await Pets.findByIdAndDelete(id);
            return res.status(200).json({ message: `Pet removido com sucesso: ${pet.name}` });

        } catch (error) {
            return res.status(500).json({ error: 'Erro ao remover pet: ' + error.message });
        }

    }
    //Editar os pets
    static async updatePet(req, res) {
        try {
            //Recebo as informacoes vindas pela requisicap
            const id = req.params.id;
            const { name, age, weight, color, available } = req.body;
            const images = req.files;

            //Verifico se todas as informacoes vieram pela request
            const camposObrigatorios = {
                name: "Nome é obrigatório",
                age: "Idade é obrigatória",
                weight: "Peso é obrigatório",
                color: "Cor é obrigatória",
            };

            for (const campo in camposObrigatorios) {
                if (!req.body[campo]) {
                    return res.status(422).json({ message: camposObrigatorios[campo] });
                }
            }

            // Verifica se o ID é válido
            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ error: 'ID de pet inválido' });
            }

            //Busco o pet pelo id recebido
            const pet = await Pets.findOne({ _id: id }).select('-__v');
            if (!pet) {
                return res.status(404).json({ error: 'Pet não encontrado' });
            }

            // Verifica se o pet pertence ao usuário
            const token = getToken(req);
            const user = await getUserByToken(token);
            if (pet.user._id.toString() !== user._id.toString()) {
                return res.status(403).json({ message: 'Acesso negado. Este pet não pertence a você.' });
            }

            // Cria o objeto de atualização com os dados da requisição
            const updateData = {
                name,
                age,
                weight,
                color,
                available: available === 'true' || available === true, // força booleano
            };

            // Se houver novas imagens, adiciona ao update
            if (images && images.length > 0) {
                const imageFilenames = images.map(image => image.filename);
                updateData.images = imageFilenames;
            }

            // Atualiza os dados
            await Pets.findByIdAndUpdate(id, updateData);

            return res.status(200).json({ message: 'Pet atualizado com sucesso' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar pet', details: error.message });
        }
    }
    //Agendar avaliacao de adotante
    static async schedule(req, res) {
        console.log(req.originalUrl);
        try {
            //Recebo as informacoes vindas pela requisicao
            const id = req.params.id;

            //Busco o pet pelo id recebido
            const pet = await Pets.findOne({ _id: id }).select('-__v');
            if (!pet) {
                return res.status(404).json({ error: 'Pet não encontrado' });
            }
            // Verifico se o pet ja nao e meu
            const token = getToken(req);
            const user = await getUserByToken(token);
            if (pet.user._id.equals(user._id)) {
                return res.status(403).json({ message: 'Nao pode agendar visita para seu propio pet' });
            }
            // Impede agendamento duplicado
            if (pet.adopter && pet.adopter._id.equals(user._id)) {
                return res.status(422).json({ message: 'Você já agendou uma visita para este pet.' });
            }
            // Marca o usuário como adotante
            pet.adopter = {
                _id: user._id,
                name: user.name,
                image: user.image,
            };
            //Salva as informacoes alteradas do pet
            await pet.save();
            // await Pets.findByIdAndUpdate(id, pet);
            return res.status(200).json({
                message: `Visita agendada com sucesso! Entre em contato com ${pet.user.name} pelo telefone ${pet.user.phone}.`,
            });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao agendar visita', details: error.message });
        }

    }
    //Adocao de Pet
    static async concludeAdoption(req, res) {
        console.log(req.originalUrl);
        try {
            //Resgato o id
            const id = req.params.id;
            //Busco o pet pelo id recebido
            const pet = await Pets.findOne({ _id: id }).select('-__v');
            if (!pet) {
                return res.status(404).json({ error: 'Pet não encontrado' });
            }
            //Resgato as informacoes do usuario
            const token = getToken(req);
            const user = await getUserByToken(token);
            //Verifico se o pet e do usuario
            if (pet.user._id.toString() !== user._id.toString()) {
                return res.status(403).json({ message: 'Acesso negado. Este pet não pertence a você.' });
            }
            pet.available = false;
            await pet.save();
            res.status(200).json({message : 'Ciclo de adocao concluido'});



        } catch (error) {
            console.error('Algo Saiu errado',error)
            return res.status(500).json({ details: error.message });
        }
    }



}
