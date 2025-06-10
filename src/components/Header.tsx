import styles from './Header.module.css'

interface HeaderProps {
  onNovoEvento: () => void
}

export default function Header({ onNovoEvento }: HeaderProps) {
  return (
    <header className={styles.header}>
      <h1>DashTony</h1>
      <button className={styles.newButton} onClick={onNovoEvento}>
        <span className={styles.plus}>+</span> Novo Evento
      </button>
    </header>
  )
}
