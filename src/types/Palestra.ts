// src/types/Palestra.ts
export interface Palestra {
    id?: string
    tipo: 'palestra' | 'curso' | 'outro'
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
    passagem: boolean //nova 
    nota: boolean //nova     
    humanoide: boolean //nova
    robo: boolean //nova
    observacoesRobo: string //nova
    vendidaPor: string
    valorComissao: number
    enderecoHospedagem: string
    enderecopassagem: string
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
  