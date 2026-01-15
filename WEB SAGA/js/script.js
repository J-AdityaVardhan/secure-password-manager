/* ============================================
   WEBSAGA - Academic ERP System
   Common JavaScript File
   ============================================ */

// ============================================
// Global Variables
// ============================================
let currentUserRole = localStorage.getItem('userRole') || 'admin';
let dummyData = {
    programs: [],
    branches: [],
    regulations: [],
    courses: [],
    faculty: [],
    questionBank: []
};

// ============================================
// Initialize on Page Load
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
    loadDummyData();
});

// ============================================
// Initialize Page
// ============================================
function initializePage() {
    // Set active menu item based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const menuLinks = document.querySelectorAll('.sidebar-menu a');
    
    menuLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes(currentPage)) {
            link.classList.add('active');
        }
    });

    // apply theme-loaded class so CSS entrance animations trigger
    try { document.body.classList.add('theme-loaded'); } catch (e) {}

    // Mobile sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            const sidebar = document.querySelector('.sidebar');
            sidebar.classList.toggle('show');
        });
    }
}

// ============================================
// Setup Event Listeners
// ============================================
function setupEventListeners() {
    // Form validation
    const forms = document.querySelectorAll('.needs-validation');
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });

    // Auto-dismiss alerts
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.transition = 'opacity 0.5s';
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 500);
        }, 3000);
    });
}

// ============================================
// Load Dummy Data
// ============================================
function loadDummyData() {
    // Initialize with some dummy data if needed
    if (!localStorage.getItem('dummyDataLoaded')) {
        dummyData = {
            programs: [
                { id: 1, name: 'B.Tech', code: 'BTECH', status: 'active' },
                { id: 2, name: 'M.Tech', code: 'MTECH', status: 'active' }
            ],
            branches: [
                { id: 1, name: 'Computer Science', code: 'CSE', status: 'active' },
                { id: 2, name: 'Electronics', code: 'ECE', status: 'active' }
            ],
            regulations: [
                { id: 1, name: 'R2021', year: 2021, status: 'active' },
                { id: 2, name: 'R2022', year: 2022, status: 'active' }
            ],
            courses: [],
            faculty: [],
            questionBank: []
        };
        localStorage.setItem('dummyData', JSON.stringify(dummyData));
        localStorage.setItem('dummyDataLoaded', 'true');
    } else {
        dummyData = JSON.parse(localStorage.getItem('dummyData') || '{}');
    }
}

// ============================================
// Form Validation Functions
// ============================================
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;

    if (form.checkValidity()) {
        return true;
    } else {
        form.classList.add('was-validated');
        return false;
    }
}

// ============================================
// Show Alert Messages
// ============================================
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    const container = document.querySelector('.main-content') || document.body;
    container.insertBefore(alertDiv, container.firstChild);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
        alertDiv.style.transition = 'opacity 0.5s';
        alertDiv.style.opacity = '0';
        setTimeout(() => alertDiv.remove(), 500);
    }, 3000);
}

// ============================================
// Modal Functions
// ============================================
function openModal(modalId, mode = 'add', data = null) {
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    
    // Reset form if exists
    const form = document.querySelector(`#${modalId} form`);
    if (form) {
        form.reset();
        form.classList.remove('was-validated');
    }

    // Populate form if editing
    if (mode === 'edit' && data) {
        populateForm(form, data);
    }

    // Update modal title
    const modalTitle = document.querySelector(`#${modalId} .modal-title`);
    if (modalTitle) {
        modalTitle.textContent = mode === 'add' ? 'Add New' : 'Edit';
    }

    modal.show();
}

function closeModal(modalId) {
    const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
    if (modal) {
        modal.hide();
    }
}

function populateForm(form, data) {
    if (!form || !data) return;
    
    Object.keys(data).forEach(key => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = data[key];
            } else {
                input.value = data[key];
            }
        }
    });
}

// ============================================
// Status Toggle Functions
// ============================================
function toggleStatus(id, type) {
    // This is a dummy function - in real app, would make API call
    showAlert(`Status updated successfully for ${type} ID: ${id}`, 'success');
    
    // Update UI
    const toggle = event.target;
    const row = toggle.closest('tr');
    const statusBadge = row.querySelector('.status-badge');
    
    if (toggle.checked) {
        statusBadge.className = 'badge status-active';
        statusBadge.textContent = 'Active';
    } else {
        statusBadge.className = 'badge status-inactive';
        statusBadge.textContent = 'Inactive';
    }
}

