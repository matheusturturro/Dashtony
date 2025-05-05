import { useEffect } from 'react'
import { db } from './firebase'
import { collection, getDocs } from 'firebase/firestore'

export default function TesteFirestore() {
  useEffect(() => {
    async function buscar() {
      const snapshot = await getDocs(collection(db, 'teste'))
      snapshot.forEach(doc => console.log(doc.id, '=>', doc.data()))
    }
    buscar()
  }, [])

  return <h1>Testando Firestore — veja o console</h1>
}
