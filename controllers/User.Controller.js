// *** Todos os Metodos e Verificacoes referente ao Usuario *** //
const bcrypt = require('bcrypt'); // Importa a biblioteca para criptografia de senhas
const User = require('../model/User'); // Importa o modelo de usuário
const jwt = require('jsonwebtoken'); // Importa o jwt


//Funcoes Vindas dos Utils | Helpers
const createUserToken = require('../utils/create-user-token'); // Importa a funcao que cria um token
const getToken = require('../utils/get-token'); // Importa funcao de verificar o token
const getUserByToken = require('../utils/get-user-by-token');

module.exports = class UserController {
    //Registra o usuario
    static async Register(req, res) {
        // Mapeando os campos obrigatórios com suas respectivas mensagens de erro
        const camposObrigatorios = {
            name: "Nome é obrigatório",
            email: "Email é obrigatório",
            phone: "Telefone é obrigatório",
            password: "Senha é obrigatória",
            confirmPassword: "Confirmação de senha é obrigatória"
        };

        // Verificando se algum campo obrigatório está faltando na requisição
        for (const campo in camposObrigatorios) {
            if (!req.body[campo]) {
                return res.status(422).json({ message: camposObrigatorios[campo] });
            }
        }

        // Extraindo dados do corpo da requisição para facilitar o uso
        const { name, phone, password, confirmPassword, email } = req.body;

        // Validando se a senha e a confirmação de senha são iguais
        if (password !== confirmPassword) {
            return res.status(422).json({ message: "As senhas precisam ser iguais" });
        }

        try {
            // Verifica se já existe um usuário cadastrado com o email fornecido
            const usuarioExiste = await User.findOne({ email });
            if (usuarioExiste) {
                return res.status(422).json({ message: "Este email já está sendo utilizado" });
            }

            // Gera um "salt" para aumentar a segurança da criptografia da senha
            const salt = await bcrypt.genSalt(8);
            const passwordHash = await bcrypt.hash(password, salt); // Criptografa a senha

            // Cria um novo usuário com os dados fornecidos
            const user = new User({
                name,
                email,
                phone,
                password: passwordHash // Armazena a senha já criptografada
            });

            // Salva o usuário no banco de dados
            const newUser = await user.save();

            // Gera um token JWT para o usuário recém-cadastrado e retorna a resposta
            createUserToken(newUser, req, res);

        } catch (error) {
            // Captura erros que possam ocorrer durante o cadastro e retorna uma mensagem ao cliente
            return res.status(500).json({ message: "Erro ao cadastrar usuário: " + error.message });
        }
    };
    //Loga o usuaruio no sistema
    static async login(req, res) {
        // Extraindo email e senha do corpo da requisição
        const { email, password } = req.body;

        // Verifica se o email foi fornecido
        if (!email) {
            return res.status(422).json({ message: "Email é obrigatório" }); // Retorna erro caso esteja ausente
        }

        // Verifica se a senha foi fornecida
        if (!password) {
            return res.status(422).json({ message: "Senha é obrigatória" }); // Retorna erro caso esteja ausente
        }

        try {
            // Busca o usuário no banco de dados pelo email fornecido
            const usuario = await User.findOne({ email });

            // Se o usuário não existir, retorna um erro
            if (!usuario) {
                return res.status(422).json({ message: "Não há usuário cadastrado com esse email" });
            }

            // Verifica se a senha fornecida corresponde à senha armazenada no banco
            const checkPassword = await bcrypt.compare(password, usuario.password);

            // Se a senha estiver incorreta, retorna um erro
            if (!checkPassword) {
                return res.status(422).json({ message: "A senha não confere" });
            }

            // Se todas as verificações forem bem-sucedidas, gera um token JWT para autenticação
            createUserToken(usuario, req, res);

        } catch (error) {
            // Se ocorrer algum erro inesperado, retorna uma mensagem de erro interna
            return res.status(500).json({ message: "Erro ao processar login: " + error.message });
        }
    }
    // Checa se o usuario esta logado e se possui o token de verificacao
    static async checkUser(req, res) {
        let currentUser = null;
        // Verifica se há um cabeçalho de autorização na requisição
        if (req.headers.authorization) {
            try {
                // Obtém o token do cabeçalho da requisição
                const token = getToken(req);

                // Decodifica o token usando a chave secreta
                const decoded = jwt.verify(token, "secretkey");

                // Busca o usuário no banco de dados usando o ID contido no token
                currentUser = await User.findById(decoded.id);

                // Se o usuário não for encontrado, retorna um erro 404 (Usuário não encontrado)
                if (!currentUser) {
                    return res.status(404).json({ message: "Usuário não encontrado" });
                }

                // Remove a senha do objeto do usuário antes de enviá-lo na resposta
                currentUser.password = undefined;

            } catch (error) {
                // Em caso de erro na autenticação (token inválido, expirado, etc.), retorna um erro 401
                return res.status(401).json({ message: "Erro na autenticação", error: error.message });
            }
        }

        // Se não houver um token na requisição, significa que o usuário não está autenticado
        if (!currentUser) {
            return res.status(403).json({ message: "Usuário não autenticado" });
        }

        // Retorna os dados do usuário autenticado com status 200
        return res.status(200).json(currentUser);
    }
    // Resgata usuario pelo id
    static async getUserById(req, res) {
        try {
            // Extraio o Id vindo da requisição
            const id = req.params.id;

            // Busco o usuário no banco de forma assíncrona
            const user = await User.findById(id).select('-password'); // Select serve para remover um trecho expecifico do retorno

            // Verifico se o usuário existe
            if (!user) {
                return res.status(422).json({ message: "Usuário não encontrado" });
            }

            // Retorno o usuário encontrado
            return res.status(200).json({ user });

        } catch (error) {
            // Capturo possíveis erros e retorno uma resposta adequada
            return res.status(500).json({ message: "Erro ao buscar usuário", error: error.message });
        }
    }

    // Alteracao de Usuario
static async editUser(req, res) {
    try {
        // 🔐 Obtém o token e verifica o usuário autenticado
        const token = getToken(req);
        const user = await getUserByToken(token);

        // 🔍 Verifica se o usuário foi encontrado no sistema
        if (!user) {
            return res.status(401).json({ message: "Acesso negado: Usuário não autenticado" });
        }

        // ✍️ Extraio as informações enviadas pelo usuário na requisição
        const { name, phone, password, confirmPassword, email } = req.body;

        // 🖼️ Atualiza a imagem do usuário caso tenha sido enviada
        if (req.file) {
            user.imagem = req.file.filename; // Salva o nome do arquivo da imagem
        }

        // ✅ Valida se os campos obrigatórios foram preenchidos
        if (!name) {
            return res.status(400).json({ message: "Nome é obrigatório" });
        }
        user.name = name;

        if (!phone) {
            return res.status(400).json({ message: "Telefone é obrigatório" });
        }
        user.phone = phone;

        if (!email) {
            return res.status(400).json({ message: "Email é obrigatório" });
        }

        // 🔎 Verifica se o e-mail já está registrado por outro usuário
        const userExist = await User.findOne({ email });
        if (userExist && user.email !== email) {
            return res.status(422).json({ message: "Email já está em uso por outro usuário" });
        }
        user.email = email;

        // 🔒 Validação de senha (caso tenha sido enviada)
        if (password || confirmPassword) {
            if (!password || !confirmPassword) {
                return res.status(400).json({ message: "Ambos os campos de senha devem ser preenchidos" });
            }
            if (password !== confirmPassword) {
                return res.status(400).json({ message: "As senhas não coincidem" });
            }

            // 🔑 Criptografa a nova senha antes de salvar
            const salt = await bcrypt.genSalt(8);
            user.password = await bcrypt.hash(password, salt);
        }

        // 🛠️ Atualiza os dados do usuário no banco de dados
        await User.findByIdAndUpdate(
            user._id,
            { $set: { name, phone, email, password: user.password, imagem: user.imagem } },
            { new: true }
        );

        // ✅ Retorna uma mensagem de sucesso
        return res.status(200).json({ message: "Usuário atualizado com sucesso", user });

    } catch (error) {
        // ⚠️ Captura e retorna erros internos da aplicação
        return res.status(500).json({ message: "Erro ao atualizar usuário", error: error.message });
    }
}


};
