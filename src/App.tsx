import { useState } from 'react'
import CadastroPalestra from './components/CadastroPalestra'
import ListaPalestras from './components/ListaPalestras'
import Header from './components/Header'
import styles from './App.module.css'
import { Palestra } from './types/Palestra'

function App() {
  const [palestraSelecionada, setPalestraSelecionada] = useState<Palestra | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'editar' | 'detalhes'>('editar')

  const handleDetalhesPalestra = (palestra: Palestra) => {
    setPalestraSelecionada(palestra)
    setModalMode('detalhes')
    setModalOpen(true)
  }

  const enableEditMode = () => {
    setModalMode('editar')
  }

  const handleNovo = () => {
    setPalestraSelecionada(null)
    setModalMode('editar')
    setModalOpen(true)
  }

  return (
    <div className={styles.app}>
      <Header onNovoEvento={handleNovo} />
      <main className={styles.main}>
        <ListaPalestras onDetalhes={handleDetalhesPalestra} />
        <CadastroPalestra
          palestraSelecionada={palestraSelecionada}
          onPalestraSalva={() => setModalOpen(false)}
          modo={modalMode}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onEditar={enableEditMode}
        />
      </main>
    </div>
  )
}

export default App
