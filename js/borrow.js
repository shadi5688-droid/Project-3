
function $(id) {
    return document.getElementById(id);
}



const esc = LMS.esc;


// قائمة الاعضاء و الكتب المتوفرة
function fillSelects() {

    const members = LMS.members();
    const books = LMS.books();


 //نشأنا متغيراً فارغاً تقريباً يحتوي على خيار افتراضي نطلع عند select
    let memberOptions = '<option value="">— Select a member —</option>';
    for (let i = 0; i < members.length; i++) {

        // لبرنامج يستخدم الرقم ID لتحديد العضو وربطه بالاستعارة.
        memberOptions += '<option value="' + members[i].id + '">' +

            esc(members[i].name) + ' (' + members[i].id + ')</option>';
    }

    $('member').innerHTML = memberOptions;   // يمشي لل select في html



     let availableCount = 0;
     
     let bookOptions = '<option value="">— Select a book —</option>';
    for (let i = 0; i < books.length; i++) {
        //مرات نا فيش نسخ
        if (books[i].available > 0) {
            availableCount++;
            bookOptions += '<option value="' + books[i].id + '">' +
                esc(books[i].title) + ' — ' + esc(books[i].author) + '</option>';
        }
    }
    $('book').innerHTML = bookOptions;
     
    // ملاحظة اذا في كتب او لا
    if (availableCount === 0) {
        $('availInfo').textContent = 'No books are currently available.';
    } else {
        $('availInfo').textContent = '';
    }
}

function resetDates() {
    $('borrowDate').value = LMS.today(); //اليوم
    $('dueDate').value = LMS.addDays(LMS.today(), 14);// يزيد 14 يوم
}

//يعني عند تغيير قيمة الحقل
$('borrowDate').onchange = function () {
    if ($('borrowDate').value !== '') {
        $('dueDate').value = LMS.addDays($('borrowDate').value, 14);  
    }
};
//&&&&&&&&&&&&&&&&

$('form').addEventListener('submit', function (e) {

    e.preventDefault();

    const memberId = $('member').value;
    const bookId = $('book').value;
    const borrowDate = $('borrowDate').value;
    const dueDate = $('dueDate').value;
    const err = $('formErr');



    if ($('member').value === '' || $('book').value === '') {
        err.textContent = 'Please select a member and a book.';
        return;
    }
    
    if ($('borrowDate').value === '' || $('dueDate').value === '') {
        err.textContent = 'Please select the borrow date and due date.';
        return;
    }

    if ($('dueDate').value < $('borrowDate').value) {
        err.textContent = 'The due date cannot be earlier than the borrow date.';
        return;
    }



    const books = LMS.books();
    const book = books.find(function (b) { return b.id ===  $('book').value; });
    const loans = LMS.loans();
    

    book.available = book.available - 1;

    //نضيف سجل استعارة جديداً إلى مصفوفة loans.
    loans.push({
        id: LMS.nextId('L', loans),
        memberId: memberId,
        bookId: bookId,
        borrowDate: borrowDate,
        dueDate: dueDate,
        returnDate: null
    });
    
    //ثم نحفظ التغييرات:
    LMS.saveBooks(books);
    LMS.saveLoans(loans);


    // رسالة
    LMS.toast('Borrowing recorded successfully');
 

    //يرد كل حاجة يعد submit
    $('form').reset();
    resetDates();
    fillSelects();
    renderRecent();
});



//اوامر يشتغلن عند تحميل الصفحة و تجهز 
fillSelects();
resetDates();
renderRecent();
