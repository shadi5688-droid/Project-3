// ==========================================
// 1. Helper Functions
// ==========================================

// Get HTML elements by ID
const $ = id => document.getElementById(id);

// Escape text before displaying it
const esc = LMS.esc;


// ==========================================
// 2. Render Members
// ==========================================

function render() {

    // Get search text
    const q = $('search').value.trim().toLowerCase();

    // Search members by ID, name, phone, or email
    const list = LMS.members().filter(m =>
        [m.id, m.name, m.phone, m.email]
            .join(' ')
            .toLowerCase()
            .includes(q)
    );

    // Display members in the table
    $('rows').innerHTML = list.length

        ? list.map(m => `
            <tr>
                <td class="num">${esc(m.id)}</td>
                <td>${esc(m.name)}</td>
                <td class="num">${esc(m.phone)}</td>
                <td class="num">${esc(m.email) || '—'}</td>
                <td class="num">${esc(m.regDate)}</td>

                <td class="actions">
                    <button class="btn btn-ghost btn-sm"
                        data-edit="${m.id}">Edit</button>

                    <button class="btn btn-danger btn-sm"
                        data-del="${m.id}">Delete</button>
                </td>
            </tr>
        `).join('')

        : `
            <tr>
                <td colspan="6" class="empty">
                    No matching members. Add a new member to get started.
                </td>
            </tr>
        `;
}


// ==========================================
// 3. Open Add / Edit Member Form
// ==========================================

function openForm(m) {

    // Set form title
    $('modalTitle').textContent = m ? 'Edit Member' : 'Add Member';

    // Fill form fields
    $('mid').value = m ? m.id : '';
    $('name').value = m ? m.name : '';
    $('phone').value = m ? m.phone : '';
    $('email').value = m ? m.email : '';
    $('regDate').value = m ? m.regDate : LMS.today();

    // Clear previous error message
    $('formErr').textContent = '';

    // Open modal and focus on name field
    LMS.openModal('modal');
    $('name').focus();
}


// ==========================================
// 4. Add Button and Search Event
// ==========================================

// Open empty form when Add button is clicked
$('addBtn').onclick = () => openForm(null);

// Update table when searching
$('search').oninput = render;


// ==========================================
// 5. Add or Update Member
// ==========================================

$('form').addEventListener('submit', e => {

    // Prevent page refresh
    e.preventDefault();

    // Get form data
    const data = {
        name: $('name').value.trim(),
        phone: $('phone').value.trim(),
        email: $('email').value.trim(),
        regDate: $('regDate').value || LMS.today()
    };


    // --------------------------------------
    // Validate Required Fields
    // --------------------------------------

    if (!data.name || !data.phone) {
        return $('formErr').textContent =
            'Name and phone number are required.';
    }


    // --------------------------------------
    // Validate Phone Number
    // --------------------------------------

    if (!/^[0-9+\-\s]{7,16}$/.test(data.phone)) {
        return $('formErr').textContent =
            'Please enter a valid phone number.';
    }


    // --------------------------------------
    // Validate Email Address
    // --------------------------------------

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        return $('formErr').textContent =
            'Please enter a valid email address.';
    }


    // --------------------------------------
    // Save Member Data
    // --------------------------------------

    const members = LMS.members();
    const id = $('mid').value;

    // Update existing member
    if (id) {

        Object.assign(
            members.find(m => m.id === id),
            data
        );

        LMS.toast('Member updated successfully');

    }

    // Add new member
    else {

        members.push({
            id: LMS.nextId('M', members),
            ...data
        });

        LMS.toast('Member added successfully');
    }


    // Save changes and refresh page
    LMS.saveMembers(members);
    LMS.closeModal('modal');
    render();

});


// ==========================================
// 6. Edit and Delete Members
// ==========================================

$('rows').addEventListener('click', async e => {

    // Check which button was clicked
    const ed = e.target.closest('[data-edit]');
    const del = e.target.closest('[data-del]');


    // --------------------------------------
    // Edit Member
    // --------------------------------------

    if (ed) {
        openForm(
            LMS.members().find(m => m.id === ed.dataset.edit)
        );
    }


    // --------------------------------------
    // Delete Member
    // --------------------------------------

    if (del) {

        const id = del.dataset.del;

        // Prevent deleting a member with unreturned books
        if (LMS.loans().some(l =>
            l.memberId === id && !l.returnDate
        )) {
            return LMS.toast(
                'A member with unreturned books cannot be deleted.',
                'error'
            );
        }


        // Ask for confirmation before deletion
        if (await LMS.confirmBox(
            'Are you sure you want to permanently delete this member?',
            'Delete',
            true
        )) {

            // Remove member and save changes
            LMS.saveMembers(
                LMS.members().filter(m => m.id !== id)
            );

            LMS.toast('Member deleted successfully');
            render();
        }
    }

});


// ==========================================
// 7. Initialize Page
// ==========================================

render();
