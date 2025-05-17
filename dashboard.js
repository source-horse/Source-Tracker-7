// Update current date
document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
});

// Initialize Charts
const initializeCharts = () => {
    // Income vs Expenses Chart
    const incomeExpenseCtx = document.getElementById('incomeExpenseChart').getContext('2d');
    const incomeExpenseChart = new Chart(incomeExpenseCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'Income',
                    data: [4500, 5200, 4800, 5600, 6200, 6200],
                    backgroundColor: '#28a745',
                    borderRadius: 4
                },
                {
                    label: 'Expenses',
                    data: [3200, 3800, 3500, 4200, 3850, 3850],
                    backgroundColor: '#dc3545',
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => '$' + value.toLocaleString()
                    }
                }
            }
        }
    });

    // Spending by Category Chart
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    const categoryChart = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: ['Housing', 'Food', 'Transportation', 'Utilities', 'Entertainment', 'Others'],
            datasets: [{
                data: [1800, 850, 450, 350, 250, 150],
                backgroundColor: [
                    '#1D6542',
                    '#28a745',
                    '#D2A76B',
                    '#123227',
                    '#D4CCBF',
                    '#6c757d'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            },
            cutout: '70%'
        }
    });

    // Update charts when period changes
    document.getElementById('chartPeriod').addEventListener('change', (e) => {
        // Update income vs expenses chart data based on selected period
        // This would typically fetch data from your backend
        console.log('Chart period changed:', e.target.value);
    });

    document.getElementById('categoryPeriod').addEventListener('change', (e) => {
        // Update category chart data based on selected period
        // This would typically fetch data from your backend
        console.log('Category period changed:', e.target.value);
    });
};

// Handle Quick Add Transaction
document.getElementById('addTransactionBtn').addEventListener('click', () => {
    // Redirect to transactions page with modal open
    window.location.href = 'transactions.html?action=add';
});

// Handle Export Report
document.getElementById('exportBtn').addEventListener('click', () => {
    // This would typically generate and download a report
    console.log('Exporting report...');
    alert('Report export feature coming soon!');
});

// Budget Data
const budgetData = {
    categories: [
        {
            name: "Groceries",
            budget: 500,
            spent: 350,
            id: "groceries"
        },
        {
            name: "Entertainment",
            budget: 200,
            spent: 180,
            id: "entertainment"
        },
        {
            name: "Utilities",
            budget: 300,
            spent: 120,
            id: "utilities"
        },
        {
            name: "Rent",
            budget: 2000,
            spent: 2000,
            id: "rent"
        },
        {
            name: "Transportation",
            budget: 400,
            spent: 250,
            id: "transportation"
        }
    ],
    totalBudget: 3400,
    totalSpent: 2900
};

// Function to render budget progress
function renderBudgetProgress() {
    const progressGrid = document.querySelector('.progress-grid');
    if (!progressGrid) return;

    // Clear existing content
    progressGrid.innerHTML = '';

    // Sort categories by percentage spent (highest to lowest)
    const sortedCategories = [...budgetData.categories].sort((a, b) => {
        const percentA = (a.spent / a.budget) * 100;
        const percentB = (b.spent / b.budget) * 100;
        return percentB - percentA;
    });

    // Take top 3 categories
    const topCategories = sortedCategories.slice(0, 3);

    // Render each category
    topCategories.forEach(category => {
        const percentage = (category.spent / category.budget) * 100;
        const progressClass = percentage >= 90 ? 'warning' : '';
        
        const categoryElement = document.createElement('div');
        categoryElement.className = 'progress-item';
        categoryElement.innerHTML = `
            <div class="progress-header">
                <h4>${category.name}</h4>
                <span>$${category.spent.toLocaleString()}/$${category.budget.toLocaleString()}</span>
            </div>
            <div class="progress-bar ${progressClass}">
                <div class="progress" style="width: ${Math.min(percentage, 100)}%"></div>
            </div>
            <p class="progress-status">${Math.round(percentage)}% spent</p>
        `;
        
        progressGrid.appendChild(categoryElement);
    });
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    renderBudgetProgress();
});

// Handle mobile menu toggle
const handleMobileMenu = () => {
    const sidebar = document.querySelector('.sidebar');
    const menuBtn = document.createElement('button');
    menuBtn.className = 'mobile-menu-btn';
    menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    menuBtn.setAttribute('aria-label', 'Toggle menu');
    
    document.querySelector('.dashboard-header').prepend(menuBtn);
    
    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });
};

// Initialize mobile menu
if (window.innerWidth <= 1024) {
    handleMobileMenu();
}

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth <= 1024) {
        handleMobileMenu();
    }
}); 