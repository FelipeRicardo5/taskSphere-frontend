# TaskSphere

TaskSphere é uma aplicação moderna de gerenciamento de tarefas desenvolvida com React e Vite, oferecendo uma interface intuitiva e responsiva para gerenciar suas atividades diárias.

## 🚀 Tecnologias Utilizadas

- **React 18** - Biblioteca JavaScript para construção de interfaces
- **Vite** - Build tool e servidor de desenvolvimento
- **React Router DOM** - Roteamento da aplicação
- **React Query** - Gerenciamento de estado e cache de dados
- **React Hook Form** - Gerenciamento de formulários
- **Yup** - Validação de formulários
- **Axios** - Cliente HTTP para requisições
- **Tailwind CSS** - Framework CSS para estilização
- **Lucide React** - Biblioteca de ícones
- **React Toastify** - Notificações toast
- **Date-fns** - Manipulação de datas

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITÓRIO]
cd tasksphere
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

## 🚀 Executando o Projeto

1. Para iniciar o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

2. Para criar uma build de produção:
```bash
npm run build
# ou
yarn build
```

3. Para visualizar a build de produção:
```bash
npm run preview
# ou
yarn preview
```

## 📁 Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
├── context/       # Contextos do React
├── hooks/         # Custom hooks
├── pages/         # Páginas da aplicação
├── routes/        # Configuração de rotas
├── services/      # Serviços e APIs
├── App.jsx        # Componente principal
├── main.jsx       # Ponto de entrada
└── index.css      # Estilos globais
```

## 🛠️ Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria uma build de produção
- `npm run preview` - Visualiza a build de produção
- `npm run lint` - Executa o linter para verificar o código

## 🔒 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
VITE_API_URL=https://tasksphere-backend-utsh.onrender.com
```

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes. 
