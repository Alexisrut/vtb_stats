// Financial Model Data
const revenueData = {
  q1_2025: {
    jan: { registered: 50, growth: 0 },
    feb: { registered: 100, growth: 1 },
    mar: { registered: 200, growth: 1 }
  },
  q2_2025: {
    apr: { registered: 300, growth: 0.5 },
    may: { registered: 500, growth: 0.67 },
    jun: { registered: 800, growth: 0.6 }
  },
  q3_2025: {
    jul: { registered: 1200, growth: 0.5 },
    aug: { registered: 1600, growth: 0.33 },
    sep: { registered: 2000, growth: 0.25 }
  },
  q4_2025: {
    oct: { registered: 2800, growth: 0.4 },
    nov: { registered: 3800, growth: 0.36 },
    dec: { registered: 5000, growth: 0.31 }
  },
  q1_2026: {
    jan: { registered: 6500, growth: 0.3 },
    feb: { registered: 8000, growth: 0.23 },
    mar: { registered: 10000, growth: 0.25 }
  },
  q2_2026: {
    apr: { registered: 12500, growth: 0.25 },
    may: { registered: 15500, growth: 0.24 },
    jun: { registered: 20000, growth: 0.29 }
  },
  q3_2026: {
    jul: { registered: 25000, growth: 0.25 },
    aug: { registered: 30000, growth: 0.2 },
    sep: { registered: 35000, growth: 0.167 }
  },
  q4_2026: {
    oct: { registered: 40000, growth: 0.143 },
    nov: { registered: 45000, growth: 0.125 },
    dec: { registered: 50000, growth: 0.111 }
  }
};

const expenseStructure = {
  q1: { salaries: 500000, infra: 25000, api: 10000, marketing: 50000, licenses: 16000, security: 20000, office: 0, capex: 300000 },
  q2: { salaries: 650000, infra: 30000, api: 20000, marketing: 100000, licenses: 16000, security: 20000, office: 40000, capex: 200000 },
  q3: { salaries: 800000, infra: 40000, api: 30000, marketing: 150000, licenses: 16000, security: 20000, office: 40000, capex: 150000 },
  q4: { salaries: 950000, infra: 50000, api: 30000, marketing: 200000, licenses: 16000, security: 20000, office: 40000, capex: 100000 }
};

const pricing = {
  free: 0,
  basic: 990,
  pro: 2490
};

const conversionRates = {
  registered_to_connected: 0.5,
  connected_to_free: 0.7,
  connected_to_basic: 0.2,
  connected_to_pro: 0.1,
  churn_rate: 0.06
};

// Generate months array
const months = [];
const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
for (let year = 2025; year <= 2026; year++) {
  for (let month = 0; month < 12; month++) {
    months.push({ name: `${monthNames[month]} ${year}`, month, year });
  }
}

// Calculate all data
let calculatedData = [];
let previousMRR = 0;

