import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, query, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore'
import { Palestra } from '../types/Palestra'
import styles from './ListaPalestras.module.css'

interface ListaPalestrasProps {
  onEditar: (palestra: Palestra) => void;
}

const formatarData = (dataString: string) => {
  const data = new Date(dataString + 'T12:00:00')
  const dia = data.getDate().toString().padStart(2, '0')
  const mes = (data.getMonth() + 1).toString().padStart(2, '0')
  const ano = data.getFullYear().toString().slice(-2)
  return `${dia}/${mes}/${ano}`
}

export default function ListaPalestras({ onEditar }: ListaPalestrasProps) {
  const [palestras, setPalestras] = useState<Palestra[]>([])
  const [loading, setLoading] = useState(true)
  const [palestraParaExcluir, setPalestraParaExcluir] = useState<Palestra | null>(null)
  const [confirmacaoTexto, setConfirmacaoTexto] = useState('')
  const [erroConfirmacao, setErroConfirmacao] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'palestras'), orderBy('dataMarcada', 'asc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const palestrasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Palestra[]
      setPalestras(palestrasData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleExcluirClick = (palestra: Palestra) => {
    setPalestraParaExcluir(palestra)
    setConfirmacaoTexto('')
    setErroConfirmacao('')
  }

  const handleConfirmarExclusao = async () => {
    if (!palestraParaExcluir || !palestraParaExcluir.id) return

    const textoEsperado = `EXCLUIR ${palestraParaExcluir.nome.toUpperCase()}`
    if (confirmacaoTexto !== textoEsperado) {
      setErroConfirmacao(`Por favor, digite exatamente: ${textoEsperado}`)
      return
    }

    try {
      await deleteDoc(doc(db, 'palestras', palestraParaExcluir.id))
      setPalestraParaExcluir(null)
      setConfirmacaoTexto('')
      setErroConfirmacao('')
    } catch (error) {
      console.error('Erro ao excluir palestra:', error)
      setErroConfirmacao('Erro ao excluir palestra. Tente novamente.')
    }
  }

  if (loading) return <div className={styles.loading}>Carregando...</div>

  return (
    <div className={styles.container}>
      <h2>Palestras Cadastradas</h2>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Data</th>
              <th>Nome</th>
              <th>Local</th>
              <th>Horário</th>
              <th>Nota</th>
              <th>Pagamento</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {palestras.map((palestra) => (
              <tr key={palestra.id}>
                <td>{formatarData(palestra.dataMarcada)}</td>
                <td>{palestra.nome}</td>
                <td>{palestra.local}</td>
                <td>{palestra.horarioEvento}</td>
                <td>{palestra.numeroNF}</td>
                <td>{palestra.pagamentoContratante}</td>
                <td>{palestra.status}</td>
                <td className={styles.acoes}>
                  <button 
                    className={styles.editButton}
                    onClick={() => onEditar(palestra)}
                  >
                    Detalhes
                  </button>
                  <button 
                    className={styles.deleteButton}
                    onClick={() => handleExcluirClick(palestra)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {palestraParaExcluir && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Confirmar Exclusão</h3>
            <p>Você está prestes a excluir a palestra:</p>
            <p className={styles.palestraInfo}>
              <strong>{palestraParaExcluir.nome}</strong> - {formatarData(palestraParaExcluir.dataMarcada)}
            </p>
            <p>Para confirmar a exclusão, digite exatamente:</p>
            <p className={styles.confirmacaoTexto}>
              EXCLUIR {palestraParaExcluir.nome.toUpperCase()}
            </p>
            <input
              type="text"
              value={confirmacaoTexto}
              onChange={(e) => setConfirmacaoTexto(e.target.value)}
              placeholder="Digite o texto de confirmação"
              className={styles.confirmacaoInput}
            />
            {erroConfirmacao && (
              <p className={styles.erro}>{erroConfirmacao}</p>
            )}
            <div className={styles.modalBotoes}>
              <button 
                className={styles.cancelarButton}
                onClick={() => {
                  setPalestraParaExcluir(null)
                  setConfirmacaoTexto('')
                  setErroConfirmacao('')
                }}
              >
                Cancelar
              </button>
              <button 
                className={styles.confirmarButton}
                onClick={handleConfirmarExclusao}
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 