import { Palestra } from '../types/Palestra'
import styles from './EventCard.module.css'

interface EventCardProps {
  event: Palestra
  onEditar: (p: Palestra) => void
  onExcluir: (p: Palestra) => void
  onDetalhes: (p: Palestra) => void
}

function badgeColor(tipo: string) {
  switch (tipo) {
    case 'curso':
      return styles.curso
    case 'outro':
      return styles.outro
    default:
      return styles.palestra
  }
}

export default function EventCard({ event, onEditar, onExcluir, onDetalhes }: EventCardProps) {
  const data = new Date(event.dataMarcada + 'T12:00:00')
  const future = data >= new Date()
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>{event.nome}</h3>
        <span className={`${styles.badge} ${badgeColor(event.tipo)}`}>{event.tipo}</span>
        {event.agendado && <span className={`${styles.badge} ${styles.agendado}`}>Agendado</span>}
        <span className={`${styles.badge} ${future ? styles.proximo : styles.passado}`}>{future ? 'Próximo' : 'Passado'}</span>
      </div>
      <ul className={styles.info}>
        <li><span className={styles.icon}>📅</span>{event.dataMarcada} {event.horarioEvento}</li>
        <li><span className={styles.icon}>📍</span>{event.local}</li>
        <li><span className={styles.icon}>🏷️</span>{event.tipo}</li>
      </ul>
      <div className={styles.financeiro}>
        <div>R$ {event.valorVenda}</div>
        <div className={styles.lucro}>Lucro: R$ {event.lucroFinal}</div>
      </div>
      <div className={styles.actions}>
        <button className={styles.details} onClick={() => onDetalhes(event)}>👁️ Ver Detalhes</button>
        <button className={styles.edit} onClick={() => onEditar(event)}>✏️ Editar</button>
        <button className={styles.delete} onClick={() => onExcluir(event)}>🗑️ Excluir</button>
      </div>
      {event.resumo && (
        <div className={styles.resumo}>{event.resumo}</div>
      )}
    </div>
  )
}
