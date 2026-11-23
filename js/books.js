const $ = id => document.getElementById(id);

const esc = LMS.esc;


function render() {

    const q = $('search').value.trim().toLowerCase();

    const list = LMS.books().filter(b =>
        [b.id, b.title, b.author, b.category, b.isbn]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );

    $('rows').innerHTML = list.length

        ? list.map(b => `
            <tr>
                <td class="num">${esc(b.id)}</td>
                <td>${esc(b.title)}</td>
                <td>${esc(b.author)}</td>
                <td>${esc(b.category)}</td>
                <td class="num">${esc(b.isbn)}</td>
                <td>${b.quantity}</td>

                <td>
                    <span class="badge ${b.available > 0 ? 'badge-avail' : 'badge-none'}">
                        ${b.available}
                    </span>
                </td>

                <td class="actions">
                    <button class="btn btn-ghost btn-sm" data-edit="${b.id}">
                        Edit
                    </button>

                    <button class="btn btn-danger btn-sm" data-del="${b.id}">
                        Delete
                    </button>
                </td>
            </tr>
        `).join('')

        : `
            <tr>
                <td colspan="8" class="empty">
                    No matching books. Add a new book to get started.
                </td>
            </tr>
        `;

    $('cats').innerHTML = [
        ...new Set(LMS.books().map(b => b.category))
    ].map(c => `<option value="${esc(c)}">`).join('');
}


function openForm(b) {

    $('modalTitle').textContent = b ? 'Edit Book' : 'Add Book';

    $('bid').value = b ? b.id : '';

    $('title').value = b ? b.title : '';
    $('author').value = b ? b.author : '';
    $('category').value = b ? b.category : '';
    $('isbn').value = b ? b.isbn : '';

    $('qty').value = b ? b.quantity : 1;

    // Clear previous error message
    $('formErr').textContent = '';

    // Open the modal window
    LMS.openModal('modal');

    $('title').focus();
}

$('addBtn').onclick = () => openForm(null);

$('search').oninput = render;


$('form').addEventListener('submit', e => {

    e.preventDefault();

    const data = {
        title: $('title').value.trim(),
        author: $('author').value.trim(),
        category: $('category').value.trim(),
        isbn: $('isbn').value.trim(),
        quantity: parseInt($('qty').value, 10)
    };

    if (!data.title || !data.author || !data.category || !data.isbn)
        return $('formErr').textContent =
            'Please complete all required fields.';

    if (!(data.quantity >= 1))
        return $('formErr').textContent =
            'Quantity must be at least 1.';

    const books = LMS.books();
    const id = $('bid').value;

    if (books.some(b => b.isbn === data.isbn && b.id !== id))
        return $('formErr').textContent =
            'This ISBN is already assigned to another book.';


    if (id) {

        const b = books.find(x => x.id === id);

        const out = b.quantity - b.available;

        if (data.quantity < out)
            return $('formErr').textContent =
                `Quantity cannot be less than ${out} (copies are currently on loan).`;

        Object.assign(b, data, {
            available: data.quantity - out
        });

        LMS.toast('Book updated successfully');

    }

    else {

        books.push({
            id: LMS.nextId('B', books),
            ...data,
            available: data.quantity
        });

        LMS.toast('Book added successfully');
    }

    LMS.saveBooks(books);

    LMS.closeModal('modal');
    render();

});


$('rows').addEventListener('click', async e => {

    const ed = e.target.closest('[data-edit]');
    const del = e.target.closest('[data-del]');


    if (ed) {

        openForm(
            LMS.books().find(b => b.id === ed.dataset.edit)
        );
    }


    if (del) {

        const id = del.dataset.del;

        if (LMS.loans().some(l =>
            l.bookId === id && !l.returnDate
        ))
            return LMS.toast(
                'A book with copies currently on loan cannot be deleted.',
                'error'
            );

        if (await LMS.confirmBox(
            'Are you sure you want to permanently delete this book?',
            'Delete',
            true
        )) {

            LMS.saveBooks(
                LMS.books().filter(b => b.id !== id)
            );

            LMS.toast('Book deleted successfully');

            render();
        }
    }

});


render();
