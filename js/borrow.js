const $ = id => document.getElementById(id);

const esc = LMS.esc;

function fillSelects() {

    const members = LMS.members();

    const books = LMS.books().filter(b => b.available > 0);


    $('member').innerHTML =
        '<option value="">— Select a member —</option>' +

        members.map(m => `
            <option value="${m.id}">
                ${esc(m.name)} (${m.id})
            </option>
        `).join('');


    $('book').innerHTML =
        '<option value="">— Select a book —</option>' +

        books.map(b => `
            <option value="${b.id}">
                ${esc(b.title)} — ${esc(b.author)}
            </option>
        `).join('');


    $('availInfo').textContent =
        books.length ? '' : 'No books are currently available.';
}


function resetDates() {

    $('borrowDate').value = LMS.today();

    $('dueDate').value = LMS.addDays(LMS.today(), 14);
}


$('book').onchange = () => {

    const b = LMS.books().find(x => x.id === $('book').value);

    $('availInfo').textContent = b
        ? `Available copies: ${b.available} of ${b.quantity}`
        : '';
};


$('borrowDate').onchange = () => {

    // Update due date when borrow date changes
    if ($('borrowDate').value) {

        $('dueDate').value =
            LMS.addDays($('borrowDate').value, 14);
    }
};

function renderRecent() {

    const members = LMS.members();

    const books = LMS.books();


    const list = [...LMS.loans()]
        .sort((a, b) => b.id.localeCompare(a.id))
        .slice(0, 5);


    $('rows').innerHTML = list.length

        ? list.map(l => `
            <tr>

                <td class="num">${esc(l.id)}</td>

                <td>
                    ${esc(
                        (members.find(m => m.id === l.memberId) || {}).name
                        || '— (Deleted)'
                    )}
                </td>

                <td>
                    ${esc(
                        (books.find(b => b.id === l.bookId) || {}).title
                        || '— (Deleted)'
                    )}
                </td>

                <td class="num">${esc(l.borrowDate)}</td>

                <td class="num">${esc(l.dueDate)}</td>

            </tr>
        `).join('')

        : `
            <tr>
                <td colspan="5" class="empty">
                    No borrowings have been recorded yet.
                </td>
            </tr>
        `;
}

$('form').addEventListener('submit', e => {

    e.preventDefault();


    const memberId = $('member').value;

    const bookId = $('book').value;

    const borrowDate = $('borrowDate').value;

    const dueDate = $('dueDate').value;

    const err = $('formErr');


    if (!memberId || !bookId)
        return err.textContent =
            'Please select a member and a book.';


    if (!borrowDate || !dueDate)
        return err.textContent =
            'Please select the borrow date and due date.';


    if (dueDate < borrowDate)
        return err.textContent =
            'The due date cannot be earlier than the borrow date.';


    const books = LMS.books();

    const book = books.find(b => b.id === bookId);


    if (!book || book.available < 1)
        return err.textContent =
            'No available copy of this book.';


    const loans = LMS.loans();


    if (loans.some(l =>
        l.memberId === memberId &&
        l.bookId === bookId &&
        !l.returnDate
    ))
        return err.textContent =
            'This member already has this book on loan.';


    err.textContent = '';


    book.available -= 1;


    loans.push({

        id: LMS.nextId('L', loans),

        memberId,

        bookId,

        borrowDate,

        dueDate,

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
