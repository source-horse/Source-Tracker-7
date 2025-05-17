// Sample transaction data
let transactions = [
    { id: 1, date: '2024-04-01', description: 'Monthly Salary', category: 'Salary', amount: 5000, type: 'income', notes: '' },
    { id: 2, date: '2024-04-02', description: 'Rent Payment', category: 'Housing', amount: -1500, type: 'expense', notes: '' },
    { id: 3, date: '2024-04-03', description: 'Grocery Shopping', category: 'Food', amount: -200, type: 'expense', notes: '' },
    { id: 4, date: '2024-04-04', description: 'Freelance Project', category: 'Freelance', amount: 1000, type: 'income', notes: '' },
    { id: 5, date: '2024-04-05', description: 'Utilities Bill', category: 'Utilities', amount: -150, type: 'expense', notes: '' }
];

// DOM Elements
const modal = document.getElementById('transactionModal');
const addTransactionBtn = document.getElementById('addTransactionBtn');
const closeBtn = document.querySelector('.close-btn');
const transactionForm = document.getElementById('transactionForm');
const transactionsBody = document.getElementById('transactionsBody');
const searchInput = document.getElementById('searchInput');
const dateFilter = document.getElementById('dateFilter');
const categoryFilter = document.getElementById('categoryFilter');
const typeFilter = document.getElementById('typeFilter');
const clearFiltersBtn = document.getElementById('clearFilters');
const exportBtn = document.getElementById('exportBtn');
const loadMoreBtn = document.getElementById('loadMore');
const cancelBtn = document.getElementById('cancelBtn');

let editingTransactionId = null;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    renderTransactions(transactions);
    setupEventListeners();
    updateSummary();
});

// Event Listeners Setup
function setupEventListeners() {
    // Modal Controls
    addTransactionBtn.addEventListener('click', () => {
        editingTransactionId = null;
        resetForm();
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

    // Form submission
    transactionForm.addEventListener('submit', handleFormSubmit);

    // Filters
    searchInput.addEventListener('input', handleFilters);
    dateFilter.addEventListener('change', handleFilters);
    categoryFilter.addEventListener('change', handleFilters);
    typeFilter.addEventListener('change', handleFilters);
    clearFiltersBtn.addEventListener('click', clearFilters);

    // Export
    exportBtn.addEventListener('click', exportTransactions);

    // Load More
    loadMoreBtn.addEventListener('click', loadMoreTransactions);
}

// Close Modal
function closeModal() {
    modal.classList.remove('active');
    resetForm();
}

// Reset Form
function resetForm() {
    transactionForm.reset();
    document.getElementById('expense').checked = true;
    document.getElementById('transactionDate').valueAsDate = new Date();
    editingTransactionId = null;
    document.querySelector('.modal-header h3').textContent = 'Add Transaction';
}

// Render Transactions
function renderTransactions(transactionsToRender) {
    transactionsBody.innerHTML = transactionsToRender.map(transaction => `
        <tr>
            <td><input type="checkbox" data-id="${transaction.id}"></td>
            <td>${formatDate(transaction.date)}</td>
            <td>${transaction.description}</td>
            <td>${transaction.category}</td>
            <td class="${transaction.type === 'income' ? 'positive' : 'negative'}">
                ${formatCurrency(transaction.amount)}
            </td>
            <td>
                <button class="btn text" onclick="editTransaction(${transaction.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn text" onclick="deleteTransaction(${transaction.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    updateSummary();
}

// Update Summary
function updateSummary() {
    const summary = transactions.reduce((acc, transaction) => {
        if (transaction.type === 'income') {
            acc.income += transaction.amount;
        } else {
            acc.expenses += Math.abs(transaction.amount);
        }
        return acc;
    }, { income: 0, expenses: 0 });

    summary.net = summary.income - summary.expenses;

    document.querySelector('.stat .amount.positive').textContent = formatCurrency(summary.income);
    document.querySelector('.stat .amount.negative').textContent = `-${formatCurrency(summary.expenses)}`;
    document.querySelector('.stat .amount:last-child').textContent = formatCurrency(summary.net);
}

// Handle Form Submit
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const type = formData.get('type');
    const amount = parseFloat(formData.get('amount'));
    
    const transaction = {
        id: editingTransactionId || Date.now(),
        date: formData.get('date'),
        description: formData.get('description'),
        category: formData.get('category'),
        amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
        type: type,
        notes: formData.get('notes') || '',
        recurring: formData.get('recurring') === 'on'
    };

    if (editingTransactionId) {
        const index = transactions.findIndex(t => t.id === editingTransactionId);
        if (index !== -1) {
            transactions[index] = transaction;
        }
    } else {
        transactions.unshift(transaction);
    }

    renderTransactions(transactions);
    closeModal();
    showToast(`Transaction ${editingTransactionId ? 'updated' : 'added'} successfully!`);
}

// Edit Transaction
function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
        editingTransactionId = id;
        document.querySelector('.modal-header h3').textContent = 'Edit Transaction';
        
        document.getElementById(transaction.type).checked = true;
        document.getElementById('transactionDate').value = transaction.date;
        document.getElementById('transactionAmount').value = Math.abs(transaction.amount);
        document.getElementById('transactionCategory').value = transaction.category;
        document.getElementById('transactionDescription').value = transaction.description;
        document.getElementById('transactionNotes').value = transaction.notes;
        document.getElementById('recurringTransaction').checked = transaction.recurring;

        modal.classList.add('active');
    }
}

// Delete Transaction
function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        transactions = transactions.filter(t => t.id !== id);
        renderTransactions(transactions);
        showToast('Transaction deleted successfully!');
    }
}

// Export Transactions
function exportTransactions() {
    const csvContent = [
        ['Date', 'Description', 'Category', 'Amount', 'Type', 'Notes'],
        ...transactions.map(t => [
            t.date,
            t.description,
            t.category,
            Math.abs(t.amount),
            t.type,
            t.notes
        ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast('Transactions exported successfully!');
}

// Filter Handlers
function handleFilters() {
    let filteredTransactions = [...transactions];

    // Search filter
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filteredTransactions = filteredTransactions.filter(t => 
            t.description.toLowerCase().includes(searchTerm) ||
            t.category.toLowerCase().includes(searchTerm)
        );
    }

    // Date filter
    const days = parseInt(dateFilter.value);
    if (days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        filteredTransactions = filteredTransactions.filter(t => 
            new Date(t.date) >= cutoffDate
        );
    }

    // Category filter
    const selectedCategories = Array.from(categoryFilter.selectedOptions).map(option => option.value);
    if (!selectedCategories.includes('all')) {
        filteredTransactions = filteredTransactions.filter(t =>
            selectedCategories.includes(t.category.toLowerCase())
        );
    }

    // Type filter
    const selectedType = typeFilter.value;
    if (selectedType !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.type === selectedType);
    }

    renderTransactions(filteredTransactions);
}

// Clear Filters
function clearFilters() {
    searchInput.value = '';
    dateFilter.value = '30';
    categoryFilter.value = 'all';
    typeFilter.value = 'all';
    handleFilters();
}

// Load More Transactions
function loadMoreTransactions() {
    // TODO: Implement pagination/infinite scroll
    showToast('Loading more transactions...');
}

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        signDisplay: 'never'
    }).format(Math.abs(amount));
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Toast Notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Add styles dynamically
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = 'var(--primary-color)';
    toast.style.color = 'var(--white)';
    toast.style.padding = '1rem 2rem';
    toast.style.borderRadius = '0.5rem';
    toast.style.animation = 'slideIn 0.3s ease-out';

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Add CSS animation for toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style); 