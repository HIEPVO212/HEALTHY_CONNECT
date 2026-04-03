function navigate(pId) {
    // 1. Ẩn tất cả các trang
    document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));

    // 2. Hiển thị trang được chọn
    document.getElementById(pId).classList.add('active');

    // 3. Cập nhật trạng thái Active trên Menu
    document.querySelectorAll('.nav-link').forEach(n => {
        n.classList.remove('active');
        // Nếu nội dung onclick của nav-link chứa pId thì active nó
        if (n.getAttribute('onclick').includes(`'${pId}'`)) {
            n.classList.add('active');
        }
    });

    // 4. Cuộn lên đầu trang
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 5. Đóng menu trên mobile nếu đang mở
    const navbarCollapse = document.getElementById('navbarNav');
    if (navbarCollapse.classList.contains('show')) {
        new bootstrap.Collapse(navbarCollapse).hide();
    }
}

function prepareConfirmation() {
    if (!currentSelectedHospital) {
        alert("Vui lòng chọn cơ sở y tế hoặc bác sĩ trước.");
        return;
    }

    const specialtySelect = document.getElementById('booking-specialty');
    if (specialtySelect && specialtySelect.value === "") {
        alert("Vui lòng chọn chuyên khoa!");
        return;
    }

    const confirmPrefix = document.getElementById('confirm-title-prefix');
    const confirmName = document.getElementById('confirm-hospital-name');
    const confirmSpec = document.getElementById('confirm-specialty');
    const confirmLocation = document.getElementById('confirm-location');
    const confirmPrice = document.getElementById('confirm-price');

    if (confirmPrefix && confirmName) {
        if (currentSelectedHospital.isDoctor) {
            confirmPrefix.innerText = "BẠN ĐANG ĐẶT LỊCH KHÁM VỚI BÁC SĨ";
            confirmName.innerText = currentSelectedHospital.fullName;

            if (confirmLocation && currentSelectedHospital.location) {
                confirmLocation.style.display = 'block';
                confirmLocation.querySelector('span').innerText = currentSelectedHospital.location;
            }
            if (confirmPrice && currentSelectedHospital.price) {
                confirmPrice.style.display = 'block';
                confirmPrice.querySelector('span').innerText = currentSelectedHospital.price.toLocaleString('vi-VN') + ' đ';
            }
        } else {
            confirmPrefix.innerText = "BẠN ĐANG ĐẶT LỊCH TẠI CƠ SỞ Y TẾ";
            confirmName.innerText = currentSelectedHospital.name;

            if (confirmLocation && currentSelectedHospital.location) {
                confirmLocation.style.display = 'block';
                confirmLocation.querySelector('span').innerText = currentSelectedHospital.location;
            }
            if (confirmPrice) {
                confirmPrice.style.display = 'none';
            }
        }
    }

    if (confirmSpec && specialtySelect && specialtySelect.value) {
        confirmSpec.innerText = "Chuyên khoa: " + specialtySelect.value;
    }

    navigate('dv5');
}

function finishBooking() {
    const name = document.getElementById('pName').value.trim();
    const phone = document.getElementById('pPhone') ? document.getElementById('pPhone').value.trim() : "";
    const idCard = document.getElementById('pIdCard') ? document.getElementById('pIdCard').value.trim() : "";

    if (name.length < 4) return alert("Vui lòng nhập đầy đủ họ tên (tối thiểu 4 ký tự).");
    if (phone.length < 10) return alert("Vui lòng nhập số điện thoại hợp lệ (tối thiểu 10 số).");
    if (idCard.length < 9) return alert("Vui lòng nhập số Căn cước công dân hợp lệ.");

    // Xóa trắng các form
    document.getElementById('pName').value = "";
    document.getElementById('pPhone').value = "";
    document.getElementById('pIdCard').value = "";
    if (document.getElementById('pAddress')) document.getElementById('pAddress').value = "";

    document.getElementById('resCode').innerText = "#HC-" + Math.floor(100000 + Math.random() * 900000);
    navigate('dv6');

    // Reset dữ liệu sau khi đặt thành công
    currentSelectedHospital = null;
    updateBookingPage();
}

