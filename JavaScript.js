// 1. Chuyển trang (Giữ lại logic cũ của bạn)
function showPage(pageId) {
    document.querySelectorAll('.page-content').forEach(sec => sec.classList.remove('active'));
    const target = document.getElementById(pageId);
    if(target) target.classList.add('active');
    window.scrollTo(0, 0);
}

// 2. Khởi tạo Slide ảnh (Swiper)
const swiper = new Swiper(".mySwiper", {
    autoplay: { delay: 3000 },
    pagination: { el: ".swiper-pagination", clickable: true },
});

// 3. Kiểm tra Form (Validation)
function validateBooking() {
    const name = document.getElementById('patient-name').value;
    const phone = document.getElementById('patient-phone').value;

    if (name.length < 5) {
        alert("Vui lòng nhập đầy đủ họ tên (ít nhất 5 ký tự)");
        return;
    }
    if (!/^\d{10}$/.test(phone)) {
        alert("Số điện thoại không hợp lệ (phải có 10 chữ số)");
        return;
    }
    
    // Nếu hợp lệ thì chuyển đến trang thành công
    showPage('dv6');
}

// 4. API Integration: Lấy lời khuyên sức khỏe ngẫu nhiên
async function getHealthAdvice() {
    try {
        // Sử dụng một API giả lập hoặc công khai (Ở đây dùng API báo giá/lời khuyên)
        const response = await fetch('https://api.quotable.io/random?tags=wisdom');
        const data = await response.json();
        document.getElementById('health-quote').innerText = `Lời khuyên hôm nay: "${data.content}"`;
    } catch (error) {
        document.getElementById('health-quote').innerText = "Chúc bạn một ngày làm việc khỏe mạnh!";
    }
}

// Gọi API khi trang web tải xong
window.onload = getHealthAdvice;
// Hàm bật/tắt menu trên điện thoại
function toggleMobileMenu() {
    const menu = document.getElementById('navMobileMenu');
    menu.classList.toggle('show');
}

// Hàm điều hướng mới: Vừa chuyển trang vừa đóng menu mobile
function navigate(pageId) {
    showPage(pageId); // Gọi hàm chuyển trang cũ của bạn
    
    // Đóng menu lại sau khi chọn trang (chỉ áp dụng trên mobile)
    const menu = document.getElementById('navMobileMenu');
    if (menu.classList.contains('show')) {
        menu.classList.remove('show');
    }
}