<template>
  <div>
    <!-- Financial Analysis Charts -->
    <div class="mb-8">
      <v-row>
        <v-col cols="12" md="8">
          <v-card border flat class="rounded-xl pa-4 h-100">
            <div class="text-subtitle-1 font-weight-bold mb-4">Flujo de Caja (Ingresos vs Gastos)</div>
            <v-chart class="chart" :option="cashFlowOption" autoresize />
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card border flat class="rounded-xl pa-4 h-100">
            <div class="text-subtitle-1 font-weight-bold mb-4">Gastos por Categoría</div>
            <v-chart class="chart" :option="expensesByCategoryOption" autoresize />
          </v-card>
        </v-col>
      </v-row>
    </div>

    <div class="mb-8">
      <v-row>
        <v-col cols="12" md="6">
          <v-card border flat class="rounded-xl pa-4 h-100">
            <div class="text-subtitle-1 font-weight-bold mb-4">Ingresos vs Gastos Totales</div>
            <v-chart class="chart" :option="incomeVsExpenseOption" autoresize />
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card border flat class="rounded-xl pa-4 h-100">
            <div class="text-subtitle-1 font-weight-bold mb-4">Valor del Inventario Activo</div>
            <v-chart class="chart" :option="inventoryValueOption" autoresize />
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLivestockStore } from '../../stores/livestock'
import { useExpensesStore } from '../../stores/expenses'
import VChart from 'vue-echarts'

const livestockStore = useLivestockStore()
const expensesStore = useExpensesStore()

// ---- CHARTS LOGIC (FINANCIAL) ----

const cashFlowOption = computed(() => {
  const expenses = expensesStore.expenses
  const incomesByMonth: Record<string, number> = {}
  const expensesByMonth: Record<string, number> = {}
  
  expenses.forEach(e => {
    const d = new Date(e.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (e.type === 'Ingreso') incomesByMonth[key] = (incomesByMonth[key] || 0) + e.amount
    else expensesByMonth[key] = (expensesByMonth[key] || 0) + e.amount
  })
  
  const allMonths = [...new Set([...Object.keys(incomesByMonth), ...Object.keys(expensesByMonth)])].sort()
  
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Ingresos', 'Gastos'] },
    xAxis: { type: 'category', data: allMonths },
    yAxis: { type: 'value' },
    series: [
      { name: 'Ingresos', type: 'bar', data: allMonths.map(m => incomesByMonth[m] || 0), itemStyle: { color: '#66bb6a' } },
      { name: 'Gastos', type: 'bar', data: allMonths.map(m => expensesByMonth[m] || 0), itemStyle: { color: '#ef5350' } }
    ]
  }
})

const expensesByCategoryOption = computed(() => {
  const categories: Record<string, number> = {}
  expensesStore.expenses.filter(e => e.type === 'Gasto').forEach(e => {
    categories[e.category] = (categories[e.category] || 0) + e.amount
  })
  
  return {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: '60%',
      data: Object.entries(categories).map(([name, value]) => ({ name, value }))
    }]
  }
})

const incomeVsExpenseOption = computed(() => {
  const totalIncome = expensesStore.expenses.filter(e => e.type === 'Ingreso').reduce((acc, e) => acc + e.amount, 0)
  const totalExpense = expensesStore.expenses.filter(e => e.type === 'Gasto').reduce((acc, e) => acc + e.amount, 0)
  
  return {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        { value: totalIncome, name: 'Ingresos', itemStyle: { color: '#66bb6a' } },
        { value: totalExpense, name: 'Gastos', itemStyle: { color: '#ef5350' } }
      ]
    }]
  }
})

const inventoryValueOption = computed(() => {
  const animals = livestockStore.animals.filter(a => a.status === 'Activo')
  const valuesByMonth: Record<string, number> = {}
  
  animals.forEach(a => {
    if (!a.acquisition_date) return
    const d = new Date(a.acquisition_date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    valuesByMonth[key] = (valuesByMonth[key] || 0) + (a.acquisition_price || 0)
  })
  
  const months = Object.keys(valuesByMonth).sort()
  let runningTotal = 0
  const cumulativeData = months.map(m => {
    runningTotal += valuesByMonth[m]
    return runningTotal
  })
  
  return {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: months },
    yAxis: { type: 'value' },
    series: [{ data: cumulativeData, type: 'line', areaStyle: {}, itemStyle: { color: '#ff9800' } }]
  }
})
</script>

<style scoped>
.chart {
  height: 350px;
}
</style>
