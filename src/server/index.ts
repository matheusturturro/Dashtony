import express, { Request, Response, RequestHandler } from "express";
import cors from "cors";
import { google, Auth } from "googleapis";
import path from "path";
import { Palestra } from "../types/Palestra";
  

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

    // Sempre atualiza os cabeçalhos para garantir que todos estejam presentes
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
          "Custo Final",
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

app.post("/add-palestra", async (req: Request, res: Response) => {
  try {
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
            "Não" // Exibe "Não" na planilha quando false
          ]]
        }
      });

    res.status(200).send("Palestra adicionada com sucesso!");
  } catch (error) {
    console.error("Erro:", error);
    res.status(500).send("Erro ao adicionar palestra.");
  }
});

app.post("/update-palestra", (async (req: Request, res: Response): Promise<void> => {
  try {
    const palestra: Palestra = {
      ...req.body,
      agendado: req.body.agendado || false // Garante que sempre tenha um valor
    };

    if (!palestra.id) {
      res.status(400).send("ID da palestra é obrigatório para atualização.");
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
        res.status(400).send("ID da linha não confere, possível corrupção de dados.");
        return;
      }
      
      // Atualiza exatamente a linha correta na planilha
      const updateRange = `Página1!A${updateRow}:AH${updateRow}`;
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
            palestra.agendado ? "Sim" : "Não" // Exibe "Sim" ou "Não" na planilha
          ]]
        }
      });
      res.status(200).send("Palestra atualizada com sucesso!");
      return;
    } else {
      console.log('\nID não encontrado na planilha!');
      res.status(404).send("Palestra não encontrada no Google Sheets.");
      return;
    }
  } catch (error) {
    console.error("Erro ao atualizar palestra:", error);
    res.status(500).send("Erro ao atualizar palestra.");
  }
}) as RequestHandler);

app.listen(3001, () => {
  console.log("Servidor rodando em http://localhost:3001");
});
