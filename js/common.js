/* ==================================================
   1. LMS OBJECT
   الكائن الرئيسي الذي يحتوي على وظائف النظام
   ================================================== */

const LMS = (() => {

    // Storage keys used to save data
    const KEYS = {
        books: 'limu_lh_books',
        members: 'limu_lh_members',
        loans: 'limu_lh_loans',
        session: 'limu_lh_session',
        seeded: 'limu_lh_seeded'
    };


    /* ==================================================
       2. LOCAL STORAGE
       قراءة البيانات وحفظها في المتصفح
       ================================================== */

    // Read data from LocalStorage
    const read = k => {
        try {
            return JSON.parse(localStorage.getItem(k)) || [];
        } catch {
            return [];
        }
    };

    // Save data in LocalStorage
    const write = (k, v) => {
        localStorage.setItem(k, JSON.stringify(v));
    };


    /* ==================================================
       3. DATE FUNCTIONS
       وظائف التعامل مع التواريخ
       ================================================== */

    // Add zero before single-digit numbers
    const pad = n => String(n).padStart(2, '0');

    // Format date as YYYY-MM-DD
    const fmt = d =>
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    // Get today's date
    const today = () => fmt(new Date());

    // Add a number of days to a date
    const addDays = (s, n) => {
        const d = new Date(s + 'T00:00:00');

        d.setDate(d.getDate() + n);

        return fmt(d);
    };


    /* ==================================================
       4. SECURITY AND TEXT FUNCTIONS
       حماية النصوص وإنشاء أرقام الكتب والأعضاء
       ================================================== */

    // Escape special HTML characters
    const esc = s =>
        String(s ?? '').replace(/[&<>"']/g, c => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[c]));

    // Generate the next ID
    const nextId = (prefix, list) => {

        const max = list.reduce((m, x) =>
            Math.max(
                m,
                parseInt(String(x.id).slice(prefix.length), 10) || 0
            ), 0
        );

        return prefix + String(max + 1).padStart(3, '0');
    };


    /* ==================================================
       5. DEMO DATA
       إضافة بيانات تجريبية عند تشغيل النظام لأول مرة
       ================================================== */

    function seed() {

        // Stop if demo data already exists
        if (localStorage.getItem(KEYS.seeded)) return;

        const t = today();


        // Sample books
        write(KEYS.books, [
            {
                id: 'B001',
                title: 'Introduction to History',
                author: 'Ibn Khaldun',
                category: 'History',
                isbn: '9789770000011',
                quantity: 5,
                available: 4
            },
            {
                id: 'B002',
                title: 'The Days',
                author: 'Taha Hussein',
                category: 'Literature',
                isbn: '9789770000028',
                quantity: 4,
                available: 4
            },
            {
                id: 'B003',
                title: 'Kalila and Dimna',
                author: 'Ibn al-Muqaffa',
                category: 'Literature',
                isbn: '9789770000035',
                quantity: 3,
                available: 3
            },
            {
                id: 'B004',
                title: 'Learning JavaScript',
                author: 'Ahmed Salem',
                category: 'Technology',
                isbn: '9789770000042',
                quantity: 6,
                available: 5
            },
            {
                id: 'B005',
                title: 'The Little Prince',
                author: 'Antoine de Saint-Exupery',
                category: 'Fiction',
                isbn: '9789770000059',
                quantity: 4,
                available: 4
            },
            {
                id: 'B006',
                title: 'Granada Trilogy',
                author: 'Radwa Ashour',
                category: 'Fiction',
                isbn: '9789770000066',
                quantity: 3,
                available: 3
            }
        ]);


        // Sample members
        write(KEYS.members, [
            {
                id: 'M001',
                name: 'Sara Ahmed',
                phone: '+218912345678',
                email: 'sara@example.com',
                regDate: addDays(t, -90)
            },
            {
                id: 'M002',
                name: 'Khaled Mansour',
                phone: '+218923456789',
                email: 'khaled@example.com',
                regDate: addDays(t, -60)
            },
            {
                id: 'M003',
                name: 'Noura Ali',
                phone: '+218934567890',
                email: 'noura@example.com',
                regDate: addDays(t, -30)
            }
        ]);


        // Sample borrowing records
        write(KEYS.loans, [
            {
                id: 'L001',
                memberId: 'M001',
                bookId: 'B001',
                borrowDate: addDays(t, -20),
                dueDate: addDays(t, -6),
                returnDate: null
            },
            {
                id: 'L002',
                memberId: 'M002',
                bookId: 'B004',
                borrowDate: addDays(t, -5),
                dueDate: addDays(t, 9),
                returnDate: null
            },
            {
                id: 'L003',
                memberId: 'M003',
                bookId: 'B002',
                borrowDate: addDays(t, -30),
                dueDate: addDays(t, -16),
                returnDate: addDays(t, -18)
            }
        ]);


        // Mark demo data as created
        localStorage.setItem(KEYS.seeded, '1');
    }


    /* ==================================================
       6. ADMIN AUTHENTICATION
       تسجيل الدخول وإدارة حسابات المسؤولين
       ================================================== */

    const ADMINS_KEY = 'limu_lh_admins';

    // Get administrators
    const admins = () => read(ADMINS_KEY);

    // Save administrators
    const saveAdmins = v => write(ADMINS_KEY, v);


    // Convert data into hexadecimal format
    const toHex = buf =>
        [...new Uint8Array(buf)]
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');


    // Generate random salt
    const newSalt = () =>
        toHex(crypto.getRandomValues(new Uint8Array(8)));


    // Hash password
    async function hash(password, salt) {

        const text = salt + ':' + password;

        if (window.crypto && crypto.subtle) {

            return 'sha256:' + toHex(
                await crypto.subtle.digest(
                    'SHA-256',
                    new TextEncoder().encode(text)
                )
            );
        }

        // Basic fallback if Web Crypto is unavailable
        let h = 5381;

        for (const c of text) {
            h = ((h << 5) + h + c.charCodeAt(0)) >>> 0;
        }

        return 'basic:' + h.toString(16);
    }


    // Find administrator by username
    const findAdmin = u =>
        admins().find(a =>
            a.username.toLowerCase() ===
            String(u).trim().toLowerCase()
        );


    // Create a new administrator account
    const makeAdmin = async (username, password) => {

        const salt = newSalt();

        return {
            username: username.trim(),
            salt,
            hash: await hash(password, salt),
            created: today()
        };
    };


    // Create default administrator if none exists
    const ready = (async () => {

        if (!admins().length) {
            saveAdmins([
                await makeAdmin('admin', 'admin123')
            ]);
        }

    })();


    /* ==================================================
       7. LOGIN AND LOGOUT
       تسجيل الدخول والخروج
       ================================================== */

    // Get current logged-in user
    const currentUser = () =>
        sessionStorage.getItem(KEYS.session);


    // Check if user is logged in
    const isLoggedIn = () =>
        !!(currentUser() && findAdmin(currentUser()));


    // Login function
    async function login(u, p) {

        await ready;

        const a = findAdmin(u);

        if (a && a.hash === await hash(p, a.salt)) {

            sessionStorage.setItem(KEYS.session, a.username);

            return true;
        }

        return false;
    }


    // Logout function
    const logout = () => {

        sessionStorage.removeItem(KEYS.session);

        location.replace('index.html');
    };


    /* ==================================================
       8. PASSWORD MANAGEMENT
       تغيير كلمة المرور وإدارة المسؤولين
       ================================================== */

    // Check password length
    const passwordProblem = p =>
        p.length < 6
            ? 'Password must be at least 6 characters.'
            : null;


    // Change current administrator password
    async function changePassword(current, next) {

        const list = admins();

        const me = list.find(a =>
            a.username === currentUser()
        );

        // Check current password
        if (!me || me.hash !== await hash(current, me.salt)) {
            return 'Current password is incorrect.';
        }

        // Validate new password
        const bad = passwordProblem(next);

        if (bad) return bad;

        // Update password and salt
        me.salt = newSalt();

        me.hash = await hash(next, me.salt);

        saveAdmins(list);

        return null;
    }


    // Add a new administrator
    async function addAdmin(username, password) {

        username = username.trim();

        // Validate username format
        if (!/^[A-Za-z0-9_.-]{3,20}$/.test(username)) {
            return 'Username must be 3-20 characters: letters, numbers, dot, dash, or underscore.';
        }

        // Check if username already exists
        if (findAdmin(username)) {
            return 'That username is already taken.';
        }

        // Validate password
        const bad = passwordProblem(password);

        if (bad) return bad;

        // Save new administrator
        const list = admins();

        list.push(await makeAdmin(username, password));

        saveAdmins(list);

        return null;
    }


    // Remove an administrator
    function removeAdmin(username) {

        const list = admins();

        // Prevent deleting current account
        if (username === currentUser()) {
            return "You can't remove your own account.";
        }

        // Keep at least one administrator
        if (list.length <= 1) {
            return 'At least one administrator is required.';
        }

        saveAdmins(
            list.filter(a => a.username !== username)
        );

        return null;
    }


    /* ==================================================
       9. BORROWING STATUS
       تحديد حالة الكتب المستعارة
       ================================================== */

    const LABELS = {
        borrowed: 'Borrowed',
        overdue: 'Overdue',
        returned: 'Returned'
    };


    // Determine borrowing status
    const statusOf = l => {

        if (l.returnDate) return 'returned';

        if (l.dueDate < today()) return 'overdue';

        return 'borrowed';
    };


    // Create status badge
    const badge = l => {

        const s = statusOf(l);

        return `
            <span class="badge badge-${s}">
                ${LABELS[s]}
            </span>
        `;
    };


    /* ==================================================
       10. TOAST NOTIFICATIONS
       عرض رسائل النجاح والخطأ
       ================================================== */

    function toast(msg, type = 'success') {

        // Find notification container
        let box = document.querySelector('.toast-box');

        // Create container if it does not exist
        if (!box) {

            box = document.createElement('div');

            box.className = 'toast-box';

            document.body.appendChild(box);
        }


        // Create notification message
        const t = document.createElement('div');

        t.className = 'toast toast-' + type;

        t.textContent = msg;

        box.appendChild(t);


        // Remove notification after 3.2 seconds
        setTimeout(() => t.remove(), 3200);
    }


    /* ==================================================
       11. CONFIRMATION BOX
       نافذة تأكيد العمليات مثل الحذف
       ================================================== */

    function confirmBox(message, okText = 'Confirm', danger = false) {

        return new Promise(resolve => {

            // Create modal background
            const o = document.createElement('div');

            o.className = 'modal-overlay open';


            // Add confirmation content
            o.innerHTML = `
                <div class="modal" style="max-width:420px">

                    <h3>Confirm Action</h3>

                    <p style="margin-bottom:18px">
                        ${esc(message)}
                    </p>

                    <div class="modal-actions">

                        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-ok>
                            ${esc(okText)}
                        </button>

                        <button class="btn btn-ghost" data-no>
                            Cancel
                        </button>

                    </div>

                </div>
            `;


            document.body.appendChild(o);


            // Close modal and return result
            const done = v => {

                o.remove();

                resolve(v);
            };


            // Confirm button
            o.querySelector('[data-ok]').onclick = () => done(true);

            // Cancel button
            o.querySelector('[data-no]').onclick = () => done(false);


            // Close when clicking outside
            o.addEventListener('click', e => {

                if (e.target === o) done(false);

            });

        });
    }


    /* ==================================================
       12. MODAL FUNCTIONS
       فتح وإغلاق النوافذ المنبثقة
       ================================================== */

    // Open modal
    const openModal = id =>
        document.getElementById(id).classList.add('open');


    // Close modal
    const closeModal = id =>
        document.getElementById(id).classList.remove('open');


    // Handle modal closing events
    document.addEventListener('click', e => {

        // Close when clicking modal background
        if (
            e.target.classList &&
            e.target.classList.contains('modal-overlay') &&
            e.target.id
        ) {
            e.target.classList.remove('open');
        }


        // Close when clicking an element with data-close
        const c = e.target.closest &&
            e.target.closest('[data-close]');

        if (c) {
            c.closest('.modal-overlay').classList.remove('open');
        }

    });


    /* ==================================================
       13. ICONS
       تعريف الأيقونات المستخدمة في الموقع
       ================================================== */

    const ICONS = {

        library: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M9 7h7"/>',

        grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',

        books: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',

        users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17.5" cy="9" r="2.5"/><path d="M17 14.2c2.7.2 4.5 2 4.5 4.8"/>',

        borrow: '<path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 20h16"/>',

        ret: '<path d="M12 4v12"/><path d="m7 11 5 5 5-5"/><path d="M4 20h16"/>',

        clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',

        logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',

        check: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/>'
    };


    // Generate SVG icon
    const icon = n =>
        `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;


    /* ==================================================
       14. NAVIGATION MENU
       روابط التنقل بين صفحات النظام
       ================================================== */

    const NAV = [

        ['dashboard', 'dashboard.html', 'grid', 'Dashboard'],

        ['books', 'books.html', 'books', 'Book Management'],

        ['members', 'members.html', 'users', 'Member Management'],

        ['borrow', 'borrow.html', 'borrow', 'Borrow a Book'],

        ['return', 'return.html', 'ret', 'Return a Book'],

        ['history', 'history.html', 'clock', 'Borrowing History']

    ];


    /* ==================================================
       15. RENDER SIDEBAR
       إنشاء الشريط الجانبي وعرض معلومات المستخدم
       ================================================== */

    function renderSidebar() {

        const el = document.getElementById('sidebar');

        // Stop if sidebar element does not exist
        if (!el) return;


        // Get current page and logged-in user
        const page = document.body.dataset.page;

        const user = currentUser();


        // Count overdue borrowing records
        const overdue = read(KEYS.loans).filter(l =>
            statusOf(l) === 'overdue'
        ).length;


        // Build sidebar HTML
        el.innerHTML = `

            <div class="brand">

                <span class="brand-mark">
                    ${icon('library')}
                    <i class="brand-dot"></i>
                </span>

                <div>
                    <h2>LIMU Library</h2>
                    <p>Library Management</p>
                </div>

            </div>


            <nav class="nav">

                ${NAV.map(n => `

                    <a href="${n[1]}" class="${n[0] === page ? 'active' : ''}">

                        ${icon(n[2])}

                        <span>${n[3]}</span>

                        ${n[0] === 'history' && overdue
                            ? `<span class="count" title="Overdue loans">${overdue}</span>`
                            : ''
                        }

                    </a>

                `).join('')}

            </nav>


            <div class="sidebar-foot">

                <div class="who">

                    <span class="avatar">
                        ${esc(user[0].toUpperCase())}
                    </span>

                    <div>
                        <b>${esc(user)}</b>
                        <small>Administrator</small>
                    </div>

                </div>


                <button class="btn-logout"
                        id="logoutBtn"
                        title="Log out"
                        aria-label="Log out">

                    ${icon('logout')}

                </button>

            </div>

        `;


        // Connect logout button
        document.getElementById('logoutBtn').onclick = logout;
    }


    /* ==================================================
       16. INITIALIZATION
       تشغيل الوظائف الأساسية عند فتح الموقع
       ================================================== */

    // Create demo data if needed
    seed();


    // Display icons in HTML elements
    document.querySelectorAll('[data-icon]').forEach(el => {

        el.innerHTML = icon(el.dataset.icon);

    });


    // Check login status on all pages except login page
    if (document.body.dataset.page !== 'login') {

        if (!isLoggedIn()) {

            // Redirect to login page
            location.replace('index.html');

        } else {

            // Display sidebar
            renderSidebar();

        }
    }


    /* ==================================================
       17. EXPORT FUNCTIONS
       إتاحة الوظائف لبقية ملفات JavaScript
       ================================================== */

    return {

        KEYS,
        read,
        write,

        today,
        addDays,

        esc,
        nextId,

        login,
        logout,
        isLoggedIn,
        currentUser,
        ready,


        statusOf,
        badge,
        LABELS,

        toast,
        confirmBox,

        openModal,
        closeModal,

        // Get data
        books: () => read(KEYS.books),
        members: () => read(KEYS.members),
        loans: () => read(KEYS.loans),

        // Save data
        saveBooks: v => write(KEYS.books, v),
        saveMembers: v => write(KEYS.members, v),
        saveLoans: v => write(KEYS.loans, v)

    };

})();