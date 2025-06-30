import express, { Request, Response, RequestHandler, Express } from "express";
import cors from "cors";
import { google, Auth } from "googleapis";
import { Palestra } from "./types/Palestra";
import path from "path";
import dotenv from "dotenv";
import admin from "firebase-admin";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
dotenv.config({ path: path.resolve(__dirname, "../.env") });
  

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET,
});
const bucket = admin.storage().bucket();

const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const credentialsJson = process.env.GOOGLE_CREDENTIALS;

const auth = new google.auth.GoogleAuth({
  ...(credentialsJson
    ? { credentials: JSON.parse(credentialsJson) }
    : { keyFile: credentialsPath! }),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const spreadsheetId = process.env.SPREADSHEET_ID!;
const range = "Página1!A:AI";

// Function to initialize sheet headers
async function initializeSheetHeaders() {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client as Auth.OAuth2Client });

    // Sempre atualiza os cabeçalhos para garantir que todos estejam presentes
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Página1!A1:AI1",
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          "ID",
          "Tipo",
          "Status",
          "Valor Venda",
          "Lucro Final",
          "Nome",
          "Data Marcada",
          "Horário Evento",
          "Local",
          "Observações",
          "Info Ida",
          "Info Retorno",
          "Hospedagem Inclusa",
          "Passagem",
          "Nota",
          "Humanoide",
          "Robô",
          "Observações Robô",
          "Vendida Por",
          "Valor Comissão",
          "Endereço Hospedagem",
          "Endereço Passagem",
          "Status Comissão",
          "Valor Bônus",
          "Data Bônus",
          "Status Bônus",
          "Data NF",
          "Número NF",
          "Valor NF Paga",
          "Valor Imposto",
          "Pagamento Contratante",
          "Valor Final Recebido",
          "Custo Final",
          "Arquivos",
          "Agendado"
        ]]
      }
    });
    console.log("Headers updated successfully");
  } catch (error) {
    console.error("Error updating headers:", error);
  }
}

// Initialize headers when server starts
initializeSheetHeaders();

app.post("/add-palestra", (async (req: Request, res: Response): Promise<void> => {
  try {
    const requiredFields = ["nome", "dataMarcada", "local", "tipo"];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      res.status(400).json({
        message: "Dados inválidos",
        error: `Campos ausentes: ${missingFields.join(", ")}`
      });
      return;
    }

    const palestra: Palestra = {
      ...req.body,
      agendado: false // Garante que sempre inicie como false
    };

    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client as Auth.OAuth2Client });

    await sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: range,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: [[
            palestra.id || '',
            palestra.tipo,
            palestra.status,
            palestra.valorVenda,
            palestra.lucroFinal,
            palestra.nome,
            palestra.dataMarcada,
            palestra.horarioEvento,
            palestra.local,
            palestra.observacoes,
            palestra.infoIda,
            palestra.infoRetorno,
            palestra.hospedagemInclusa,
            palestra.passagem,
            palestra.nota,
            palestra.humanoide,
            palestra.robo,
            palestra.observacoesRobo,
            palestra.vendidaPor,
            palestra.valorComissao,
            palestra.enderecoHospedagem,
            palestra.enderecopassagem,
            palestra.statusComissao,
            palestra.valorBonus,
            palestra.dataBonus,
            palestra.statusBonus,
            palestra.dataNF,
            palestra.numeroNF,
            palestra.valorNFPaga,
            palestra.valorImposto,
            palestra.pagamentoContratante,
            palestra.valorFinalRecebido,
            palestra.custoFinal,
            (palestra.documentos || []).join(';'),
            "Não" // Exibe "Não" na planilha quando false
          ]]
        }
      });

    res.status(200).json({ message: "Palestra adicionada com sucesso!" });
  } catch (error) {
    console.error("Erro:", error);
    res.status(500).json({ message: "Erro ao adicionar palestra.", error: String(error) });
  }
}) as RequestHandler);