// --- Paging & Data Logic cho Cơ Sở Y Tế (1-30) ---
const hospitalData = [
    { name: "Bệnh viện Chợ Rẫy", location: "Quận 5, TP.HCM", img: "Image/Hospital/1.jpg" },
    { name: "Bệnh viện Bạch Mai", location: "Đống Đa, Hà Nội", img: "Image/Hospital/2.jpg" },
    { name: "Bệnh viện Đa Khoa Đồng Nai", location: "Biên Hòa, Đồng Nai", img: "Image/Hospital/3.jpg" },
    { name: "Bệnh viện Từ Dũ", location: "Quận 1, TP.HCM", img: "Image/Hospital/4.jpg" },
    { name: "Bệnh viện Nhi Đồng 1", location: "Quận 10, TP.HCM", img: "Image/Hospital/5.jpg" },
    { name: "Viện Tim TP.HCM", location: "Quận 10, TP.HCM", img: "Image/Hospital/6.jpg" },
    { name: "Bệnh viện Đại học Y Dược", location: "Quận 5, TP.HCM", img: "Image/Hospital/7.jpg" },
    { name: "Bệnh viện Ung Bướu", location: "Bình Thạnh, TP.HCM", img: "Image/Hospital/8.jpg" },
    { name: "Bệnh viện TW Quân đội 108", location: "Hai Bà Trưng, Hà Nội", img: "Image/Hospital/9.jpg" },
    { name: "Bệnh viện Việt Đức", location: "Hoàn Kiếm, Hà Nội", img: "Image/Hospital/10.jpg" },
    { name: "Bệnh viện Phụ Sản TW", location: "Hoàn Kiếm, Hà Nội", img: "Image/Hospital/11.jpg" },
    { name: "Bệnh viện Nhi Trung ương", location: "Đống Đa, Hà Nội", img: "Image/Hospital/12.jpg" },
    { name: "Bệnh viện K (Cơ sở Tân Triều)", location: "Thanh Trì, Hà Nội", img: "Image/Hospital/13.jpg" },
    { name: "Bệnh viện Răng Hàm Mặt TW", location: "Quận 5, TP.HCM", img: "Image/Hospital/14.jpg" },
    { name: "Bệnh viện Đa Khoa Quốc Tế Vinmec", location: "Bình Thạnh, TP.HCM", img: "Image/Hospital/15.jpg" },
    { name: "Bệnh viện FV", location: "Quận 7, TP.HCM", img: "Image/Hospital/16.jpg" },
    { name: "Bệnh viện Tâm Anh", location: "Tân Bình, TP.HCM", img: "Image/Hospital/17.jpg" },
    { name: "Bệnh viện Hoàn Mỹ Sài Gòn", location: "Phú Nhuận, TP.HCM", img: "Image/Hospital/18.jpg" },
    { name: "Bệnh viện Mắt TP.HCM", location: "Quận 3, TP.HCM", img: "Image/Hospital/19.jpg" },
    { name: "Bệnh viện Da Liễu TP.HCM", location: "Quận 3, TP.HCM", img: "Image/Hospital/20.jpg" },
    { name: "Bệnh viện Chấn Thương Chỉnh Hình", location: "Quận 5, TP.HCM", img: "Image/Hospital/21.jpg" },
    { name: "Bệnh viện Bình Dân", location: "Quận 3, TP.HCM", img: "Image/Hospital/22.jpg" },
    { name: "Bệnh viện Phạm Ngọc Thạch", location: "Quận 5, TP.HCM", img: "Image/Hospital/23.jpg" },
    { name: "Bệnh viện Thống Nhất", location: "Tân Bình, TP.HCM", img: "Image/Hospital/24.jpg" },
    { name: "Bệnh viện Nhi Đồng 2", location: "Quận 1, TP.HCM", img: "Image/Hospital/25.jpg" },
    { name: "Bệnh viện Đa Khoa Đà Nẵng", location: "Hải Châu, Đà Nẵng", img: "Image/Hospital/26.jpg" },
    { name: "Bệnh viện C Đà Nẵng", location: "Hải Châu, Đà Nẵng", img: "Image/Hospital/27.jpg" },
    { name: "Bệnh viện Trung ương Huế", location: "TP. Huế", img: "Image/Hospital/28.jpg" },
    { name: "Bệnh viện Đa Khoa TP. Cần Thơ", location: "Ninh Kiều, Cần Thơ", img: "Image/Hospital/29.jpg" },
    { name: "Bệnh viện Đa Khoa Tỉnh Bình Dương", location: "Thủ Dầu Một, Bình Dương", img: "Image/Hospital/30.jpg" }
].map((h, i) => {
    const lowerName = h.name.toLowerCase();
    let specialties = ["Khoa Nội Tổng Quát", "Khoa Ngoại Tổng Quát", "Khoa Tai Mũi Họng", "Khoa Răng Hàm Mặt", "Khoa Tim Mạch", "Khoa Thần Kinh", "Khoa Da Liễu"];

    // Xử lý logic chia chuyên khoa phù hợp cho từng bệnh viện dựa trên tên
    if (lowerName.includes("nhi đồng") || lowerName.includes("nhi trung ương")) specialties = ["Khoa Nội Nhi", "Khoa Ngoại Nhi", "Khoa Hô Hấp Nhi", "Khoa Tiêu Hóa Nhi", "Khoa Sơ Sinh", "Khoa Tâm Lý Trẻ Em"];
    else if (lowerName.includes("từ dũ") || lowerName.includes("phụ sản")) specialties = ["Khoa Sản Dịch Vụ", "Khoa Phụ Khoa", "Khoa Hiếm Muộn", "Khám Tiền Sản", "Kế Hoạch Hóa Gia Đình"];
    else if (lowerName.includes("ung bướu") || lowerName.includes("viện k")) specialties = ["Khoa Tầm Soát Ung Thư", "Khoa Ngoại Tuyến Vú", "Khoa Tịch Thuốc/Xạ Trị", "Khoa Nội Điều Trị Theo Yêu Cầu"];
    else if (lowerName.includes("mắt")) specialties = ["Khoa Giác Mạc", "Khoa Khúc Xạ", "Khoa Glôcôm", "Khoa Đáy Mắt", "Phẫu Thuật Phaco"];
    else if (lowerName.includes("da liễu")) specialties = ["Khám Bệnh Da", "Khoa Dị Ứng", "Da Liễu Thẩm Mỹ", "Điều Trị Mụn Bọc/Nám"];
    else if (lowerName.includes("tim")) specialties = ["Khoa Nội Tim Mạch", "Khoa Tim Mạch Can Thiệp", "Khám Nhịp Tim", "Khoa Phẫu Thuật Tim"];
    else if (lowerName.includes("răng hàm mặt")) specialties = ["Khám Răng Hàm Mặt", "Nhổ Răng Khôn Tiểu Phẫu", "Phục Hình Khúc Xạ", "Nha Khoa Thẩm Mỹ"];
    else if (lowerName.includes("chấn thương chỉnh hình")) specialties = ["Khoa Chấn Thương Thể Thao", "Khoa Cột Sống", "Khoa Khớp Cơ Xương", "Vật Lý Trị Liệu"];

    const hospitalImageMap = {
        "Bệnh viện Chợ Rẫy": "Chợ rẫy.jpg",
        "Bệnh viện Bạch Mai": "Bạch Mai.jpg",
        "Bệnh viện Đa Khoa Đồng Nai": "Đa khoa ĐN.jpg",
        "Bệnh viện Từ Dũ": "Từ dũ.jpg",
        "Bệnh viện Nhi Đồng 1": "Nhi đồng 1.jpg",
        "Viện Tim TP.HCM": "Viện tim TP.HCM.jpg",
        "Bệnh viện Đại học Y Dược": "ĐH Y dược.jpg",
        "Bệnh viện FV": "FV.jpg",
        "Bệnh viện Ung Bướu": "Ung bướu.jpg",
        "Bệnh viện TW Quân đội 108": "108.jpg",
        "Bệnh viện Việt Đức": "Việt đức.jpg",
        "Bệnh viện Phụ Sản TW": "Phụ sản TW.jpg",
        "Bệnh viện Nhi Trung ương": "Nhi trung ương.jpg",
        "Bệnh viện K (Cơ sở Tân Triều)": "K.jpg",
        "Bệnh viện Răng Hàm Mặt TW": "RHM TW.jpg",
        "Bệnh viện Đa Khoa Quốc Tế Vinmec": "Vinmec.jpg",
        "Bệnh viện Tâm Anh": "Tâm anh.jpg",
        "Bệnh viện Hoàn Mỹ Sài Gòn": "Hoàn Mỹ SG.jpg",
        "Bệnh viện Mắt TP.HCM": "Măt TPHCM.jpg",
        "Bệnh viện Da Liễu TP.HCM": "Da liễu HCM.jpg",
        "Bệnh viện Chấn Thương Chỉnh Hình": "Chấn thương chỉnh hình.jpg",
        "Bệnh viện Bình Dân": "Bình dân.jpg",
        "Bệnh viện Phạm Ngọc Thạch": "Phạm Ngọc Thạch.jpg",
        "Bệnh viện Thống Nhất": "Thống nhất.jpg",
        "Bệnh viện Nhi Đồng 2": "Nhi đồng 2.jpg",
        "Bệnh viện Đa Khoa Đà Nẵng": "Đa khoa đà nẵng.jpg",
        "Bệnh viện C Đà Nẵng": "C đà nẵng.jpg",
        "Bệnh viện Trung ương Huế": "Trung ương Huế.jpg",
        "Bệnh viện Đa Khoa TP. Cần Thơ": "Cần Thơ.jpg",
        "Bệnh viện Đa Khoa Tỉnh Bình Dương": "Bình Dương.jpg"
    };

    if (hospitalImageMap[h.name]) {
        h.img = `Image/Hospital/${hospitalImageMap[h.name]}`;
    } else {
        const shortName = h.name.replace(/(Bệnh viện|Đa Khoa|Quốc Tế|TW|Tỉnh|TP\.) /gi, "").trim();
        h.img = `https://ui-avatars.com/api/?name=${encodeURIComponent(shortName)}&background=random&color=fff&size=150&bold=true&font-size=0.4`;
    }

    return { id: i + 1, ...h, specialties };
});

