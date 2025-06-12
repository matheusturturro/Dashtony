# DashTony - Sistema de Gestão de Palestras

DashTony é um painel para gerenciamento de palestras desenvolvido em React e TypeScript. As informações cadastradas são armazenadas no Firebase e também enviadas para o Google Sheets através de um pequeno servidor Node. A planilha, por sua vez, alimenta o Google Agenda para que todos os eventos fiquem organizados em um calendário compartilhado.

Fluxo completo do dado: **Aplicação → Firebase → Google Sheets → Google Agenda**.

## Principais Funcionalidades

- Cadastro de palestras com diversos detalhes (data, local, pagamentos etc.)
- Listagem e atualização do status de cada palestra
- Gestão de pagamentos e contratantes
- Registro de hospedagem e notas fiscais

## Como Executar

1. **Clone o repositório**
   ```bash
   git clone [URL_DO_REPOSITÓRIO]
   cd dashtony
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Crie um arquivo `.env`** na raiz do projeto contendo as chaves do Firebase:
   ```env
   VITE_FIREBASE_API_KEY=sua_api_key
   VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain
   VITE_FIREBASE_PROJECT_ID=seu_project_id
   VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
   VITE_FIREBASE_APP_ID=seu_app_id
   ```

4. **Inicie a aplicação**
   ```bash
   npm run dev
   ```
   O painel ficará disponível em `http://localhost:5173` (porta padrão do Vite).

### Servidor de Integração com Google Sheets

Para enviar e atualizar os dados na planilha, rode o servidor Node em paralelo:

```bash
npm run server
```

Defina as variáveis de ambiente abaixo (por exemplo em `.env` ou diretamente no ambiente):

```env
SPREADSHEET_ID=seu_id_da_planilha
GOOGLE_KEY_FILE=/caminho/para/google-key.json
PORT=3001
```

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
<<<<<<<<< Temporary merge branch 1
npm.cmd run dev
node dist/server/index.js
=========
>>>>>>>>> Temporary merge branch 2
