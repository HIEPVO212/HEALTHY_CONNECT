// 1. Kiểm tra Form (Validation)
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
    navigate('dv6');
}

// 2. API Integration: Lấy lời khuyên sức khỏe ngẫu nhiên
async function getHealthAdvice() {
    try {
        const response = await fetch('https://api.quotable.io/random?tags=wisdom');
        const data = await response.json();
        const quoteEl = document.getElementById('health-quote');
        if (quoteEl) quoteEl.innerText = `Lời khuyên hôm nay: "${data.content}"`;
    } catch (error) {
        const quoteEl = document.getElementById('health-quote');
        if (quoteEl) quoteEl.innerText = "Chúc bạn một ngày làm việc khỏe mạnh!";
    }
}
// Gọi API khi trang web tải xong
window.addEventListener('load', getHealthAdvice);

// Hàm bật/tắt menu trên điện thoại
function toggleMobileMenu() {
    const menu = document.getElementById('navMobileMenu');
    if (menu) menu.classList.toggle('show');
}

// 3. Hàm Điều Hướng và Chuyển Trang (Tích hợp xử lý Menu & Active state)
function navigate(pId, pushState = true, restoreScroll = null) {
    // Ngăn chặn hành vi mặc định của thẻ <a href="#"> làm nhảy URL sai lệch
    if (typeof window !== 'undefined' && window.event) {
        window.event.preventDefault();
    }

    // Ẩn tất cả các trang
    document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));

    // Kiểm tra trang có tồn tại không. Nếu không (VD: intro, login chưa code), báo đang phát triển
    let target = document.getElementById(pId);
    if (!target) {
        alert("Tính năng này đang được phát triển, Vui lòng quay lại sau!");
        pId = 'home';
        target = document.getElementById('home');
    }

    // Gắn hook đặc biệt cho trang xác nhận dv5
    if (pId === 'dv5') {
        populateConfirmationPage();
    }
    
    // Bắt đặc thù cho Đặt lịch: nếu vào dv3 mà ko qua nút Đặt lịch thì kiểm tra form
    if (pId === 'dv3') {
        updateBookingFormState();
    }

    // Hiển thị trang được chọn
    target.classList.add('active');

    // Cập nhật trạng thái Active trên Menu
    document.querySelectorAll('.nav-link').forEach(n => {
        n.classList.remove('active');
        // Nếu nội dung onclick của nav-link chứa pId thì active nó
        if (n.getAttribute('onclick') && n.getAttribute('onclick').includes(`'${pId}'`)) {
            n.classList.add('active');
        }
    });

    // Đóng menu trên mobile nếu đang mở (Bootstrap 5 Collapse)
    const navbarCollapse = document.getElementById('navbarNav');
    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
        if (typeof bootstrap !== 'undefined') {
            const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse) || new bootstrap.Collapse(navbarCollapse, { toggle: false });
            bsCollapse.hide();
        } else {
            navbarCollapse.classList.remove('show');
        }
    }

    // Cập nhật URL và lịch sử duyệt web để hỗ trợ nút Back (Quay lại)
    if (pushState) {
        const currentHash = window.location.hash.substring(1) || 'home';
        if (currentHash !== pId) {
            try {
                // Lưu vị trí cuộn trang hiện tại vào lịch sử TRƯỚC KHI sang trang mới
                history.replaceState({ page: currentHash, scrollPos: window.scrollY }, currentHash, `#${currentHash}`);

                // Đẩy Lịch sử mới và đưa màn hình lên đầu
                history.pushState({ page: pId, scrollPos: 0 }, pId, `#${pId}`);
            } catch (err) {
                // Fallback nếu chạy file:/// ở local
                window.location.hash = `#${pId}`;
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Chỉ scroll lên top khi click cùng một trang từ menu
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } else {
        // Khôi phục Lịch sử cho phím Back (Để timeout nhẹ chờ DOM render layout)
        if (restoreScroll !== null) {
            setTimeout(() => {
                window.scrollTo({ top: restoreScroll, behavior: 'auto' });
            }, 50);
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
}

// Xử lý sự kiện khi người dùng bấm nút Back (Quay lại) hoặc Forward trên trình duyệt
window.addEventListener('popstate', function (event) {
    if (event.state && event.state.page) {
        // Trích xuất scrollPos và ra lệnh restore
        navigate(event.state.page, false, event.state.scrollPos || 0);
    } else {
        const hash = window.location.hash.substring(1);
        if (hash) {
            navigate(hash, false, 0);
        } else {
            navigate('home', false, 0);
        }
    }
});

// Đồng bộ URL lúc tải trang lại (F5). Nếu hash là các trang chi tiết động thì tự quay về home vì mất Data hiển thị.
window.addEventListener('load', function () {
    const hash = window.location.hash.substring(1);
    if (hash && !hash.includes('detail-')) {
        navigate(hash, false, 0);
    } else {
        history.replaceState({ page: 'home', scrollPos: window.scrollY }, 'home', '#home');
    }
});

// 4. Xử lý kịch bản form Xác nhận
function finishBooking() {
    const pNameEl = document.getElementById('pName');
    if (!pNameEl) return navigate('dv6');
    const name = pNameEl.value;
    if (name.length < 4) return alert("Vui lòng nhập đầy đủ họ tên");

    const resCodeEl = document.getElementById('resCode');
    if (resCodeEl) resCodeEl.innerText = "#HC-" + Math.floor(1000 + Math.random() * 9000);
    navigate('dv6');
}

// 4.5 Hàm hiển thị chi tiết Dịch vụ động
function showServiceDetail(serviceId) {
    document.querySelectorAll('.service-detail-item').forEach(el => el.style.display = 'none');
    const target = document.getElementById('service-item-' + serviceId);
    if (target) { target.style.display = 'block'; }
    navigate('detail-dichvu-container');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 4.6 Hàm hiển thị chi tiết Chuyên khoa động
function showSpecialtyDetail(specialtyId) {
    document.querySelectorAll('.specialty-detail-item').forEach(el => el.style.display = 'none');

    const target = document.getElementById('specialty-item-' + specialtyId);
    if (target) { target.style.display = 'block'; }

    // Ẩn chuyên khoa hiện tại khỏi danh sách "Chuyên khoa khác"
    document.querySelectorAll('.related-specialty-slide').forEach(el => {
        if (el.dataset.id == specialtyId) {
            el.style.display = 'none';
        } else {
            el.style.display = '';
        }
    });

    navigate('detail-chuyenkhoa-container');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 4.7 Hàm hiển thị chi tiết Tin tức động
function showNewsDetail(newsId) {
    document.querySelectorAll('.news-detail-item').forEach(el => el.style.display = 'none');

    const target = document.getElementById('news-item-' + newsId);
    if (target) { target.style.display = 'block'; }

    // Ẩn tin tức hiện tại khỏi danh sách "Tin tức khác"
    document.querySelectorAll('.related-news-slide').forEach(el => {
        if (el.dataset.id == newsId) {
            el.style.display = 'none';
        } else {
            el.style.display = '';
        }
    });

    navigate('detail-tintuc-container');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 4.8 Hàm hiển thị chi tiết Bác sĩ động
function showDoctorDetail(doctorId) {
    document.querySelectorAll('.doctor-detail-item').forEach(el => el.style.display = 'none');
    const target = document.getElementById('doctor-item-' + doctorId);
    if (target) { target.style.display = 'block'; }

    // Ẩn bác sĩ hiện tại khỏi danh sách "Đội ngũ bác sĩ khác"
    document.querySelectorAll('.related-doctor-slide').forEach(el => {
        if (el.dataset.id == doctorId) {
            el.style.display = 'none';
        } else {
            el.style.display = '';
        }
    });

    navigate('detail-bacsi-container');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 5. Khởi tạo các thành phần UI nâng cấp khi mã HTML đã load xong
document.addEventListener("DOMContentLoaded", function () {
    // --- KIỂM TRA CUỘN TRANG SAU KHI RELOAD ---
    if (localStorage.getItem('hc_scroll_testimonials') === 'true') {
        const target = document.getElementById('testimonials-section');
        if (target) {
            setTimeout(() => {
                target.scrollIntoView({ behavior: 'smooth' });
                localStorage.removeItem('hc_scroll_testimonials');
            }, 500); // Đợi Swiper và các element load xong mới cuộn
        }
    }

    // Khởi tạo Swiper Dịch vụ (Giao diện mới 1 cột nhóm)
    if (document.querySelector(".serviceSwiper")) {
        new Swiper(".serviceSwiper", {
            slidesPerView: 1, spaceBetween: 20,
            observer: true, observeParents: true,
            navigation: { nextEl: ".service-next", prevEl: ".service-prev" }
        });
    }

    // Khởi tạo Swiper Chuyên khoa (Giao diện mới 1 cột nhóm)
    if (document.querySelector(".specialtySwiper")) {
        new Swiper(".specialtySwiper", {
            slidesPerView: 1, spaceBetween: 20,
            observer: true, observeParents: true,
            navigation: { nextEl: ".specialty-next", prevEl: ".specialty-prev" }
        });
    }

    // Khởi tạo Swiper Bác sĩ
    if (document.querySelector(".doctorSwiper")) {
        new Swiper(".doctorSwiper", {
            slidesPerView: 1, spaceBetween: 20,
            observer: true, observeParents: true,
            navigation: { nextEl: ".doctor-next", prevEl: ".doctor-prev" },
            breakpoints: { 576: { slidesPerView: 2 }, 992: { slidesPerView: 4 }, 1200: { slidesPerView: 5 } }
        });
    }

    // Khởi tạo Swiper Tin Tức Khác / Chuyên khoa liên quan / Bác sĩ khác
    const relatedSwipers = document.querySelectorAll(".relatedSwiper, .relatedNewsSwiper, .relatedDoctorSwiper");
    relatedSwipers.forEach(swiperEl => {
        const parent = swiperEl.parentElement;
        const nextBtn = parent.querySelector('.related-next, .related-news-next, .related-doc-next');
        const prevBtn = parent.querySelector('.related-prev, .related-news-prev, .related-doc-prev');

        new Swiper(swiperEl, {
            slidesPerView: 1, spaceBetween: 20,
            observer: true,
            observeParents: true,
            watchSlidesProgress: true,
            navigation: { nextEl: nextBtn, prevEl: prevBtn },
            breakpoints: { 768: { slidesPerView: 2 }, 1200: { slidesPerView: 3 }, 1400: { slidesPerView: 4 } }
        });
    });

    // Khởi tạo Swiper Tin tức
    if (document.querySelector(".newsSwiper")) {
        new Swiper(".newsSwiper", {
            slidesPerView: 1, spaceBetween: 20,
            observer: true, observeParents: true,
            pagination: { el: ".newsSwiper .swiper-pagination", clickable: true },
            breakpoints: { 576: { slidesPerView: 2 }, 992: { slidesPerView: 3 } }
        });
    }

    // Khởi tạo Swiper Main Banner (Chuyển tự động sau 6s)
    if (document.querySelector(".mainBannerSwiper")) {
        new Swiper(".mainBannerSwiper", {
            slidesPerView: 1,
            loop: true, // Vòng lặp
            autoplay: {
                delay: 6000,          // Tự chuyển sau 6 giây
                disableOnInteraction: false, // Vẫn autoplay sau khi user click/vuốt
            },
            pagination: {
                el: ".mainBannerSwiper .swiper-pagination",
                clickable: true,
            },
            navigation: {
                nextEl: ".mainBannerSwiper .swiper-button-next",
                prevEl: ".mainBannerSwiper .swiper-button-prev",
            },
            on: {
                click: function (swiper, event) {
                    // event is the original pointer event. Swiper's click handler ignores drags!
                    // Bỏ qua nếu user click nhầm vào nút chuyển slide Next/Prev
                    const target = event.target;
                    if (target.closest('.swiper-button-next') || target.closest('.swiper-button-prev') || target.closest('.swiper-pagination')) {
                        return;
                    }

                    // Mở Modal Khám Nhanh (chỉ khi click chuột trái thực sự)
                    const modalEl = document.getElementById('quickBookingModal');
                    if (modalEl && window.bootstrap) {
                        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
                        modal.show();
                    }
                }
            }
        });
    }

    // Khởi tạo Swiper Testimonial
    const initTestimonialSwiper = () => {
        if (document.querySelector(".testimonialSwiper")) {
            new Swiper(".testimonialSwiper", {
                slidesPerView: 1,
                spaceBetween: 30,
                loop: true,
                autoplay: { delay: 4000 },
                pagination: { el: ".testimonialSwiper .swiper-pagination", clickable: true },
                breakpoints: {
                    768: { slidesPerView: 2 },
                    1200: { slidesPerView: 3 }
                }
            });
        }
    };

    // --- HIỆU ỨNG SỐ CHẠY (COUNTER) ---
    const countConfigs = [
        { id: 'count-years', end: 10, suffix: '+' },
        { id: 'count-patients', end: 50000, suffix: '' },
        { id: 'count-doctors', end: 50, suffix: '+' }
    ];

    const animateCount = (el, start, end, duration, suffix = '') => {
        let startTime = null;
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            el.innerText = value.toLocaleString('en-US') + suffix;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                countConfigs.forEach(config => {
                    const el = document.getElementById(config.id);
                    if (el) animateCount(el, 0, config.end, 2000, config.suffix);
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 }); // Hạ thấp ngưỡng để dễ quan sát

    const statsSection = document.getElementById('count-patients')?.closest('.mt-5');
    if (statsSection) statsObserver.observe(statsSection);

    // --- LOGIC ĐÁNH GIÁ (FEEDBACK) ---
    const starBox = document.getElementById('starRatingBox');
    if (starBox) {
        const stars = starBox.querySelectorAll('.rating-star');
        stars.forEach(star => {
            star.addEventListener('click', function () {
                const val = parseInt(this.dataset.val);
                document.getElementById('ratingValue').value = val;
                stars.forEach((s, idx) => {
                    if (idx < val) {
                        s.classList.replace('far', 'fas');
                        s.classList.add('text-warning');
                    } else {
                        s.classList.replace('fas', 'far');
                        s.classList.remove('text-warning');
                    }
                });
            });
        });
    }

    // Load Local Feedback
    const loadFeedbacks = () => {
        let saved = JSON.parse(localStorage.getItem('hc_feedbacks') || '[]');
        if (saved.length > 0) {
            const wrapper = document.querySelector('.testimonialSwiper .swiper-wrapper');
            if (wrapper) {
                saved.forEach(fb => {
                    const starsHtml = '<i class="fas fa-star"></i>'.repeat(fb.rating) + (fb.rating < 5 ? '<i class="far fa-star"></i>'.repeat(5 - fb.rating) : '');
                    const slide = `
                        <div class="swiper-slide">
                            <div class="card border-0 shadow-sm p-4 rounded-4 text-center h-100 bg-info bg-opacity-10" style="border: 1px dashed #0d6efd !important;">
                                <div class="text-warning mb-3">${starsHtml}</div>
                                <p class="fst-italic text-dark mb-4">"${fb.content}"</p>
                                <div class="d-flex align-items-center justify-content-center">
                                    <div class="bg-primary text-white rounded-circle me-3 d-flex align-items-center justify-content-center" style="width:50px; height:50px; font-weight:bold">${fb.name.charAt(0).toUpperCase()}</div>
                                    <div class="text-start">
                                        <h6 class="fw-bold mb-0">${fb.name}</h6>
                                        <small class="text-muted">Vừa đánh giá</small>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                    wrapper.insertAdjacentHTML('afterbegin', slide);
                });
            }
        }
        initTestimonialSwiper();
    };
    loadFeedbacks();
});

// Hàm gửi Feedback Demo (Có logic phân loại Hài lòng / Không hài lòng)
function submitFeedbackDemo() {
    const ratingVal = parseInt(document.getElementById('ratingValue').value);
    const name = document.getElementById('fbName').value.trim();
    const content = document.getElementById('fbContent').value.trim();

    if (ratingVal === 0) return alert("Vui lòng chọn số sao đánh giá!");
    if (!name) return alert("Vui lòng nhập tên của bạn!");
    if (!content) return alert("Vui lòng nhập nội dung đánh giá!");

    // Save to Local Storage để người dùng thấy ngay
    const newFb = { rating: ratingVal, name, content, date: new Date().toISOString() };
    let saved = JSON.parse(localStorage.getItem('hc_feedbacks') || '[]');
    saved.push(newFb);
    localStorage.setItem('hc_feedbacks', JSON.stringify(saved));

    // LOGIC PHÂN LOẠI PHẢN HỒI
    if (ratingVal >= 4) {
        // Trường hợp Hài Lòng
        alert(`Cảm ơn ${name}! 🌟 Đánh giá ${ratingVal} sao của bạn đã được ghi nhận vào chỉ số "Bệnh nhân hài lòng". Chúng tôi rất vui khi được phục vụ bạn!`);
    } else {
        // Trường hợp Không Hài Lòng (1, 2, 3 sao)
        alert(`Chào ${name}, chúng tôi rất tiếc vì trải nghiệm chưa tốt của bạn. ✍️ Phản hồi này đã được gửi trực tiếp tới Ban giám đốc để xử lý. Chúng tôi sẽ sớm liên hệ để lắng nghe và hỗ trợ bạn tốt hơn!`);
    }

    // Đóng Modal
    const modalEl = document.getElementById('feedbackModal');
    if (modalEl && window.bootstrap) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    }

    // Ghi nhớ để tự cuộn xuống sau khi reload
    localStorage.setItem('hc_scroll_testimonials', 'true');
    setTimeout(() => location.reload(), 1000); 
}

// ==========================================
// THÊM CHỨC NĂNG DỮ LIỆU & PHÂN TRANG 30 BỆNH VIỆN
// ==========================================

const hospitalData = [
    { name: 'Bệnh viện Trung ương Quân đội 108', img: 'images/Hospital/108.jpg', location: 'Hà Nội' },
    { name: 'Bệnh viện Đa khoa tỉnh Bình Dương', img: 'images/Hospital/Bình Dương.jpg', location: 'Bình Dương' },
    { name: 'Bệnh viện Bình Dân', img: 'images/Hospital/Bình dân.jpg', location: 'TP.HCM' },
    { name: 'Bệnh viện Bạch Mai', img: 'images/Hospital/Bạch Mai.jpg', location: 'Hà Nội' },
    { name: 'Bệnh viện C Đà Nẵng', img: 'images/Hospital/C đà nẵng.jpg', location: 'Đà Nẵng' },
    { name: 'Bệnh viện Chấn thương chỉnh hình', img: 'images/Hospital/Chấn thương chỉnh hình.jpg', location: 'TP.HCM' },
    { name: 'Bệnh viện Chợ Rẫy', img: 'images/Hospital/Chợ rẫy.jpg', location: 'TP.HCM' },
    { name: 'Bệnh viện Đa khoa Trung ương Cần Thơ', img: 'images/Hospital/Cần Thơ.jpg', location: 'Cần Thơ' },
    { name: 'Bệnh viện Da Liễu TP.HCM', img: 'images/Hospital/Da liễu HCM.jpg', location: 'TP.HCM' },
    { name: 'Bệnh viện Pháp Việt (FV)', img: 'images/Hospital/FV.jpg', location: 'TP.HCM' },
    { name: 'Bệnh viện Hoàn Mỹ Sài Gòn', img: 'images/Hospital/Hoàn Mỹ SG.jpg', location: 'TP.HCM' },
    { name: 'Bệnh viện K', img: 'images/Hospital/K.jpg', location: 'Hà Nội' },
    { name: 'Bệnh viện Mắt TP.HCM', img: 'images/Hospital/Măt TPHCM.jpg', location: 'TP.HCM' },
    { name: 'Bệnh viện Nhi Trung ương', img: 'images/Hospital/Nhi trung ương.jpg', location: 'Hà Nội' },
    { name: 'Bệnh viện Nhi Đồng 1', img: 'images/Hospital/Nhi đồng 1.jpg', location: 'TP.HCM' },
    { name: 'Bệnh viện Nhi Đồng 2', img: 'images/Hospital/Nhi đồng 2.jpg', location: 'TP.HCM' },
    { name: 'Bệnh viện Phạm Ngọc Thạch', img: 'images/Hospital/Phạm Ngọc Thạch.jpg', location: 'TP.HCM' },
    { name: 'Bệnh viện Phụ sản Trung ương', img: 'images/Hospital/Phụ sản TW.jpg', location: 'Hà Nội' },
    { name: 'Bệnh viện Răng Hàm Mặt Trung ương', img: 'images/Hospital/RHM TW.jpg', location: 'TP.HCM' },
    { name: 'Bệnh viện Thống Nhất', img: 'images/Hospital/Thống nhất.jpg', location: 'TP.HCM' },
    { name: 'Bệnh viện Trung ương Huế', img: 'images/Hospital/Trung ương Huế.jpg', location: 'Thừa Thiên Huế' },
    { name: 'Bệnh viện Đa khoa Tâm Anh', img: 'images/Hospital/Tâm anh.jpg', location: 'TP.HCM' },
    { name: 'Bệnh viện Từ Dũ', img: 'images/Hospital/Từ dũ.jpg', location: 'TP.HCM' },
    { name: 'Bệnh viện Ung Bướu', img: 'images/Hospital/Ung bướu.jpg', location: 'TP.HCM' },
    { name: 'Bệnh viện Đa khoa Quốc tế Vinmec', img: 'images/Hospital/Vinmec.jpg', location: 'Hà Nội' },
    { name: 'Viện Tim TP.HCM', img: 'images/Hospital/Viện tim TP.HCM.jpg', location: 'TP.HCM' },
    { name: 'Bệnh viện Hữu nghị Việt Đức', img: 'images/Hospital/Việt đức.jpg', location: 'Hà Nội' },
    { name: 'Bệnh viện Đại học Y Dược', img: 'images/Hospital/ĐH Y dược.jpg', location: 'TP.HCM' },
    { name: 'Bệnh viện Đa khoa Đồng Nai', img: 'images/Hospital/Đa khoa ĐN.jpg', location: 'Đồng Nai' },
    { name: 'Bệnh viện Đa khoa Đà Nẵng', img: 'images/Hospital/Đa khoa đà nẵng.jpg', location: 'Đà Nẵng' }
];

let globalCurrentPage = 1;
const itemsPerPage = 5;
let filteredHospitals = [...hospitalData];

function renderHospitals() {
    const listContainer = document.getElementById('hospital-list-container');
    const paginationContainer = document.getElementById('hospital-pagination');
    
    // Nếu trang hiện tại không có container, không làm gì cả
    if (!listContainer || !paginationContainer) return;

    listContainer.innerHTML = '';
    
    if (filteredHospitals.length === 0) {
        listContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-box-open fs-1 text-muted mb-3"></i>
                <h5 class="text-muted">Không tìm thấy bệnh viện cơ sở y tế nào...</h5>
            </div>
        `;
        paginationContainer.innerHTML = '';
        return;
    }

    const startIndex = (globalCurrentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredHospitals.length);
    
    // Render Items
    for (let i = startIndex; i < endIndex; i++) {
        const hospital = filteredHospitals[i];
        const cardHTML = `
            <div class="col-12">
                <div class="card border-0 rounded-4 bg-white hospital-card-3d p-3 cursor-pointer">
                    <div class="d-flex flex-column flex-md-row align-items-md-center gap-4">
                        <div class="hospital-img-wrapper rounded-3 overflow-hidden flex-shrink-0" style="width: 150px; height: 100px;">
                            <img src="${hospital.img}" alt="${hospital.name}" class="w-100 h-100 object-fit-cover" onerror="this.src='https://via.placeholder.com/150x100?text=Healthcare'">
                        </div>
                        <div class="flex-grow-1">
                            <h5 class="fw-bold mb-2 text-primary hospital-title">${hospital.name}</h5>
                            <div class="d-flex align-items-center text-muted mb-2 small">
                                <i class="fas fa-map-marker-alt me-2 text-danger"></i>
                                <span>Khu vực: <span class="fw-bold">${hospital.location}</span></span>
                            </div>
                            <div class="d-flex gap-2">
                                <span class="badge bg-light text-dark border"><i class="fas fa-star text-warning me-1"></i> 4.8</span>
                                <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25"><i class="fas fa-check-circle me-1"></i> Đặt lịch online</span>
                            </div>
                        </div>
                        <div class="ms-md-auto mt-3 mt-md-0 text-md-end text-center flex-shrink-0">
                            <button class="btn btn-modern px-4 rounded-pill" onclick="selectHospitalForBooking(${i})">Đặt lịch khám <i class="fas fa-arrow-right ms-1"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        listContainer.insertAdjacentHTML('beforeend', cardHTML);
    }

    // Render Pagination
    const totalPages = Math.ceil(filteredHospitals.length / itemsPerPage);
    paginationContainer.innerHTML = '';
    
    // Nút Trước
    const prevDisabled = globalCurrentPage === 1 ? 'disabled' : '';
    paginationContainer.insertAdjacentHTML('beforeend', `
        <li class="page-item ${prevDisabled}">
            <a class="page-link" href="javascript:void(0)" onclick="changeHospitalPage(${globalCurrentPage - 1})"><i class="fas fa-angle-left"></i></a>
        </li>
    `);

    // Danh sách số
    for (let p = 1; p <= totalPages; p++) {
        const activeClass = p === globalCurrentPage ? 'active' : '';
        paginationContainer.insertAdjacentHTML('beforeend', `
            <li class="page-item ${activeClass}">
                <a class="page-link" href="javascript:void(0)" onclick="changeHospitalPage(${p})">${p}</a>
            </li>
        `);
    }

    // Nút Sau
    const nextDisabled = globalCurrentPage === totalPages ? 'disabled' : '';
    paginationContainer.insertAdjacentHTML('beforeend', `
        <li class="page-item ${nextDisabled}">
            <a class="page-link" href="javascript:void(0)" onclick="changeHospitalPage(${globalCurrentPage + 1})"><i class="fas fa-angle-right"></i></a>
        </li>
    `);
}

function changeHospitalPage(page) {
    const totalPages = Math.ceil(filteredHospitals.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        globalCurrentPage = page;
        renderHospitals();
        
        // Tự động cuộn lên xíu khi chuyển trang (cho UX tốt hơn)
        const dv1 = document.getElementById('dv1');
        if (dv1) {
            window.scrollTo({
                top: dv1.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    }
}

function searchHospitals() {
    const query = document.getElementById('hospitalSearchInput').value.toLowerCase().trim();
    filteredHospitals = hospitalData.filter(h => 
        h.name.toLowerCase().includes(query) || h.location.toLowerCase().includes(query)
    );
    globalCurrentPage = 1; // Reset về trang 1 khi search
    renderHospitals();
}

// ==========================================
// THÊM CHỨC NĂNG DỮ LIỆU & PHÂN TRANG 70 BÁC SĨ
// ==========================================

const doctorImages = [
    "images/Doctor/111852-pgs-than-kinh-cao-phi-phong.png",
    "images/Doctor/113415-ths-bs-than-kinh-do-anh-vu.png",
    "images/Doctor/135456-bac-si-dinh-vinh-quang-chuyen-khoa-than-kinh.jpg",
    "images/Doctor/140051-ths-bs-than-kinh-nguyen-canh-nam.png",
    "images/Doctor/144549-bac-si-than-kinh-bs-nguyen-quoc-giang.png",
    "images/Doctor/151612-bsnguyen-thi-hung.jpg",
    "images/Doctor/layer-10.jpg",
    "images/Doctor/layer-12.jpg",
    "images/Doctor/pexels-byb-byb-412101727-19471016.jpg",
    "images/Doctor/pexels-khanh-hoang-minh-2-77752098-27392531.jpg",
    "images/Doctor/pexels-konrads-photo-32115955.jpg",
    "images/Doctor/pexels-konrads-photo-32160039.jpg",
    "images/Doctor/pexels-konrads-photo-32254667.jpg",
    "images/Doctor/pexels-kooldark-14438788.jpg",
    "images/Doctor/pexels-kooldark-14628046.jpg",
    "images/Doctor/pexels-kooldark-15641079.jpg",
    "images/Doctor/pexels-kooldark-15641080.jpg",
    "images/Doctor/pexels-kooldark-15962796.jpg",
    "images/Doctor/pexels-kooldark-15962799.jpg",
    "images/Doctor/pexels-kooldark-29995617.jpg",
    "images/Doctor/pexels-nguy-n-ti-n-th-nh-2150376175-36603939.jpg",
    "images/Doctor/pexels-oys-photography-838143052-19438561.jpg",
    "images/Doctor/pexels-pro5-vn-1368185933-26336880.jpg",
    "images/Doctor/top-bac-si-uy-tin-benh-vien-cho-ray-ivie-(3)-jpg_1f38e4ef_e73e_4e58_8896_5c70f130f261.png"
];

const firstNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"];
const middleNames = ["Văn", "Thị", "Hữu", "Thanh", "Minh", "Thu", "Ngọc", "Gia", "Bảo", "Đức", "Hải", "Tuấn", "Thành", "Đình", "Nhật", "Quốc", "Trung", "Hoài"];
const lastNames = ["Anh", "Tuấn", "Thắng", "Linh", "Hùng", "Hương", "Huy", "Lan", "Nhung", "Trang", "Khoa", "Phong", "Nam", "Vũ", "Tâm", "Hà", "Cường", "Sơn", "Mai", "Thảo", "Long", "Hiếu", "Dũng", "Khánh", "Ngân", "Quyên", "Phương", "Phát", "Đạt", "Bình", "Châu", "Khang"];
const titles = ["ThS.BS", "ThS.BS", "BS.CKII", "BS.CKI", "PGS.TS", "TS.BS", "BS", "GS.TS"];
const docSpecialties = [
    "Khoa Nội Tổng Quát", "Khoa Ngoại Tổng Quát", "Khoa Nhi Tổng Hợp", "Khoa Sản Phụ Khoa", 
    "Chuyên Khoa Tim Mạch", "Khoa Nội Thần Kinh", "Khoa Da Liễu", "Khoa Mắt Đo Khúc Xạ", 
    "Khoa Răng Hàm Mặt", "Khoa Tai Mũi Họng", "Khoa Cơ Xương Khớp", "Khoa Nội Tiêu Hóa",
    "Chấn Thương Chỉnh Hình", "Khoa Ung Bướu", "Hồi Sức Cấp Cứu"
];

const doctorData = [];
// Khởi tạo chính xác 70 bác sĩ
for (let i = 0; i < 70; i++) {
    // Generate Random Name pseudo-deterministically using index
    const t = titles[i % titles.length];
    const f = firstNames[(i * 3) % firstNames.length];
    const m = middleNames[(i * 5) % middleNames.length];
    const l = lastNames[i % lastNames.length];
    const name = `${t} ${f} ${m} ${l}`;
    
    // Gắn liền Bác sĩ vào Cơ sở Y tế được liệt kê trong biến hospitalData
    // Cứ mỗi 2-3 bác sĩ sẽ ở chung 1 bệnh viện cho thực tế
    const hosp = hospitalData[Math.floor(i / 2.5) % hospitalData.length];
    const spec = docSpecialties[i % docSpecialties.length];
    
    // Pick hình ảnh tráo đổi liên tục
    const img = doctorImages[i % doctorImages.length];

    doctorData.push({
        name: name,
        img: img,
        desc: spec,
        hospital: hosp.name
    });
}

let currentDoctorPage = 1;
const doctorsPerPage = 10;
let filteredDoctors = [...doctorData];

function renderDoctors() {
    const listContainer = document.getElementById('doctor-list-container');
    const paginationContainer = document.getElementById('doctor-pagination');
    
    if (!listContainer || !paginationContainer) return;

    listContainer.innerHTML = '';
    
    if (filteredDoctors.length === 0) {
        listContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-user-md fs-1 text-muted mb-3"></i>
                <h5 class="text-muted">Không tìm thấy bác sĩ nào...</h5>
            </div>
        `;
        paginationContainer.innerHTML = '';
        return;
    }

    const startIndex = (currentDoctorPage - 1) * doctorsPerPage;
    const endIndex = Math.min(startIndex + doctorsPerPage, filteredDoctors.length);
    
    for (let i = startIndex; i < endIndex; i++) {
        const doc = filteredDoctors[i];
        
        const cardHTML = `
            <div class="col-md-6">
                <div class="card border-0 rounded-4 bg-white doctor-card-3d p-3 cursor-pointer h-100">
                    <div class="d-flex align-items-center gap-3">
                        <div class="doctor-img-wrapper rounded-circle overflow-hidden shadow-sm flex-shrink-0" style="width: 90px; height: 90px; border: 3px solid #f8faff;">
                            <img src="${doc.img}" alt="${doc.name}" class="w-100 h-100 object-fit-cover" onerror="this.src='https://i.pravatar.cc/150?u=${i}'">
                        </div>
                        <div class="flex-grow-1 min-vw-0"> <!-- min-vw-0 prevent flex text overflow issues -->
                            <h6 class="fw-bold mb-1 text-primary doctor-title text-truncate" title="${doc.name}">${doc.name}</h6>
                            <div class="text-muted small mb-1 fw-medium"><i class="fas fa-stethoscope text-info me-1"></i> ${doc.desc}</div>
                            <div class="text-secondary small mb-3 text-truncate" title="${doc.hospital}"><i class="fas fa-hospital text-danger me-1"></i> ${doc.hospital}</div>
                            <button class="btn btn-modern rounded-pill btn-sm w-100" onclick="selectDoctorFromList(${i})">
                                Chọn lịch tư vấn <i class="fas fa-arrow-right ms-1"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        listContainer.insertAdjacentHTML('beforeend', cardHTML);
    }

    // Render Pagination
    const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);
    paginationContainer.innerHTML = '';
    
    const prevDisabled = currentDoctorPage === 1 ? 'disabled' : '';
    paginationContainer.insertAdjacentHTML('beforeend', `
        <li class="page-item ${prevDisabled}">
            <a class="page-link" href="javascript:void(0)" onclick="changeDoctorPage(${currentDoctorPage - 1})"><i class="fas fa-angle-left"></i></a>
        </li>
    `);

    // Thuật toán hiển thị các trang cho đẹp tránh tràn layout (chỉ hiện xung quanh trang hiện tại)
    for (let p = 1; p <= totalPages; p++) {
        const activeClass = p === currentDoctorPage ? 'active' : '';
        if (totalPages > 5) {
            if (p === 1 || p === totalPages || (p >= currentDoctorPage - 1 && p <= currentDoctorPage + 1)) {
                paginationContainer.insertAdjacentHTML('beforeend', `
                    <li class="page-item ${activeClass}">
                        <a class="page-link" href="javascript:void(0)" onclick="changeDoctorPage(${p})">${p}</a>
                    </li>
                `);
            } else if (p === currentDoctorPage - 2 || p === currentDoctorPage + 2) {
                paginationContainer.insertAdjacentHTML('beforeend', `
                    <li class="page-item disabled"><span class="page-link border-0 bg-transparent text-muted">...</span></li>
                `);
            }
        } else {
            paginationContainer.insertAdjacentHTML('beforeend', `
                <li class="page-item ${activeClass}">
                    <a class="page-link" href="javascript:void(0)" onclick="changeDoctorPage(${p})">${p}</a>
                </li>
            `);
        }
    }

    const nextDisabled = currentDoctorPage === totalPages ? 'disabled' : '';
    paginationContainer.insertAdjacentHTML('beforeend', `
        <li class="page-item ${nextDisabled}">
            <a class="page-link" href="javascript:void(0)" onclick="changeDoctorPage(${currentDoctorPage + 1})"><i class="fas fa-angle-right"></i></a>
        </li>
    `);
}

function changeDoctorPage(page) {
    const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentDoctorPage = page;
        renderDoctors();
        
        const dv2 = document.getElementById('dv2');
        if (dv2) {
            window.scrollTo({
                top: dv2.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    }
}

function searchDoctors() {
    const query = document.getElementById('doctorSearchInput').value.toLowerCase().trim();
    filteredDoctors = doctorData.filter(d => 
        d.name.toLowerCase().includes(query) || 
        d.desc.toLowerCase().includes(query) || 
        d.hospital.toLowerCase().includes(query)
    );
    currentDoctorPage = 1; 
    renderDoctors();
}

function selectDoctorFromList(index) {
    const doc = filteredDoctors[index];
    selectDoctorForBooking(doc.name, doc.img, doc.desc);
}

// Tự động gọi khởi tạo giao diện
document.addEventListener("DOMContentLoaded", function() {
    renderHospitals();
    renderDoctors();
});

// ==========================================
// LOGIC ĐẶT LỊCH (BOOKING STATE)
// ==========================================
let currentBookingTarget = null; // { type: 'hospital'|'doctor', data: {...} }

function selectHospitalForBooking(index) {
    const hospital = filteredHospitals[index];
    currentBookingTarget = {
        type: 'hospital',
        data: hospital
    };
    navigate('dv3');
}

function selectDoctorForBooking(name, img, desc) {
    currentBookingTarget = {
        type: 'doctor',
        data: { name, img, desc }
    };
    navigate('dv3');
}

function clearBookingSelection() {
    currentBookingTarget = null;
    updateBookingFormState();
}

function updateBookingFormState() {
    const emptyState = document.getElementById('booking-empty-state');
    const formState = document.getElementById('booking-form-state');
    
    // Nếu đang không ở trang dv3 thì ko cần xử lý UI
    const dv3 = document.getElementById('dv3');
    if (!dv3 || !dv3.classList.contains('active')) return;

    if (!currentBookingTarget) {
        if(emptyState) emptyState.style.display = 'block';
        if(formState) formState.style.display = 'none';
    } else {
        if(emptyState) emptyState.style.display = 'none';
        if(formState) formState.style.display = 'block';

        // Update target info UI
        document.getElementById('selected-target-img').src = currentBookingTarget.data.img;
        document.getElementById('selected-target-name').innerText = currentBookingTarget.data.name;
        
        const typeBadge = document.getElementById('selected-target-type');
        const descText = document.getElementById('selected-target-desc');
        const selectSpecialty = document.getElementById('booking-specialty-select');
        if(selectSpecialty) selectSpecialty.innerHTML = '';

        if (currentBookingTarget.type === 'hospital') {
            typeBadge.innerText = 'Cơ sở y tế';
            typeBadge.className = 'badge bg-primary mb-1';
            descText.innerHTML = `<i class="fas fa-map-marker-alt"></i> Khu vực: ${currentBookingTarget.data.location}`;
            
            // Xử lý tạo chuyên khoa dựa trên tên bệnh viện
            let specialties = ['Khoa Nội Tổng Quát', 'Khoa Ngoại Tổng Quát', 'Tai Mũi Họng', 'Răng Hàm Mặt', 'Phụ Sản', 'Nhi Khoa', 'Mắt', 'Da Liễu'];
            const name = currentBookingTarget.data.name.toLowerCase();
            
            if (name.includes('nhi')) {
                specialties = ['Nhi Khoa Tổng Quát', 'Nhi Hô Hấp', 'Nhi Tiêu Hóa', 'Nhi Sơ Sinh'];
            } else if (name.includes('sản') || name.includes('từ dũ')) {
                specialties = ['Sản Khoa', 'Phụ Khoa', 'Khám Thai Định Kỳ', 'Hiếm Muộn'];
            } else if (name.includes('mắt')) {
                specialties = ['Khám Mắt Tổng Hợp', 'Đo Khúc Xạ', 'Phẫu Thuật Đục Thủy Tinh Thể'];
            } else if (name.includes('răng hàm mặt')) {
                specialties = ['Nha Khoa Tổng Quát', 'Chỉnh Nha', 'Phục Hình Răng'];
            } else if (name.includes('da liễu')) {
                specialties = ['Da Liễu Lâm Sàng', 'Thẩm Mỹ Da', 'Laser Trị Liệu'];
            } else if (name.includes('chấn thương') || name.includes('xương')) {
                specialties = ['Cơ Xương Khớp', 'Chấn Thương Chỉnh Hình', 'Phục Hồi Chức Năng'];
            } else if (name.includes('tim')) {
                specialties = ['Nội Tim Mạch', 'Ngoại Tim Mạch', 'Nhịp Tim'];
            } else if (name.includes('ung bướu') || name.includes('k ') || name.includes('k.')) {
                specialties = ['Tầm Soát Ung Thư', 'Xạ Trị', 'Hóa Trị', 'Khám U Bướu'];
            }

            if(selectSpecialty) {
                specialties.forEach(sp => {
                    selectSpecialty.insertAdjacentHTML('beforeend', `<option>${sp}</option>`);
                });
            }
        } else {
            typeBadge.innerText = 'Bác sĩ';
            typeBadge.className = 'badge bg-success mb-1';
            descText.innerHTML = `<i class="fas fa-stethoscope"></i> ${currentBookingTarget.data.desc}`;
            
            // Bác sĩ thì chuyên khoa là chuyên khoa của bác sĩ đó
            if(selectSpecialty) {
                selectSpecialty.insertAdjacentHTML('beforeend', `<option>${currentBookingTarget.data.desc}</option>`);
            }
        }
        
        // Đảm bảo Form validate lại để nút Tiếp tục ẩn/hiện đúng chuẩn
        checkBookingFormValidity();
    }
}

// Hook vào hàm navigate có sẵn bằng cách override
if (typeof window.originalNavigate === 'undefined') {
    window.originalNavigate = window.navigate;
    window.navigate = function(pId, pushState = true, restoreScroll = null) {
        window.originalNavigate(pId, pushState, restoreScroll);
        if(pId === 'dv3') {
            setTimeout(updateBookingFormState, 50); 
        }
        if(pId === 'dv5') {
            setTimeout(populateConfirmationPage, 50);
        }
    };
}

// Hàm kết nối thông tin giữa dv3 và form xác nhận dv5
function populateConfirmationPage() {
    if (!currentBookingTarget && window.location.hash !== '#dv5') {
        // Chỉ bật cảnh báo nếu thực sự người dùng đang cố ấn next
        return;
    }
    
    // Đổ thông tin cơ bản từ booking target
    const imgEl = document.getElementById('confirm-target-img');
    const typeEl = document.getElementById('confirm-target-type');
    const nameEl = document.getElementById('confirm-target-name');
    const descEl = document.getElementById('confirm-target-desc');
    
    if (currentBookingTarget) {
        if (imgEl) imgEl.src = currentBookingTarget.data.img;
        if (nameEl) nameEl.textContent = currentBookingTarget.data.name;
        
        if (typeEl) {
            typeEl.textContent = currentBookingTarget.type === 'hospital' ? 'Cơ sở y tế' : 'Bác sĩ chuyên khoa';
            typeEl.className = currentBookingTarget.type === 'hospital' ? 'badge bg-primary px-3 py-2 rounded-pill fs-7 mb-2' : 'badge bg-info text-dark px-3 py-2 rounded-pill fs-7 mb-2';
        }
        
        if (descEl) {
            descEl.innerHTML = `<i class="${currentBookingTarget.type === 'hospital' ? 'fas fa-map-marker-alt text-danger' : 'fas fa-stethoscope text-info'} me-1"></i> ${currentBookingTarget.data.desc}`;
        }
    }
    
    // Thu thập dữ liệu từ trang form dv3
    const dv3Select = document.getElementById('booking-specialty-select');
    const dateQuery = document.querySelector('#dv3 input[type="date"]');
    const notesQuery = document.querySelector('#dv3 textarea');
    
    const confirmSpec = document.getElementById('confirm-specialty');
    const confirmDate = document.getElementById('confirm-date');
    const confirmNotes = document.getElementById('confirm-notes');
    
    if (confirmSpec) {
        confirmSpec.textContent = (dv3Select && dv3Select.value) ? dv3Select.options[dv3Select.selectedIndex].text : 'Chưa chọn';
    }
    
    if (confirmDate) {
        if (dateQuery && dateQuery.value) {
            const parts = dateQuery.value.split('-');
            if(parts.length === 3) confirmDate.textContent = `${parts[2]}/${parts[1]}/${parts[0]}`;
            else confirmDate.textContent = dateQuery.value;
        } else {
            // Không thiết lập mặc định có thể là đi luôn hôm nay.
            const today = new Date();
            confirmDate.innerHTML = `<span class="text-danger">Đến xếp sổ trực tiếp ngay hôm nay</span>`;
        }
    }
    
    
    if (confirmNotes) {
        confirmNotes.textContent = (notesQuery && notesQuery.value.trim() !== '') ? notesQuery.value : 'Không có ghi chú thêm.';
    }
}

// Kiểm tra tính hợp lệ của form đặt lịch khám (dv3) để hiện nút Tiếp tục
function checkBookingFormValidity() {
    const spec = document.getElementById('booking-specialty-select');
    const date = document.getElementById('booking-date-input');
    const btnWrapper = document.getElementById('booking-submit-wrapper');
    
    if (spec && date && btnWrapper) {
        if (spec.value && date.value) {
            btnWrapper.style.display = 'block';
            setTimeout(() => {
                btnWrapper.style.opacity = '1';
            }, 10);
        } else {
            btnWrapper.style.opacity = '0';
            setTimeout(() => {
                if (btnWrapper.style.opacity === '0') {
                    btnWrapper.style.display = 'none';
                }
            }, 400); 
        }
    }
}

// Lắng nghe sự thay đổi của chuyên khoa (trong trường hợp JS fill vào)
document.addEventListener('DOMContentLoaded', () => {
    const specSelect = document.getElementById('booking-specialty-select');
    if (specSelect) {
        specSelect.addEventListener('change', checkBookingFormValidity);
    }
});
function changeTab(type) {
    const loginBox = document.getElementById('form-login-box');
    const registerBox = document.getElementById('form-register-box');
    const loginBtn = document.getElementById('tab-login-btn');
    const registerBtn = document.getElementById('tab-register-btn');

    // Reset trạng thái OTP khi chuyển tab
    document.getElementById('otp-section').style.display = 'none';
    document.getElementById('btn-get-otp').style.display = 'block';
    document.getElementById('btn-login-final').style.display = 'none';
    document.getElementById('loginPhone').readOnly = false;

    if (type === 'login') {
        loginBox.style.display = 'block';
        registerBox.style.display = 'none';
        loginBtn.classList.add('bg-white', 'shadow-sm');
        loginBtn.classList.remove('text-muted');
        registerBtn.classList.add('text-muted');
        registerBtn.classList.remove('bg-white', 'shadow-sm');
    } else {
        loginBox.style.display = 'none';
        registerBox.style.display = 'block';
        registerBtn.classList.add('bg-white', 'shadow-sm');
        registerBtn.classList.remove('text-muted');
        loginBtn.classList.add('text-muted');
        loginBtn.classList.remove('bg-white', 'shadow-sm');
    }
}

// Hàm yêu cầu gửi OTP
function requestOTP() {
    const phone = document.getElementById('loginPhone').value;
    if(phone.length < 10) {
        alert("Vui lòng nhập số điện thoại hợp lệ!");
        return;
    }

    alert("Mã OTP đã được gửi thành công đến số " + phone);
    
    // Hiện ô nhập mã và đổi nút bấm
    document.getElementById('otp-section').style.display = 'block';
    document.getElementById('btn-get-otp').style.display = 'none';
    document.getElementById('btn-login-final').style.display = 'block';
    document.getElementById('loginPhone').readOnly = true; // Khóa ô nhập số điện thoại
}