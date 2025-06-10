import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, query, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore'
import { Palestra } from '../types/Palestra'
import EventCard from './EventCard'
import SearchBar from './SearchBar'
import FilterButtons, { Filter } from './FilterButtons'
import StatsCards from './StatsCards'
import styles from './ListaPalestras.module.css'

interface ListaPalestrasProps {
  onEditar: (p: Palestra) => void
}

export default function ListaPalestras({ onEditar }: ListaPalestrasProps) {
  const [palestras, setPalestras] = useState<Palestra[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('todos')
  const [palestraParaExcluir, setPalestraParaExcluir] = useState<Palestra | null>(null)
  const [confirmacaoTexto, setConfirmacaoTexto] = useState('')
  const [erroConfirmacao, setErroConfirmacao] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'palestras'), orderBy('dataMarcada', 'asc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Palestra[]
      setPalestras(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleExcluirClick = (p: Palestra) => {
    setPalestraParaExcluir(p)
    setConfirmacaoTexto('')
    setErroConfirmacao('')
  }

  const handleConfirmarExclusao = async () => {
    if (!palestraParaExcluir || !palestraParaExcluir.id) return
    const esperado = `EXCLUIR ${palestraParaExcluir.nome.toUpperCase()}`
    if (confirmacaoTexto !== esperado) {
      setErroConfirmacao(`Por favor, digite exatamente: ${esperado}`)
      return
    }
    try {
      await deleteDoc(doc(db, 'palestras', palestraParaExcluir.id))
      setPalestraParaExcluir(null)
    } catch (e) {
      setErroConfirmacao('Erro ao excluir palestra. Tente novamente.')
    }
  }

  const now = new Date()
  const futuros = palestras.filter(p => new Date(p.dataMarcada + 'T00:00:00') >= now).length
  const passados = palestras.length - futuros

  const filtradas = palestras.filter(p => {
    const termo = search.toLowerCase()
    const matches = p.nome.toLowerCase().includes(termo)
    const data = new Date(p.dataMarcada + 'T00:00:00')
    const isFuture = data >= now
    if (filter === 'proximos') return matches && isFuture
    if (filter === 'passados') return matches && !isFuture
    return matches
  })

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <SearchBar value={search} onChange={setSearch} />
        <FilterButtons active={filter} onChange={setFilter} />
      </div>
      <StatsCards total={palestras.length} futuros={futuros} passados={passados} />
      {loading ? (
        <div className={styles.loading}>Carregando...</div>
      ) : (
        <div className={styles.grid}>
          {filtradas.map(p => (
            <EventCard
              key={p.id}
              event={p}
              onEditar={onEditar}
              onExcluir={handleExcluirClick}
              onDetalhes={onEditar}
            />
          ))}
        </div>
      )}

      {palestraParaExcluir && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Confirmar Exclusão</h3>
            <p>Digite EXCLUIR {palestraParaExcluir.nome.toUpperCase()} para confirmar.</p>
            <input value={confirmacaoTexto} onChange={e => setConfirmacaoTexto(e.target.value)} />
            {erroConfirmacao && <p className={styles.erro}>{erroConfirmacao}</p>}
            <div className={styles.modalBotoes}>
              <button onClick={() => setPalestraParaExcluir(null)}>Cancelar</button>
              <button onClick={handleConfirmarExclusao}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