app.post("/upload-document", upload.array("files"), async (req: Request, res: Response) => {
  try {
    const idEvento = req.body.idEvento;
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ message: "Nenhum arquivo enviado" });
      return;
    }
    const urls: string[] = [];
    for (const file of files) {
      const filePath = `palestras/${idEvento}/${file.originalname}`;
      const token = uuidv4();
      await bucket.file(filePath).save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
          metadata: { firebaseStorageDownloadTokens: token },
        },
      });
      const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media&token=${token}`;
      urls.push(url);
    }
    res.json({ urls });
  } catch (err) {
    console.error("Erro no upload:", err);
    res.status(500).json({ message: "Erro ao enviar arquivo", error: String(err) });
  }
});

app.post("/update-palestra", (async (req: Request, res: Response): Promise<void> => {
  try {
    const requiredFields = ["id", "nome", "dataMarcada", "local", "tipo"];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      res.status(400).json({
        message: "Dados inválidos",
        error: `Campos ausentes: ${missingFields.join(", ")}`
      });
      return;
    }

    const palestra: Palestra = {
      ...req.body,
      agendado: req.body.agendado || false // Garante que sempre tenha um valor
    };

    if (!palestra.id) {
      res.status(400).json({
        message: "Dados inválidos",
        error: "ID da palestra é obrigatório"
      });
      return;
    }

    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client as Auth.OAuth2Client });

    // Get all rows to find the row index by id
    const getResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: range,
    });

    const rows = getResponse.data.values || [];
    
    // Log detalhado para debug
    console.log('=== DEBUG DE IDS ===');
    console.log('ID recebido para edição:', palestra.id);
    console.log('Tipo do ID recebido:', typeof palestra.id);
    console.log('Comprimento do ID recebido:', palestra.id.length);
    
    // Log dos primeiros 5 IDs da planilha para comparação
    console.log('\nPrimeiros 5 IDs da planilha:');
    rows.slice(0, 5).forEach((row, index) => {
      console.log(`Linha ${index + 2}:`, {
        id: row[0],
        tipo: typeof row[0],
        comprimento: row[0]?.length,
        nome: row[5] // Nome da palestra para referência
      });
    });

    // Log detalhado para debug da busca de IDs
    console.log('\n--- Debug de Busca findIndex ---');
    console.log('Buscando ID:', palestra.id);
    
    // Pula o cabeçalho (primeira linha) e procura o ID
    // rows.slice(1) faz com que rowIndex 0 corresponda à linha 2 da planilha
    const rowIndex = rows.slice(1).findIndex((row, indexNoSlice) => {
      // Pula linhas que não têm ID definido na primeira coluna
      if (!row[0]) return false;
      
      const rowId = row[0].toString().trim(); // Converte para string e remove espaços em branco
      const rowName = row[5]; // Nome da palestra para referência
      const actualSheetRow = indexNoSlice + 2; // Linha real na planilha

      console.log(`Comparando com linha ${actualSheetRow} (índice no slice: ${indexNoSlice}): ID_Planilha='${rowId}', Nome='${rowName}'`);
      
      const match = rowId === palestra.id;
      if (match) {
        console.log('!!! Match encontrado na busca findIndex !!! Linha:', actualSheetRow);
      }
      return match;
    });

    if (rowIndex !== -1) {
      const updateRow = rowIndex + 2; // +1 para compensar o slice(1) (que removeu o cabeçalho) e +1 porque o Google Sheets é 1-indexado

      // Proteção extra: garante que o ID da linha encontrada é igual ao enviado
      // O índice aqui é updateRow - 1 porque estamos acessando o array 'rows' completo (com cabeçalho)
      const idOnSheet = rows[updateRow - 1]?.[0]?.toString().trim();
      console.log('Verificando ID antes de atualizar: ID na planilha (' + idOnSheet + ') vs ID recebido (' + palestra.id + ')');
      
      if (idOnSheet !== palestra.id) {
        console.error('Erro de consistência: O ID na linha a ser atualizada no Google Sheets não corresponde ao ID recebido.');
        res.status(400).json({
          message: "Dados inválidos",
          error: "ID da linha não confere, possível corrupção de dados."
        });
        return;
      }
      
      // Atualiza exatamente a linha correta na planilha
      const updateRange = `Página1!A${updateRow}:AI${updateRow}`;
      console.log('Preparando para atualizar a range:', updateRange);
      console.log('Atualizando linha:', updateRow, 'com ID:', palestra.id);
      console.log('Nome da palestra sendo atualizada:', palestra.nome);
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: updateRange,
        valueInputOption: "RAW",
        requestBody: {
          values: [[
            palestra.id,
            palestra.tipo,
            palestra.status,
            palestra.valorVenda,
            palestra.lucroFinal,
            palestra.nome,
            palestra.dataMarcada,
            palestra.horarioEvento,
            palestra.local,
            palestra.observacoes,
            palestra.infoIda,
            palestra.infoRetorno,
            palestra.hospedagemInclusa,
            palestra.passagem,
            palestra.nota,
            palestra.humanoide,
            palestra.robo,
            palestra.observacoesRobo,
            palestra.vendidaPor,
            palestra.valorComissao,
            palestra.enderecoHospedagem,
            palestra.enderecopassagem,
            palestra.statusComissao,
            palestra.valorBonus,
            palestra.dataBonus,
            palestra.statusBonus,
            palestra.dataNF,
            palestra.numeroNF,
            palestra.valorNFPaga,
            palestra.valorImposto,
            palestra.pagamentoContratante,
            palestra.valorFinalRecebido,
            palestra.custoFinal,
            (palestra.documentos || []).join(';'),
            palestra.agendado ? "Sim" : "Não" // Exibe "Sim" ou "Não" na planilha
          ]]
        }
      });
      res.status(200).json({ message: "Palestra atualizada com sucesso!" });
      return;
    } else {
      console.log('\nID não encontrado na planilha!');
      res.status(404).json({ message: "Palestra não encontrada no Google Sheets." });
      return;
    }
  } catch (error) {
    console.error("Erro ao atualizar palestra:", error);
    res.status(500).json({ message: "Erro ao atualizar palestra.", error: String(error) });
  }
}) as RequestHandler);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT || 3000}`);
});