months.forEach((monthInfo, index) => {
  const quarterMap = [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4];
  const quarter = `q${quarterMap[monthInfo.month]}_${monthInfo.year}`;
  const monthKey = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'][monthInfo.month];
  
  const registered = revenueData[quarter][monthKey].registered;
  const connected = Math.round(registered * conversionRates.registered_to_connected);
  const freeUsers = Math.round(connected * conversionRates.connected_to_free);
  const basicUsers = Math.round(connected * conversionRates.connected_to_basic);
  const proUsers = Math.round(connected * conversionRates.connected_to_pro);
  
  const basicRevenue = basicUsers * pricing.basic;
  const proRevenue = proUsers * pricing.pro;
  const enterpriseRevenue = Math.round(registered * 5); // Small enterprise component
  const totalMRR = basicRevenue + proRevenue + enterpriseRevenue;
  const partnerCommission = Math.round(totalMRR * 0.08);
  const totalRevenue = totalMRR + partnerCommission;
  
  // Expenses
  const expenseQuarter = `q${quarterMap[monthInfo.month]}`;
  const expenses = expenseStructure[expenseQuarter];
  const totalOPEX = expenses.salaries + expenses.infra + expenses.api + expenses.marketing + 
                    expenses.licenses + expenses.security + expenses.office;
  const totalCAPEX = expenses.capex;
  const totalExpenses = totalOPEX + totalCAPEX;
  
  // P&L
  const ebitda = totalRevenue - totalExpenses;
  const ebitdaMargin = totalRevenue > 0 ? (ebitda / totalRevenue * 100) : 0;
  const cumulativeEbitda = index === 0 ? ebitda : calculatedData[index - 1].cumulativeEbitda + ebitda;
  
  // Metrics
  const newPaidUsers = index === 0 ? (basicUsers + proUsers) : (basicUsers + proUsers) - (calculatedData[index - 1].basicUsers + calculatedData[index - 1].proUsers);
  const cac = newPaidUsers > 0 ? expenses.marketing / newPaidUsers : 0;
  const arpu = connected > 0 ? totalRevenue / connected : 0;
  const ltv = conversionRates.churn_rate > 0 ? (arpu * 12) / conversionRates.churn_rate : 0;
  const ltvCacRatio = cac > 0 ? ltv / cac : 0;
  const mrrGrowth = previousMRR > 0 ? ((totalMRR - previousMRR) / previousMRR * 100) : 0;
  
  previousMRR = totalMRR;
  
  calculatedData.push({
    month: monthInfo.name,
    registered,
    connected,
    freeUsers,
    basicUsers,
    proUsers,
    basicRevenue,
    proRevenue,
    enterpriseRevenue,
    partnerCommission,
    totalMRR,
    totalRevenue,
    salaries: expenses.salaries,
    infra: expenses.infra,
    api: expenses.api,
    marketing: expenses.marketing,
    licenses: expenses.licenses,
    security: expenses.security,
    office: expenses.office,
    totalOPEX,
    totalCAPEX,
    totalExpenses,
    ebitda,
    ebitdaMargin,
    cumulativeEbitda,
    cac,
    ltv,
    ltvCacRatio,
    mau: connected,
    churnRate: conversionRates.churn_rate * 100,
    mrr: totalMRR,
    mrrGrowth,
    arpu
  });
});

// Format currency
function formatCurrency(value) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

function formatNumber(value) {
  return new Intl.NumberFormat('ru-RU').format(Math.round(value));
}

function formatPercent(value) {
  return `${value.toFixed(1)}%`;
}

function getCssClass(value) {
  if (value > 0) return 'positive';
  if (value < 0) return 'negative';
  return '';
}

// Build tables
function buildRevenueTable() {
  const table = document.getElementById('revenueTable');
  let html = `
    <thead>
      <tr>
        <th>Месяц</th>
        <th>Registered Users</th>
        <th>Connected Users</th>
        <th>Free Users</th>
        <th>Basic Users</th>
        <th>Pro Users</th>
        <th>Basic Revenue (₽)</th>
        <th>Pro Revenue (₽)</th>
        <th>Enterprise Revenue (₽)</th>
        <th>Partner Commission (₽)</th>
        <th>Total MRR (₽)</th>
      </tr>
    </thead>
    <tbody>
  `;
  
  calculatedData.forEach(row => {
    html += `
      <tr>
        <td>${row.month}</td>
        <td class="number">${formatNumber(row.registered)}</td>
        <td class="number">${formatNumber(row.connected)}</td>
        <td class="number">${formatNumber(row.freeUsers)}</td>
        <td class="number">${formatNumber(row.basicUsers)}</td>
        <td class="number">${formatNumber(row.proUsers)}</td>
        <td class="number ${getCssClass(row.basicRevenue)}">${formatCurrency(row.basicRevenue)}</td>
        <td class="number ${getCssClass(row.proRevenue)}">${formatCurrency(row.proRevenue)}</td>
        <td class="number ${getCssClass(row.enterpriseRevenue)}">${formatCurrency(row.enterpriseRevenue)}</td>
        <td class="number ${getCssClass(row.partnerCommission)}">${formatCurrency(row.partnerCommission)}</td>
        <td class="number ${getCssClass(row.totalMRR)}">${formatCurrency(row.totalMRR)}</td>
      </tr>
    `;
  });
  
  html += '</tbody>';
  table.innerHTML = html;
}

