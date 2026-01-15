/**
 * WEBSAGA - Centralized Data Layer (Mock Database)
 * Handles all CRUD operations and data integrity using localStorage.
 */

const DB = {
    // Keys for localStorage
    KEYS: {
        PROGRAMS: 'wsg_programs',
        BRANCHES: 'wsg_branches',
        COURSES: 'wsg_courses',
        FACULTY: 'wsg_faculty',
        STUDENTS: 'wsg_students',
        USERS: 'wsg_users', // Admin users
        MAPPINGS: {
            PROG_BRANCH: 'wsg_map_prog_branch',
            BRANCH_COURSE: 'wsg_map_branch_course',
            FACULTY_COURSE: 'wsg_map_faculty_course'
        },
        QUESTIONS: 'wsg_questions'
    },

    // Initialize Default Data if empty
    init: function () {
        console.log("Initializing DB...");
        if (!localStorage.getItem(this.KEYS.PROGRAMS)) {
            const defaultPrograms = [
                { id: 1, name: "B.Tech", code: "BTECH", duration: 4, status: "Active" },
                { id: 2, name: "M.Tech", code: "MTECH", duration: 2, status: "Active" },
                { id: 3, name: "MBA", code: "MBA", duration: 2, status: "Active" }
            ];
            localStorage.setItem(this.KEYS.PROGRAMS, JSON.stringify(defaultPrograms));
        }

        if (!localStorage.getItem(this.KEYS.BRANCHES)) {
            const defaultBranches = [
                { id: 1, name: "Computer Science and Engineering", code: "CSE", status: "Active" },
                { id: 2, name: "Information Technology", code: "IT", status: "Active" },
                { id: 3, name: "Electronics and Communication", code: "ECE", status: "Active" }
            ];
            localStorage.setItem(this.KEYS.BRANCHES, JSON.stringify(defaultBranches));
        }

        if (!localStorage.getItem(this.KEYS.COURSES)) {
            localStorage.setItem(this.KEYS.COURSES, JSON.stringify([]));
        }

        if (!localStorage.getItem(this.KEYS.FACULTY)) {
            localStorage.setItem(this.KEYS.FACULTY, JSON.stringify([]));
        }
    },

    // --- GENERIC CRUD ---

    getAll: function (key) {
        return JSON.parse(localStorage.getItem(key) || '[]');
    },

    getById: function (key, id) {
        const items = this.getAll(key);
        return items.find(item => item.id == id);
    },

    add: function (key, item) {
        const items = this.getAll(key);
        // Auto-increment ID if not provided
        if (!item.id) {
            item.id = items.length ? Math.max(...items.map(i => i.id)) + 1 : 1;
        }
        items.push(item);
        localStorage.setItem(key, JSON.stringify(items));
        return item;
    },

    update: function (key, id, updates) {
        const items = this.getAll(key);
        const index = items.findIndex(item => item.id == id);
        if (index !== -1) {
            items[index] = { ...items[index], ...updates };
            localStorage.setItem(key, JSON.stringify(items));
            return items[index];
        }
        return null;
    },

    delete: function (key, id) {
        let items = this.getAll(key);
        items = items.filter(item => item.id != id);
        localStorage.setItem(key, JSON.stringify(items));
    },

    // --- SPECIFIC RELATIONSHIP LOGIC ---

    // Get Branches linked to a Program
    getBranchesByProgram: function (programId) {
        // Since we didn't implement robust many-to-many yet, we assume branches exist independently
        // but can be "mapped". For now, return all active branches as a simplified logic 
        // OR implement extraction from the mapping table.
        // Let's implement reading from MAPPINGS.PROG_BRANCH if it exists, else return all.

        // Simpler approach for this prototype: 
        // We will store a 'programId' in branch directly if 1:N, or use the mapping table.
        // Let's stick to the existing Mapping pattern found in admin/program-branch-mapping.html

        const mappings = this.getAll(this.KEYS.MAPPINGS.PROG_BRANCH);
        // mapping structure: { id, programId, branchId }
        const linkedBranchIds = mappings.filter(m => m.programId == programId).map(m => m.branchId);

        const allBranches = this.getAll(this.KEYS.BRANCHES);
        return allBranches.filter(b => linkedBranchIds.includes(b.id));
    },

    // Cascade Delete: When Program is deleted, delete its mappings
    deleteProgram: function (id) {
        this.delete(this.KEYS.PROGRAMS, id);

        // Remove from mappings
        let mappings = this.getAll(this.KEYS.MAPPINGS.PROG_BRANCH);
        mappings = mappings.filter(m => m.programId != id);
        localStorage.setItem(this.KEYS.MAPPINGS.PROG_BRANCH, JSON.stringify(mappings));
    },

    // --- COUNTS FOR DASHBOARD ---
    getCounts: function () {
        return {
            programs: this.getAll(this.KEYS.PROGRAMS).length,
            branches: this.getAll(this.KEYS.BRANCHES).length,
            courses: this.getAll(this.KEYS.COURSES).length,
            faculty: this.getAll(this.KEYS.FACULTY).length
        };
    }
};

// Initialize on load
DB.init();

// Expose to window
window.DB = DB;