// ============================================
// CRUD Operations (Dummy)
// ============================================
function saveItem(type, data) {
    // Dummy save - just show alert
    showAlert(`${type} saved successfully!`, 'success');
    closeModal(`add${type}Modal`);
    
    // In real app, would refresh table here
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

function updateItem(type, id, data) {
    // Dummy update - just show alert
    showAlert(`${type} updated successfully!`, 'success');
    closeModal(`edit${type}Modal`);
    
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

function deleteItem(type, id) {
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
        // Dummy delete - just show alert
        showAlert(`${type} deleted successfully!`, 'success');
        
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
}

// ============================================
// Dependent Dropdown Functions
// ============================================
function setupDependentDropdown(parentId, childId, mapping) {
    const parentSelect = document.getElementById(parentId);
    const childSelect = document.getElementById(childId);

    if (!parentSelect || !childSelect) return;

    parentSelect.addEventListener('change', function() {
        const selectedValue = this.value;
        
        // Clear child options
        childSelect.innerHTML = '<option value="">Select...</option>';

        if (selectedValue && mapping[selectedValue]) {
            mapping[selectedValue].forEach(item => {
                const option = document.createElement('option');
                option.value = item.id || item.value;
                option.textContent = item.name || item.text;
                childSelect.appendChild(option);
            });
        }
    });
}

// ============================================
// Question Paper Generation Functions
// ============================================
function autoFillQuestionPaperFields() {
    const programSelect = document.getElementById('programSelect');
    const courseSelect = document.getElementById('courseSelect');
    
    if (programSelect && courseSelect && programSelect.value && courseSelect.value) {
        // Auto-fill regulation, year, semester based on selected course
        // This is dummy logic - in real app, would fetch from API
        const regulationField = document.getElementById('regulation');
        const yearField = document.getElementById('year');
        const semesterField = document.getElementById('semester');
        const academicYearField = document.getElementById('academicYear');

        if (regulationField) regulationField.value = 'R2021';
        if (yearField) yearField.value = '2';
        if (semesterField) semesterField.value = '3';
        if (academicYearField) academicYearField.value = '2024-2025';
    }
}

function generateRandomQuestions() {
    const questionTypes = ['Define', 'Explain', 'Describe', 'Compare', 'Analyze', 'Evaluate'];
    const topics = ['Data Structures', 'Algorithms', 'Database Systems', 'Operating Systems', 'Networks'];
    const questions = [];

    const numQuestions = parseInt(document.getElementById('numQuestions')?.value || 5);

    for (let i = 0; i < numQuestions; i++) {
        const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];
        const randomMarks = [2, 5, 10, 15][Math.floor(Math.random() * 4)];
        
        questions.push({
            id: i + 1,
            question: `${randomType} ${randomTopic}.`,
            co: `CO${Math.floor(Math.random() * 5) + 1}`,
            bloomLevel: ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate'][Math.floor(Math.random() * 5)],
            difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)],
            marks: randomMarks
        });
    }

    return questions;
}

function displayGeneratedQuestions(questions) {
    const container = document.getElementById('generatedQuestions');
    if (!container) return;

    container.innerHTML = '';

    questions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'card mb-3';
        questionDiv.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="mb-2">Question ${index + 1} (${q.marks} marks)</h6>
                        <p class="mb-1">${q.question}</p>
                        <div class="mt-2">
                            <span class="badge bg-info me-2">${q.co}</span>
                            <span class="badge bg-warning me-2">${q.bloomLevel}</span>
                            <span class="badge bg-secondary">${q.difficulty}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(questionDiv);
    });
}

// ============================================
// Print Functions
// ============================================
function printQuestionPaper() {
    window.print();
}

// ============================================
// File Upload Functions
// ============================================
function handleFileUpload(inputId) {
    const input = document.getElementById(inputId);
    if (!input || !input.files.length) return;

    const file = input.files[0];
    const fileName = file.name;
    
    showAlert(`File "${fileName}" selected successfully!`, 'info');
    
    // In real app, would upload file here
}

// ============================================
// Image Preview Functions
// ============================================
function previewImage(input, previewId) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    const preview = document.getElementById(previewId);

    reader.onload = function(e) {
        if (preview) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
    };

    reader.readAsDataURL(file);
}

// ============================================
// Search and Filter Functions
// ============================================
function filterTable(inputId, tableId) {
    const input = document.getElementById(inputId);
    const table = document.getElementById(tableId);
    
    if (!input || !table) return;

    const filter = input.value.toUpperCase();
    const rows = table.getElementsByTagName('tr');

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const text = row.textContent || row.innerText;
        
        if (text.toUpperCase().indexOf(filter) > -1) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    }
}

// ============================================
// Export Functions
// ============================================
function exportToCSV(tableId, filename) {
    const table = document.getElementById(tableId);
    if (!table) return;

    let csv = [];
    const rows = table.querySelectorAll('tr');

    for (let i = 0; i < rows.length; i++) {
        const row = [];
        const cols = rows[i].querySelectorAll('td, th');

        for (let j = 0; j < cols.length; j++) {
            row.push(cols[j].innerText);
        }

        csv.push(row.join(','));
    }

    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'export.csv';
    a.click();
}

// ============================================
// Utility Functions
// ============================================
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
}

// ============================================
// Authentication Functions
// ============================================
function handleLogin(role) {
    localStorage.setItem('userRole', role);
    localStorage.setItem('isLoggedIn', 'true');
    
    if (role === 'admin') {
        window.location.href = 'admin/dashboard.html';
    } else {
        window.location.href = 'faculty/dashboard.html';
    }
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('userRole');
        localStorage.removeItem('isLoggedIn');
        window.location.href = '../main.html';
    }
}

function changePassword() {
    const oldPassword = document.getElementById('oldPassword')?.value;
    const newPassword = document.getElementById('newPassword')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;

    if (!oldPassword || !newPassword || !confirmPassword) {
        showAlert('Please fill all fields', 'danger');
        return;
    }

    if (newPassword !== confirmPassword) {
        showAlert('New password and confirm password do not match', 'danger');
        return;
    }

    if (newPassword.length < 6) {
        showAlert('Password must be at least 6 characters long', 'danger');
        return;
    }

    // Dummy password change
    showAlert('Password changed successfully!', 'success');
    
    setTimeout(() => {
        window.location.href = '../main.html';
    }, 1500);
}