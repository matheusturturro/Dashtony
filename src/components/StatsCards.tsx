import styles from './StatsCards.module.css'
import { Filter } from '../types/Filter'

interface StatsCardsProps {
  total: number
  futuros: number
  passados: number
  active: Filter
  onChange: (f: Filter) => void
}

export default function StatsCards({
  total,
  futuros,
  passados,
  active,
  onChange
}: StatsCardsProps) {
  return (
    <div className={styles.cards}>
      <div
        className={`${styles.card} ${styles.total} ${active === 'todos' ? styles.activeTotal : ''}`}
        onClick={() => onChange('todos')}
      >
        Total: {total}
      </div>
      <div
        className={`${styles.card} ${styles.futuro} ${active === 'proximos' ? styles.activeFuturo : ''}`}
        onClick={() => onChange('proximos')}
      >
        Futuros: {futuros}
      </div>
      <div
        className={`${styles.card} ${styles.passado} ${active === 'passados' ? styles.activePassado : ''}`}
        onClick={() => onChange('passados')}
      >
        Passados: {passados}
      </div>
    </div>
  )
}
