import { useState } from 'react'
import styles from './Header.module.css'

interface HeaderProps {
  onNovoEvento: () => void
  viewMode: 'card' | 'list'
  onChangeViewMode: (mode: 'card' | 'list') => void
}

export default function Header({ onNovoEvento, viewMode, onChangeViewMode }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSelect = (mode: 'card' | 'list') => {
    onChangeViewMode(mode)
    setMenuOpen(false)
  }

  return (
    <header className={styles.header}>
      <div className={styles.titleArea}>
        <h1>DashTony</h1>
        <div className={styles.menuWrapper}>
          <button
            className={styles.menuButton}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Alterar modo de visualização"
          >
            ⋮
          </button>
          {menuOpen && (
            <div className={styles.menuDropdown}>
              <button
                className={viewMode === 'card' ? styles.activeOption : ''}
                onClick={() => handleSelect('card')}
              >
                Modo Card
              </button>
              <button
                className={viewMode === 'list' ? styles.activeOption : ''}
                onClick={() => handleSelect('list')}
              >
                Modo Lista
              </button>
            </div>
          )}
        </div>
      </div>
      <button className={styles.newButton} onClick={onNovoEvento}>
        <span className={styles.plus}>+</span> Novo Evento
      </button>
    </header>
  )
}
