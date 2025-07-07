import { Palestra } from '../types/Palestra'
import styles from './EventCard.module.css'

interface EventCardProps {
  event: Palestra
  onEditar: (p: Palestra) => void
  onExcluir: (p: Palestra) => void
  onDetalhes: (p: Palestra) => void
  gray?: boolean
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

function statusClass(status: string) {
  switch (status.toLowerCase()) {
    case 'cancelada':
      return styles.statusCancelada
    case 'agendada':
      return styles.statusAgendada
    case 'confirmada':
      return styles.statusConfirmada
    default:
      return styles.status
  }
}

export default function EventCard({ event, onEditar, onExcluir, onDetalhes, gray }: EventCardProps) {
  const data = new Date(event.dataMarcada + 'T12:00:00')
  const future = data >= new Date()
  const formattedDate = data
    .toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    .replace(/\//g, '-')
  return (
    <div className={`${styles.card} ${gray ? styles.gray : ''}`}>
      <div className={styles.header}>
        <h3>{event.nome}</h3>
        <span className={`${styles.badge} ${badgeColor(event.tipo)}`}>{event.tipo}</span>
        {event.status && (
          <span className={`${styles.badge} ${statusClass(event.status)}`}>{event.status}</span>
        )}
        {event.agendado && (
          <span className={`${styles.badge} ${styles.agendado}`}>Agendado</span>
        )}
        <span className={`${styles.badge} ${future ? styles.proximo : styles.passado}`}>{future ? 'Próximo' : 'Passado'}</span>
      </div>
      <ul className={styles.info}>
        <li>
          <span className={styles.icon}>📅</span>
          {formattedDate}
          <span className={styles.icon}>🕒</span>
          {event.horarioEvento}
        </li>
        <li><span className={styles.icon}>📍</span>{event.local}</li>
      </ul>
      <div className={styles.financeiro}>
        <div>R$ {event.valorVenda}</div>
        <div className={styles.lucro}>Lucro: R$ {event.lucroFinal}</div>
      </div>
      {event.resumo && (
        <p className={styles.resumo}>{event.resumo}</p>
      )}
      <div className={styles.actions}>
        <button className={styles.details} onClick={() => onDetalhes(event)}>👁️ Ver Detalhes</button>
        <button className={styles.edit} onClick={() => onEditar(event)}>✏️ Editar</button>
        <button className={styles.delete} onClick={() => onExcluir(event)}>🗑️ Excluir</button>
      </div>
    </div>
  )
}
