import { Palestra } from '../types/Palestra'
import styles from './EventCard.module.css'

interface EventCardProps {
  event: Palestra
  onExcluir: (p: Palestra) => void
  onDetalhes: (p: Palestra) => void
  gray?: boolean
}

export default function EventCard({ event, onExcluir, onDetalhes, gray }: EventCardProps) {
  // Formata data da palestra
  const data = new Date(event.dataMarcada + 'T12:00:00')
  const formattedDate = data
    .toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    .replace(/\//g, '-')

  const confirmada = event.status?.toLowerCase() === 'confirmada'

  return (
    <div className={`${styles.card} ${gray ? styles.gray : ''}`}>
      {event.observacoes && (
        <div className={styles.observacoes}>{event.observacoes}</div>
      )}
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
        <li>
          <span className={styles.icon}>✅</span>
          {confirmada ? 'Confirmada' : 'Não confirmada'}
        </li>
        <li>
          <span className={styles.icon}>📅</span>
          {formattedDate}
          <span className={styles.icon}>🕒</span>
          {event.horarioEvento}
        </li>
        {event.infoIda && (
          <li>
            <span className={styles.icon}>✈️</span>
            Ida: {event.infoIda}
          </li>
        )}
        {event.infoRetorno && (
          <li>
            <span className={styles.icon}>✈️</span>
            Retorno: {event.infoRetorno}
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