let currentSelectedHospital = null;

function selectHospital(id) {
    currentSelectedHospital = hospitalData.find(h => h.id === id);
    if (currentSelectedHospital) currentSelectedHospital.isDoctor = false;
    updateBookingPage();
    navigate('dv3');
}

function selectDoctor(id) {
    const doc = doctorData.find(d => d.id === id);
    if (doc) {
        currentSelectedHospital = {
            isDoctor: true,
            fullName: doc.fullName,
            location: doc.hospital,
            specialties: [doc.specialty],
            price: doc.price
        };
    }
    updateBookingPage();
    navigate('dv3');
}

function navigateBookingTab(pId) {
    currentSelectedHospital = null;
    updateBookingPage();
    navigate(pId);
}

function clearBookingSelection() {
    currentSelectedHospital = null;
    updateBookingPage();
}

function updateBookingPage() {
    const emptyState = document.getElementById('booking-empty-state');
    const formContainer = document.getElementById('booking-form-container');

    if (!currentSelectedHospital) {
        if (emptyState) emptyState.style.display = 'block';
        if (formContainer) formContainer.style.display = 'none';
        // Xoá text input cũ
        const specialtySelect = document.getElementById('booking-specialty');
        if (specialtySelect) specialtySelect.innerHTML = '<option value="" selected disabled>-- Vui lòng chọn chuyên khoa --</option>';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (formContainer) formContainer.style.display = 'block';

    if (currentSelectedHospital.isDoctor) {
        document.getElementById('booking-title-prefix').innerText = "BẠN ĐANG ĐẶT LỊCH KHÁM VỚI BÁC SĨ";
        document.getElementById('booking-hospital-name').innerText = currentSelectedHospital.fullName;
        document.getElementById('booking-hospital-location').innerHTML = '<i class="fas fa-hospital text-danger me-1"></i> Làm việc tại: ' + currentSelectedHospital.location;
    } else {
        document.getElementById('booking-title-prefix').innerText = "BẠN ĐANG ĐẶT LỊCH TẠI CƠ SỞ Y TẾ";
        document.getElementById('booking-hospital-name').innerText = currentSelectedHospital.name;
        document.getElementById('booking-hospital-location').innerHTML = '<i class="fas fa-map-marker-alt text-danger me-1"></i> ' + currentSelectedHospital.location;
    }

    const specialtySelect = document.getElementById('booking-specialty');
    specialtySelect.innerHTML = '<option value="" selected disabled>-- Vui lòng chọn chuyên khoa --</option>';

    if (currentSelectedHospital.specialties) {
        currentSelectedHospital.specialties.forEach(sp => {
            specialtySelect.innerHTML += `<option value="${sp}">${sp}</option>`;
        });
        // Nếu là bác sĩ, tự động chọn luôn chuyên khoa của bác sĩ đó
        if (currentSelectedHospital.isDoctor) {
            specialtySelect.value = currentSelectedHospital.specialties[0];
        }
    }
}

let currentFilteredHospitals = [...hospitalData];
let currentPage = 1;
const itemsPerPage = 5;

function renderHospitals() {
    const container = document.getElementById('hospital-list-container');
    container.innerHTML = '';

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const hospitalsToRender = currentFilteredHospitals.slice(startIndex, endIndex);

    if (hospitalsToRender.length === 0) {
        container.innerHTML = '<div class="text-center text-muted my-5"><i class="fas fa-search-minus fa-3x mb-3 text-light"></i><br>Không tìm thấy bệnh viện nào khớp với từ khóa.</div>';
        return;
    }

    hospitalsToRender.forEach(h => {
        // Sử dụng default avatar nếu ảnh lỗi
        const fallbackImg = `https://ui-avatars.com/api/?name=${encodeURIComponent(h.name)}&background=2281c4&color=fff&size=150`;
        const cardHtml = `
                    <div class="hospital-card-3d">
                        <div class="d-flex align-items-center w-100">
                            <img src="${h.img}" class="hospital-img-3d" onerror="this.src='${fallbackImg}'" alt="${h.name}">
                            <div class="hospital-details">
                                <h6 class="fw-bold mb-1" style="font-size: 1.1rem; color: var(--primary-color);">${h.name}</h6>
                                <small class="text-muted"><i class="fas fa-map-marker-alt me-2 text-danger"></i>${h.location}</small>
                            </div>
                            <button class="btn btn-3d" onclick="selectHospital(${h.id})">ĐẶT LỊCH</button>
                        </div>
                    </div>
                `;
        container.innerHTML += cardHtml;
    });
}

function renderPagination() {
    const paginationUl = document.getElementById('hospital-pagination');
    paginationUl.innerHTML = '';

    const totalPages = Math.ceil(currentFilteredHospitals.length / itemsPerPage);

    if (totalPages <= 1) return;

    // Nút Prev
    paginationUl.innerHTML += `
                <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;">
                        <i class="fas fa-chevron-left"></i>
                    </a>
                </li>
            `;

    // Số thứ tự trang
    for (let i = 1; i <= totalPages; i++) {
        // Logic thu gọn (ellipsis) nếu có quá nhiều trang
        if (totalPages > 5) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                // Hiện
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                if (!paginationUl.innerHTML.includes('...')) {
                    paginationUl.innerHTML += `<li class="page-item disabled"><span class="page-link border-0 bg-transparent text-muted">...</span></li>`;
                }
                continue;
            } else {
                continue;
            }
        }

        paginationUl.innerHTML += `
                    <li class="page-item ${currentPage === i ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
                    </li>
                `;
    }

    // Nút Next
    paginationUl.innerHTML += `
                <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;">
                        <i class="fas fa-chevron-right"></i>
                    </a>
                </li>
            `;
}

