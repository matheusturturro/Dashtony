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
PORT=3001 # opcional
```

## Estrutura do Projeto

- `src/components` – componentes de interface
- `src/services` – configurações de Firebase e chamadas de API
- `src/types` – definições de tipos TypeScript
- `src/server` – código do servidor de integração com Google Sheets

## Contribuindo

1. Faça um fork do projeto.
2. Crie uma branch para sua feature (`git checkout -b feature/SuaFeature`).
3. Commit suas alterações (`git commit -m 'Minha contribuição'`).
4. Envie a branch (`git push origin feature/SuaFeature`).
5. Abra um Pull Request.


