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