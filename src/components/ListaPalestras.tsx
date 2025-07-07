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
  const [monthFilter, setMonthFilter] = useState('')
  const [filterLoading, setFilterLoading] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'palestras'), orderBy('dataMarcada', 'asc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Palestra[]
      setPalestras(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!loading) {
      setFilterLoading(true)
      const t = setTimeout(() => setFilterLoading(false), 300)
      return () => clearTimeout(t)
    }
  }, [search, filter, monthFilter])

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

  let filtradas = palestras.filter(p => {
    const termo = search.toLowerCase()
    const matches = p.nome.toLowerCase().includes(termo)
    const data = new Date(p.dataMarcada + 'T00:00:00')
    const isFuture = data >= now
    if (filter === 'proximos') return matches && isFuture
    if (filter === 'passados') return matches && !isFuture
    return matches
  })

  if (monthFilter) {
    const [year, month] = monthFilter.split('-').map(Number)
    filtradas = filtradas.filter(p => {
      const d = new Date(p.dataMarcada + 'T00:00:00')
      return d.getMonth() + 1 === month && d.getFullYear() === year
    })
  }


  function formatMonthYear(month: number, year: number) {
    return new Date(year, month, 1).toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    })
  }

  const months: { month: number; year: number; eventos: Palestra[] }[] = []
  if (filtradas.length > 0) {
    const first = new Date(filtradas[0].dataMarcada + 'T00:00:00')
    const last = new Date(filtradas[filtradas.length - 1].dataMarcada + 'T00:00:00')
    let current = new Date(first.getFullYear(), first.getMonth(), 1)
    const end = new Date(last.getFullYear(), last.getMonth() + 1, 1)
    while (current <= end) {
      const y = current.getFullYear()
      const m = current.getMonth()
      const eventos = filtradas.filter(e => {
        const d = new Date(e.dataMarcada + 'T00:00:00')
        return d.getFullYear() === y && d.getMonth() === m
      })
      months.push({ month: m, year: y, eventos })
      current = new Date(y, m + 1, 1)
    }
  } else {
    const now = new Date()
    months.push({ month: now.getMonth(), year: now.getFullYear(), eventos: [] })
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    months.push({ month: next.getMonth(), year: next.getFullYear(), eventos: [] })
  }

  let coloredIndex = 0


  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <SearchBar value={search} onChange={setSearch} />
        <FilterButtons active={filter} onChange={setFilter} />
        <div className={styles.monthSelector}>
          <input
            type="month"
            className={styles.monthInput}
            value={monthFilter}
            onChange={e => setMonthFilter(e.target.value)}
            placeholder="Filtrar por mês e ano..."
          />
          {monthFilter && (
            <button className={styles.clearFilter} onClick={() => setMonthFilter('')}>
              Limpar Filtro
            </button>
          )}
        </div>
      </div>
      <StatsCards total={palestras.length} futuros={futuros} passados={passados} />
      {loading ? (
        <div className={styles.loading}>Carregando...</div>
      ) : (
        <div className={filterLoading ? styles.fade : ''}>
          {months.map(({ month, year, eventos }) => {
            let gray = false
            if (eventos.length > 0) {
              gray = coloredIndex % 2 === 1
              coloredIndex++
            }
            return (
              <div
                key={`${year}-${month}`}
                className={styles.monthSection}
              >
                <h2 className={styles.monthTitle}>{formatMonthYear(month, year)}</h2>
                {eventos.length === 0 ? (
                  <p className={styles.emptyMonth}>nada marcado</p>
                ) : (
                  <div className={styles.grid}>
                    {eventos.map(p => (
                      <EventCard
                        key={p.id}
                        event={p}
                        onEditar={onEditar}
                        onExcluir={handleExcluirClick}
                        onDetalhes={onEditar}
                        gray={gray}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
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
