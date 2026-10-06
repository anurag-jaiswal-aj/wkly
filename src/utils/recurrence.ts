export const calculateNextDate = (currentDate: string, recurrence: string): string => {
  const date = new Date(currentDate)
  
  switch (recurrence) {
    case 'daily':
      date.setDate(date.getDate() + 1)
      break
    case 'weekly':
      date.setDate(date.getDate() + 7)
      break
    case 'biweekly':
      date.setDate(date.getDate() + 14)
      break
    case 'monthly':
      date.setMonth(date.getMonth() + 1)
      break
  }
  
  return date.toISOString().split('T')[0]
}
