export const calculateAgeMonths = (dob: string | null | undefined, endDate: Date = new Date()) => {
  if (!dob) return 0
  const birth = new Date(dob)
  const diffTime = endDate.getTime() - birth.getTime()
  if (diffTime < 0) return 0
  const diffDays = diffTime / (1000 * 60 * 60 * 24)
  return Math.floor(diffDays / 30.44)
}

export const calculateAgeDays = (dob: string | null | undefined, endDate: Date = new Date()) => {
  if (!dob) return 0
  const birth = new Date(dob)
  const diffTime = endDate.getTime() - birth.getTime()
  if (diffTime < 0) return 0
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)
}