function buildExpensesTable() {
  const table = document.getElementById('expensesTable');
  let html = `
    <thead>
      <tr>
        <th>Месяц</th>
        <th>Зарплаты (₽)</th>
        <th>Инфраструктура (₽)</th>
        <th>API Банков (₽)</th>
        <th>Маркетинг (₽)</th>
        <th>Лицензии (₽)</th>
        <th>Security (₽)</th>
        <th>Офис (₽)</th>
        <th>Total OPEX (₽)</th>
        <th>Разработка (₽)</th>
        <th>Total CAPEX (₽)</th>
        <th>Total Expenses (₽)</th>
      </tr>
    </thead>
    <tbody>
  `;
  
  calculatedData.forEach(row => {
    html += `
      <tr>
        <td>${row.month}</td>
        <td class="number negative">${formatCurrency(row.salaries)}</td>
        <td class="number negative">${formatCurrency(row.infra)}</td>
        <td class="number negative">${formatCurrency(row.api)}</td>
        <td class="number negative">${formatCurrency(row.marketing)}</td>
        <td class="number negative">${formatCurrency(row.licenses)}</td>
        <td class="number negative">${formatCurrency(row.security)}</td>
        <td class="number negative">${formatCurrency(row.office)}</td>
        <td class="number negative">${formatCurrency(row.totalOPEX)}</td>
        <td class="number negative">${formatCurrency(row.totalCAPEX)}</td>
        <td class="number negative">${formatCurrency(row.totalCAPEX)}</td>
        <td class="number negative">${formatCurrency(row.totalExpenses)}</td>
      </tr>
    `;
  });
  
  html += '</tbody>';
  table.innerHTML = html;
}

function buildPLTable() {
  const table = document.getElementById('plTable');
  let html = `
    <thead>
      <tr>
        <th>Месяц</th>
        <th>Total Revenue (₽)</th>
        <th>Total Expenses (₽)</th>
        <th>EBITDA (₽)</th>
        <th>EBITDA Margin (%)</th>
        <th>Cumulative EBITDA (₽)</th>
      </tr>
    </thead>
    <tbody>
  `;
  
  calculatedData.forEach(row => {
    html += `
      <tr>
        <td>${row.month}</td>
        <td class="number positive">${formatCurrency(row.totalRevenue)}</td>
        <td class="number negative">${formatCurrency(row.totalExpenses)}</td>
        <td class="number ${getCssClass(row.ebitda)}">${formatCurrency(row.ebitda)}</td>
        <td class="number ${getCssClass(row.ebitdaMargin)}">${formatPercent(row.ebitdaMargin)}</td>
        <td class="number ${getCssClass(row.cumulativeEbitda)}">${formatCurrency(row.cumulativeEbitda)}</td>
      </tr>
    `;
  });
  
  html += '</tbody>';
  table.innerHTML = html;
}

function buildMetricsTable() {
  const table = document.getElementById('metricsTable');
  let html = `
    <thead>
      <tr>
        <th>Месяц</th>
        <th>CAC (₽)</th>
        <th>LTV (₽)</th>
        <th>LTV/CAC Ratio</th>
        <th>MAU</th>
        <th>Churn Rate (%)</th>
        <th>MRR (₽)</th>
        <th>MRR Growth (%)</th>
        <th>ARPU (₽)</th>
      </tr>
    </thead>
    <tbody>
  `;
  
  calculatedData.forEach(row => {
    html += `
      <tr>
        <td>${row.month}</td>
        <td class="number">${formatCurrency(row.cac)}</td>
        <td class="number positive">${formatCurrency(row.ltv)}</td>
        <td class="number ${row.ltvCacRatio >= 3 ? 'positive' : ''}">${row.ltvCacRatio.toFixed(2)}</td>
        <td class="number">${formatNumber(row.mau)}</td>
        <td class="number">${formatPercent(row.churnRate)}</td>
        <td class="number positive">${formatCurrency(row.mrr)}</td>
        <td class="number ${getCssClass(row.mrrGrowth)}">${formatPercent(row.mrrGrowth)}</td>
        <td class="number">${formatCurrency(row.arpu)}</td>
      </tr>
    `;
  });
  
  html += '</tbody>';
  table.innerHTML = html;
}

