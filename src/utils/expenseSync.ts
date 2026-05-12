import { useExpensesStore } from '../stores/expenses'
import type { Animal, Expense } from '../types'

export const syncAnimalExpenses = async (animalId: string, data: Animal) => {
  const expensesStore = useExpensesStore()

  // 1. Purchase Record
  if (data.acquisition_type === 'Compra' && data.acquisition_price > 0) {
    const existingExpenseId = await expensesStore.findAnimalExpense(animalId, 'Compra')
    if (existingExpenseId) {
      const expense = expensesStore.expenses.find(e => e.id === existingExpenseId)
      if (expense && expense.amount !== data.acquisition_price) {
        if (confirm(`El precio de adquisición cambió. ¿Deseas actualizar el registro de gasto por compra de $${expense.amount} a $${data.acquisition_price}?`)) {
          await expensesStore.updateExpense(existingExpenseId, { 
            amount: data.acquisition_price,
            date: data.acquisition_date
          })
        }
      }
    } else {
      if (confirm(`Has registrado una compra por $${data.acquisition_price}. ¿Deseas crear automáticamente un registro de gasto asociado?`)) {
        const newExpense: Expense = {
          amount: data.acquisition_price,
          date: data.acquisition_date,
          description: `Compra de animal ${data.number} - ${data.name}`,
          category: 'Compra',
          type: 'Gasto',
          scope: 'Individual'
        }
        await expensesStore.addExpense(newExpense, [animalId])
      }
    }
  }

  // 2. Sale Record
  if (data.status === 'Vendido' && data.sale_price && data.sale_price > 0) {
    const existingIncomeId = await expensesStore.findAnimalExpense(animalId, 'Venta')
    if (existingIncomeId) {
      const income = expensesStore.expenses.find(e => e.id === existingIncomeId)
      if (income && income.amount !== data.sale_price) {
        if (confirm(`El precio de venta cambió. ¿Deseas actualizar el registro de ingreso por venta de $${income.amount} a $${data.sale_price}?`)) {
          await expensesStore.updateExpense(existingIncomeId, { 
            amount: data.sale_price,
            date: data.sale_date || new Date().toISOString().split('T')[0]
          })
        }
      }
    } else {
      if (confirm(`Has marcado al animal como vendido por $${data.sale_price}. ¿Deseas crear automáticamente un registro de ingreso asociado?`)) {
        const newIncome: Expense = {
          amount: data.sale_price,
          date: data.sale_date || new Date().toISOString().split('T')[0],
          description: `Venta de animal ${data.number} - ${data.name}`,
          category: 'Venta',
          type: 'Ingreso',
          scope: 'Individual'
        }
        await expensesStore.addExpense(newIncome, [animalId])
      }
    }
  }
}