function changePage(page) {
    const totalPages = Math.ceil(currentFilteredHospitals.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderHospitals();
        renderPagination();
        document.getElementById('dv1').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function filterHospitals() {
    const searchTerm = document.getElementById('searchHospital').value.toLowerCase();
    currentFilteredHospitals = hospitalData.filter(h =>
        h.name.toLowerCase().includes(searchTerm) ||
        h.location.toLowerCase().includes(searchTerm)
    );
    currentPage = 1;
    renderHospitals();
    renderPagination();
}

// --- Doctor Logic (1-70) ---
const firstNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"];
const middleNames = ["Văn", "Thị", "Học", "Tiến", "Đức", "Ngọc", "Hoài", "Thanh", "Minh", "Quang", "Hữu", "Thành", "Thu", "Hải", "Tuấn", "Mai", "Phương", "Kim"];
const lastNames = ["Anh", "Tuấn", "Nam", "Nữ", "Hương", "Hùng", "Hà", "Phong", "Khang", "Bình", "Châu", "Đạt", "Linh", "Thắng", "Vy", "Yến", "Tâm", "Huy", "Hòa"];
const specialtiesList = ["Tim mạch", "Thần kinh", "Nhi khoa", "Sản phụ khoa", "Da liễu", "Cơ xương khớp", "Nội tiết", "Tiêu hóa", "Mắt", "Tai mũi họng", "Răng hàm mặt", "Hô hấp", "Ngoại tổng quát"];
const titlesList = ["ThS.BS", "ThS.BS", "BS.CKI", "BS.CKI", "BS.CKII", "PGS.TS.BS", "TS.BS"];
const expList = ["5 năm", "8 năm", "12 năm", "15 năm", "20 năm", "25 năm", "Hơn 30 năm"];

const doctorImages = [
    "111852-pgs-than-kinh-cao-phi-phong.png", "113415-ths-bs-than-kinh-do-anh-vu.png",
    "135456-bac-si-dinh-vinh-quang-chuyen-khoa-than-kinh.jpg", "140051-ths-bs-than-kinh-nguyen-canh-nam.png",
    "144549-bac-si-than-kinh-bs-nguyen-quoc-giang.png", "151612-bsnguyen-thi-hung.jpg",
    "layer-10.jpg", "layer-12.jpg", "pexels-byb-byb-412101727-19471016.jpg",
    "pexels-khanh-hoang-minh-2-77752098-27392531.jpg", "pexels-konrads-photo-32115955.jpg",
    "pexels-konrads-photo-32160039.jpg", "pexels-konrads-photo-32254667.jpg",
    "pexels-kooldark-14438788.jpg", "pexels-kooldark-14628046.jpg",
    "pexels-kooldark-15641079.jpg", "pexels-kooldark-15641080.jpg",
    "pexels-kooldark-15962796.jpg", "pexels-kooldark-15962799.jpg",
    "pexels-kooldark-29995617.jpg", "pexels-nguy-n-ti-n-th-nh-2150376175-36603939.jpg",
    "pexels-oys-photography-838143052-19438561.jpg", "pexels-pro5-vn-1368185933-26336880.jpg",
    "top-bac-si-uy-tin-benh-vien-cho-ray-ivie-(3)-jpg_1f38e4ef_e73e_4e58_8896_5c70f130f261.png"
];

const generateDoctors = (count) => {
    const docs = [];
    for (let i = 1; i <= count; i++) {
        const title = titlesList[Math.floor(Math.random() * titlesList.length)];
        const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${middleNames[Math.floor(Math.random() * middleNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
        const spec = specialtiesList[Math.floor(Math.random() * specialtiesList.length)];
        const exp = expList[Math.floor(Math.random() * expList.length)];

        // Pick a random hospital to act as workplace
        const workHospital = hospitalData[Math.floor(Math.random() * Math.min(15, hospitalData.length))];

        // Use local images instead of randomuser.me
        const imgName = doctorImages[Math.floor(Math.random() * doctorImages.length)];
        const img = `Image/Doctor/${imgName}`;

        docs.push({
            id: i, title, name,
            fullName: `${title} ${name}`,
            specialty: spec,
            hospital: workHospital.name,
            exp, img,
            price: (Math.floor(Math.random() * 4) + 2) * 100000 // 200k to 500k
        });
    }
    // Keep specific doctors for consistency
    if (docs.length > 1) {
        docs[0] = { id: 1, title: 'PGS.TS', name: 'Nguyễn Văn Thắng', fullName: 'PGS.TS Nguyễn Văn Thắng', specialty: 'Tim mạch', hospital: 'Bệnh viện Chợ Rẫy', exp: '25 năm', img: 'Image/Doctor/top-bac-si-uy-tin-benh-vien-cho-ray-ivie-(3)-jpg_1f38e4ef_e73e_4e58_8896_5c70f130f261.png', price: 500000 };
        docs[1] = { id: 2, title: 'ThS.BS', name: 'Lê Mỹ Linh', fullName: 'ThS.BS Lê Mỹ Linh', specialty: 'Da liễu', hospital: 'Bệnh viện Đại học Y Dược', exp: '10 năm', img: 'Image/Doctor/151612-bsnguyen-thi-hung.jpg', price: 300000 };
    }
    return docs;
};

const doctorData = generateDoctors(70);
let currentFilteredDoctors = [...doctorData];
let currentDocPage = 1;
const docsPerPage = 10;

function renderDoctors() {
    const container = document.getElementById('doctor-list-container');
    if (!container) return;
    container.innerHTML = '';

    const startIndex = (currentDocPage - 1) * docsPerPage;
    const endIndex = startIndex + docsPerPage;
    const docsToRender = currentFilteredDoctors.slice(startIndex, endIndex);

    if (docsToRender.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted my-5"><i class="fas fa-user-md fa-3x mb-3 text-light"></i><br>Không tìm thấy bác sĩ nào khớp với điều kiện.</div>';
        return;
    }

    docsToRender.forEach(d => {
        const fallbackImg = `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name)}&background=2281c4&color=fff&size=150`;
        const priceFormatted = d.price.toLocaleString('vi-VN') + ' đ';
        const cardHtml = `
                    <div class="col-md-6 col-lg-6">
                        <div class="doctor-card-3d">
                            <div class="d-flex w-100 flex-column flex-sm-row">
                                <div class="text-center me-sm-4 mb-3 mb-sm-0">
                                    <div class="doctor-avatar-wrap">
                                        <img src="${d.img}" class="doctor-avatar-3d" onerror="this.src='${fallbackImg}'" alt="${d.fullName}">
                                    </div>
                                    <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 mt-2 rounded-pill px-3 py-1">${d.specialty}</span>
                                </div>
                                <div class="flex-grow-1">
                                    <h5 class="fw-bold mb-2 text-dark" style="font-size: 1.15rem;">${d.fullName}</h5>
                                    <div class="doctor-info-item">
                                        <i class="fas fa-hospital"></i>
                                        <span>${d.hospital}</span>
                                    </div>
                                    <div class="doctor-info-item">
                                        <i class="fas fa-briefcase-medical"></i>
                                        <span>Kinh nghiệm: <strong class="text-dark">${d.exp}</strong></span>
                                    </div>
                                    <div class="doctor-info-item">
                                        <i class="fas fa-money-bill-wave"></i>
                                        <span>Phí khám: <strong class="text-danger">${priceFormatted}</strong></span>
                                    </div>
                                    <button class="btn btn-3d w-100 mt-3" onclick="selectDoctor(${d.id})">
                                        <i class="far fa-calendar-check me-2"></i> ĐẶT LỊCH
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
        container.innerHTML += cardHtml;
    });
}

function renderDoctorPagination() {
    const paginationUl = document.getElementById('doctor-pagination');
    if (!paginationUl) return;
    paginationUl.innerHTML = '';

    const totalPages = Math.ceil(currentFilteredDoctors.length / docsPerPage);

    if (totalPages <= 1) return;

    // Nút Prev
    paginationUl.innerHTML += `
                <li class="page-item ${currentDocPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="changeDocPage(${currentDocPage - 1}); return false;">
                        <i class="fas fa-chevron-left"></i>
                    </a>
                </li>
            `;

    for (let i = 1; i <= totalPages; i++) {
        if (totalPages > 5) {
            if (i === 1 || i === totalPages || (i >= currentDocPage - 1 && i <= currentDocPage + 1)) {
                // show
            } else if (i === currentDocPage - 2 || i === currentDocPage + 2) {
                if (!paginationUl.innerHTML.includes('...')) {
                    paginationUl.innerHTML += `<li class="page-item disabled"><span class="page-link border-0 bg-transparent text-muted">...</span></li>`;
                }
                continue;
            } else {
                continue;
            }
        }

        paginationUl.innerHTML += `
                    <li class="page-item ${currentDocPage === i ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="changeDocPage(${i}); return false;">${i}</a>
                    </li>
                `;
    }

    // Nút Next
    paginationUl.innerHTML += `
                <li class="page-item ${currentDocPage === totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="changeDocPage(${currentDocPage + 1}); return false;">
                        <i class="fas fa-chevron-right"></i>
                    </a>
                </li>
            `;
}

function changeDocPage(page) {
    const totalPages = Math.ceil(currentFilteredDoctors.length / docsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentDocPage = page;
        renderDoctors();
        renderDoctorPagination();
        document.getElementById('dv2').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function filterDoctors() {
    const searchTerm = document.getElementById('searchDoctor').value.toLowerCase();
    const searchSpec = document.getElementById('filterSpecialty').value.toLowerCase();

    currentFilteredDoctors = doctorData.filter(d =>
        (d.fullName.toLowerCase().includes(searchTerm) || d.specialty.toLowerCase().includes(searchTerm)) &&
        (searchSpec === "" || d.specialty.toLowerCase().includes(searchSpec))
    );
    currentDocPage = 1;
    renderDoctors();
    renderDoctorPagination();
}

// Tự động render khi tải xong trang (nếu mục này ở chế độ active thì nó sẽ load luôn)
document.addEventListener("DOMContentLoaded", () => {
    renderHospitals();
    renderPagination();
    updateBookingPage();
    renderDoctors();
    renderDoctorPagination();
});