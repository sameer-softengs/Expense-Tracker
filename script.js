const addExpenseButton = document.getElementById("add-expense");
const amountInput = document.getElementById("amount");
const categorySelect = document.getElementById("category");
const dateInput = document.getElementById("date");
const expenseList = document.getElementById("expense-list");
const totalExpensesElement = document.getElementById("total-expenses");
const filterCategorySelect = document.getElementById("filter-category");
const currencySelector = document.getElementById("currency-selector");
const currencySymbolElement = document.getElementById("currency-symbol");
const expenseChartCanvas = document.getElementById("expense-chart");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const shareButton = document.getElementById("share-button");
const exportButton = document.getElementById("export-button");

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let categories = ["food", "rent", "education", "entertainment"];
let currentCurrency = "USD";

// Add expense
function addExpense() {
  const amount = parseFloat(amountInput.value);
  const category = categorySelect.value;
  const date = new Date(dateInput.value).toLocaleDateString();

  if (amount && category && date) {
    const expense = { amount, category, date, currency: currentCurrency };
    expenses.push(expense);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    amountInput.value = "";
    dateInput.value = "";
    renderExpenses();
    updateSummary();
  }
}

// Render expenses
function renderExpenses() {
  const filteredExpenses = filterCategorySelect.value === "all"
    ? expenses
    : expenses.filter(expense => expense.category === filterCategorySelect.value);

  expenseList.innerHTML = filteredExpenses.map(expense => `
    <li>
      ${expense.amount} - ${expense.category} - ${expense.date}
      <button onclick="deleteExpense(${expenses.indexOf(expense)})">Delete</button>
    </li>
  `).join('');
}

// Delete expense
function deleteExpense(index) {
  expenses.splice(index, 1);
  localStorage.setItem("expenses", JSON.stringify(expenses));
  renderExpenses();
  updateSummary();
}

// Update summary
function updateSummary() {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  totalExpensesElement.textContent = total.toFixed(2);
  
  const categoryTotals = categories.map(category => ({
    category,
    total: expenses.filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0)
  }));

  const chartData = {
    labels: categories,
    datasets: [{
      data: categoryTotals.map(cat => cat.total),
      backgroundColor: ["#ff6347", "#4caf50", "#ffa500", "#00bfff"],
    }]
  };

  const chartConfig = {
    type: "pie",
    data: chartData,
  };

  new Chart(expenseChartCanvas, chartConfig);
}

// Toggle dark mode
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

// Export expenses as CSV
function exportToCSV() {
  const csvRows = [];
  const headers = ['Amount', 'Category', 'Date', 'Currency'];
  csvRows.push(headers.join(','));

  expenses.forEach(expense => {
    const row = [
      expense.amount,
      expense.category,
      expense.date,
      expense.currency
    ];
    csvRows.push(row.join(','));
  });

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'expenses.csv';
  link.click();
}

// Share monthly summary
function shareSummary() {
  const summary = `Total Expenses: ${totalExpensesElement.textContent} ${currencySymbolElement.textContent}`;
  const shareMessage = `Hey, here's my monthly expense summary: ${summary}`;
  
  if (navigator.share) {
    navigator.share({
      title: 'Monthly Expense Summary',
      text: shareMessage,
      url: window.location.href
    }).catch(error => console.log('Error sharing:', error));
  } else {
    alert('Sharing is not supported on this device.');
  }
}

// Event listeners
addExpenseButton.addEventListener("click", addExpense);
filterCategorySelect.addEventListener("change", renderExpenses);
currencySelector.addEventListener("change", function() {
  currentCurrency = currencySelector.value;
  currencySymbolElement.textContent = currentCurrency === "USD" ? "$" : currentCurrency === "EUR" ? "€" : currentCurrency === "INR" ? "₹" : "Rs" ;
  renderExpenses();
  updateSummary();
});
darkModeToggle.addEventListener("click", toggleDarkMode);
exportButton.addEventListener("click", exportToCSV);
shareButton.addEventListener("click", shareSummary);

// Initial render
renderExpenses();
updateSummary();
