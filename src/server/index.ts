import express, { Request, Response } from "express";
import cors from "cors";
import { google, Auth } from "googleapis";
import path from "path";
import { Palestra } from "../types/Palestra";

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "sheets-key.json"), // <- coloque sua chave JSON aqui
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const spreadsheetId = "1ZYDkpQpep8LrxDtCuKyVVPjzTZkE4jy3PN_gKy01KkE";
const range = "Página1!A:AH";

// Function to initialize sheet headers
async function initializeSheetHeaders() {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client as Auth.OAuth2Client });

    // Check if headers exist
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Página1!A1:AH1",
    });

    if (!response.data.values || response.data.values.length === 0) {
      // Add headers if they don't exist
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Página1!A1:AH1",
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
            "Custo Final"
          ]]
        }
      });
      console.log("Headers initialized successfully");
    }
  } catch (error) {
    console.error("Error initializing headers:", error);
  }
}

// Initialize headers when server starts
initializeSheetHeaders();

app.post("/add-palestra", async (req: Request, res: Response) => {
  try {
    const palestra: Palestra = req.body;

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
            palestra.custoFinal
          ]]
        }
      });

    res.status(200).send("Palestra adicionada com sucesso!");
  } catch (error) {
    console.error("Erro:", error);
    res.status(500).send("Erro ao adicionar palestra.");
  }
});

app.post("/update-palestra", (async (req: Request, res: Response) => {
  try {
    const palestra: Palestra = req.body;

    if (!palestra.id) {
      return res.status(400).send("ID da palestra é obrigatório para atualização.");
    }

    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client as Auth.OAuth2Client });

    // Get all rows to find the row index by id
    const getResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: range,
    });

    const rows = getResponse.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === palestra.id);

    if (rowIndex === -1) {
      return res.status(404).send("Palestra não encontrada no Google Sheets.");
    }

    // Update the row (rowIndex + 1 because Sheets are 1-indexed and +1 for header)
    const updateRange = `Página1!A${rowIndex + 2}:AH${rowIndex + 2}`;
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
          palestra.custoFinal
        ]]
      }
    });

    res.status(200).send("Palestra atualizada com sucesso!");
  } catch (error) {
    console.error("Erro ao atualizar palestra:", error);
    res.status(500).send("Erro ao atualizar palestra.");
  }
}) as express.RequestHandler);

app.listen(3001, () => {
  console.log("Servidor rodando em http://localhost:3001");
});
