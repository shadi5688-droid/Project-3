const KEYS = {
    books: 'limu_lh_books',
    members: 'limu_lh_members',
    loans: 'limu_lh_loans',
    session: 'limu_lh_session',
    seeded: 'limu_lh_seeded'
};

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

const LMS = {


    read: function (key) {
        const text = localStorage.getItem(key);
        if (text === null) {
            return [];
        }
        return JSON.parse(text);
    },

    write: function (key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },

    books: function () {
        return LMS.read(KEYS.books);
    },

    members: function () {
        return LMS.read(KEYS.members);
    },

    loans: function () {
        return LMS.read(KEYS.loans);
    },

    saveBooks: function (list) {
        LMS.write(KEYS.books, list);
    },

    saveMembers: function (list) {
        LMS.write(KEYS.members, list);
    },

    saveLoans: function (list) {
        LMS.write(KEYS.loans, list);
    },



    formatDate: function (d) {
        const year = d.getFullYear();
        let month = d.getMonth() + 1;  //@@@
        let day = d.getDate();

        if (month < 10) { month = '0' + month; }
        if (day < 10) { day = '0' + day; }

        return year + '-' + month + '-' + day;
    },
     


    // اليوم 
    today: function () {
        return LMS.formatDate(new Date());
    },
     

    addDays: function (dateText, days) {
        const d = new Date(dateText + 'T00:00:00');
        d.setDate(d.getDate() + days);
        return LMS.formatDate(d);
    },


    esc: function (text) {
        if (text === null || text === undefined) {
            return '';
        }
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },

    nextId: function (prefix, list) {
        let max = 0;

        for (let i = 0; i < list.length; i++) {
            const number = parseInt(list[i].id.slice(prefix.length), 10);
            if (number > max) {
                max = number;
            }
        }

        let next = String(max + 1);
        while (next.length < 3) {
            next = '0' + next;
        }
        return prefix + next;
    },



    seed: function () {

        if (localStorage.getItem(KEYS.seeded)) {
            return;
        }

        const t = LMS.today();

        LMS.saveBooks([
            { id: 'B001', title: 'Introduction to History', author: 'Ibn Khaldun', category: 'History', isbn: '9789770000011', quantity: 5, available: 4 },
            { id: 'B002', title: 'The Days', author: 'Taha Hussein', category: 'Literature', isbn: '9789770000028', quantity: 4, available: 4 },
            { id: 'B003', title: 'Kalila and Dimna', author: 'Ibn al-Muqaffa', category: 'Literature', isbn: '9789770000035', quantity: 3, available: 3 },
            { id: 'B004', title: 'Learning JavaScript', author: 'Ahmed Salem', category: 'Technology', isbn: '9789770000042', quantity: 6, available: 5 },
            { id: 'B005', title: 'The Little Prince', author: 'Antoine de Saint-Exupery', category: 'Fiction', isbn: '9789770000059', quantity: 4, available: 4 },
            { id: 'B006', title: 'Granada Trilogy', author: 'Radwa Ashour', category: 'Fiction', isbn: '9789770000066', quantity: 3, available: 3 }
        ]);

        LMS.saveMembers([
            { id: 'M001', name: 'Sara Ahmed', phone: '+218912345678', email: 'sara@example.com', regDate: LMS.addDays(t, -90) },
            { id: 'M002', name: 'Khaled Mansour', phone: '+218923456789', email: 'khaled@example.com', regDate: LMS.addDays(t, -60) },
            { id: 'M003', name: 'Noura Ali', phone: '+218934567890', email: 'noura@example.com', regDate: LMS.addDays(t, -30) }
        ]);

        LMS.saveLoans([
            { id: 'L001', memberId: 'M001', bookId: 'B001', borrowDate: LMS.addDays(t, -20), dueDate: LMS.addDays(t, -6), returnDate: null },
            { id: 'L002', memberId: 'M002', bookId: 'B004', borrowDate: LMS.addDays(t, -5), dueDate: LMS.addDays(t, 9), returnDate: null },
            { id: 'L003', memberId: 'M003', bookId: 'B002', borrowDate: LMS.addDays(t, -30), dueDate: LMS.addDays(t, -16), returnDate: LMS.addDays(t, -18) }
        ]);

        localStorage.setItem(KEYS.seeded, '1');
    },



    currentUser: function () {
        return sessionStorage.getItem(KEYS.session);
    },

    isLoggedIn: function () {
        return LMS.currentUser() === ADMIN_USERNAME;
    },

    login: function (username, password) {
        if (username.toLowerCase() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            sessionStorage.setItem(KEYS.session, ADMIN_USERNAME);
            return true;
        }
        return false;
    },

    logout: function () {
        sessionStorage.removeItem(KEYS.session);
        location.replace('index.html');
    },


  //حالة الاستعارة  //////////////////////////////
    statusOf: function (loan) {
        if (loan.returnDate) {
            return 'returned';
        }

        if (loan.dueDate < LMS.today()) {
            return 'overdue';
        }
        return 'borrowed';
    },

    badge: function (loan) {
        const status = LMS.statusOf(loan);

        let label = 'Borrowed';
        if (status === 'overdue') { label = 'Overdue'; }
        if (status === 'returned') { label = 'Returned'; }

        return '<span class="badge badge-' + status + '">' + label + '</span>';
    },


   

    toast: function (message, type) {

        if (!type) { type = 'success'; }

        let box = document.querySelector('.toast-box');
        if (!box) {
            box = document.createElement('div');
            box.className = 'toast-box';
            document.body.appendChild(box);
        }

        const t = document.createElement('div');
        t.className = 'toast toast-' + type;
        t.textContent = message;
        box.appendChild(t);

        setTimeout(function () {
            t.remove();
        }, 3200);
    },



    openModal: function (id) {
        document.getElementById(id).classList.add('open');
    },

    closeModal: function (id) {
        document.getElementById(id).classList.remove('open');
    },



    icons: {
        library: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M9 7h7"/>',
        grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
        books: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
        users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17.5" cy="9" r="2.5"/><path d="M17 14.2c2.7.2 4.5 2 4.5 4.8"/>',
        borrow: '<path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 20h16"/>',
        ret: '<path d="M12 4v12"/><path d="m7 11 5 5 5-5"/><path d="M4 20h16"/>',
        logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
        check: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/>'
    },

    icon: function (name) {
        return '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">' + LMS.icons[name] + '</svg>';
    },


    nav: [
        ['dashboard', 'dashboard.html', 'grid', 'Dashboard'],
        ['books', 'books.html', 'books', 'Book Management'],
        ['members', 'members.html', 'users', 'Member Management'],
        ['borrow', 'borrow.html', 'borrow', 'Borrow a Book'],
        ['return', 'return.html', 'ret', 'Return a Book']
    ],

    showSidebar: function () {

        const sidebar = document.getElementById('sidebar');

        if (!sidebar) {
            return;
        }

        const page = document.body.dataset.page;
        const user = LMS.currentUser();

        const loans = LMS.loans();
        let overdue = 0;
        for (let i = 0; i < loans.length; i++) {
            if (LMS.statusOf(loans[i]) === 'overdue') {
                overdue++;
            }
        }

        let links = '';
        for (let i = 0; i < LMS.nav.length; i++) {
            const n = LMS.nav[i];

            let activeClass = '';
            if (n[0] === page) {
                activeClass = 'active';
            }

            let countHtml = '';
            if (n[0] === 'return' && overdue > 0) {
                countHtml = '<span class="count" title="Overdue loans">' + overdue + '</span>';
            }

            links += '<a href="' + n[1] + '" class="' + activeClass + '">' +
                LMS.icon(n[2]) +
                '<span>' + n[3] + '</span>' +
                countHtml +
                '</a>';
        }

        sidebar.innerHTML =
            '<div class="brand">' +
                '<span class="brand-mark">' + LMS.icon('library') + '<i class="brand-dot"></i></span>' +
                '<div><h2>LIMU Library</h2><p>Library Management</p></div>' +
            '</div>' +

            '<nav class="nav">' + links + '</nav>' +

            '<div class="sidebar-foot">' +
                '<div class="who">' +
                    '<span class="avatar">' + LMS.esc(user[0].toUpperCase()) + '</span>' +
                    '<div><b>' + LMS.esc(user) + '</b><small>Administrator</small></div>' +
                '</div>' +
                '<button class="btn-logout" id="logoutBtn" title="Log out" aria-label="Log out">' +
                    LMS.icon('logout') +
                '</button>' +
            '</div>';

        document.getElementById('logoutBtn').onclick = LMS.logout;
    }
};


LMS.seed();

const iconElements = document.querySelectorAll('[data-icon]');
for (let i = 0; i < iconElements.length; i++) {
    iconElements[i].innerHTML = LMS.icon(iconElements[i].dataset.icon);
}

document.addEventListener('click', function (e) {

    if (e.target.classList.contains('modal-overlay') && e.target.id) {
        e.target.classList.remove('open');
    }

    if (e.target.hasAttribute('data-close')) {
        e.target.closest('.modal-overlay').classList.remove('open');
    }
});

if (document.body.dataset.page !== 'login') {
    if (!LMS.isLoggedIn()) {
        location.replace('index.html');
    } else {
        LMS.showSidebar();
    }
}
