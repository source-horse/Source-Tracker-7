// Update current date
document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
});

// Sample budget data
let budgets = [
    {
        id: 1,
        name: "Monthly Budget - April 2024",
        period: "monthly",
        startDate: "2024-04-01",
        endDate: "2024-04-30",
        totalAmount: 5000,
        spent: 2300,
        categories: [
            { name: "Groceries", amount: 800, spent: 450 },
            { name: "Rent", amount: 2000, spent: 2000 },
            { name: "Utilities", amount: 300, spent: 250 },
            { name: "Entertainment", amount: 400, spent: 150 },
            { name: "Savings", amount: 1500, spent: 0 }
        ],
        rolloverEnabled: false,
        status: "active"
    },
    {
        id: 2,
        name: "Quarterly Savings",
        period: "quarterly",
        startDate: "2024-04-01",
        endDate: "2024-06-30",
        totalAmount: 7500,
        spent: 2930,
        categories: [
            { name: "Emergency Fund", amount: 3000, spent: 1000 },
            { name: "Vacation", amount: 2500, spent: 930 },
            { name: "Investment", amount: 2000, spent: 1000 }
        ],
        rolloverEnabled: true,
        status: "active"
    }
];

// DOM Elements
const modal = document.getElementById('budgetModal');
const createBudgetBtn = document.getElementById('createBudgetBtn');
const closeBtn = document.querySelector('.close-btn');
const cancelBtn = document.getElementById('cancelBtn');
const budgetForm = document.getElementById('budgetForm');
const budgetPeriod = document.getElementById('budgetPeriod');
const dateRange = document.querySelector('.date-range');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const categoriesList = document.getElementById('categoriesList');
const budgetsGrid = document.getElementById('budgetsGrid');
const searchInput = document.getElementById('searchInput');
const periodFilter = document.getElementById('periodFilter');
const statusFilter = document.getElementById('statusFilter');
const clearFiltersBtn = document.getElementById('clearFilters');
const exportBtn = document.getElementById('exportBtn');

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    renderBudgets(budgets);
    setupEventListeners();
    updateSummary();
    
    // Set default dates for new budgets
    const dates = calculatePeriodDates('monthly');
    document.getElementById('startDate').value = dates.start;
    document.getElementById('endDate').value = dates.end;
});

// Event Listeners Setup
function setupEventListeners() {
    // Modal Controls
    createBudgetBtn.addEventListener('click', () => {
        resetForm();
        document.querySelector('.modal-header h3').textContent = 'Create New Budget';
        document.querySelector('.modal-footer button[type="submit"]').textContent = 'Create Budget';
        modal.classList.add('active');
    });

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Form Controls
    budgetPeriod.addEventListener('change', handlePeriodChange);
    addCategoryBtn.addEventListener('click', addCategoryField);
    budgetForm.addEventListener('submit', handleFormSubmit);

    // Add event listener for initial category remove button
    const initialRemoveBtn = document.querySelector('.remove-category');
    if (initialRemoveBtn) {
        initialRemoveBtn.addEventListener('click', function() {
            if (document.querySelectorAll('.category-item').length > 1) {
                this.closest('.category-item').remove();
            } else {
                showToast('You must have at least one category', 'warning');
            }
        });
    }

    // Filters
    searchInput.addEventListener('input', handleFilters);
    periodFilter.addEventListener('change', handleFilters);
    statusFilter.addEventListener('change', handleFilters);
    clearFiltersBtn.addEventListener('click', clearFilters);

    // Export
    exportBtn.addEventListener('click', exportBudgets);
}

