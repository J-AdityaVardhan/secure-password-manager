/**
 * WEBSAGA - Authentication Module
 * Handles Login, Logout, and Route Protection
 */

const Auth = {
    KEYS: {
        USER: 'currentUser',
        IS_LOGGED_IN: 'isLoggedIn',
        ADMIN_CREDS: 'wsg_admin_credentials',
        FACULTY_CREDS: 'wsg_faculty_credentials'
    },

    // Check if user is logged in
    checkSession: function () {
        return localStorage.getItem(this.KEYS.IS_LOGGED_IN) === 'true';
    },

    // Get current user details
    getUser: function () {
        const user = localStorage.getItem(this.KEYS.USER);
        return user ? JSON.parse(user) : null;
    },

    // Initialize Credentials (if missing)
    initCredentials: function () {
        const defaultAdmins = JSON.parse(localStorage.getItem(this.KEYS.ADMIN_CREDS) || '[]');

        // Ensure default 'admin' user exists and has correct password '141414'
        const adminIndex = defaultAdmins.findIndex(u => u.username === 'admin');
        if (adminIndex !== -1) {
            defaultAdmins[adminIndex].password = '141414'; // Enforce new password
        } else {
            defaultAdmins.push({ username: 'admin', password: '141414', name: 'System Administrator', role: 'admin' });
        }

        localStorage.setItem(this.KEYS.ADMIN_CREDS, JSON.stringify(defaultAdmins));
    },

    // Login Function
    login: function (username, password, role) {
        this.initCredentials(); // ensure admin creds exist

        let users = [];
        if (role === 'admin') {
            users = JSON.parse(localStorage.getItem(this.KEYS.ADMIN_CREDS) || '[]');
        } else if (role === 'faculty') {
            // Read directly from the main faculty data store
            users = JSON.parse(localStorage.getItem('wsg_faculty') || '[]');
        }

        // Find user
        const user = users.find(u =>
            (u.username === username || u.email === username || u.empId === username) &&
            u.password === password
        );

        if (user) {
            // Success
            // Check status if applicable (for faculty)
            if (role === 'faculty' && user.status === 'Inactive') {
                return { success: false, message: 'Account is inactive. Please contact Admin.' };
            }

            localStorage.setItem(this.KEYS.IS_LOGGED_IN, 'true');
            localStorage.setItem(this.KEYS.USER, JSON.stringify({
                username: user.username || user.empId,
                name: user.name,
                role: role,
                id: user.empId || 'admin'
            }));
            return { success: true, user: user };
        }

        return { success: false, message: 'Invalid Credentials' };
    },

    // Logout Function
    logout: function () {
        if (confirm("Are you sure you want to logout?")) {
            localStorage.removeItem(this.KEYS.IS_LOGGED_IN);
            localStorage.removeItem(this.KEYS.USER);
            window.location.href = '../main.html'; // Go up one level by default, or absolute path
        }
    },

    // Guard: Protect Page
    requireAuth: function (allowedRoles = []) {
        if (!this.checkSession()) {
            console.warn("Unauthorized access. Redirecting...");
            window.location.href = '../main.html';
            return;
        }

        const user = this.getUser();
        if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
            alert("Access Denied: You do not have permission to view this page.");
            window.history.back(); // Go back
        }
    }
};

// Expose
window.Auth = Auth;
