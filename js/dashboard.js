// دالة مختصرة عشان نستدعيها طول و بطريقة مختصرة 
function $(id) {
    return document.getElementById(id);
}

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
}

document.getElementById('sBooks').textContent = totalBooks;
$('sMembers').textContent = members.length;  
$('sBorrowed').textContent = borrowedCount;
$('sAvail').textContent = availableBooks;




function render() {
//  حالة العنصر الي اختارها المستخدم في html
    const status = $('status').value; 

    //() ننشئ نسخة جديدة من arry 
    //و نرتبها

    const sorted = LMS.loans().sort()

    //متغير عشان تحطو فيه الجدول
    let html = '';      
    
    //على طول البيانات النخزنة
    for (let i = 0; i < sorted.length; i++) {

        const l = sorted[i];
        // ابحثي عن العضو الذي يتطابق رقمه مع رقم العضو الموجود في سجل الاستعارة.

        const member = members.find(function (m) 
        { return m.id === l.memberId; }
        );

        const book = books.find(function (b)
         { return b.id === l.bookId; 

         }
        );


        //إذا اختار المستخدم حالة معينة، وكانت حالة الاستعارة الحالية مختلفة عن الحالة المختارة، فتخطَّ هذه الاستعارة وانتقل إلى الاستعارة التالية.                                                    //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        if (status !== '' && LMS.statusOf(l) !== status) {
            continue;
        }

    

        html += '<tr class="">' +
    '<td class="num">' + l.id + '</td>' +
    '<td>' + member.name  + '</td>' +
    '<td>' + book.title + '</td>' +
    '<td class="num">' + l.borrowDate + '</td>' +
    '<td class="num">' + l.dueDate + '</td>' +
    '<td class="num">' + (l.returnDate || '—') + '</td>' +
    '<td>' + LMS.badge(l) + '</td>' +// حالة الاستعارة
    '</tr>';
    }


    $('rows').innerHTML = html;

}

$('status').onchange = render;// كل ما صار تغير في starus  يدث الصفحة
//يشغل render() مباشرة عند فتح الصفحة لأول مرة، حتى تظهر البيانات دون الحاجة إلى الضغط على شيء.
render();

