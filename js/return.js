function $(id) {
    return document.getElementById(id);
}

const esc = LMS.esc;




function render() {


    const q = $('search').value.trim().toLowerCase();
    const members = LMS.members();
    const books = LMS.books();
    const loans = LMS.loans();

    let html = '';


    for (let i = 0; i < loans.length; i++) {
        const l = loans[i];

        if (l.returnDate) {
            continue;
        }
        

        const member = members.find(function (m) { return m.id === l.memberId; });
        const book = books.find(function (b) { return b.id === l.bookId; });

        const memberName = member ? member.name : '— (Deleted)';
        const memberPhone = member ? member.phone : '—';
        const bookTitle = book ? book.title : '— (Deleted)';

        const text = [l.id, memberName, memberPhone, bookTitle].join(' ').toLowerCase();
        if (!text.includes(q)) {
            continue;
        }

        let rowClass = '';
        if (LMS.statusOf(l) === 'overdue') {
            rowClass = 'late';
        }

        html += '<tr class="' + rowClass + '">' +
            '<td class="num">' + esc(l.id) + '</td>' +
            '<td>' + esc(memberName) + '</td>' +
            '<td class="num">' + esc(memberPhone) + '</td>' +
            '<td>' + esc(bookTitle) + '</td>' +
            '<td class="num">' + l.borrowDate + '</td>' +
            '<td class="num">' + l.dueDate + '</td>' +
            '<td>' + LMS.badge(l) + '</td>' +
            '<td><button class="btn btn-ok btn-sm" onclick="returnBook(\'' + l.id + '\')">Record Return</button></td>' +
            '</tr>';
    }

    if (html === '') {
        html = '<tr><td colspan="8" class="empty">There are no books awaiting return.</td></tr>';
    }

    $('rows').innerHTML = html;
}

$('search').oninput = render;




function returnBook(loanId) {

    if (!confirm('Confirm that the book has been received and returned?')) {
        return;
    }

    const loans = LMS.loans();
    const loan = loans.find(function (x) { return x.id === loanId; });

    if (!loan || loan.returnDate) {
        return;
    }

    loan.returnDate = LMS.today();

    const books = LMS.books();
    const book = books.find(function (b) { return b.id === loan.bookId; });

    if (book) {
        book.available = book.available + 1;

        if (book.available > book.quantity) {
            book.available = book.quantity;
        }

        LMS.saveBooks(books);
    }

    LMS.saveLoans(loans);

    LMS.toast('Book return recorded successfully');

    render();
}


render();
