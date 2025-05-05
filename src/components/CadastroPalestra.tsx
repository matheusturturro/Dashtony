// src/components/CadastroPalestra.tsx
import { useState, FormEvent, useEffect } from 'react'
import { db } from '../firebase'
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore'
import { Palestra } from '../types/Palestra'
import styles from './CadastroPalestra.module.css'

interface CadastroPalestraProps {
  palestraSelecionada: Palestra | null;
  onPalestraSalva: () => void;
}

export default function CadastroPalestra({ palestraSelecionada, onPalestraSalva }: CadastroPalestraProps) {
  const [form, setForm] = useState<Palestra>({
    status: '',
    valorVenda: 0,
    lucroFinal: 0,
    nome: '',
    dataMarcada: '',
    horarioEvento: '',
    local: '',
    observacoes: '',
    infoIda: '',
    infoRetorno: '',
    hospedagemInclusa: false,
    enderecoHospedagem: '',
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
  })

  useEffect(() => {
    if (palestraSelecionada) {
      setForm(palestraSelecionada)
    } else {
      // Limpa o formulário quando não há palestra selecionada
      setForm({
        status: '',
        valorVenda: 0,
        lucroFinal: 0,
        nome: '',
        dataMarcada: '',
        horarioEvento: '',
        local: '',
        observacoes: '',
        infoIda: '',
        infoRetorno: '',
        hospedagemInclusa: false,
        enderecoHospedagem: '',
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

    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? target.checked : 
              type === 'number' ? (value === '' ? 0 : Number(value)) : 
              value
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      if (palestraSelecionada) {
        // Atualiza palestra existente
        const palestraData = { ...form }
        delete palestraData.id
        const docRef = doc(collection(db, 'palestras'), palestraSelecionada.id)
        await updateDoc(docRef, palestraData)
      } else {
        // Cria nova palestra
      await addDoc(collection(db, 'palestras'), form)
      alert('Palestra salva!')
      }
      
      // Limpa o formulário
      setForm({
        status: '',
        valorVenda: 0,
        lucroFinal: 0,
        nome: '',
        dataMarcada: '',
        horarioEvento: '',
        local: '',
        observacoes: '',
        infoIda: '',
        infoRetorno: '',
        hospedagemInclusa: false,
        enderecoHospedagem: '',
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
      })
      
      // Notifica o componente pai
      onPalestraSalva()
    } catch (err) {
      console.error(err)
      alert('Erro ao salvar palestra')
    }
  }

  return (
    <form className={`${styles.form} ${palestraSelecionada ? styles.editing : ''}`} onSubmit={handleSubmit}>
      <h2>{palestraSelecionada ? 'Editar Palestra' : 'Nova Palestra'}</h2>
      {/* Bloco Inicial Prioritário */}
      <div className={styles.field}>
        <label>Nome:</label>
        <input type="text" name="nome" value={form.nome} onChange={handleChange} />
      </div>
      <div className={styles.field}><label>Data Marcada:</label>
        <input type="date" name="dataMarcada" value={form.dataMarcada} onChange={handleChange} /></div>
      <div className={styles.field}><label>Status:</label>
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="">Selecione</option>
          <option value="Agendada">Agendada</option>
          <option value="Concluída">Concluída</option>
        </select>
      </div>
      <div className={styles.field}><label>Lucro Final:</label>
        <input type="number" name="lucroFinal" value={form.lucroFinal} onChange={handleChange} /></div>

      {/* Detalhes do Evento */}
      <div className={styles.field}>
        <label>Local:</label>
        <input 
          type="text" 
          name="local" 
          value={form.local} 
          onChange={handleChange}
          placeholder="Digite o local do evento"
        />
      </div>
      <div className={styles.field}>
        <label>Horário do Evento:</label>
        <input type="time" name="horarioEvento" value={form.horarioEvento} onChange={handleChange} />
      </div>
      <div className={styles.field}><label>Observações:</label>
        <textarea name="observacoes" value={form.observacoes} onChange={handleChange} /></div>

      {/* Logística */}
      <div className={styles.field}><label>Informações de Ida:</label>
        <input type="date" name="infoIda" value={form.infoIda} onChange={handleChange} />
        </div>
      <div className={styles.field}><label>Informações de Retorno:</label>
      <input type="date" name="infoRetorno" value={form.infoRetorno} onChange={handleChange} />
        </div>
      <div className={styles.field}>
        <label>Hospedagem Inclusa:</label>
        <div className={styles.checkboxContainer}>
          <input 
            type="checkbox" 
            name="hospedagemInclusa" 
            checked={form.hospedagemInclusa} 
            onChange={handleChange} 
          />
          <span>Sim</span>
        </div>
      </div>
      {form.hospedagemInclusa && (
        <div className={styles.field}>
          <label>Endereço da Hospedagem:</label>
          <input 
            type="text" 
            name="enderecoHospedagem" 
            value={form.enderecoHospedagem} 
            onChange={handleChange}
            placeholder="Digite o endereço da hospedagem"
          />
        </div>
      )}

      {/* Venda e Comissão */}
      <div className={styles.field}><label>Vendida Por:</label>
        <input type="text" name="vendidaPor" value={form.vendidaPor} onChange={handleChange} /></div>
      <div className={styles.field}>
        <label>Valor de Venda da Palestra:</label>
        <input 
          type="number" 
          name="valorVenda" 
          value={form.valorVenda || ''} 
          onChange={handleChange} 
          placeholder="Digite o valor"
        />
      </div>
      <div className={styles.field}><label>Valor da Comissão (%):</label>
      <input 
          type="number" 
          name="valorComissao" 
          value={form.valorComissao || ''} 
          onChange={handleChange} 
          placeholder="Digite o valor"
        /></div>
      
      <div className={styles.field}><label>Status da Comissão:</label>
        <input type="text" name="statusComissao" value={form.statusComissao} onChange={handleChange} /></div>

      {/* Bônus */}
      <div className={styles.field}><label>Valor do Bônus:</label>
      <input 
          type="number" 
          name="valorBonus" 
          value={form.valorBonus || ''} 
          onChange={handleChange} 
          placeholder="Digite o valor"
        /></div>
      <div className={styles.field}><label>Data/Pagamento do Bônus:</label>
        <input type="date" name="dataBonus" value={form.dataBonus} onChange={handleChange} /></div>
      <div className={styles.field}><label>Status do Bônus:</label>
        <input type="text" name="statusBonus" value={form.statusBonus} onChange={handleChange} /></div>

      {/* Nota Fiscal */}
      <div className={styles.field}><label>Data de Emissão da NF:</label>
        <input type="date" name="dataNF" value={form.dataNF} onChange={handleChange} /></div>
      <div className={styles.field}><label>Número da Nota Fiscal:</label>
        <input type="text" name="numeroNF" value={form.numeroNF} onChange={handleChange} /></div>
      <div className={styles.field}><label>Valor da NF Paga:</label>
      <input 
          type="number" 
          name="valorNFPaga" 
          value={form.valorNFPaga || ''} 
          onChange={handleChange} 
          placeholder="Digite o valor"
        /></div>
      <div className={styles.field}><label>Valor do Imposto:</label>
      <input 
          type="number" 
          name="valorImposto" 
          value={form.valorImposto || ''} 
          onChange={handleChange} 
          placeholder="Digite o valor"
        /></div>

      {/* Pagamento Final */}
      <div className={styles.field}><label>Pagamento do Contratante:</label>
        <input type="text" name="pagamentoContratante" value={form.pagamentoContratante} onChange={handleChange} /></div>
      <div className={styles.field}><label>Valor Final Recebido em Conta:</label>
      <input 
          type="number" 
          name="valorFinalRecebido" 
          value={form.valorFinalRecebido || ''} 
          onChange={handleChange} 
          placeholder="Digite o valor"
        /></div>
      <div className={styles.field}><label>Custo Final:</label>
      <input 
          type="number" 
          name="custoFinal" 
          value={form.custoFinal || ''} 
          onChange={handleChange} 
          placeholder="Digite o valor"
        /></div>

      <button type="submit" className={styles.button}>Salvar Palestra</button>
    </form>
  )
}
