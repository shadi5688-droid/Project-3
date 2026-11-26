
function $(id) {
    return document.getElementById(id);
}

const esc = LMS.esc;

function fillSelects() {

    const members = LMS.members();
    const books = LMS.books();

    let memberOptions = '<option value="">— Select a member —</option>';
    for (let i = 0; i < members.length; i++) {
        memberOptions += '<option value="' + members[i].id + '">' +
            esc(members[i].name) + ' (' + members[i].id + ')</option>';
    }
    $('member').innerHTML = memberOptions;

    let bookOptions = '<option value="">— Select a book —</option>';
    let availableCount = 0;
    for (let i = 0; i < books.length; i++) {
        if (books[i].available > 0) {
            availableCount++;
            bookOptions += '<option value="' + books[i].id + '">' +
                esc(books[i].title) + ' — ' + esc(books[i].author) + '</option>';
        }
    }
    $('book').innerHTML = bookOptions;

    if (availableCount === 0) {
        $('availInfo').textContent = 'No books are currently available.';
    } else {
        $('availInfo').textContent = '';
    }
}

function resetDates() {
    $('borrowDate').value = LMS.today();
    $('dueDate').value = LMS.addDays(LMS.today(), 14);
}

$('borrowDate').onchange = function () {
    if ($('borrowDate').value !== '') {
        $('dueDate').value = LMS.addDays($('borrowDate').value, 14);
    }
};

$('book').onchange = function () {

    const book = LMS.books().find(function (b) {
        return b.id === $('book').value;
    });

    if (book) {
        $('availInfo').textContent = 'Available copies: ' + book.available + ' of ' + book.quantity;
    } else {
        $('availInfo').textContent = '';
    }
};


function renderRecent() {

    const members = LMS.members();
    const books = LMS.books();

    const sorted = LMS.loans().sort(function (a, b) {
        return b.id.localeCompare(a.id);
    });

    const recent = sorted.slice(0, 5);

    let html = '';

    for (let i = 0; i < recent.length; i++) {
        const l = recent[i];

        const member = members.find(function (m) { return m.id === l.memberId; });
        const book = books.find(function (b) { return b.id === l.bookId; });

        html += '<tr>' +
            '<td class="num">' + esc(l.id) + '</td>' +
            '<td>' + esc(member ? member.name : '— (Deleted)') + '</td>' +
            '<td>' + esc(book ? book.title : '— (Deleted)') + '</td>' +
            '<td class="num">' + esc(l.borrowDate) + '</td>' +
            '<td class="num">' + esc(l.dueDate) + '</td>' +
            '</tr>';
    }

    if (html === '') {
        html = '<tr><td colspan="5" class="empty">No borrowings have been recorded yet.</td></tr>';
    }

    $('rows').innerHTML = html;
}



$('form').addEventListener('submit', function (e) {

    e.preventDefault();

    const memberId = $('member').value;
    const bookId = $('book').value;
    const borrowDate = $('borrowDate').value;
    const dueDate = $('dueDate').value;
    const err = $('formErr');

    if (memberId === '' || bookId === '') {
        err.textContent = 'Please select a member and a book.';
        return;
    }

    if (borrowDate === '' || dueDate === '') {
        err.textContent = 'Please select the borrow date and due date.';
        return;
    }

    if (dueDate < borrowDate) {
        err.textContent = 'The due date cannot be earlier than the borrow date.';
        return;
    }

    const books = LMS.books();
    const book = books.find(function (b) { return b.id === bookId; });

    if (!book || book.available < 1) {
        err.textContent = 'No available copy of this book.';
        return;
    }

    const loans = LMS.loans();
    for (let i = 0; i < loans.length; i++) {
        if (loans[i].memberId === memberId && loans[i].bookId === bookId && !loans[i].returnDate) {
            err.textContent = 'This member already has this book on loan.';
            return;
        }
    }

    err.textContent = '';

    book.available = book.available - 1;

    loans.push({
        id: LMS.nextId('L', loans),
        memberId: memberId,
        bookId: bookId,
        borrowDate: borrowDate,
        dueDate: dueDate,
        returnDate: null
    });

    LMS.saveBooks(books);
    LMS.saveLoans(loans);

    LMS.toast('Borrowing recorded successfully');

    $('form').reset();
    resetDates();
    fillSelects();
    renderRecent();
});

fillSelects();
resetDates();
renderRecent();
