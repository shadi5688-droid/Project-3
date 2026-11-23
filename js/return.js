
const $ = id => document.getElementById(id);

const esc = LMS.esc;


function render() {

    const q = $('search').value.trim().toLowerCase();

    const members = LMS.members();
    const books = LMS.books();


    const rows = LMS.loans()

        .filter(l => !l.returnDate)

        .map(l => ({
            l,
            m: members.find(x => x.id === l.memberId) || {},
            b: books.find(x => x.id === l.bookId) || {}
        }))

        .filter(r =>
            [r.l.id, r.m.name, r.m.phone, r.b.title]
                .join(' ')
                .toLowerCase()
                .includes(q)
        );


    $('rows').innerHTML = rows.length

        ? rows.map(({ l, m, b }) => `
            <tr class="${LMS.statusOf(l) === 'overdue' ? 'late' : ''}">

                <td class="num">${l.id}</td>

                <td>${esc(m.name || '— (Deleted)')}</td>

                <td class="num">${esc(m.phone || '—')}</td>

                <td>${esc(b.title || '— (Deleted)')}</td>

                <td class="num">${l.borrowDate}</td>

                <td class="num">${l.dueDate}</td>

                <td>${LMS.badge(l)}</td>

                <td>
                    <button class="btn btn-ok btn-sm"
                        data-ret="${l.id}">
                        Record Return
                    </button>
                </td>

            </tr>
        `).join('')

        : `
            <tr>
                <td colspan="8" class="empty">
                    There are no books awaiting return.
                </td>
            </tr>
        `;
}


$('search').oninput = render;


$('rows').addEventListener('click', async e => {

    const btn = e.target.closest('[data-ret]');

    if (!btn) return;


    if (!await LMS.confirmBox(
        'Confirm that the book has been received and returned?',
        'Record Return'
    )) {
        return;
    }


    const loans = LMS.loans();
    const l = loans.find(x => x.id === btn.dataset.ret);

    if (!l || l.returnDate) return;


    l.returnDate = LMS.today();


    const books = LMS.books();
    const b = books.find(x => x.id === l.bookId);


    if (b) {

        b.available = Math.min(
            b.available + 1,
            b.quantity
        );

        LMS.saveBooks(books);
    }


    LMS.saveLoans(loans);

    LMS.toast('Book return recorded successfully');

    render();

});

render();
