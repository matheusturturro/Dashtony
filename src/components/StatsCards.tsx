import styles from './StatsCards.module.css'

interface Stats {
  total: number
  futuros: number
  passados: number
}

export default function StatsCards({ total, futuros, passados }: Stats) {
  return (
    <div className={styles.cards}>
      <div className={`${styles.card} ${styles.total}`}>Total: {total}</div>
      <div className={`${styles.card} ${styles.futuro}`}>Futuros: {futuros}</div>
      <div className={`${styles.card} ${styles.passado}`}>Passados: {passados}</div>
    </div>
  )
}
