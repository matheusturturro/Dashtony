import { useState } from 'react'
import CadastroPalestra from './components/CadastroPalestra'
import ListaPalestras from './components/ListaPalestras'
import Header from './components/Header'
import styles from './App.module.css'
import { Palestra } from './types/Palestra'

function App() {
  const [palestraSelecionada, setPalestraSelecionada] = useState<Palestra | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleEditarPalestra = (palestra: Palestra) => {
    setPalestraSelecionada(palestra)
    setModalOpen(true)
  }

  const handleNovo = () => {
    setPalestraSelecionada(null)
    setModalOpen(true)
  }

  return (
    <div className={styles.app}>
      <Header onNovoEvento={handleNovo} />
      <main className={styles.main}>
        <ListaPalestras onEditar={handleEditarPalestra} />
        <CadastroPalestra
          palestraSelecionada={palestraSelecionada}
          onPalestraSalva={() => setModalOpen(false)}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      </main>
    </div>
  )
}

export default App
