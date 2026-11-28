function $(id) {
    return document.getElementById(id);
}

const esc = LMS.esc;



function render() {

    const q = $('search').value.trim().toLowerCase();
    const members = LMS.members();

    let html = '';

    for (let i = 0; i < members.length; i++) {
        const m = members[i];

        const text = [m.id, m.name, m.phone, m.email].join(' ').toLowerCase();
        if (!text.includes(q)) {
            continue;
        }

        html += '<tr>' +
            '<td class="num">' + esc(m.id) + '</td>' +
            '<td>' + esc(m.name) + '</td>' +
            '<td class="num">' + esc(m.phone) + '</td>' +
            '<td class="num">' + (esc(m.email) || '—') + '</td>' +
            '<td class="num">' + esc(m.regDate) + '</td>' +
            '<td class="actions">' +
                '<button class="btn btn-ghost btn-sm" onclick="editMember(\'' + m.id + '\')">Edit</button> ' +
                '<button class="btn btn-danger btn-sm" onclick="deleteMember(\'' + m.id + '\')">Delete</button>' +
            '</td>' +
            '</tr>';
    }

    if (html === '') {
        html = '<tr><td colspan="6" class="empty">No matching members. Add a new member to get started.</td></tr>';
    }

    $('rows').innerHTML = html;
}



function openForm(m) {

    if (m) {
        $('modalTitle').textContent = 'Edit Member';
        $('mid').value = m.id;
        $('name').value = m.name;
        $('phone').value = m.phone;
        $('email').value = m.email;
        $('regDate').value = m.regDate;
    } else {
        $('modalTitle').textContent = 'Add Member';
        $('mid').value = '';
        $('name').value = '';
        $('phone').value = '';
        $('email').value = '';
        $('regDate').value = LMS.today();
    }

    $('formErr').textContent = '';
    LMS.openModal('modal');
    $('name').focus();
}

$('addBtn').onclick = function () {
    openForm(null);
};

$('search').oninput = render;

function editMember(id) {
    const member = LMS.members().find(function (m) { return m.id === id; });
    openForm(member);
}


$('form').addEventListener('submit', function (e) {

    e.preventDefault();

    const name = $('name').value.trim();
    const phone = $('phone').value.trim();
    const email = $('email').value.trim();
    let regDate = $('regDate').value;
    const id = $('mid').value;   

    if (regDate === '') {
        regDate = LMS.today();
    }

    if (name === '' || phone === '') {
        $('formErr').textContent = 'Name and phone number are required.';
        return;
    }

    if (!/^[0-9+\-\s]{7,16}$/.test(phone)) {
        $('formErr').textContent = 'Please enter a valid phone number.';
        return;
    }

    if (email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        $('formErr').textContent = 'Please enter a valid email address.';
        return;
    }

    const members = LMS.members();

    if (id !== '') {

        const member = members.find(function (m) { return m.id === id; });

        member.name = name;
        member.phone = phone;
        member.email = email;
        member.regDate = regDate;

        LMS.toast('Member updated successfully');

    } else {

        members.push({
            id: LMS.nextId('M', members),
            name: name,
            phone: phone,
            email: email,
            regDate: regDate
        });

        LMS.toast('Member added successfully');
    }

    LMS.saveMembers(members);
    LMS.closeModal('modal');
    render();
});


function deleteMember(id) {

    const loans = LMS.loans();
    for (let i = 0; i < loans.length; i++) {
        if (loans[i].memberId === id && !loans[i].returnDate) {
            LMS.toast('A member with unreturned books cannot be deleted.', 'error');
            return;
        }
    }

    if (confirm('Are you sure you want to permanently delete this member?')) {

        const members = LMS.members().filter(function (m) {
            return m.id !== id;
        });

        LMS.saveMembers(members);
        LMS.toast('Member deleted successfully');
        render();
    }
}



render();
 

