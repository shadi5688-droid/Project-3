const books = LMS.books();
const members = LMS.members();
const loans = LMS.loans();

const $ = id => document.getElementById(id);

const active = loans.filter(l => !l.returnDate);

$('sBooks').textContent = books.reduce(
    (sum, book) => sum + book.quantity, 0
);

$('sMembers').textContent = members.length;

$('sBorrowed').textContent = active.length;

$('sAvail').textContent = books.reduce(
    (sum, book) => sum + book.available, 0
);



$('todayLabel').textContent = new Date().toLocaleDateString(
    'en-GB',
    {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }
);


const overdue = loans.filter(
    l => LMS.statusOf(l) === 'overdue'
).length;

if (overdue) {
    const a = $('overdueAlert');

    a.hidden = false;
    a.textContent =
        `⚠️ There are ${overdue} overdue loans. Check Borrowing History.`;
}


const mName = id =>
    (members.find(m => m.id === id) || {}).name || '— (Deleted)';

const bName = id =>
    (books.find(b => b.id === id) || {}).title || '— (Deleted)';


const recent = [...loans]
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 6);


$('recent').innerHTML = recent.length

    ? recent.map(l => `
        <tr>
            <td>${LMS.esc(mName(l.memberId))}</td>
            <td>${LMS.esc(bName(l.bookId))}</td>
            <td class="num">${l.borrowDate}</td>
            <td>${LMS.badge(l)}</td>
        </tr>
    `).join('')

    : `
        <tr>
            <td colspan="4" class="empty">
                No recent activity.
            </td>
        </tr>
    `;
