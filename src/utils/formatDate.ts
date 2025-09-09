export function formatDate(isoDate: string): string {
  if (!isoDate) return ''
  const date = new Date(isoDate + 'T00:00:00')
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
