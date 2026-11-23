const $ = id => document.getElementById(id);

const esc = LMS.esc;


function render() {

    // Get search text and selected status
    const q = $('search').value.trim().toLowerCase();
    const st = $('status').value;

    // Get members and books data
    const members = LMS.members();
    const books = LMS.books();


    const rows = [...LMS.loans()]

        .sort((a, b) => b.id.localeCompare(a.id))

        .map(l => ({
            l,
            m: members.find(x => x.id === l.memberId) || {},
            b: books.find(x => x.id === l.bookId) || {}
        }))

        .filter(r =>
            (!st || LMS.statusOf(r.l) === st) &&
            [r.l.id, r.m.name, r.b.title]
                .join(' ')
                .toLowerCase()
                .includes(q)
        );


    $('rows').innerHTML = rows.length

        ? rows.map(({ l, m, b }) => `
            <tr class="${LMS.statusOf(l) === 'overdue' ? 'late' : ''}">

                <td class="num">${l.id}</td>

                <td>${esc(m.name || '— (Deleted)')}</td>

                <td>${esc(b.title || '— (Deleted)')}</td>

                <td class="num">${l.borrowDate}</td>

                <td class="num">${l.dueDate}</td>

                <td class="num">${l.returnDate || '—'}</td>

                <td>${LMS.badge(l)}</td>

            </tr>
        `).join('')

        : `
            <tr>
                <td colspan="7" class="empty">
                    No matching records.
                </td>
            </tr>
        `;
}


$('search').oninput = render;

$('status').onchange = render;


render();
