// src/components/CadastroPalestra.tsx
import { useState, FormEvent, useEffect } from 'react'
import { db } from '../firebase'
import { collection, updateDoc, doc } from 'firebase/firestore'
import { Palestra } from '../types/Palestra'
import styles from './CadastroPalestra.module.css'
import {v4 as uuidv4} from "uuid";
import { formatDate } from '../utils/formatDate'

import { setDoc } from 'firebase/firestore'; // Adicione esta importação
const API_URL = import.meta.env.VITE_BACKEND_URL || ""
interface CadastroPalestraProps {
  palestraSelecionada: Palestra | null
  onPalestraSalva: () => void
  isOpen: boolean
  onClose: () => void
  modo?: 'editar' | 'detalhes'
  onEditar?: () => void
}

export default function CadastroPalestra({ palestraSelecionada, onPalestraSalva, isOpen, onClose, modo = 'editar', onEditar }: CadastroPalestraProps) {
  const readOnly = modo === 'detalhes'
  const [form, setForm] = useState<Palestra>({
    tipo: 'palestra',
    status: '',
    valorVenda: 0,
    lucroFinal: 0,
    nome: '',
    dataMarcada: '',
    horarioEvento: '',
    local: '',
    observacoes: '',
    resumo: '',
    infoIda: '',
    infoRetorno: '',
    humanoide: false,
    nota: false,
    passagem: false,
    robo: false,
    observacoesRobo: '',
    hospedagemInclusa: false,
    enderecoHospedagem: '',
    enderecopassagem: '',
    vendidaPor: '',
    valorComissao: 0,
    statusComissao: '',
    valorBonus: 0,
    dataBonus: '',
    statusBonus: '',
    dataNF: '',
    numeroNF: '',
    valorNFPaga: 0,
    valorImposto: 0,
    pagamentoContratante: '',
    valorFinalRecebido: 0,
    custoFinal: 0,
    agendado: false,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const tabItems = [
    { id: 'basico', label: 'Básico' },
    { id: 'financeiro', label: 'Financeiro' },
    { id: 'viagem', label: 'Viagem' }
  ] as const
  const [tab, setTab] = useState<(typeof tabItems)[number]['id']>('basico')

  const handleTabKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    const { key } = e
    const lastIndex = tabItems.length - 1
    let newIndex = index

    if (key === 'ArrowRight') {
      newIndex = index === lastIndex ? 0 : index + 1
    } else if (key === 'ArrowLeft') {
      newIndex = index === 0 ? lastIndex : index - 1
    } else if (key === 'Home') {
      newIndex = 0
    } else if (key === 'End') {
      newIndex = lastIndex
    } else if (key === 'Enter' || key === ' ') {
      setTab(tabItems[index].id)
      return
    } else {
      return
    }

    e.preventDefault()
    const newTab = tabItems[newIndex].id
    setTab(newTab)
    const btn = document.getElementById(`tab-${newTab}`)
    btn?.focus()
  }

  useEffect(() => {
    if (palestraSelecionada) {
      setForm(palestraSelecionada)
    } else {
      // Limpa o formulário quando não há palestra selecionada
      setForm({
        tipo: 'palestra',
        status: '',
        valorVenda: 0,
        lucroFinal: 0,
        nome: '',
        dataMarcada: '',
        horarioEvento: '',
        local: '',
        observacoes: '',
        resumo: '',
        infoIda: '',
        infoRetorno: '',
        humanoide: false,
        nota: false,
        passagem: false,
        robo: false,
        observacoesRobo: '',
        hospedagemInclusa: false,
        enderecoHospedagem: '',
        enderecopassagem: '',
        vendidaPor: '',
        valorComissao: 0,
        statusComissao: '',
        valorBonus: 0,
        dataBonus: '',
        statusBonus: '',
        dataNF: '',
        numeroNF: '',
        valorNFPaga: 0,
        valorImposto: 0,
        pagamentoContratante: '',
        valorFinalRecebido: 0,
        custoFinal: 0,
        agendado: false,
      })
    }
  }, [palestraSelecionada])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement
    const { name, value, type } = target

    // Tratamento especial para campos de data
    if (type === 'date') {
      // Adiciona o horário para garantir que a data seja interpretada corretamente
      const data = new Date(value + 'T12:00:00')
      const dataFormatada = data.toISOString().split('T')[0]
      setForm(prev => ({
        ...prev,
        [name]: dataFormatada
      }))
      return
    }

    // Tratamento especial para campos numéricos
    if (type === 'number') {
      const numericValue = value === '' ? 0 : parseFloat(value)
      setForm(prev => ({
        ...prev,
        [name]: numericValue
      }))
      return
    }

    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? target.checked : value
    }))
  }

  const validateForm = (): boolean => {
    if (!form.nome.trim()) {
      setError('O nome é obrigatório')
      return false
    }
    if (!form.dataMarcada) {
      setError('A data é obrigatória')
      return false
    }
    if (!form.local.trim()) {
      setError('O local é obrigatório')
      return false
    }
    if (form.valorVenda < 0) {
      setError('O valor de venda não pode ser negativo')
      return false
    }
    if (form.infoIda && form.infoRetorno) {
      const dataIda = new Date(form.infoIda)
      const dataRetorno = new Date(form.infoRetorno)
      if (dataRetorno < dataIda) {
        setError('A data de retorno deve ser posterior à data de ida')
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      if (palestraSelecionada) {
        // Atualiza palestra existente (mantém o id atual)
        const palestraData = { ...form, id: palestraSelecionada.id };
        console.log('ID enviado para edição:', palestraData.id);
        // Usa o id do Firestore salvo em palestraSelecionada.id
        const docRef = doc(collection(db, 'palestras'), palestraSelecionada.id);
        await updateDoc(docRef, palestraData);
        // Atualiza no Google Sheets
        try {
            const response = await fetch(`${API_URL}/update-palestra`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(palestraData),
          });
          if (!response.ok) {
            console.error('Erro ao atualizar no Google Sheets:', await response.text());
          }
        } catch (sheetsError) {
          console.error('Erro ao atualizar no Google Sheets:', sheetsError);
        }
      } else {
        // Cria nova palestra com id único para o Google Sheets
        const uuid = uuidv4();
        const novaPalestra = { ...form, id: uuid };

        const docRef = doc(db, 'palestras', uuid); // Cria uma referência com ID explícito
        await setDoc(docRef, { ...form, id: uuid }); // Usa setDoc em vez de addDoc
        // Envia para o Google Sheets
        try {
            const response = await fetch(`${API_URL}/add-palestra`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(novaPalestra),
          });
          if (!response.ok) {
            console.error('Erro ao enviar para o Google Sheets:', await response.text());
          }
        } catch (sheetsError) {
          console.error('Erro ao enviar para o Google Sheets:', sheetsError);
        }
      }
      
      // Limpa o formulário
      setForm({
        tipo: 'palestra',
        status: '',
        valorVenda: 0,
        lucroFinal: 0,
        nome: '',
        dataMarcada: '',
        horarioEvento: '',
        local: '',
        observacoes: '',
        resumo: '',
        infoIda: '',
        infoRetorno: '',
        humanoide: false,
        nota: false,
        passagem: false,
        robo: false,
        observacoesRobo: '',
        hospedagemInclusa: false,
        enderecoHospedagem: '',
        enderecopassagem: '',
        vendidaPor: '',
        valorComissao: 0,
        statusComissao: '',
        valorBonus: 0,
        dataBonus: '',
        statusBonus: '',
        dataNF: '',
        numeroNF: '',
        valorNFPaga: 0,
        valorImposto: 0,
        pagamentoContratante: '',
        valorFinalRecebido: 0,
        custoFinal: 0,
        agendado: false,
      })
      
      // Notifica o componente pai
      onPalestraSalva()
    } catch (err) {
      console.error('Erro:', JSON.stringify(err))
      setError('Erro ao salvar palestra. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }
  if (!isOpen) return null

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <div className={styles.topRow}>
            <h2 className={styles.title}>
              {modo === 'detalhes'
                ? 'Detalhes da Palestra'
                : palestraSelecionada
                ? 'Editar Palestra'
                : 'Nova Palestra'}
            </h2>
            <div className={styles.actions}>
              {modo === 'detalhes' && onEditar && (
                <button
                  type="button"
                  className={styles.editButton}
                  onClick={onEditar}
                >
                  <span aria-hidden="true" className={styles.editIcon}>✎</span>
                  <span className={styles.editLabel}>Editar</span>
                </button>
              )}
              <button
                type="button"
                className={styles.closeButton}
                aria-label="Fechar"
                onClick={onClose}
              >
                ×
              </button>
            </div>
          </div>
          <nav className={styles.tabs} role="tablist">
            {tabItems.map((t, i) => (
              <button
                key={t.id}
                id={`tab-${t.id}`}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                tabIndex={tab === t.id ? 0 : -1}
                onClick={() => setTab(t.id)}
                onKeyDown={e => handleTabKeyDown(e, i)}
                className={styles.tabButton}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
        <form
          className={`${styles.form} ${palestraSelecionada ? styles.editing : ''}`}
          onSubmit={readOnly ? e => e.preventDefault() : handleSubmit}
        >
      {error && <div className={styles.error}>{error}</div>}

      {/* Bloco Inicial Prioritário */}
      {tab === 'basico' && (
        <>
      <div className={styles.field}>
        <label>Tipo: <span className={styles.required}>*</span></label>
        <select name="tipo" value={form.tipo} onChange={handleChange} required>
          <option value="palestra">Palestra</option>
          <option value="curso">Curso</option>
          <option value="outro">Outro</option>
        </select>
      </div>
      <div className={styles.field}>
        <label>Nome: <span className={styles.required}>*</span></label>
        <input
          type="text"
          name="nome"
          value={form.nome}
          onChange={handleChange}
          required
          placeholder="Digite o nome da palestra"
          disabled={readOnly}
        />
      </div>
      <div className={styles.field}>
        <label>Data Marcada: <span className={styles.required}>*</span></label>
        {readOnly ? (
          <input
            type="text"
            value={formatDate(form.dataMarcada)}
            readOnly
            className={styles.readonlyInput}
          />
        ) : (
          <input
            type="date"
            name="dataMarcada"
            value={form.dataMarcada}
            onChange={handleChange}
            required
          />
        )}
      </div>
      <div className={styles.field}>
        <label>Status:</label>
        <select name="status" value={form.status} onChange={handleChange} disabled={readOnly}>
          <option value="">Selecione</option>
          <option value="Cancelada">Cancelada</option>
          <option value="Agendada">Agendada</option>
          <option value="Confirmada">Confirmada</option>
        </select>
      </div>
      <div className={styles.field}>
        <label>Lucro Final:</label>
        <input
          type="number"
          name="lucroFinal"
          value={form.lucroFinal || ''}
          onChange={handleChange}
          placeholder="Digite o lucro final"
          disabled={readOnly}
        />
      </div>

      {/* Detalhes do Evento */}
      <div className={styles.field}>
        <label>Local:</label>
        <input
          type="text"
          name="local"
          value={form.local}
          onChange={handleChange}
          placeholder="Digite o local do evento"
          disabled={readOnly}
        />
      </div>
      <div className={styles.field}>
        <label>Horário do Evento:</label>
        <input type="time" name="horarioEvento" value={form.horarioEvento} onChange={handleChange} disabled={readOnly} />
      </div>
      <div className={styles.field}>
        <label>Observações:</label>
        <textarea name="observacoes" value={form.observacoes} onChange={handleChange} readOnly={readOnly} />
      </div>
      <div className={styles.field}>
        <label>Resumo:</label>
        <textarea
          name="resumo"
          value={form.resumo}
          onChange={handleChange}
          placeholder="Escreva um breve resumo da palestra"
          readOnly={readOnly}
        />
      </div>

      <div className={styles.field}>
        <label>Robô:</label>
        <div className={styles.checkboxContainer}>
          <input
            type="checkbox"
            name="robo"
            checked={form.robo}
            onChange={handleChange}
            disabled={readOnly}
          />
          <span>Sim</span>
        </div>
      </div>

      {form.robo && (
        <div className={styles.field}>
          <label>Observações do Robô:</label>
          <textarea
            name="observacoesRobo"
            value={form.observacoesRobo}
            onChange={handleChange}
            placeholder="Digite as observações sobre o robô"
            readOnly={readOnly}
          />
        </div>
      )}

      </>
      )}

      {/* Logística */}
      {tab === 'viagem' && (
        <>
      <div className={styles.field}>
        <label>Informações de Ida:</label>
        {readOnly ? (
          <input
            type="text"
            value={formatDate(form.infoIda)}
            readOnly
            className={styles.readonlyInput}
          />
        ) : (
          <input
            type="date"
            name="infoIda"
            value={form.infoIda}
            onChange={handleChange}
          />
        )}
      </div>
      <div className={styles.field}>
        <label>Informações de Retorno:</label>
        {readOnly ? (
          <input
            type="text"
            value={formatDate(form.infoRetorno)}
            readOnly
            className={styles.readonlyInput}
          />
        ) : (
          <input
            type="date"
            name="infoRetorno"
            value={form.infoRetorno}
            onChange={handleChange}
          />
        )}
      </div>
      <div className={styles.field}>
        <label>Hospedagem Inclusa:</label>
        <div className={styles.checkboxContainer}>
          <input
            type="checkbox"
            name="hospedagemInclusa"
            checked={form.hospedagemInclusa}
            onChange={handleChange}
            disabled={readOnly}
          />
          <span>Sim</span>
        </div>
      </div>

      {form.hospedagemInclusa && (
        <div className={styles.field}>
          <label>Observações da Hospedagem:</label>
          <textarea
            name="enderecoHospedagem"
            value={form.enderecoHospedagem}
            onChange={handleChange}
            placeholder="Digite as observações sobre a hospedagem"
            readOnly={readOnly}
          />
        </div>
      )}

      <div className={styles.field}>
        <label>Passagem Inclusa:</label>
        <div className={styles.checkboxContainer}>
          <input
            type="checkbox"
            name="passagem"
            checked={form.passagem}
            onChange={handleChange}
            disabled={readOnly}
          />
          <span>Sim</span>
        </div>
      </div>

      {form.passagem && (
        <div className={styles.field}>
          <label>Observações da Passagem:</label>
          <textarea
            name="enderecopassagem"
            value={form.enderecopassagem}
            onChange={handleChange}
            placeholder="Digite as observações sobre a passagem"
            readOnly={readOnly}
          />
        </div>
      )}
      </>
      )}

      {/* Venda e Comissão */}
      {tab === 'financeiro' && (
        <>
      <div className={styles.field}>
        <label>Vendida Por:</label>
        <input type="text" name="vendidaPor" value={form.vendidaPor} onChange={handleChange} disabled={readOnly} />
      </div>
      <div className={styles.field}>
        <label>Valor de Venda da Palestra:</label>
        <input
          type="number"
          name="valorVenda"
          value={form.valorVenda || ''}
          onChange={handleChange}
          placeholder="Digite o valor"
          disabled={readOnly}
        />
      </div>
      <div className={styles.field}>
        <label>Valor da Comissão (%):</label>
        <input
          type="number"
          name="valorComissao"
          value={form.valorComissao || ''}
          onChange={handleChange}
          placeholder="Digite o valor"
          disabled={readOnly}
        />
      </div>
      
      <div className={styles.field}>
        <label>Status da Comissão:</label>
        <input type="text" name="statusComissao" value={form.statusComissao} onChange={handleChange} disabled={readOnly} />
      </div>

      {/* Bônus */}
      <div className={styles.field}>
        <label>Valor do Bônus:</label>
        <input
          type="number"
          name="valorBonus"
          value={form.valorBonus || ''}
          onChange={handleChange}
          placeholder="Digite o valor"
          disabled={readOnly}
        />
      </div>
      <div className={styles.field}>
        <label>Data/Pagamento do Bônus:</label>
        {readOnly ? (
          <input
            type="text"
            value={formatDate(form.dataBonus)}
            readOnly
            className={styles.readonlyInput}
          />
        ) : (
          <input
            type="date"
            name="dataBonus"
            value={form.dataBonus}
            onChange={handleChange}
          />
        )}
      </div>
      <div className={styles.field}>
        <label>Status do Bônus:</label>
        <input type="text" name="statusBonus" value={form.statusBonus} onChange={handleChange} disabled={readOnly} />
      </div>

      {/* Nota Fiscal */}
      <div className={styles.field}>
        <label>Data de Emissão da NF:</label>
        {readOnly ? (
          <input
            type="text"
            value={formatDate(form.dataNF)}
            readOnly
            className={styles.readonlyInput}
          />
        ) : (
          <input
            type="date"
            name="dataNF"
            value={form.dataNF}
            onChange={handleChange}
          />
        )}
      </div>
      <div className={styles.field}>
        <label>Número da Nota Fiscal:</label>
        <input type="text" name="numeroNF" value={form.numeroNF} onChange={handleChange} disabled={readOnly} />
      </div>
      <div className={styles.field}>
        <label>Valor da NF Paga:</label>
        <input
          type="number"
          name="valorNFPaga"
          value={form.valorNFPaga || ''}
          onChange={handleChange}
          placeholder="Digite o valor"
          disabled={readOnly}
        />
      </div>
      <div className={styles.field}>
        <label>Valor do Imposto:</label>
        <input
          type="number"
          name="valorImposto"
          value={form.valorImposto || ''}
          onChange={handleChange}
          placeholder="Digite o valor"
          disabled={readOnly}
        />
      </div>

      {/* Pagamento Final */}
      <div className={styles.field}>
        <label>Pagamento do Contratante:</label>
        <select name="pagamentoContratante" value={form.pagamentoContratante} onChange={handleChange} disabled={readOnly}>
          <option value="">Selecione</option>
          <option value="Sim">Sim</option>
          <option value="Não">Não</option>
        </select>
      </div>
      <div className={styles.field}>
        <label>Valor Final Recebido em Conta:</label>
        <input
          type="number"
          name="valorFinalRecebido"
          value={form.valorFinalRecebido || ''}
          onChange={handleChange}
          placeholder="Digite o valor"
          disabled={readOnly}
        />
      </div>
      <div className={styles.field}>
        <label>Custo Final:</label>
        <input
          type="number"
          name="custoFinal"
          value={form.custoFinal || ''}
          onChange={handleChange}
          placeholder="Digite o valor"
          disabled={readOnly}
        />
      </div>

      </>
      )}

      {!readOnly && (
        <button
          type="submit"
          className={styles.button}
          disabled={loading}
        >
          {loading ? 'Salvando...' : 'Salvar Palestra'}
        </button>
      )}
        </form>
      </div>
    </div>
  )
}