// Build summary cards
function buildSummaryCards() {
  const container = document.getElementById('summary-container');
  const lastMonth = calculatedData[calculatedData.length - 1];
  const firstMonth = calculatedData[0];
  
  const totalRevenue = calculatedData.reduce((sum, row) => sum + row.totalRevenue, 0);
  const totalExpenses = calculatedData.reduce((sum, row) => sum + row.totalExpenses, 0);
  const finalEbitda = lastMonth.cumulativeEbitda;
  
  container.innerHTML = `
    <div class="summary-card">
      <h3>Всего пользователей</h3>
      <div class="value positive">${formatNumber(lastMonth.registered)}</div>
    </div>
    <div class="summary-card">
      <h3>Платных пользователей</h3>
      <div class="value positive">${formatNumber(lastMonth.basicUsers + lastMonth.proUsers)}</div>
    </div>
    <div class="summary-card">
      <h3>Общий доход</h3>
      <div class="value positive">${formatCurrency(totalRevenue)}</div>
    </div>
    <div class="summary-card">
      <h3>Общие расходы</h3>
      <div class="value negative">${formatCurrency(totalExpenses)}</div>
    </div>
    <div class="summary-card">
      <h3>Итоговый EBITDA</h3>
      <div class="value ${getCssClass(finalEbitda)}">${formatCurrency(finalEbitda)}</div>
    </div>
    <div class="summary-card">
      <h3>LTV/CAC Ratio</h3>
      <div class="value ${lastMonth.ltvCacRatio >= 3 ? 'positive' : ''}">${lastMonth.ltvCacRatio.toFixed(2)}</div>
    </div>
  `;
}

// Build charts
let revenueChart, expensesChart, plChart, metricsChart;

function buildRevenueChart() {
  const ctx = document.getElementById('revenueChart').getContext('2d');
  const labels = calculatedData.map(row => row.month.split(' ')[0]);
  
  if (revenueChart) revenueChart.destroy();
  
  revenueChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Total Revenue',
          data: calculatedData.map(row => row.totalRevenue),
          borderColor: '#21808D',
          backgroundColor: 'rgba(33, 128, 141, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Basic Users',
          data: calculatedData.map(row => row.basicUsers * 100),
          borderColor: '#FFC185',
          backgroundColor: 'rgba(255, 193, 133, 0.1)',
          tension: 0.4,
          yAxisID: 'y1'
        },
        {
          label: 'Pro Users',
          data: calculatedData.map(row => row.proUsers * 100),
          borderColor: '#B4413C',
          backgroundColor: 'rgba(180, 65, 60, 0.1)',
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Рост доходов и пользователей',
          font: { size: 16, weight: 'bold' }
        },
        legend: { position: 'top' }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: { display: true, text: 'Доход (₽)' }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: { display: true, text: 'Пользователи (x100)' },
          grid: { drawOnChartArea: false }
        }
      }
    }
  });
}

function buildExpensesChart() {
  const ctx = document.getElementById('expensesChart').getContext('2d');
  const labels = calculatedData.map(row => row.month.split(' ')[0]);
  
  if (expensesChart) expensesChart.destroy();
  
  expensesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Зарплаты',
          data: calculatedData.map(row => row.salaries),
          backgroundColor: '#1FB8CD'
        },
        {
          label: 'Маркетинг',
          data: calculatedData.map(row => row.marketing),
          backgroundColor: '#FFC185'
        },
        {
          label: 'Инфраструктура',
          data: calculatedData.map(row => row.infra),
          backgroundColor: '#B4413C'
        },
        {
          label: 'API Банков',
          data: calculatedData.map(row => row.api),
          backgroundColor: '#5D878F'
        },
        {
          label: 'Прочее',
          data: calculatedData.map(row => row.licenses + row.security + row.office),
          backgroundColor: '#D2BA4C'
        },
        {
          label: 'CAPEX',
          data: calculatedData.map(row => row.totalCAPEX),
          backgroundColor: '#944454'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Структура расходов по месяцам',
          font: { size: 16, weight: 'bold' }
        },
        legend: { position: 'top' }
      },
      scales: {
        x: { stacked: true },
        y: {
          stacked: true,
          title: { display: true, text: 'Расходы (₽)' }
        }
      }
    }
  });
}

