// Sample data for demonstration
const sampleData = {
    transactions: [
        { id: 1, description: 'Salary', amount: 5000, type: 'income', category: 'Salary', date: '2024-04-01' },
        { id: 2, description: 'Rent', amount: -1500, type: 'expense', category: 'Housing', date: '2024-04-02' },
        { id: 3, description: 'Groceries', amount: -200, type: 'expense', category: 'Food', date: '2024-04-03' },
        { id: 4, description: 'Freelance Work', amount: 1000, type: 'income', category: 'Freelance', date: '2024-04-04' },
        { id: 5, description: 'Utilities', amount: -150, type: 'expense', category: 'Utilities', date: '2024-04-05' }
    ],
    budgets: [
        { category: 'Housing', budget: 2000, spent: 1500 },
        { category: 'Food', budget: 500, spent: 200 },
        { category: 'Utilities', budget: 300, spent: 150 },
        { category: 'Entertainment', budget: 200, spent: 50 }
    ],
    notifications: [
        { id: 1, message: 'You\'ve reached 80% of your Food budget', type: 'warning', date: '2024-04-05' },
        { id: 2, message: 'New expense recorded: Rent - $1,500', type: 'info', date: '2024-04-02' },
        { id: 3, message: 'Income received: Salary - $5,000', type: 'success', date: '2024-04-01' }
    ]
};

// Initialize charts when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('expensesPieChart')) {
        initializeCharts();
    }
    if (document.querySelector('.transactions-list')) {
        renderTransactions();
    }
    if (document.querySelector('.budget-categories')) {
        renderBudgetProgress();
    }
    if (document.querySelector('.notifications-list')) {
        renderNotifications();
    }
    initializeMobileMenu();
});

// Initialize Charts
function initializeCharts() {
    // Expense Categories Pie Chart
    const expensesCtx = document.getElementById('expensesPieChart');
    if (expensesCtx) {
        new Chart(expensesCtx, {
            type: 'doughnut',
            data: {
                labels: ['Housing', 'Food', 'Utilities', 'Entertainment'],
                datasets: [{
                    data: [1500, 200, 150, 50],
                    backgroundColor: [
                        '#1D6542',
                        '#123227',
                        '#D2A76B',
                        '#D4CCBF'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#123227',
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    }

    // Income vs Expenses Line Chart
    const incomeExpensesCtx = document.getElementById('incomeExpensesChart');
    if (incomeExpensesCtx) {
        new Chart(incomeExpensesCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    {
                        label: 'Income',
                        data: [4500, 5000, 4800, 6000, 5200, 5500],
                        borderColor: '#1D6542',
                        backgroundColor: 'rgba(29, 101, 66, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Expenses',
                        data: [3000, 3200, 3800, 3500, 3700, 3400],
                        borderColor: '#D2A76B',
                        backgroundColor: 'rgba(210, 167, 107, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#123227',
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#123227',
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        },
                        grid: {
                            color: 'rgba(212, 204, 191, 0.5)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#123227'
                        },
                        grid: {
                            color: 'rgba(212, 204, 191, 0.5)'
                        }
                    }
                }
            }
        });
    }
}

// Render Recent Transactions
function renderTransactions() {
    const transactionsList = document.querySelector('.transactions-list');
    if (!transactionsList) return;

    const transactions = sampleData.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    const transactionsHTML = transactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-title">${transaction.description}</div>
                <div class="transaction-details">${transaction.category} • ${formatDate(transaction.date)}</div>
            </div>
            <div class="transaction-amount ${transaction.type === 'income' ? 'positive' : 'negative'}">
                ${formatCurrency(transaction.amount)}
            </div>
        </div>
    `).join('');

    transactionsList.innerHTML = transactionsHTML;
}

// Render Budget Progress
function renderBudgetProgress() {
    const budgetCategories = document.querySelector('.budget-categories');
    if (!budgetCategories) return;

    const budgets = sampleData.budgets;
    const budgetsHTML = budgets.map(budget => {
        const percentage = (budget.spent / budget.budget) * 100;
        const status = percentage >= 80 ? 'danger' : percentage >= 60 ? 'warning' : 'success';

        return `
            <div class="budget-item">
                <div class="budget-info">
                    <span class="budget-category">${budget.category}</span>
                    <span class="budget-amount">${formatCurrency(budget.spent)} / ${formatCurrency(budget.budget)}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${status}" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }).join('');

    budgetCategories.innerHTML = budgetsHTML;
}

// Render Notifications
function renderNotifications() {
    const notificationsList = document.querySelector('.notifications-list');
    if (!notificationsList) return;

    const notifications = sampleData.notifications;
    const notificationsHTML = notifications.map(notification => `
        <div class="notification-item ${notification.type}">
            <div class="notification-message">${notification.message}</div>
            <div class="notification-date">${formatDate(notification.date)}</div>
        </div>
    `).join('');

    notificationsList.innerHTML = notificationsHTML;
}

// Initialize Mobile Menu
function initializeMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuBtn.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menuBtn.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuBtn.classList.remove('active');
            }
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuBtn.classList.remove('active');
            });
        });
    }
}

// Utility Functions
function formatCurrency(amount) {
    const absAmount = Math.abs(amount);
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(absAmount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// Event Listeners
document.querySelector('.btn.primary').addEventListener('click', () => {
    // TODO: Implement add transaction modal
    alert('Add Transaction functionality will be implemented here');
}); 