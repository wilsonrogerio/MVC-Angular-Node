# 🐶 Pet Adoption Aplication

Esta é uma Aplicacao Full stack desenvolvida em **Node.js** com **Express** e **MongoDB** **Angular**, destinada ao gerenciamento de adoção de pets.

---

## 🚀 Funcionalidades

- Cadastro e login de usuários
- Cadastro, atualização e remoção de pets
- Upload de imagens para os pets
- Adoção de pets e conclusão do ciclo de adoção
- Autenticação via JWT

---

## 📁 Estrutura de Pastas

Back-End/
├── controllers/ # Lógica das rotas (Pets e Users)
├── db/ # Conexão com banco de dados MongoDB
├── model/ # Schemas do Mongoose (User e Pet)
├── routes/ # Rotas da API
├── index.js # Ponto de entrada da aplicação
├── package.json # Dependências e scripts

yaml
Copiar
Editar

---

## 🔧 Instalação e Execução

1. Clone o repositório:
```bash
git clone https://github.com/seuusuario/pet-adoption-api.git
Acesse o diretório do projeto:

bash
Copiar
Editar
cd pet-adoption-api
Instale as dependências:

bash
Copiar
Editar
npm install
Configure seu arquivo .env com as variáveis necessárias:

ini
Copiar
Editar
DB_URI=mongodb://localhost:27017/pets
SECRET=uma_chave_secreta_para_token
Execute o servidor:

bash
Copiar
Editar
npm start
🔐 Autenticação
A API utiliza autenticação JWT. Após o login, você receberá um token que deve ser enviado no header das requisições protegidas:

makefile
Copiar
Editar
Authorization: Bearer SEU_TOKEN_AQUI
📌 Endpoints Principais
🔹 Usuários
Método	Rota	Descrição
POST	/users/register	Cadastrar um novo usuário
POST	/users/login	Login de usuário e retorno do token
GET	/users/checkuser	Verifica o usuário logado

🔹 Pets
Método	Rota	Descrição
POST	/pets/create	Cadastrar um novo pet
GET	/pets	Listar todos os pets
GET	/pets/mypets	Listar pets do usuário autenticado
GET	/pets/myadoptions	Listar pets que o usuário adotou
PATCH	/pets/:id	Atualizar informações de um pet
DELETE	/pets/:id	Remover um pet
PATCH	/pets/schedule/:id	Agendar uma visita para um pet
PATCH	/pets/conclude/:id	Concluir a adoção de um pet

🛠 Tecnologias Utilizadas
Node.js

Express

MongoDB + Mongoose

JWT (Json Web Token)

Multer (upload de imagens)

Dotenv
