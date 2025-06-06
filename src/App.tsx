import { useState } from 'react'
import CadastroPalestra from './components/CadastroPalestra'
import ListaPalestras from './components/ListaPalestras'
import styles from './App.module.css'
import { Palestra } from './types/Palestra'

function App() {
  const [palestraSelecionada, setPalestraSelecionada] = useState<Palestra | null>(null)

  const handleEditarPalestra = (palestra: Palestra) => {
    if (palestraSelecionada?.id === palestra.id) {
      setPalestraSelecionada(null)
    } else {
      setPalestraSelecionada(palestra)
    }
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>Gestão de Palestras</h1>
      </header>
      <main className={styles.main}>
        <ListaPalestras onEditar={handleEditarPalestra} />
        <CadastroPalestra
          palestraSelecionada={palestraSelecionada}
          onPalestraSalva={() => setPalestraSelecionada(null)}
        />
      </main>
    </div>
  )
}

export default App
