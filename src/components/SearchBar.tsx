import styles from './SearchBar.module.css'

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className={styles.searchBar}>
      <span className={styles.icon}>🔍</span>
      <input
        type="text"
        placeholder="Buscar eventos..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
