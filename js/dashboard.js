// دالة مختصرة عشان نستدعيها طول و بطريقة مختصرة @@@@@@@@@@@@@@@@@@@@
function $(id) {
    return document.getElementById(id);
}
// $(id) 

// اوامر استدعاء من common
const books = LMS.books(); // الكتب
const members = LMS.members();// الاعضاء
const loans = LMS.loans();// الاستعارات
// استدعاء object من الذاكرة و تثبيتها في متغيرات
 
let totalBooks = 0;
let availableBooks = 0;

for (let i = 0; i < books.length; i++) {
    totalBooks += books[i].quantity;  // توصل لل الكميه لكل  كتاب  و تزبد و تعطي العدد الكلي للكتب 
    availableBooks += books[i].available;   // يمشي لعدد النسخ المتوفر لكل كتاب  و بعطي العدد الكلي المتوفر
}
let borrowedCount = 0;   
let overdueCount = 0;   

for (let i = 0; i < loans.length; i++) {  
    if (!loans[i].returnDate) { // م يعني لو في تاريخ معناها رد الكتاب لو مفش معناها العداد يزيد
        borrowedCount++;
    }
    //LMS.statusOf()ظيفتها تحديد حالة الاستعارة.
    //ترجع واحدة من ثلاث قيم:
    //- borrowed
    //- overdue
    //- returned
    if (LMS.statusOf(loans[i]) === 'overdue') {
        overdueCount++;
    }
}
// في html
$('sBooks').textContent = totalBooks;
$('sMembers').textContent = members.length;  // عدد الكلي ما يتغيرش
$('sBorrowed').textContent = borrowedCount;
$('sAvail').textContent = availableBooks;

$('todayLabel').textContent = new Date().toLocaleDateString('en-GB');  // يعرض تاريخ اليوم 
  
// بعرض كيف التنبيه على عدد الاستعارات الي فاتن موعدهن
if (overdueCount > 0) {
    $('overdueAlert').hidden = false;  // لو true يختفن
    $('overdueAlert').textContent = 'There are ' + overdueCount + ' overdue loans.';
}

//تعني تجهيز وعرض المحتوى داخل صفحة الويب.  @@@@@@@@@@@@@@@@@@@@
function render() {
// حالة العنصر
    const status = $('status').value;
    //slice() ننشئ نسخة جديدة من arry 
    //عشان ما نبيش نعدل loans
    const sorted = loans.slice().sort(
        function (a, b) {

              //تقارن بين نصين لترتيبهما أبجدياً.
              //استخدمنا b قبل a للحصول على ترتيب تنازلي.
        return b.id.localeCompare(a.id);//@@@@@@@@@@@@@@@@@@@@@@@

    });
 //متغير عشان تحطو فيه الجدول
    let html = '';      //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    //على طول البيانات النخزنة
    for (let i = 0; i < sorted.length; i++) {

        const l = sorted[i];
        //تعني: ابحثي عن العضو الذي يتطابق رقمه مع رقم العضو الموجود في سجل الاستعارة.
        const member = members.find(function (m) 
        { return m.id === l.memberId; }
        );
        const book = books.find(function (b)
         { return b.id === l.bookId; 

         }
        );
        //إذا وجدنا العضو، نأخذ اسمه.
        //ا لم نجده، نعرض — (Deleted).
        const memberName = member ? member.name : '— (Deleted)';
        const bookTitle = book ? book.title : '— (Deleted)';
         
        //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        if (status !== '' && LMS.statusOf(l) !== status) {
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

    $('rows').innerHTML = html;
}
// : عندما يغير المستخدم حالة الاستعارة من القائمة، يتم تشغيل render() من جديد لتحديث الجدول.
$('status').onchange = render;
//يشغل render() مباشرة عند فتح الصفحة لأول مرة، حتى تظهر البيانات دون الحاجة إلى الضغط على شيء.
render();
