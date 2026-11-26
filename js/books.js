
function $(id) {
    return document.getElementById(id);
}

const esc = LMS.esc;


function render() {

    const q = $('search').value.trim().toLowerCase();
    const books = LMS.books();

    let html = '';
    const categories = [];

    for (let i = 0; i < books.length; i++) {
        const b = books[i];

        if (!categories.includes(b.category)) {
            categories.push(b.category);
        }

        const text = [b.id, b.title, b.author, b.category, b.isbn].join(' ').toLowerCase();
        if (!text.includes(q)) {
            continue;
        }

        let badgeClass = 'badge-none';
        if (b.available > 0) {
            badgeClass = 'badge-avail';
        }

        html += '<tr>' +
            '<td class="num">' + esc(b.id) + '</td>' +
            '<td>' + esc(b.title) + '</td>' +
            '<td>' + esc(b.author) + '</td>' +
            '<td>' + esc(b.category) + '</td>' +
            '<td class="num">' + esc(b.isbn) + '</td>' +
            '<td>' + b.quantity + '</td>' +
            '<td><span class="badge ' + badgeClass + '">' + b.available + '</span></td>' +
            '<td class="actions">' +
                '<button class="btn btn-ghost btn-sm" onclick="editBook(\'' + b.id + '\')">Edit</button> ' +
                '<button class="btn btn-danger btn-sm" onclick="deleteBook(\'' + b.id + '\')">Delete</button>' +
            '</td>' +
            '</tr>';
    }

    if (html === '') {
        html = '<tr><td colspan="8" class="empty">No matching books. Add a new book to get started.</td></tr>';
    }

    $('rows').innerHTML = html;

    let options = '';
    for (let i = 0; i < categories.length; i++) {
        options += '<option value="' + esc(categories[i]) + '">';
    }
    $('cats').innerHTML = options;
}



function openForm(b) {

    if (b) {
        $('modalTitle').textContent = 'Edit Book';
        $('bid').value = b.id;
        $('title').value = b.title;
        $('author').value = b.author;
        $('category').value = b.category;
        $('isbn').value = b.isbn;
        $('qty').value = b.quantity;
    } else {
        $('modalTitle').textContent = 'Add Book';
        $('bid').value = '';
        $('title').value = '';
        $('author').value = '';
        $('category').value = '';
        $('isbn').value = '';
        $('qty').value = 1;
    }

    $('formErr').textContent = '';
    LMS.openModal('modal');
    $('title').focus();
}

$('addBtn').onclick = function () {
    openForm(null);
};

$('search').oninput = render;

function editBook(id) {
    const book = LMS.books().find(function (b) { return b.id === id; });
    openForm(book);
}



$('form').addEventListener('submit', function (e) {

    e.preventDefault();

    const title = $('title').value.trim();
    const author = $('author').value.trim();
    const category = $('category').value.trim();
    const isbn = $('isbn').value.trim();
    const quantity = parseInt($('qty').value, 10);
    const id = $('bid').value;  

    if (title === '' || author === '' || category === '' || isbn === '') {
        $('formErr').textContent = 'Please complete all required fields.';
        return;
    }

    if (!(quantity >= 1)) {
        $('formErr').textContent = 'Quantity must be at least 1.';
        return;
    }

    const books = LMS.books();

    for (let i = 0; i < books.length; i++) {
        if (books[i].isbn === isbn && books[i].id !== id) {
            $('formErr').textContent = 'This ISBN is already assigned to another book.';
            return;
        }
    }

    if (id !== '') {

        const book = books.find(function (b) { return b.id === id; });

        const out = book.quantity - book.available;

        if (quantity < out) {
            $('formErr').textContent = 'Quantity cannot be less than ' + out + ' (copies are currently on loan).';
            return;
        }

        book.title = title;
        book.author = author;
        book.category = category;
        book.isbn = isbn;
        book.quantity = quantity;
        book.available = quantity - out;

        LMS.toast('Book updated successfully');

    } else {

        books.push({
            id: LMS.nextId('B', books),
            title: title,
            author: author,
            category: category,
            isbn: isbn,
            quantity: quantity,
            available: quantity
        });

        LMS.toast('Book added successfully');
    }

    LMS.saveBooks(books);
    LMS.closeModal('modal');
    render();
});

function deleteBook(id) {

    const loans = LMS.loans();
    for (let i = 0; i < loans.length; i++) {
        if (loans[i].bookId === id && !loans[i].returnDate) {
            LMS.toast('A book with copies currently on loan cannot be deleted.', 'error');
            return;
        }
    }

    if (confirm('Are you sure you want to permanently delete this book?')) {

        const books = LMS.books().filter(function (b) {
            return b.id !== id;
        });

        LMS.saveBooks(books);
        LMS.toast('Book deleted successfully');
        render();
    }
}

render();
