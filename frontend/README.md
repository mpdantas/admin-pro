# 🚀 Admin Pro - Sistema de Cadastro de Clientes

![Status do Projeto](https://img.shields.io/badge/status-conclu%C3%ADdo-brightgreen)

Um sistema full-stack completo para gerenciamento de cadastros de clientes, construído com tecnologias modernas. Este projeto foi desenvolvido como parte de um portfólio profissional, demonstrando habilidades em desenvolvimento backend, frontend e banco de dados.

---

### ✨ Funcionalidades Principais

* **Autenticação Segura:** Sistema de Registro e Login com senhas criptografadas e autenticação baseada em Tokens JWT.
* **Arquitetura Multiempresa:** A estrutura do banco de dados e da API isola os dados por empresa, permitindo que o sistema seja usado por múltiplos negócios de forma segura.
* **CRUD Completo de Clientes:** Interface completa para Criar, Ler, Atualizar e Deletar clientes.
* **Formulário Avançado:**
    * Interface organizada em abas (Geral, Endereço, Veículo, Observações).
    * Busca de endereço automática via API do ViaCEP.
    * Máscaras de input dinâmicas para campos como CPF, CNPJ, Celular e Placa (padrão antigo e Mercosul).
    * Validação de dados em tempo real com Yup.
* **Geração de PDF:** Funcionalidade para gerar e baixar uma Ficha Cadastral completa do cliente em formato PDF.
* **Busca e Paginação:** Interface para buscar clientes na base de dados com feedback visual do total de registros.

---

### 📸 Screenshots

*(Dica: Crie uma pasta `docs/images` na raiz do seu projeto, coloque suas melhores screenshots lá, e substitua os links abaixo)*

**Tela de Login**
![Tela de Login](https://i.imgur.com/image_link_aqui.png)

**Tela Principal de Gerenciamento**
![Tela de Gerenciamento](https://i.imgur.com/image_link_aqui.png)

**Formulário com Abas**
![Formulário com Abas](https://i.imgur.com/image_link_aqui.png)


---

### 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando as seguintes tecnologias:

**Backend:**
* **Node.js** com **Express.js** para a construção da API RESTful.
* **PostgreSQL** como banco de dados relacional.
* **JWT (JSON Web Token)** para autenticação.
* **bcrypt.js** para criptografia de senhas.
* **CORS** para gerenciamento de permissões de origem.

**Frontend:**
* **React** com **Vite** para uma experiência de desenvolvimento rápida e moderna.
* **Material-UI (MUI)** para a biblioteca de componentes visuais.
* **React Router DOM** para o roteamento de páginas (SPA).
* **Axios** para as chamadas à API.
* **Yup** para validação de formulários.
* **Zustand** para gerenciamento de estado global (notificações).
* **react-imask** para máscaras de input.
* **@react-pdf/renderer** para geração de PDFs no lado do cliente.

---

### ⚙️ Como Rodar o Projeto Localmente

Siga os passos abaixo para configurar e rodar o projeto na sua máquina.

**Pré-requisitos:**
* Node.js (v18+)
* PostgreSQL
* Git

```bash
# 1. Clone o repositório
git clone [https://github.com/seu-usuario/admin-pro.git](https://github.com/seu-usuario/admin-pro.git)

# 2. Navegue para a pasta do projeto
cd admin-pro

# 3. Configure e rode o Backend
cd backend
npm install
# Crie um arquivo .env e adicione suas credenciais do banco e JWT_SECRET
# No seu pgAdmin, crie o banco de dados 'adminpro_db'
# Execute o script em 'backend/db/init.sql' para criar as tabelas
npm run dev

# 4. Em um novo terminal, configure e rode o Frontend
cd frontend
npm install
npm run dev

# A aplicação estará disponível em http://localhost:5173