// Render Budgets
function renderBudgets(budgetsToRender) {
    budgetsGrid.innerHTML = budgetsToRender.map(budget => `
        <div class="budget-card">
            <h3>${budget.name}</h3>
            <div class="budget-info">
                <p>
                    <span>Total Budget</span>
                    <span>${formatCurrency(budget.totalAmount)}</span>
                </p>
                <p>
                    <span>Spent</span>
                    <span>${formatCurrency(budget.spent)}</span>
                </p>
                <p>
                    <span>Remaining</span>
                    <span class="${budget.totalAmount - budget.spent > 0 ? 'positive' : 'negative'}">
                        ${formatCurrency(budget.totalAmount - budget.spent)}
                    </span>
                </p>
            </div>
            <div class="progress-bar">
                <div class="progress ${getProgressClass(budget.spent / budget.totalAmount * 100)}"
                     style="width: ${Math.min(budget.spent / budget.totalAmount * 100, 100)}%">
                </div>
            </div>
            <div class="categories">
                ${budget.categories.map(category => `
                    <div class="category">
                        <p>
                            <span>${category.name}</span>
                            <span>${formatCurrency(category.spent)} / ${formatCurrency(category.amount)}</span>
                        </p>
                        <div class="progress-bar">
                            <div class="progress ${getProgressClass(category.spent / category.amount * 100)}"
                                 style="width: ${Math.min(category.spent / category.amount * 100, 100)}%">
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="card-actions">
                <button class="btn text" onclick="editBudget(${budget.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn text" onclick="archiveBudget(${budget.id})">
                    <i class="fas fa-archive"></i> Archive
                </button>
            </div>
        </div>
    `).join('');
}

// Handle Period Change
function handlePeriodChange() {
    const selectedPeriod = budgetPeriod.value;
    dateRange.classList.toggle('hidden', selectedPeriod !== 'custom');
    
    if (selectedPeriod !== 'custom') {
        const dates = calculatePeriodDates(selectedPeriod);
        document.getElementById('startDate').value = dates.start;
        document.getElementById('endDate').value = dates.end;
    }
}

// Calculate Period Dates
function calculatePeriodDates(period) {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    let end;

    switch (period) {
        case 'monthly':
            end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            break;
        case 'quarterly':
            end = new Date(today.getFullYear(), today.getMonth() + 3, 0);
            break;
        case 'yearly':
            end = new Date(today.getFullYear() + 1, 0, 0);
            break;
        default:
            end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }

    return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
    };
}

// Add Category Field
function addCategoryField() {
    const categoryItem = document.createElement('div');
    categoryItem.className = 'category-item';
    categoryItem.innerHTML = `
        <select class="category-select">
            <option value="groceries">Groceries</option>
            <option value="rent">Rent</option>
            <option value="utilities">Utilities</option>
            <option value="entertainment">Entertainment</option>
            <option value="savings">Savings</option>
        </select>
        <input type="number" class="category-amount" step="0.01" min="0" placeholder="0.00">
        <button type="button" class="btn text remove-category"><i class="fas fa-trash"></i></button>
    `;

    categoryItem.querySelector('.remove-category').addEventListener('click', function() {
        if (document.querySelectorAll('.category-item').length > 1) {
            this.closest('.category-item').remove();
        } else {
            showToast('You must have at least one category', 'warning');
        }
    });

    categoriesList.appendChild(categoryItem);
}

// Handle Form Submit
function handleFormSubmit(e) {
    e.preventDefault();
    
    try {
        const formData = new FormData(e.target);
        const categoryItems = document.querySelectorAll('.category-item');
        
        // Validate total amount
        const totalAmount = parseFloat(formData.get('amount'));
        if (!totalAmount || totalAmount <= 0) {
            throw new Error('Please enter a valid total budget amount');
        }

        // Validate and collect categories
        let categoryTotal = 0;
        const categories = Array.from(categoryItems).map(item => {
            const amount = parseFloat(item.querySelector('.category-amount').value);
            if (!amount || amount <= 0) {
                throw new Error('Please enter valid amounts for all categories');
            }
            categoryTotal += amount;
            return {
                name: item.querySelector('.category-select').value,
                amount: amount,
                spent: 0
            };
        });

        // Validate category total matches budget total
        if (Math.abs(categoryTotal - totalAmount) > 0.01) {
            throw new Error('Category amounts must sum to the total budget amount');
        }

        const budget = {
            id: Date.now(),
            name: formData.get('name'),
            period: formData.get('period'),
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value,
            totalAmount: totalAmount,
            spent: 0,
            categories: categories,
            rolloverEnabled: formData.get('rollover') === 'on',
            status: 'active'
        };

        budgets.unshift(budget);
        renderBudgets(budgets);
        updateSummary();
        closeModal();
        showToast('Budget created successfully!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Filter Handlers
function handleFilters() {
    let filteredBudgets = [...budgets];

    // Search filter
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filteredBudgets = filteredBudgets.filter(b => 
            b.name.toLowerCase().includes(searchTerm)
        );
    }

    // Period filter
    const selectedPeriod = periodFilter.value;
    if (selectedPeriod !== 'all') {
        filteredBudgets = filteredBudgets.filter(b => b.period === selectedPeriod);
    }

    // Status filter
    const selectedStatus = statusFilter.value;
    if (selectedStatus !== 'all') {
        filteredBudgets = filteredBudgets.filter(b => b.status === selectedStatus);
    }

    renderBudgets(filteredBudgets);
}

// Clear Filters
function clearFilters() {
    searchInput.value = '';
    periodFilter.value = 'all';
    statusFilter.value = 'all';
    renderBudgets(budgets);
}

// Export Budgets
function exportBudgets() {
    const csvContent = [
        ['Name', 'Period', 'Start Date', 'End Date', 'Total Amount', 'Spent', 'Remaining', 'Status'],
        ...budgets.map(b => [
            b.name,
            b.period,
            b.startDate,
            b.endDate,
            b.totalAmount,
            b.spent,
            b.totalAmount - b.spent,
            b.status
        ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budgets-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast('Budgets exported successfully!', 'success');
}

// Update Summary
function updateSummary() {
    const summary = budgets.reduce((acc, budget) => {
        if (budget.status === 'active') {
            acc.totalAllocated += budget.totalAmount;
            acc.totalSpent += budget.spent;
        }
        return acc;
    }, { totalAllocated: 0, totalSpent: 0 });

    document.getElementById('totalAllocated').textContent = formatCurrency(summary.totalAllocated);
    document.getElementById('totalSpent').textContent = formatCurrency(summary.totalSpent);
    document.getElementById('totalRemaining').textContent = formatCurrency(summary.totalAllocated - summary.totalSpent);
}

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function getProgressClass(percentage) {
    if (percentage >= 90) return 'danger';
    if (percentage >= 75) return 'warning';
    return '';
}

function closeModal() {
    modal.classList.remove('active');
}

function showToast(message, type = 'info') {
    // You can implement a toast notification system here
    alert(message);
}

function resetForm() {
    budgetForm.reset();
    dateRange.classList.add('hidden');
    const dates = calculatePeriodDates('monthly');
    document.getElementById('startDate').value = dates.start;
    document.getElementById('endDate').value = dates.end;
    
    // Reset categories
    categoriesList.innerHTML = `
        <div class="category-item">
            <select class="category-select">
                <option value="groceries">Groceries</option>
                <option value="rent">Rent</option>
                <option value="utilities">Utilities</option>
                <option value="entertainment">Entertainment</option>
                <option value="savings">Savings</option>
            </select>
            <input type="number" class="category-amount" step="0.01" min="0" placeholder="0.00">
            <button type="button" class="btn text remove-category"><i class="fas fa-trash"></i></button>
        </div>
    `;
}

// Edit and Archive Functions
function editBudget(id) {
    const budget = budgets.find(b => b.id === id);
    if (budget) {
        // Populate form with budget data
        document.getElementById('budgetName').value = budget.name;
        document.getElementById('budgetPeriod').value = budget.period;
        document.getElementById('startDate').value = budget.startDate;
        document.getElementById('endDate').value = budget.endDate;
        document.getElementById('totalAmount').value = budget.totalAmount;
        document.getElementById('rolloverEnabled').checked = budget.rolloverEnabled;

        // Populate categories
        categoriesList.innerHTML = budget.categories.map(category => `
            <div class="category-item">
                <select class="category-select">
                    <option value="groceries" ${category.name === 'Groceries' ? 'selected' : ''}>Groceries</option>
                    <option value="rent" ${category.name === 'Rent' ? 'selected' : ''}>Rent</option>
                    <option value="utilities" ${category.name === 'Utilities' ? 'selected' : ''}>Utilities</option>
                    <option value="entertainment" ${category.name === 'Entertainment' ? 'selected' : ''}>Entertainment</option>
                    <option value="savings" ${category.name === 'Savings' ? 'selected' : ''}>Savings</option>
                </select>
                <input type="number" class="category-amount" step="0.01" min="0" value="${category.amount}">
                <button type="button" class="btn text remove-category"><i class="fas fa-trash"></i></button>
            </div>
        `).join('');

        // Show modal
        modal.classList.add('active');
    }
}

function archiveBudget(id) {
    if (confirm('Are you sure you want to archive this budget?')) {
        const budget = budgets.find(b => b.id === id);
        if (budget) {
            budget.status = 'expired';
            renderBudgets(budgets);
            updateSummary();
            showToast('Budget archived successfully!', 'success');
        }
    }
} 