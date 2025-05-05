// src/types/Palestra.ts
export interface Palestra {
    id?: string
    status: string
    valorVenda: number
    lucroFinal: number
    nome: string
    dataMarcada: string
    horarioEvento: string
    local: string
    observacoes: string
    infoIda: string
    infoRetorno: string
    hospedagemInclusa: boolean
    vendidaPor: string
    valorComissao: number
    enderecoHospedagem: string
    statusComissao: string
    valorBonus: number
    dataBonus: string
    statusBonus: string
    dataNF: string
    numeroNF: string
    valorNFPaga: number
    valorImposto: number
    pagamentoContratante: string
    valorFinalRecebido: number
    custoFinal: number
}
  