function buildPLChart() {
  const ctx = document.getElementById('plChart').getContext('2d');
  const labels = calculatedData.map(row => row.month.split(' ')[0]);
  
  if (plChart) plChart.destroy();
  
  plChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Total Revenue',
          data: calculatedData.map(row => row.totalRevenue),
          borderColor: '#21808D',
          backgroundColor: 'rgba(33, 128, 141, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Total Expenses',
          data: calculatedData.map(row => row.totalExpenses),
          borderColor: '#C0152F',
          backgroundColor: 'rgba(192, 21, 47, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'EBITDA',
          data: calculatedData.map(row => row.ebitda),
          borderColor: '#D2BA4C',
          backgroundColor: 'rgba(210, 186, 76, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Cumulative EBITDA',
          data: calculatedData.map(row => row.cumulativeEbitda),
          borderColor: '#5D878F',
          backgroundColor: 'rgba(93, 135, 143, 0.1)',
          tension: 0.4,
          borderWidth: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'P&L: Путь к прибыльности',
          font: { size: 16, weight: 'bold' }
        },
        legend: { position: 'top' }
      },
      scales: {
        y: {
          title: { display: true, text: 'Сумма (₽)' }
        }
      }
    }
  });
}

function buildMetricsChart() {
  const ctx = document.getElementById('metricsChart').getContext('2d');
  const labels = calculatedData.map(row => row.month.split(' ')[0]);
  
  if (metricsChart) metricsChart.destroy();
  
  metricsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'MRR Growth %',
          data: calculatedData.map(row => row.mrrGrowth),
          borderColor: '#21808D',
          backgroundColor: 'rgba(33, 128, 141, 0.1)',
          tension: 0.4,
          yAxisID: 'y'
        },
        {
          label: 'LTV/CAC Ratio',
          data: calculatedData.map(row => row.ltvCacRatio),
          borderColor: '#B4413C',
          backgroundColor: 'rgba(180, 65, 60, 0.1)',
          tension: 0.4,
          yAxisID: 'y1'
        },
        {
          label: 'EBITDA Margin %',
          data: calculatedData.map(row => row.ebitdaMargin),
          borderColor: '#D2BA4C',
          backgroundColor: 'rgba(210, 186, 76, 0.1)',
          tension: 0.4,
          yAxisID: 'y'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Ключевые метрики эффективности',
          font: { size: 16, weight: 'bold' }
        },
        legend: { position: 'top' }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: { display: true, text: 'Проценты (%)' }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: { display: true, text: 'LTV/CAC Ratio' },
          grid: { drawOnChartArea: false }
        }
      }
    }
  });
}

// Tab switching
function switchTab(tabName) {
  const tabs = document.querySelectorAll('.tab');
  const contents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => tab.classList.remove('active'));
  contents.forEach(content => content.classList.remove('active'));
  
  event.target.classList.add('active');
  document.getElementById(tabName).classList.add('active');
  
  // Rebuild chart for active tab
  if (tabName === 'revenue' && !revenueChart) buildRevenueChart();
  if (tabName === 'expenses' && !expensesChart) buildExpensesChart();
  if (tabName === 'pl' && !plChart) buildPLChart();
  if (tabName === 'metrics' && !metricsChart) buildMetricsChart();
}

// Initialize
function init() {
  buildSummaryCards();
  buildRevenueTable();
  buildExpensesTable();
  buildPLTable();
  buildMetricsTable();
  buildRevenueChart();
}

init();