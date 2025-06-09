import styles from './FilterButtons.module.css'

export type Filter = 'todos' | 'proximos' | 'passados'

interface FilterButtonsProps {
  active: Filter
  onChange: (f: Filter) => void
}

export default function FilterButtons({ active, onChange }: FilterButtonsProps) {
  return (
    <div className={styles.filters}>
      <button
        className={`${styles.button} ${active === 'todos' ? styles.activeTodos : ''}`}
        onClick={() => onChange('todos')}
      >
        Todos
      </button>
      <button
        className={`${styles.button} ${active === 'proximos' ? styles.activeProximos : ''}`}
        onClick={() => onChange('proximos')}
      >
        Próximos
      </button>
      <button
        className={`${styles.button} ${active === 'passados' ? styles.activePassados : ''}`}
        onClick={() => onChange('passados')}
      >
        Passados
      </button>
    </div>
  )
}
