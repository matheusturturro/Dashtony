import { Palestra } from '../types/Palestra'
import styles from './EventCard.module.css'
import { formatDate } from '../utils/formatDate'

interface EventCardProps {
  event: Palestra
  onExcluir: (p: Palestra) => void
  onDetalhes: (p: Palestra) => void
  gray?: boolean
}

export default function EventCard({ event, onExcluir, onDetalhes, gray }: EventCardProps) {
  // Formata data da palestra
  const formattedDate = formatDate(event.dataMarcada)

  const statusLower = event.status?.toLowerCase()
  let statusIcon = '🟢'
  let statusClass = 'confirmada'
  let statusText = 'Confirmada'

  if (statusLower === 'cancelada') {
    statusIcon = '🔴'
    statusClass = 'cancelada'
    statusText = 'Cancelada'
  } else if (statusLower === 'agendada' || statusLower === 'nao confirmada' || statusLower === 'não confirmada') {
    statusIcon = '🟡'
    statusClass = 'agendada'
    statusText = 'Agendada'
  }

  return (
    <div className={`${styles.card} ${gray ? styles.gray : ''}`}>
      {event.observacoes && (
        <div className={styles.observacoes}>{event.observacoes}</div>
      )}

      <div className={`${styles.status} ${styles[statusClass]}`}>
        <span className={styles.icon}>{statusIcon}</span>
        {statusText}
      </div>

      <div className={styles.header}>
        <h3>{event.nome}</h3>
        {event.tags && (
          <div className={styles.tags}>
            {event.tags.map(tag => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
        )}
      </div>

      <ul className={styles.info}>
        <li>
          <span className={styles.icon}>🏙️</span>
          {event.cidade ?? event.local}
        </li>
        {event.contratante && (
          <li>
            <span className={styles.icon}>👤</span>
            {event.contratante}
          </li>
        )}
        {event.humanoide && (
          <li>
            <span className={styles.icon}>🤖</span>
            Com tecnologia
          </li>
        )}
        {event.robo && (
          <li>
            <span className={styles.icon}>🤖</span>
            {event.observacoesRobo ? `Robô: ${event.observacoesRobo}` : 'Robô'}
          </li>
        )}
        <li className={styles.dateTime}>
          <span className={styles.icon}>📅</span>
          <time dateTime={event.dataMarcada}>{formattedDate}</time>
          <span className={styles.icon}>🕒</span>
          <time dateTime={event.horarioEvento}>{event.horarioEvento}</time>
        </li>
        {event.infoIda && (
          <li>
            <span className={styles.icon}>✈️</span>
            Ida: {formatDate(event.infoIda)}
          </li>
        )}
        {event.infoRetorno && (
          <li>
            <span className={styles.icon}>✈️</span>
            Retorno: {formatDate(event.infoRetorno)}
          </li>
        )}
      </ul>

      <div className={styles.actions}>
        <button className={styles.details} onClick={() => onDetalhes(event)}>
          👁️ Ver Detalhes
        </button>
        <button className={styles.delete} onClick={() => onExcluir(event)}>
          🗑️ Excluir
        </button>
      </div>
    </div>
  )
}

