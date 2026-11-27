
function $(id) {
    return document.getElementById(id);
}

const books = LMS.books();
const members = LMS.members();
const loans = LMS.loans();


let totalBooks = 0;
let availableBooks = 0;
for (let i = 0; i < books.length; i++) {
    totalBooks += books[i].quantity;
    availableBooks += books[i].available;
}

let borrowedCount = 0;   
let overdueCount = 0;    
for (let i = 0; i < loans.length; i++) {
    if (!loans[i].returnDate) {
        borrowedCount++;
    }
    if (LMS.statusOf(loans[i]) === 'overdue') {
        overdueCount++;
    }
}

$('sBooks').textContent = totalBooks;
$('sMembers').textContent = members.length;
$('sBorrowed').textContent = borrowedCount;
$('sAvail').textContent = availableBooks;

$('todayLabel').textContent = new Date().toLocaleDateString('en-GB');

if (overdueCount > 0) {
    $('overdueAlert').hidden = false;
    $('overdueAlert').textContent = 'There are ' + overdueCount + ' overdue loans.';
}


function render() {

    const q = $('search').value.trim().toLowerCase();
    const status = $('status').value;

    const sorted = loans.slice().sort(function (a, b) {
        return b.id.localeCompare(a.id);
    });

    let html = '';

    for (let i = 0; i < sorted.length; i++) {

        const l = sorted[i];

        const member = members.find(function (m) { return m.id === l.memberId; });
        const book = books.find(function (b) { return b.id === l.bookId; });

        const memberName = member ? member.name : '— (Deleted)';
        const bookTitle = book ? book.title : '— (Deleted)';

        if (status !== '' && LMS.statusOf(l) !== status) {
            continue;
        }

        const text = (l.id + ' ' + memberName + ' ' + bookTitle).toLowerCase();
        if (!text.includes(q)) {
            continue;
        }

        let rowClass = '';
        if (LMS.statusOf(l) === 'overdue') {
            rowClass = 'late';
        }

        html += '<tr class="' + rowClass + '">' +
            '<td class="num">' + LMS.esc(l.id) + '</td>' +
            '<td>' + LMS.esc(memberName) + '</td>' +
            '<td>' + LMS.esc(bookTitle) + '</td>' +
            '<td class="num">' + l.borrowDate + '</td>' +
            '<td class="num">' + l.dueDate + '</td>' +
            '<td class="num">' + (l.returnDate || '—') + '</td>' +
            '<td>' + LMS.badge(l) + '</td>' +
            '</tr>';
    }

    if (html === '') {
        html = '<tr><td colspan="7" class="empty">No matching records.</td></tr>';
    }

    $('rows').innerHTML = html;
}

$('search').oninput = render;
$('status').onchange = render;

render();
