<template>
  <div>
    <!-- KPIs Financial -->
    <div class="mb-8">
      <div class="text-overline mb-2 text-primary font-weight-bold">Métricas Financieras</div>
      <v-row dense>
        <v-col v-for="kpi in financialKpis" :key="kpi.title" cols="6" sm="4" md="3">
          <KpiCard v-bind="kpi" />
        </v-col>
      </v-row>
    </div>

    <!-- Charts -->
    <FinancialCharts />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLivestockStore } from '../../stores/livestock'
import { useExpensesStore } from '../../stores/expenses'

import KpiCard from './KpiCard.vue'
import FinancialCharts from './FinancialCharts.vue'
import { formatCurrency } from '../../utils/dashboardHelpers'

const livestockStore = useLivestockStore()
const expensesStore = useExpensesStore()

// ---- KPI COMPUTATIONS (FINANCIAL) ----
const financialKpis = computed(() => {
  const expenses = expensesStore.expenses
  const totalIncome = expenses.filter(e => e.type === 'Ingreso').reduce((acc, e) => acc + e.amount, 0)
  const totalExpense = expenses.filter(e => e.type === 'Gasto').reduce((acc, e) => acc + e.amount, 0)
  const netBalance = totalIncome - totalExpense
  
  const inventoryValue = livestockStore.animals
    .filter(a => a.status === 'Activo')
    .reduce((acc, a) => acc + (a.acquisition_price || 0), 0)
  
  return [
    { title: 'Ingresos Totales', value: formatCurrency(totalIncome), icon: 'mdi-cash-plus', color: 'text-green', iconColor: 'green' },
    { title: 'Gastos Totales', value: formatCurrency(totalExpense), icon: 'mdi-cash-minus', color: 'text-red', iconColor: 'red' },
    { title: 'Balance Neto', value: formatCurrency(netBalance), icon: 'mdi-finance', color: netBalance >= 0 ? 'text-green' : 'text-red', iconColor: netBalance >= 0 ? 'green' : 'red' },
    { title: 'Valor Inventario', value: formatCurrency(inventoryValue), icon: 'mdi-warehouse', color: 'text-orange', iconColor: 'orange' },
  ]
})
</script>
