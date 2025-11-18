// =====================================================
// 🎮 메인 스크립트 (엔진) - 멀티 페이지 버전
// HTML과 3개 DB를 연결하는 핵심 로직
// =====================================================

// ============================================
// ⭐️ 로딩 애니메이션 시나리오
// ============================================

/**
 * 인터랙티브 로딩 애니메이션 초기화
 * 미니멀리즘 컨셉: "Caffeine-fit" → "Caff-Fit" (텍스트 변경) → 페이드아웃
 */
function initLoadingAnimation() {
    const loadingOverlay = document.getElementById('loading-overlay');
    const animatedLogo = document.getElementById('animated-logo');
    const mainContent = document.getElementById('main-content');

    if (!loadingOverlay || !animatedLogo || !mainContent) return;

    // [1단계: 0초] "Caffeine-fit" 텍스트 보여주기 (페이지 켜지면 바로 보임)
    // 초기 상태 유지

    // [2단계: 2.2초 뒤] "eine" 부분이 왼쪽으로 부드럽게 슬라이드 아웃되는 애니메이션
    setTimeout(() => {
        animatedLogo.classList.add('logo-text-changed'); // "eine" 부분 슬라이드 아웃
    }, 2200);

    // [3단계: 3.5초 뒤] 로고가 부드럽게 축소되면서 페이드아웃 (동시 진행)
    // 배경도 함께 페이드아웃, 메인 콘텐츠는 페이드인
    setTimeout(() => {
        animatedLogo.classList.add('logo-fadeout'); // 로고 축소 & 페이드아웃
        loadingOverlay.style.opacity = '0'; // 배경 페이드아웃 (1.2초)
        mainContent.classList.add('show'); // 메인 콘텐츠 페이드인 (1.2초)
    }, 3500);

    // [4단계: 4.9초 뒤] 최종 정리 (페이드 완료 후)
    setTimeout(() => {
        loadingOverlay.style.display = 'none'; // 로딩 오버레이 완전히 제거
        loadingOverlay.style.pointerEvents = 'none'; // 상호작용 비활성화
        animatedLogo.classList.remove('logo-text-changed', 'logo-fadeout'); // 클래스 제거 (새로고침 시 재사용)
    }, 4900);
}

// ============================================
// 0️⃣ 유틸리티 함수들
// ============================================

/**
 * 토스트 알림 표시
 * @param {string} message - 알림 메시지
 * @param {string} type - 알림 타입 ('success', 'error', 'info', 'warning')
 * @param {number} duration - 표시 지속 시간 (ms)
 */
function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('remove');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * 진행률 업데이트
 * @param {number} percentage - 진행률 (0-100)
 */
function updateProgressBar(percentage) {
    const progressBar = document.getElementById('onboarding-progress');
    const progressText = document.getElementById('progress-percentage');
    
    if (progressBar) {
        progressBar.style.width = Math.min(percentage, 100) + '%';
    }
    if (progressText) {
        progressText.textContent = Math.min(percentage, 100);
    }
}

/**
 * 입력 필드 검증 표시
 * @param {HTMLElement} input - 입력 필드
 * @param {boolean} isValid - 유효 여부
 * @param {string} message - 피드백 메시지
 */
function setFieldValidity(input, isValid, message = '') {
    if (!input) return;
    
    // 클래스 제거
    input.classList.remove('valid', 'invalid');
    
    // 피드백 요소 찾기 또는 생성
    let feedback = input.parentElement.querySelector('.form-feedback');
    if (!feedback) {
        feedback = document.createElement('small');
        feedback.className = 'form-feedback';
        input.parentElement.appendChild(feedback);
    }
    
    if (isValid) {
        input.classList.add('valid');
        feedback.className = 'form-feedback success';
        feedback.textContent = '✓ ' + message;
    } else if (message) {
        input.classList.add('invalid');
        feedback.className = 'form-feedback error';
        feedback.textContent = '✗ ' + message;
    }
}

// ============================================
// 1️⃣ 페이지 관리 시스템
// ============================================

const pages = {
    home: 'page-home',
    onboarding: 'page-onboarding',
    planner: 'page-planner',
    result: 'page-result'
};

// ============================================
// 🔐 데이터 저장 관리 시스템
// ============================================

/**
 * 프로필 저장/로드 관리
 */
const ProfileManager = {
    // 현재 활성 프로필
    save: (profile, profileName = 'default') => {
        const profiles = JSON.parse(localStorage.getItem('caffitProfiles') || '{}');
        profiles[profileName] = {
            ...profile,
            savedAt: new Date().toISOString()
        };
        localStorage.setItem('caffitProfiles', JSON.stringify(profiles));
        localStorage.setItem('activeProfile', profileName);
        console.log(`✅ 프로필 저장: ${profileName}`);
    },
    
    load: (profileName = 'default') => {
        const profiles = JSON.parse(localStorage.getItem('caffitProfiles') || '{}');
        return profiles[profileName] || null;
    },
    
    getAllProfiles: () => {
        return JSON.parse(localStorage.getItem('caffitProfiles') || '{}');
    },
    
    delete: (profileName) => {
        const profiles = JSON.parse(localStorage.getItem('caffitProfiles') || '{}');
        delete profiles[profileName];
        localStorage.setItem('caffitProfiles', JSON.stringify(profiles));
        console.log(`✅ 프로필 삭제: ${profileName}`);
    },
    
    getActive: () => {
        const activeProfile = localStorage.getItem('activeProfile') || 'default';
        return ProfileManager.load(activeProfile);
    }
};

/**
 * 계획 히스토리 저장/로드 관리
 */
const PlanHistory = {
    save: (plan) => {
        const history = JSON.parse(localStorage.getItem('caffitPlanHistory') || '[]');
        history.unshift({
            ...plan,
            savedAt: new Date().toISOString(),
            id: Date.now()
        });
        // 최근 50개만 유지
        if (history.length > 50) history.pop();
        localStorage.setItem('caffitPlanHistory', JSON.stringify(history));
        console.log(`✅ 계획 저장됨`);
        return history[0].id;
    },
    
    getAll: () => {
        return JSON.parse(localStorage.getItem('caffitPlanHistory') || '[]');
    },
    
    getById: (id) => {
        const history = PlanHistory.getAll();
        return history.find(p => p.id === id);
    },
    
    delete: (id) => {
        let history = JSON.parse(localStorage.getItem('caffitPlanHistory') || '[]');
        history = history.filter(p => p.id !== id);
        localStorage.setItem('caffitPlanHistory', JSON.stringify(history));
    }
};

/**
 * 즐겨찾기 제품 관리
 */
const FavoriteProducts = {
    add: (productIndex) => {
        const favorites = JSON.parse(localStorage.getItem('caffitFavorites') || '[]');
        if (!favorites.includes(productIndex)) {
            favorites.push(productIndex);
            localStorage.setItem('caffitFavorites', JSON.stringify(favorites));
            console.log(`✅ 즐겨찾기 추가: 제품 ${productIndex}`);
        }
    },
    
    remove: (productIndex) => {
        let favorites = JSON.parse(localStorage.getItem('caffitFavorites') || '[]');
        favorites = favorites.filter(idx => idx !== productIndex);
        localStorage.setItem('caffitFavorites', JSON.stringify(favorites));
        console.log(`✅ 즐겨찾기 제거: 제품 ${productIndex}`);
    },
    
    getAll: () => {
        return JSON.parse(localStorage.getItem('caffitFavorites') || '[]');
    },
    
    isFavorite: (productIndex) => {
        const favorites = FavoriteProducts.getAll();
        return favorites.includes(productIndex);
    }
};

/**
 * 최근 사용 제품 관리
 */
const RecentProducts = {
    add: (productIndex) => {
        let recent = JSON.parse(localStorage.getItem('caffitRecent') || '[]');
        recent = recent.filter(idx => idx !== productIndex);
        recent.unshift(productIndex);
        if (recent.length > 10) recent.pop();
        localStorage.setItem('caffitRecent', JSON.stringify(recent));
    },
    
    getAll: () => {
        return JSON.parse(localStorage.getItem('caffitRecent') || '[]');
    }
};

/**
 * 페이지 전환 함수
 * @param {string} pageKey - 이동할 페이지 ('home', 'onboarding', 'planner', 'result')
 */
function showPage(pageKey) {
    // 모든 페이지 숨기기
    Object.values(pages).forEach(pageId => {
        const page = document.getElementById(pageId);
        if (page) page.classList.remove('active');
    });

    // 선택된 페이지 보이기
    const targetPage = document.getElementById(pages[pageKey]);
    if (targetPage) {
        targetPage.classList.add('active');
        window.scrollTo(0, 0);
        console.log(`📄 페이지 이동: ${pageKey}`);
    }
}

// ============================================
// 2️⃣ HTML 요소 가져오기 (document.getElementById)
// ============================================

// 홈 페이지
const startBtn = document.getElementById("start-btn");

// 온보딩 섹션
const categorySelect = document.getElementById("category-select");
const ageSelect = document.getElementById("age-select");
const weightInput = document.getElementById("weight-input");
const weightDisplay = document.getElementById("weight-display");
const weightStatus = document.getElementById("weight-status");
const wakeTime = document.getElementById("wake-time");
const sleepTime = document.getElementById("sleep-time");
const saveProfileBtn = document.getElementById("save-profile-btn");
const backToHomeBtn = document.getElementById("back-to-home-btn");
const myLimitDisplay = document.getElementById("my-limit-display");

// 플래너 섹션
const categoryFilter = document.getElementById("category-filter");
const productSelect = document.getElementById("product-select");
const addProductBtn = document.getElementById("add-product-btn");
const productList = document.getElementById("product-list");
const startTime = document.getElementById("start-time");
const getPlanBtn = document.getElementById("get-plan-btn");
const backToOnboardingBtn = document.getElementById("back-to-onboarding-btn");

// 결과 섹션
const loadingSpinner = document.getElementById("loading-spinner");
const aiResultDisplay = document.getElementById("ai-result-display");
const backToPlannerBtn = document.getElementById("back-to-planner-btn");
const restartBtn = document.getElementById("restart-btn");

// ============================================
// 3️⃣ 페이지 네비게이션 이벤트
// ============================================

startBtn.addEventListener("click", () => showPage('onboarding'));
backToHomeBtn.addEventListener("click", () => showPage('home'));
backToOnboardingBtn.addEventListener("click", () => showPage('onboarding'));
backToPlannerBtn.addEventListener("click", () => showPage('planner'));
restartBtn.addEventListener("click", () => showPage('home'));

// 체중 입력 실시간 피드백
if (weightInput) {
    weightInput.addEventListener('input', function() {
        const weight = parseFloat(this.value);
        
        if (!this.value) {
            weightDisplay.textContent = '-';
            weightStatus.textContent = '';
        } else if (weight < 30) {
            weightDisplay.textContent = weight + ' kg';
            weightStatus.innerHTML = '<span style="color: var(--error-color);">⚠️ 너무 가벼움</span>';
        } else if (weight > 200) {
            weightDisplay.textContent = weight + ' kg';
            weightStatus.innerHTML = '<span style="color: var(--error-color);">⚠️ 너무 무거움</span>';
        } else {
            weightDisplay.textContent = weight + ' kg';
            weightStatus.innerHTML = '<span style="color: var(--success-color);">✅ 정상</span>';
        }
    });
}

// 건강 리포트 보기 버튼
document.addEventListener('DOMContentLoaded', () => {
    const viewHealthReportBtn = document.getElementById('view-health-report-btn');
    if (viewHealthReportBtn) {
        viewHealthReportBtn.addEventListener('click', () => {
            console.log("📊 건강 리포트 페이지로 이동 중...");
            HealthReport.initialize();  // 초기화 먼저
            showPage('health-report');  // 그 후 페이지 전환
            console.log("✅ 건강 리포트 페이지 표시됨");
        });
    }
});

// ============================================
// 4️⃣ 온보딩 섹션 로직
// ============================================

/**
 * 적정 카페인 한도를 계산하는 함수
 * @param {string} ageGroup - 나이대 ('teen' 또는 'adult')
 * @param {number} weight - 체중 (kg)
 * @returns {number} 적정 카페인 한도 (mg)
 */
function calculateCaffeinLimit(ageGroup, weight) {
    if (ageGroup === "teen") {
        return Math.min(weight * constantsDB.caffeine.teen.mgPerKg, constantsDB.caffeine.teen.maxDaily);
    } else if (ageGroup === "adult") {
        return Math.min(weight * constantsDB.caffeine.adult.mgPerKg, constantsDB.caffeine.adult.maxDaily);
    }
    return 0;
}

/**
 * 적정 설탕 한도를 가져오는 함수
 * @param {string} ageGroup - 나이대 ('teen' 또는 'adult')
 * @returns {number} 적정 설탕 한도 (g)
 */
function getSugarLimit(ageGroup) {
    if (ageGroup === "teen") {
        return constantsDB.sugar.teen.maxDaily;
    } else if (ageGroup === "adult") {
        return constantsDB.sugar.adult.maxDaily;
    }
    return 50;
}

/**
 * 수면 시간 사이의 시간 계산 (밤새는 경우 고려)
 * @param {string} wakeTimeStr - 기상 시간 (HH:MM)
 * @param {string} sleepTimeStr - 취침 시간 (HH:MM)
 * @returns {number} 활동 시간 (시간)
 */
function calculateAwakeHours(wakeTimeStr, sleepTimeStr) {
    const [wakeH, wakeM] = wakeTimeStr.split(':').map(Number);
    const [sleepH, sleepM] = sleepTimeStr.split(':').map(Number);
    
    const wakeMinutes = wakeH * 60 + wakeM;
    const sleepMinutes = sleepH * 60 + sleepM;
    
    let hours;
    if (sleepMinutes > wakeMinutes) {
        // 같은 날: 기상 → 취침
        hours = (sleepMinutes - wakeMinutes) / 60;
    } else {
        // 다른 날: 기상 → 다음날 취침 (밤새는 경우)
        hours = (1440 - wakeMinutes + sleepMinutes) / 60;
    }
    
    return hours;
}

/**
 * 프로필 선택 드롭다운 업데이트
 */
function updateProfileSelect() {
    const profileSelect = document.getElementById('profile-select');
    const allProfiles = ProfileManager.getAllProfiles();
    
    // 기존 옵션 제거 (첫 번째 제외)
    while (profileSelect.options.length > 1) {
        profileSelect.remove(1);
    }
    
    // 저장된 프로필 추가
    Object.keys(allProfiles).forEach(profileName => {
        if (profileName !== 'default') {
            const option = document.createElement('option');
            option.value = profileName;
            option.textContent = `📌 ${profileName}`;
            profileSelect.appendChild(option);
        }
    });
    
    console.log(`✅ 프로필 선택 드롭다운 업데이트: ${Object.keys(allProfiles).length}개`);
}

/**
 * 프로필 관리 버튼 이벤트 설정
 */
function setupProfileManagement() {
    const profileSelect = document.getElementById('profile-select');
    const loadProfileBtn = document.getElementById('load-profile-btn');
    const deleteProfileBtn = document.getElementById('delete-profile-btn');
    const saveProfileAsBtn = document.getElementById('save-profile-as-btn');
    const profileNameInput = document.getElementById('profile-name-input');
    
    // 프로필 로드
    if (loadProfileBtn) {
        loadProfileBtn.addEventListener('click', function() {
            const selectedProfile = profileSelect.value;
            if (!selectedProfile) {
                showToast("❌ 로드할 프로필을 선택해주세요!", 'error');
                return;
            }
            
            const profile = ProfileManager.load(selectedProfile);
            if (profile) {
                // 폼에 데이터 채우기
                categorySelect.value = profile.category;
                ageSelect.value = profile.ageGroup;
                weightInput.value = profile.weight;
                wakeTime.value = profile.wakeTime;
                sleepTime.value = profile.sleepTime;
                profileNameInput.value = selectedProfile;
                
                // 진행률 업데이트
                checkOnboardingProgress();
                
                showToast(`✅ 프로필 로드됨: ${selectedProfile}`, 'success');
                console.log(`✅ 프로필 로드 완료: ${selectedProfile}`);
            }
        });
    }
    
    // 프로필 삭제
    if (deleteProfileBtn) {
        deleteProfileBtn.addEventListener('click', function() {
            const selectedProfile = profileSelect.value;
            if (!selectedProfile || selectedProfile === 'default') {
                showToast("❌ 삭제할 프로필을 선택해주세요!", 'error');
                return;
            }
            
            if (confirm(`"${selectedProfile}" 프로필을 삭제하시겠습니까?`)) {
                ProfileManager.delete(selectedProfile);
                updateProfileSelect();
                profileSelect.value = '';
                showToast(`✅ 프로필 삭제됨: ${selectedProfile}`, 'success');
            }
        });
    }
    
    // 프로필 새로 저장 (save-profile-btn 클릭 후)
    if (saveProfileAsBtn) {
        saveProfileAsBtn.addEventListener('click', function() {
            const profileName = profileNameInput.value.trim();
            if (!profileName) {
                showToast("❌ 프로필 이름을 입력해주세요!", 'error');
                return;
            }
            
            if (profileName === 'default') {
                showToast("❌ 'default'는 예약어입니다. 다른 이름을 사용해주세요.", 'error');
                return;
            }
            
            const userProfileJSON = localStorage.getItem("userProfile");
            if (userProfileJSON) {
                const userProfile = JSON.parse(userProfileJSON);
                ProfileManager.save(userProfile, profileName);
                updateProfileSelect();
                profileSelect.value = profileName;
                showToast(`✅ 프로필이 저장되었습니다: ${profileName}`, 'success');
                profileNameInput.value = '';
            }
        });
    }
}

/**
 * save-profile-btn 클릭 이벤트
 * 카테고리, 나이, 체중, 수면시간 값을 가져와 카페인 한도를 계산하고 저장
 */
saveProfileBtn.addEventListener("click", function() {
    const category = categorySelect.value;
    const ageGroup = ageSelect.value;
    const weight = parseFloat(weightInput.value);
    const wakeTimeValue = wakeTime.value;
    const sleepTimeValue = sleepTime.value;

    // 입력값 검증
    if (!category || !ageGroup || !weight || weight <= 0 || !wakeTimeValue || !sleepTimeValue) {
        showToast("❌ 모든 정보를 입력해주세요!", 'error');
        return;
    }
    
    if (weight < 30 || weight > 200) {
        showToast("❌ 체중은 30kg ~ 200kg 범위로 입력해주세요!", 'error');
        return;
    }

    // 카페인 한도 계산
    const caffeineLimit = calculateCaffeinLimit(ageGroup, weight);
    const sugarLimit = getSugarLimit(ageGroup);
    const awakeHours = calculateAwakeHours(wakeTimeValue, sleepTimeValue);

    // 사용자 프로필 객체 생성
    const userProfile = {
        category: category,
        ageGroup: ageGroup,
        weight: weight,
        caffeineLimit: caffeineLimit,
        sugarLimit: sugarLimit,
        wakeTime: wakeTimeValue,
        sleepTime: sleepTimeValue,
        awakeHours: awakeHours,
        savedAt: new Date().toISOString()
    };

    // 로컬 스토리지에 저장
    localStorage.setItem("userProfile", JSON.stringify(userProfile));

    // UI에 표시
    const ageText = ageGroup === "teen" ? "청소년" : "성인";
    const categoryText = 
        category === "student" ? "학생" : 
        category === "office" ? "직장인" : 
        category === "athlete" ? "헬스인" : category;

    myLimitDisplay.innerHTML = `
        <div class="limit-info">
            <h3>✅ 프로필이 저장되었습니다!</h3>
            <div class="limit-details">
                <p><strong>📌 카테고리:</strong> ${categoryText}</p>
                <p><strong>🎂 나이대:</strong> ${ageText}</p>
                <p><strong>⚖️ 체중:</strong> ${weight}kg</p>
                <p><strong>🌅 기상 시간:</strong> ${wakeTimeValue}</p>
                <p><strong>🌙 취침 시간:</strong> ${sleepTimeValue}</p>
                <p><strong>⏳ 활동 시간:</strong> ${awakeHours.toFixed(1)}시간</p>
                <hr>
                <p><strong>☕ 일일 카페인 안전 한도:</strong> <span class="limit-value">${caffeineLimit.toFixed(0)}mg</span></p>
                <p><strong>🍬 일일 설탕 안전 한도:</strong> <span class="limit-value">${sugarLimit}g</span></p>
                <p class="limit-description">💡 이 한도를 초과하지 않도록 주의하세요!</p>
            </div>
        </div>
    `;

    console.log("✅ 프로필 저장 완료:", userProfile);
    
    // 토스트 알림
    showToast("✅ 프로필이 저장되었습니다!", 'success');
    
    // 사용자가 확인을 완료할 때까지 기다렸다가 이동
    const continueBtn = document.createElement('button');
    continueBtn.className = 'btn btn-primary';
    continueBtn.textContent = '→ 계속하기 (제품 선택 페이지)';
    continueBtn.style.marginTop = '1rem';
    continueBtn.style.width = '100%';
    continueBtn.addEventListener('click', () => {
        showPage('planner');
    });
    
    myLimitDisplay.querySelector('.limit-details').appendChild(continueBtn);
    
    // 자동 스크롤 (사용자가 저장된 내용을 볼 수 있도록)
    myLimitDisplay.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

// ============================================
// 5️⃣ 플래너 섹션 로직
// ============================================

/**
 * 고유한 제품 카테고리 목록 추출
 * @returns {Array<string>} 카테고리 배열
 */
function getProductCategories() {
    const categories = new Set();
    caffeineDB.forEach(product => {
        if (product.category) {
            categories.add(product.category);
        }
    });
    return Array.from(categories).sort();
}

/**
 * 카테고리 필터 드롭다운 초기화
 */
function populateCategoryFilter() {
    console.log("🏷️ 카테고리 필터 초기화 중...");
    
    if (!categoryFilter) {
        console.error("❌ categoryFilter 요소를 찾을 수 없습니다!");
        return;
    }
    
    // 기존 옵션 초기화 (첫 번째 옵션은 유지)
    categoryFilter.innerHTML = '<option value="">-- 전체 카테고리 --</option>';
    
    const categories = getProductCategories();
    let categoryCount = 0;
    
    categories.forEach(category => {
        const productCount = caffeineDB.filter(p => p.category === category).length;
        const option = document.createElement("option");
        option.value = category;
        option.textContent = `${category} (${productCount}개)`;
        categoryFilter.appendChild(option);
        categoryCount++;
    });
    
    console.log(`✅ 카테고리 필터에 ${categoryCount}개 카테고리 추가됨`);
}

/**
 * product-select 옵션 동적으로 채우기 (선택적 카테고리 필터링)
 * @param {string} filterCategory - 특정 카테고리로 필터링할 경우 해당 값 전달 (기본값: null - 전체)
 */
function populateProductSelect(filterCategory = null) {
    console.log("🔍 populateProductSelect 호출됨");
    console.log("caffeineDB 상태:", caffeineDB ? `✅ 존재 (${caffeineDB.length}개)` : "❌ 없음");
    console.log("productSelect 상태:", productSelect ? "✅ 존재" : "❌ 없음");
    
    if (!productSelect) {
        console.error("❌ productSelect 요소를 찾을 수 없습니다!");
        return;
    }
    
    if (!caffeineDB || caffeineDB.length === 0) {
        console.error("❌ caffeineDB가 로드되지 않았습니다!");
        return;
    }
    
    // 기존 옵션 초기화
    productSelect.innerHTML = '<option value="">-- 제품을 선택해주세요 --</option>';
    
    let addedCount = 0;
    caffeineDB.forEach((product, index) => {
        // 카테고리 필터 적용
        if (filterCategory && product.category !== filterCategory) {
            return;
        }
        
        const option = document.createElement("option");
        option.value = index; // 배열 인덱스를 value로 사용
        const sugarInfo = product.sugar !== null ? `${product.sugar}g` : '정보없음';
        option.textContent = `${product.name} (카페인: ${product.caffeine}mg, 설탕: ${sugarInfo})`;
        productSelect.appendChild(option);
        addedCount++;
    });
    
    console.log(`✅ 드롭다운에 ${addedCount}개 제품 추가됨`);
}

/**
 * 카테고리별 제품 통계 표시
 */
function showCategoryStats() {
    const categories = getProductCategories();
    console.log("📂 제품 카테고리 통계:");
    categories.forEach(category => {
        const count = caffeineDB.filter(p => p.category === category).length;
        const avgCaffeine = (caffeineDB
            .filter(p => p.category === category)
            .reduce((sum, p) => sum + p.caffeine, 0) / count).toFixed(0);
        console.log(`  - ${category}: ${count}개 (평균 카페인: ${avgCaffeine}mg)`);
    });
}

// ============================================
// 페이지 로드 완료 후 제품 드롭다운 초기화
// ============================================

// DOMContentLoaded 또는 즉시 실행
function initializeProducts() {
    console.log("📦 제품 초기화 시작...");
    
    // caffeineDB 확인
    if (typeof caffeineDB === 'undefined') {
        console.error("❌ 심각한 오류: caffeineDB가 정의되지 않았습니다!");
        console.error("로드된 변수:", Object.keys(window).filter(k => k.includes('caffeine') || k.includes('DB')));
        return;
    }
    
    console.log(`✅ caffeineDB 확인: ${caffeineDB.length}개 제품`);
    
    // 카테고리 필터 드롭다운 초기화
    populateCategoryFilter();
    
    // 페이지 로드 시 제품 선택지 채우기 (전체 제품)
populateProductSelect();

    // 카테고리별 통계 출력
    showCategoryStats();
    
    // ============================================
    // 카테고리 필터 이벤트 리스너 설정
    // ============================================
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            const selectedCategory = this.value;
            console.log(`🔍 카테고리 필터 변경: "${selectedCategory || '전체'}"`);
            
            // 선택한 카테고리로 제품 드롭다운 필터링
            populateProductSelect(selectedCategory || null);
            
            // 선택된 카테고리의 제품 수 표시
            if (selectedCategory) {
                const count = caffeineDB.filter(p => p.category === selectedCategory).length;
                console.log(`  └─ ${count}개 제품 표시됨`);
            } else {
                console.log(`  └─ 모든 ${caffeineDB.length}개 제품 표시됨`);
            }
        });
        console.log("✅ 카테고리 필터 이벤트 리스너 설정 완료");
    } else {
        console.error("❌ categoryFilter 요소를 찾을 수 없습니다!");
    }
    
    console.log("✅ 제품 초기화 완료");
}

// 페이지 로드 완료 후 실행
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ThemeManager.initialize();
        initializeProducts();
        updateProfileSelect();
        setupProfileManagement();
        setupProductTabs();
        initializeMobileOptimizations();
        adjustFontSizes();
        setupSwipeNavigation();
        HealthReport.initialize();
    });
} else {
    ThemeManager.initialize();
    initializeProducts();
    updateProfileSelect();
    setupProfileManagement();
    setupProductTabs();
    initializeMobileOptimizations();
    adjustFontSizes();
    setupSwipeNavigation();
    HealthReport.initialize();
}

// 화면 리사이즈 시 폰트 크기 재조정
window.addEventListener('resize', adjustFontSizes);

// ============================================
// 모바일/터치 최적화
// ============================================

/**
 * 모바일 및 터치 기기 감지
 */
function initializeMobileOptimizations() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTouch = () => {
        return (('ontouchstart' in window) ||
                (navigator.maxTouchPoints > 0) ||
                (navigator.msMaxTouchPoints > 0));
    };

    if (isMobile || isTouch()) {
        document.body.classList.add('is-mobile');
        console.log('📱 모바일/터치 기기 감지됨');
        
        // 모바일에서 터치 피드백 추가
        addTouchFeedback();
        
        // 모바일 키보드 관련 조정
        document.addEventListener('focusin', handleMobileKeyboard);
        document.addEventListener('focusout', handleMobileKeyboardClose);
    }
}

/**
 * 모바일에서 키보드 오픈 시 레이아웃 조정
 */
function handleMobileKeyboard() {
    if (window.innerHeight < 500) {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
    }
}

/**
 * 모바일에서 키보드 닫혔을 때 레이아웃 복구
 */
function handleMobileKeyboardClose() {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
}

/**
 * 터치 피드백 추가
 */
function addTouchFeedback() {
    const buttons = document.querySelectorAll('.btn, button, [role="button"]');
    
    buttons.forEach(btn => {
        btn.addEventListener('touchstart', function() {
            this.style.opacity = '0.8';
            this.style.transform = 'scale(0.98)';
        });
        
        btn.addEventListener('touchend', function() {
            this.style.opacity = '1';
            this.style.transform = 'scale(1)';
        });
    });
}

/**
 * 모바일 나비게이션 제스처 지원
 */
function setupSwipeNavigation() {
    let touchStartX = 0;
    let touchEndX = 0;

    const pages = document.querySelectorAll('.page');

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeDistance = touchEndX - touchStartX;
        const threshold = 50; // 최소 스와이프 거리

        if (Math.abs(swipeDistance) < threshold) return;

        // 현재 활성화된 페이지 찾기
        const currentPage = document.querySelector('.page.active');
        if (!currentPage) return;

        const pages = Array.from(document.querySelectorAll('.page'));
        const currentIndex = pages.indexOf(currentPage);

        if (swipeDistance > threshold && currentIndex > 0) {
            // 왼쪽으로 스와이프 - 이전 페이지
            goToPage(pages[currentIndex - 1].id);
            console.log('👈 이전 페이지로 이동');
        } else if (swipeDistance < -threshold && currentIndex < pages.length - 1) {
            // 오른쪽으로 스와이프 - 다음 페이지
            goToPage(pages[currentIndex + 1].id);
            console.log('👉 다음 페이지로 이동');
        }
    }
}

/**
 * 모바일에 맞춘 폰트 크기 동적 조정
 */
function adjustFontSizes() {
    const width = window.innerWidth;
    
    if (width < 400) {
        document.documentElement.style.fontSize = '13px';
    } else if (width < 500) {
        document.documentElement.style.fontSize = '14px';
    } else if (width < 768) {
        document.documentElement.style.fontSize = '15px';
    } else {
        document.documentElement.style.fontSize = '16px';
    }
}

// ============================================
// 건강 리포트 시스템
// ============================================

/**
 * 건강 리포트 관리자
 */
const HealthReport = {
    REPORT_KEY: 'caff-fit-health-reports',
    
    /**
     * 리포트 데이터 저장
     */
    saveReport(date, totalCaffeine, totalSugar, productCount) {
        const reports = JSON.parse(localStorage.getItem(this.REPORT_KEY) || '[]');
        const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
        
        // 같은 날짜의 기존 리포트가 있으면 누적
        const existingIndex = reports.findIndex(r => r.date === dateStr);
        if (existingIndex >= 0) {
            reports[existingIndex].totalCaffeine += totalCaffeine;
            reports[existingIndex].totalSugar += totalSugar;
            reports[existingIndex].productCount += productCount;
        } else {
            reports.push({ date: dateStr, totalCaffeine, totalSugar, productCount });
        }
        
        localStorage.setItem(this.REPORT_KEY, JSON.stringify(reports));
    },
    
    /**
     * 기간별 리포트 조회
     */
    getReportsByPeriod(period = 'week') {
        const reports = JSON.parse(localStorage.getItem(this.REPORT_KEY) || '[]');
        const today = new Date();
        let startDate = new Date();
        
        if (period === 'week') {
            startDate.setDate(today.getDate() - 7);
        } else if (period === 'month') {
            startDate.setMonth(today.getMonth() - 1);
        }
        
        return reports.filter(r => {
            const rDate = new Date(r.date);
            return period === 'all' || rDate >= startDate;
        });
    },
    
    /**
     * 리포트 통계 계산
     */
    calculateStats(period = 'week') {
        const reports = this.getReportsByPeriod(period);
        
        if (reports.length === 0) {
            return {
                totalCaffeine: 0,
                totalSugar: 0,
                avgCaffeine: 0,
                avgSugar: 0,
                productCount: 0,
                days: 0
            };
        }
        
        const totalCaffeine = reports.reduce((sum, r) => sum + r.totalCaffeine, 0);
        const totalSugar = reports.reduce((sum, r) => sum + r.totalSugar, 0);
        const totalProducts = reports.reduce((sum, r) => sum + r.productCount, 0);
        const days = reports.length;
        
        return {
            totalCaffeine,
            totalSugar,
            avgCaffeine: Math.round(totalCaffeine / days),
            avgSugar: Math.round(totalSugar / days),
            productCount: totalProducts,
            days
        };
    },
    
    /**
     * 건강 상태 평가
     */
    assessHealth(totalCaffeine, totalSugar) {
        const dailyLimit = 400;
        const whoSugarLimit = 50;
        
        const caffeinePercentage = Math.min(100, (totalCaffeine / dailyLimit) * 100);
        const sugarPercentage = Math.min(100, (totalSugar / whoSugarLimit) * 100);
        
        const getCaffeineStatus = (percent) => {
            if (percent <= 50) return { status: '좋음 ✅', color: '#66BB6A' };
            if (percent <= 80) return { status: '주의 ⚠️', color: '#FFA726' };
            return { status: '위험 ❌', color: '#EF5350' };
        };
        
        const getSugarStatus = (percent) => {
            if (percent <= 50) return { status: '좋음 ✅', color: '#66BB6A' };
            if (percent <= 100) return { status: '주의 ⚠️', color: '#FFA726' };
            return { status: '위험 ❌', color: '#EF5350' };
        };
        
        return {
            caffeineStatus: getCaffeineStatus(caffeinePercentage),
            sugarStatus: getSugarStatus(sugarPercentage),
            caffeinePercentage,
            sugarPercentage
        };
    },
    
    /**
     * 건강 팁 생성
     */
    generateHealthTips(caffeinePercent, sugarPercent) {
        const tips = [];
        
        if (caffeinePercent < 20) {
            tips.push({
                icon: '😴',
                title: '충분한 각성도',
                description: '카페인 섭취가 적절합니다. 필요시 무리하지 않는 수준에서 조절하세요.'
            });
        } else if (caffeinePercent > 80) {
            tips.push({
                icon: '⚠️',
                title: '카페인 과다 섭취',
                description: '권장량을 초과했습니다. 수면 방해, 불안감 등이 발생할 수 있으니 주의하세요.'
            });
        }
        
        if (sugarPercent < 30) {
            tips.push({
                icon: '💚',
                title: '건강한 설탕 섭취',
                description: '설탕 섭취가 조절되고 있습니다. 이 수준을 유지해주세요!'
            });
        } else if (sugarPercent > 100) {
            tips.push({
                icon: '🍬',
                title: '설탕 과다 섭취',
                description: 'WHO 권장량을 초과했습니다. 저당 제품을 선택해보세요.'
            });
        }
        
        // 추가 팁
        tips.push({
            icon: '💧',
            title: '수분 섭취',
            description: '카페인을 섭취했다면 충분한 물을 마시세요. (2-3리터 권장)'
        });
        
        tips.push({
            icon: '⏰',
            title: '카페인 타이밍',
            description: '오후 3시 이후 카페인 섭취는 수면에 방해가 될 수 있습니다.'
        });
        
        return tips;
    },
    
    /**
     * 리포트 렌더링
     */
    renderReport(period = 'week') {
        console.log('📊 renderReport 호출됨, period:', period);
        
        const reports = JSON.parse(localStorage.getItem(this.REPORT_KEY) || '[]');
        console.log('📊 저장된 리포트 수:', reports.length);
        
        const emptyState = document.getElementById('report-empty-state');
        const periodSelector = document.getElementById('period-selector');
        const reportSummary = document.querySelector('.report-summary');
        const healthAssessment = document.querySelector('.health-assessment');
        const healthTips = document.querySelector('.health-tips');
        const recommendedProducts = document.querySelector('.recommended-products');
        
        console.log('엘리먼트 찾기:', {
            emptyState: emptyState ? '✅' : '❌',
            periodSelector: periodSelector ? '✅' : '❌',
            reportSummary: reportSummary ? '✅' : '❌',
            healthAssessment: healthAssessment ? '✅' : '❌',
            healthTips: healthTips ? '✅' : '❌',
            recommendedProducts: recommendedProducts ? '✅' : '❌'
        });
        
        // 데이터가 없으면 초기 상태 표시
        if (reports.length === 0) {
            console.log('📊 데이터 없음 - 초기 상태 표시');
            if (emptyState) {
                emptyState.style.display = 'block';
                console.log('✅ emptyState 표시됨');
            }
            if (periodSelector) periodSelector.style.display = 'none';
            if (reportSummary) reportSummary.style.display = 'none';
            if (healthAssessment) healthAssessment.style.display = 'none';
            if (healthTips) healthTips.style.display = 'none';
            if (recommendedProducts) recommendedProducts.style.display = 'none';
            console.log('📊 리포트 데이터 없음 - 초기 상태 표시 완료');
            return;
        }
        
        // 데이터가 있으면 콘텐츠 표시
        if (emptyState) emptyState.style.display = 'none';
        if (periodSelector) periodSelector.style.display = 'flex';
        if (reportSummary) reportSummary.style.display = 'grid';
        if (healthAssessment) healthAssessment.style.display = 'block';
        if (healthTips) healthTips.style.display = 'block';
        if (recommendedProducts) recommendedProducts.style.display = 'block';
        
        const stats = this.calculateStats(period);
        const assessment = this.assessHealth(stats.avgCaffeine, stats.avgSugar);
        
        // 요약 통계 업데이트
        document.getElementById('total-caffeine').textContent = `${stats.totalCaffeine} mg`;
        document.getElementById('total-sugar').textContent = `${stats.totalSugar} g`;
        document.getElementById('total-count').textContent = `${stats.productCount}회`;
        
        // 건강 평가 업데이트
        document.getElementById('caffeine-fill').style.width = `${Math.min(100, assessment.caffeinePercentage)}%`;
        document.getElementById('caffeine-status').textContent = assessment.caffeineStatus.status;
        document.getElementById('caffeine-percentage').textContent = `${Math.round(assessment.caffeinePercentage)}%`;
        
        document.getElementById('sugar-fill').style.width = `${Math.min(100, assessment.sugarPercentage)}%`;
        document.getElementById('sugar-status').textContent = assessment.sugarStatus.status;
        document.getElementById('sugar-percentage').textContent = `${Math.round(assessment.sugarPercentage)}%`;
        
        // 건강 팁 렌더링
        const tipsContainer = document.getElementById('health-tips-container');
        const tips = this.generateHealthTips(assessment.caffeinePercentage, assessment.sugarPercentage);
        
        tipsContainer.innerHTML = tips.map(tip => `
            <div class="tip-item">
                <div class="tip-icon">${tip.icon}</div>
                <div class="tip-content">
                    <div class="tip-title">${tip.title}</div>
                    <div class="tip-description">${tip.description}</div>
                </div>
            </div>
        `).join('');
        
        // 권장 제품 렌더링
        this.renderRecommendedProducts();
        
        console.log('📊 건강 리포트 렌더링 완료');
    },
    
    /**
     * 권장 제품 렌더링 (설탕이 적은 제품)
     */
    renderRecommendedProducts() {
        const container = document.getElementById('recommended-products-container');
        
        const lowSugarProducts = caffeineDB
            .map((product, index) => ({
                index,
                product,
                score: product.sugar === null ? 50 : 100 - product.sugar
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 6);
        
        container.innerHTML = lowSugarProducts.map(({ index, product }) => `
            <div class="product-recommendation">
                <div class="product-recommendation-name">${product.name}</div>
                <div class="product-recommendation-stats">
                    <span>☕ ${product.caffeine}mg</span>
                    <span>🍬 ${product.sugar !== null ? product.sugar + 'g' : '정보없음'}</span>
                </div>
                <div class="product-recommendation-reason">
                    ${product.sugar !== null && product.sugar < 15 ? '✨ 저당 제품' : '💚 권장'}
                </div>
            </div>
        `).join('');
    },
    
    /**
     * 초기화
     */
    initialize() {
        const periodBtns = document.querySelectorAll('.period-btn');
        const reportSection = document.getElementById('page-health-report');
        
        if (!periodBtns.length || !reportSection) return;
        
        // 첫 렌더링
        this.renderReport('week');
        
        // 기간 선택 버튼 이벤트
        periodBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                periodBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const period = btn.dataset.period;
                this.renderReport(period);
                console.log(`📊 리포트 기간 변경: ${period}`);
            });
        });
        
        // 뒤로 가기 버튼
        const backBtn = document.getElementById('back-to-planner-from-report-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => showPage('planner'));
        }
        
        // 리포트 저장 버튼
        const downloadBtn = document.getElementById('download-report-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                const stats = this.calculateStats(
                    document.querySelector('.period-btn.active').dataset.period
                );
                showToast('📥 리포트 저장 기능이 준비 중입니다!', 'info');
            });
        }
    }
};

// ============================================
// 스마트 추천 시스템
// ============================================

/**
 * 스마트 추천 엔진
 */
const SmartRecommendation = {
    /**
     * 추천 점수 계산
     */
    calculateRecommendationScore(productIndex) {
        let score = 0;
        const product = caffeineDB[productIndex];
        
        // 1. 최근 사용 점수 (20점)
        const recentProducts = RecentProducts.getAll();
        if (recentProducts.includes(productIndex)) {
            score += 20;
        }
        
        // 2. 즐겨찾기 점수 (15점)
        if (FavoriteProducts.isFavorite(productIndex)) {
            score += 15;
        }
        
        // 3. 같은 카테고리의 즐겨찾기 제품이 있으면 (10점)
        const favoriteCategories = FavoriteProducts.getAll()
            .map(idx => caffeineDB[idx]?.category)
            .filter(Boolean);
        if (favoriteCategories.includes(product.category)) {
            score += 10;
        }
        
        // 4. 카페인 다양성 (최근 제품과 다른 카페인 레벨: 8점)
        if (recentProducts.length > 0) {
            const recentCaffeine = caffeineDB[recentProducts[recentProducts.length - 1]]?.caffeine || 0;
            const difference = Math.abs(product.caffeine - recentCaffeine);
            if (difference > 30) {
                score += 8;
            }
        }
        
        // 5. 건강한 선택 (낮은 설탕: 7점)
        if (product.sugar !== null && product.sugar < 15) {
            score += 7;
        }
        
        return Math.min(100, score);
    },
    
    /**
     * 추천 이유 생성
     */
    getRecommendationReason(productIndex, score) {
        const product = caffeineDB[productIndex];
        const recentProducts = RecentProducts.getAll();
        
        if (score >= 40) {
            if (FavoriteProducts.isFavorite(productIndex)) {
                return "💚 당신이 즐겨찾기한 제품입니다";
            }
            if (recentProducts.includes(productIndex)) {
                return "🔄 최근에 자주 선택하는 제품입니다";
            }
            if (product.sugar !== null && product.sugar < 15) {
                return "✨ 건강한 선택! 설탕이 적습니다";
            }
        }
        
        return "🎯 당신의 취향에 맞는 제품입니다";
    },
    
    /**
     * 추천 제품 목록 생성 (상위 8개)
     */
    getRecommendations(limit = 8) {
        return caffeineDB
            .map((product, index) => ({
                index,
                product,
                score: this.calculateRecommendationScore(index),
                reason: this.getRecommendationReason(index, this.calculateRecommendationScore(index))
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    },
    
    /**
     * 추천 UI 렌더링
     */
    renderRecommendations() {
        const container = document.getElementById('recommendations-container');
        const recommendationsSection = document.getElementById('smart-recommendations');
        const recommendations = this.getRecommendations(8);
        
        if (!container || recommendations.length === 0) {
            if (recommendationsSection) {
                recommendationsSection.style.display = 'none';
            }
            return;
        }
        
        container.innerHTML = '';
        
        recommendations.forEach(({ index, product, score, reason }) => {
            const card = document.createElement('div');
            card.className = 'recommendation-card';
            card.style.cursor = 'pointer';
            
            const reasonLabel = score >= 40 ? '⭐ 추천' : score >= 20 ? '👍 좋음' : '📌 확인';
            
            card.innerHTML = `
                <div class="recommendation-label">${reasonLabel}</div>
                <div class="recommendation-name">${product.name}</div>
                <div class="recommendation-stats">
                    <span>☕ ${product.caffeine}mg</span>
                    <span>🍬 ${product.sugar !== null ? product.sugar + 'g' : '정보없음'}</span>
                </div>
                <div class="recommendation-score">
                    <div style="flex: 1; margin-right: 0.5rem;">
                        <div class="recommendation-score-bar">
                            <div class="recommendation-score-fill" style="width: ${score}%;"></div>
                        </div>
                        <small style="font-size: 0.7rem; color: var(--text-secondary);">${score}점</small>
                    </div>
                </div>
            `;
            
            // 클릭 시 제품 선택
            card.addEventListener('click', () => {
                const productSelect = document.getElementById('product-select');
                if (productSelect) {
                    productSelect.value = index;
                    showToast(`${product.name} 선택됨! 🎯`, 'success');
                    
                    // 자동으로 추가 버튼 클릭
                    setTimeout(() => {
                        const addBtn = document.getElementById('add-product-btn');
                        if (addBtn) addBtn.click();
                    }, 300);
                }
            });
            
            container.appendChild(card);
        });
        
        console.log('✨ 스마트 추천 렌더링 완료');
    }
};

// ============================================
// 다크/라이트 모드 관리
// ============================================

/**
 * 테마 매니저 객체
 */
const ThemeManager = {
    THEME_KEY: 'caff-fit-theme',
    
    /**
     * 저장된 테마 가져오기
     */
    getSavedTheme() {
        return localStorage.getItem(this.THEME_KEY) || 'dark';
    },
    
    /**
     * 테마 저장
     */
    saveTheme(theme) {
        localStorage.setItem(this.THEME_KEY, theme);
    },
    
    /**
     * 테마 적용
     */
    applyTheme(theme) {
        const root = document.documentElement;
        
        if (theme === 'light') {
            root.classList.add('light-mode');
            this.updateThemeToggleIcon('☀️');
        } else {
            root.classList.remove('light-mode');
            this.updateThemeToggleIcon('🌙');
        }
        
        this.saveTheme(theme);
        console.log(`🎨 테마 변경: ${theme === 'light' ? '라이트 🌞' : '다크 🌙'}`);
    },
    
    /**
     * 토글 버튼 아이콘 업데이트
     */
    updateThemeToggleIcon(icon) {
        const btn = document.getElementById('theme-toggle-btn');
        if (btn) {
            btn.textContent = icon;
        }
    },
    
    /**
     * 현재 테마 가져오기
     */
    getCurrentTheme() {
        return document.documentElement.classList.contains('light-mode') ? 'light' : 'dark';
    },
    
    /**
     * 테마 토글
     */
    toggleTheme() {
        const currentTheme = this.getCurrentTheme();
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    },
    
    /**
     * 시스템 다크 모드 설정 감지
     */
    detectSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    },
    
    /**
     * 초기화
     */
    initialize() {
        const savedTheme = this.getSavedTheme();
        this.applyTheme(savedTheme);
        
        // 테마 토글 버튼 이벤트
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        }
        
        // 시스템 테마 변경 감지
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                const newTheme = e.matches ? 'dark' : 'light';
                this.applyTheme(newTheme);
                showToast(`✨ 시스템 테마가 변경되었습니다 (${newTheme === 'light' ? '라이트 🌞' : '다크 🌙'})`, 'info');
            });
        }
    }
};

// ============================================
// 온보딩 입력 필드 실시간 검증
// ============================================

/**
 * 온보딩 진행 상태 계산 및 업데이트
 */
function checkOnboardingProgress() {
    let completed = 0;
    const total = 5; // category, age, weight, wake-time, sleep-time
    
    if (categorySelect.value) {
        completed++;
        setFieldValidity(categorySelect, true, '선택 완료');
    } else {
        categorySelect.classList.remove('valid', 'invalid');
    }
    
    if (ageSelect.value) {
        completed++;
        setFieldValidity(ageSelect, true, '선택 완료');
    } else {
        ageSelect.classList.remove('valid', 'invalid');
    }
    
    if (weightInput.value && weightInput.value > 0) {
        completed++;
        setFieldValidity(weightInput, true, `${weightInput.value}kg 입력됨`);
    } else {
        weightInput.classList.remove('valid', 'invalid');
    }
    
    if (wakeTime.value) {
        completed++;
        setFieldValidity(wakeTime, true, '입력 완료');
    } else {
        wakeTime.classList.remove('valid', 'invalid');
    }
    
    if (sleepTime.value) {
        completed++;
        setFieldValidity(sleepTime, true, '입력 완료');
    } else {
        sleepTime.classList.remove('valid', 'invalid');
    }
    
    const percentage = (completed / total) * 100;
    updateProgressBar(percentage);
}

// 체중 입력 필드 범위 검증
weightInput.addEventListener('blur', function() {
    const weight = parseFloat(this.value);
    if (this.value && (weight < 30 || weight > 200)) {
        setFieldValidity(this, false, '체중은 30kg ~ 200kg 사이여야 합니다');
    } else if (this.value) {
        setFieldValidity(this, true, `${weight}kg 입력됨`);
    }
});

// 각 필드에 이벤트 리스너 추가
categorySelect.addEventListener('change', checkOnboardingProgress);
ageSelect.addEventListener('change', checkOnboardingProgress);
weightInput.addEventListener('input', checkOnboardingProgress);
wakeTime.addEventListener('change', checkOnboardingProgress);
sleepTime.addEventListener('change', checkOnboardingProgress);

/**
 * 제품 통계 업데이트
 * caffeineDB 배열 인덱스를 기반으로 통계 계산
 */
function updateProductStats() {
    const productCards = productList.querySelectorAll(".product-card");
    let totalCaffeine = 0;
    let totalSugar = 0;
    
    productCards.forEach(card => {
        const productIndex = parseInt(card.dataset.productIndex);
        const product = caffeineDB[productIndex];
        if (product) {
            totalCaffeine += product.caffeine;
            totalSugar += (product.sugar ?? 0); // null 처리
        }
    });
    
    document.getElementById('total-caffeine').textContent = totalCaffeine;
    document.getElementById('total-sugar').textContent = totalSugar;
    document.getElementById('product-count').textContent = productCards.length;
    
    // 안전도 표시
    const userProfileJSON = localStorage.getItem("userProfile");
    if (userProfileJSON) {
        const userProfile = JSON.parse(userProfileJSON);
        const caffeinePercent = (totalCaffeine / userProfile.caffeineLimit) * 100;
        const sugarPercent = (totalSugar / userProfile.sugarLimit) * 100;
        
        const statCards = document.querySelectorAll('.stat-card');
        if (statCards[0]) {
            statCards[0].style.borderColor = caffeinePercent > 100 ? 'var(--error-color)' : caffeinePercent > 80 ? 'var(--warning-color)' : 'var(--success-color)';
        }
        if (statCards[1]) {
            statCards[1].style.borderColor = sugarPercent > 100 ? 'var(--error-color)' : sugarPercent > 80 ? 'var(--warning-color)' : 'var(--success-color)';
        }
    }
}

/**
 * add-product-btn 클릭 이벤트
 * 선택된 제품을 product-list에 추가
 * caffeineDB 배열 인덱스 기반 작동
 */
/**
 * 제품 탭 필터 처리
 */
function setupProductTabs() {
    const tabBtns = document.querySelectorAll('.quick-tab-btn');
    const smartRecommendationsSection = document.getElementById('smart-recommendations');
    const categoryFilter = document.getElementById('category-filter');
    const productInputGroup = document.querySelector('.product-input-group');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabType = this.dataset.tab;
            
            // 활성 탭 업데이트
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 추천 탭 처리
            if (tabType === 'recommended') {
                if (smartRecommendationsSection) {
                    smartRecommendationsSection.style.display = 'block';
                }
                if (categoryFilter) categoryFilter.style.display = 'none';
                if (productInputGroup) productInputGroup.style.display = 'none';
                SmartRecommendation.renderRecommendations();
            } else {
                if (smartRecommendationsSection) {
                    smartRecommendationsSection.style.display = 'none';
                }
                if (categoryFilter) categoryFilter.style.display = 'block';
                if (productInputGroup) productInputGroup.style.display = 'grid';
                
                // 제품 필터링
                if (tabType === 'favorites') {
                    const favorites = FavoriteProducts.getAll();
                    populateProductSelectFromIndices(favorites);
                } else if (tabType === 'recent') {
                    const recent = RecentProducts.getAll();
                    populateProductSelectFromIndices(recent);
                } else {
                    populateProductSelect();
                }
            }
            
            console.log(`📂 제품 탭 변경: ${tabType}`);
        });
    });
}

/**
 * 특정 제품 인덱스들로 드롭다운 채우기
 */
function populateProductSelectFromIndices(indices) {
    productSelect.innerHTML = '<option value="">-- 제품을 선택해주세요 --</option>';
    
    if (indices.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = '-- 제품이 없습니다 --';
        option.disabled = true;
        productSelect.appendChild(option);
        showToast("❌ 해당하는 제품이 없습니다!", 'info');
        return;
    }
    
    indices.forEach(index => {
        if (index < caffeineDB.length) {
            const product = caffeineDB[index];
            const option = document.createElement('option');
            option.value = index;
            const sugarInfo = product.sugar !== null ? `${product.sugar}g` : '정보없음';
            option.textContent = `${product.name} (카페인: ${product.caffeine}mg, 설탕: ${sugarInfo})`;
            productSelect.appendChild(option);
        }
    });
}

/**
 * 선택된 제품 카운트 업데이트
 */
function updateProductCount() {
    const productCards = productList.querySelectorAll(".product-card");
    const count = productCards.length;
    
    const countDisplay = document.getElementById('selected-product-count');
    const statsDisplay = document.getElementById('selected-product-stats');
    
    if (countDisplay) {
        countDisplay.textContent = count + '개';
    }
    
    if (count > 0 && statsDisplay) {
        // 카페인과 설탕 총합 계산
        let totalCaffeine = 0;
        let totalSugar = 0;
        
        productCards.forEach(card => {
            const productIndex = parseInt(card.dataset.productIndex);
            const product = caffeineDB[productIndex];
            totalCaffeine += product.caffeine;
            totalSugar += product.sugar ?? 0;
        });
        
        statsDisplay.textContent = `☕ ${totalCaffeine}mg | 🍬 ${totalSugar}g`;
    } else if (statsDisplay) {
        statsDisplay.textContent = '';
    }
}

addProductBtn.addEventListener("click", function() {
    const selectedProductIndex = parseInt(productSelect.value);

    // 선택 검증
    if (isNaN(selectedProductIndex) || selectedProductIndex < 0 || selectedProductIndex >= caffeineDB.length) {
        showToast("❌ 제품을 선택해주세요!", 'error');
        return;
    }

    // 제품 찾기
    const selectedProduct = caffeineDB[selectedProductIndex];
    
    // 최근 사용 제품에 추가
    RecentProducts.add(selectedProductIndex);

    // 제품 카드 HTML 생성
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.dataset.productIndex = selectedProductIndex;
    
    const isFavorite = FavoriteProducts.isFavorite(selectedProductIndex);
    
    productCard.innerHTML = `
        <div class="product-info">
            <h4>${selectedProduct.name}</h4>
            <div class="product-stats">
                <span class="stat">☕ ${selectedProduct.caffeine}mg</span>
                <span class="stat">🍬 ${selectedProduct.sugar ?? '정보없음'}g</span>
                <span class="stat category-badge">🏷️ ${selectedProduct.category}</span>
            </div>
        </div>
        <div style="display: flex; gap: 0.5rem;">
            <button class="btn-favorite" style="background: ${isFavorite ? 'var(--warning-color)' : 'transparent'}; border: 2px solid var(--warning-color); color: var(--warning-color); padding: 0.5rem 0.75rem; border-radius: var(--radius-md); cursor: pointer;">⭐</button>
            <button class="btn-remove" style="background: var(--error-color); color: white; border: none; padding: 0.5rem 0.75rem; border-radius: var(--radius-md); cursor: pointer;">❌ 제거</button>
        </div>
    `;

    // 제품 카드에 애니메이션 클래스 추가
    productCard.style.animation = 'slideInLeft 0.3s ease-out';
    
    // 제품 리스트에 추가
    productList.appendChild(productCard);
    console.log("✅ 제품 추가:", selectedProduct.name);
    
    // 제품 카드 제거 이벤트 추가
    const removeBtn = productCard.querySelector('.btn-remove');
    removeBtn.addEventListener('click', function() {
        productCard.style.animation = 'slideOut 0.2s ease-out';
        setTimeout(() => {
            productCard.remove();
            updateProductStats();
            updateProductCount();
        }, 200);
        showToast(`${selectedProduct.name} 제거됨`, 'info');
    });
    
    // 즐겨찾기 버튼 이벤트
    const favoriteBtn = productCard.querySelector('.btn-favorite');
    favoriteBtn.addEventListener('click', function() {
        if (FavoriteProducts.isFavorite(selectedProductIndex)) {
            FavoriteProducts.remove(selectedProductIndex);
            favoriteBtn.style.background = 'transparent';
            showToast(`⭐ 즐겨찾기 제거됨`, 'info');
        } else {
            FavoriteProducts.add(selectedProductIndex);
            favoriteBtn.style.background = 'var(--warning-color)';
            showToast(`⭐ 즐겨찾기 추가됨!`, 'success');
        }
    });

    // 선택지 초기화
    productSelect.value = "";
    
    // 통계 업데이트
    updateProductStats();
    updateProductCount();
    
    // 제품 리스트로 부드럽게 스크롤
    setTimeout(() => {
        productList.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
    
    // 토스트 알림
    showToast(`${selectedProduct.name} 추가됨!`, 'success');
});

/**
 * 드롭다운에서 즐겨찾기 버튼
 */
document.addEventListener('DOMContentLoaded', () => {
    const favoriteProductBtn = document.getElementById('favorite-product-btn');
    
    if (favoriteProductBtn) {
        favoriteProductBtn.addEventListener('click', function() {
            const selectedProductIndex = parseInt(productSelect.value);
            
            if (isNaN(selectedProductIndex)) {
                showToast("❌ 제품을 먼저 선택해주세요!", 'error');
                return;
            }
            
            if (FavoriteProducts.isFavorite(selectedProductIndex)) {
                FavoriteProducts.remove(selectedProductIndex);
                showToast("⭐ 즐겨찾기 제거됨", 'info');
            } else {
                FavoriteProducts.add(selectedProductIndex);
                showToast("⭐ 즐겨찾기 추가됨!", 'success');
            }
        });
    }
});

// ============================================
// 6️⃣ AI 통합 로직 (핵심!) ⭐️⭐️⭐️
// ============================================

/**
 * 마스터 AI 프롬프트 생성
 * @param {Object} userProfile - 사용자 프로필
 * @param {Array} selectedProducts - 선택된 제품 배열
 * @param {string} startTimeValue - 시작 시간
 * @returns {string} 마스터 AI 프롬프트
 */
function generateMasterPrompt(userProfile, selectedProducts, startTimeValue) {
    const productsInfo = selectedProducts
        .map(p => {
            const sugarInfo = p.sugar !== null ? `${p.sugar}g` : '정보없음';
            return `- ${p.name} (카페인: ${p.caffeine}mg, 설탕: ${sugarInfo})`;
        })
        .join("\n");

    const totalCaffeine = selectedProducts.reduce((sum, p) => sum + p.caffeine, 0);
    const totalSugar = selectedProducts.reduce((sum, p) => sum + (p.sugar ?? 0), 0);

    const ageText = userProfile.ageGroup === "teen" ? "청소년" : "성인";
    const categoryText = 
        userProfile.category === "student" ? "학생" : 
        userProfile.category === "office" ? "직장인" : 
        userProfile.category === "athlete" ? "헬스인" : userProfile.category;

    const prompt = `
🎯 당신은 건강한 카페인 & 설탕 섭취 관리 AI 어시스턴트입니다.

📊 사용자 프로필:
- 카테고리: ${categoryText}
- 나이대: ${ageText}
- 체중: ${userProfile.weight}kg
- 기상 시간: ${userProfile.wakeTime}
- 취침 시간: ${userProfile.sleepTime}
- 활동 시간: ${userProfile.awakeHours.toFixed(1)}시간
- 일일 카페인 안전 한도: ${userProfile.caffeineLimit}mg
- 일일 설탕 안전 한도: ${userProfile.sugarLimit}g

🥤 선택된 제품 리스트:
${productsInfo}

📈 총 섭취 예상량:
- 총 카페인: ${totalCaffeine}mg (안전 한도 대비 ${((totalCaffeine / userProfile.caffeineLimit) * 100).toFixed(1)}%)
- 총 설탕: ${totalSugar}g (안전 한도 대비 ${((totalSugar / userProfile.sugarLimit) * 100).toFixed(1)}%)

⏰ 시작 시간: ${startTimeValue}

🚀 요청:
1. 이 제품들을 안전하게 섭취하기 위한 최적 스케줄을 제시하세요
2. 각 제품 사이에 적절한 시간 간격(최소 2시간)을 유지하세요
3. 기상 시간(${userProfile.wakeTime})부터 취침 시간(${userProfile.sleepTime}) 사이에 제품을 배치하세요
4. 취침 3시간 전에는 카페인 섭취를 피하세요
5. 섭취 안전성 평가를 포함하세요 (안전/주의/위험)
6. 건강한 섭취 팁을 포함하세요

📝 형식: 이모지를 포함한 친근한 한국어로 답변해주세요.
    `;

    return prompt;
}

// =====================================================
// 🔑 Google Gemini API 키 설정
// =====================================================
// ⚠️ 보안: API 키는 환경 변수에서 로드됩니다.
// 로컬 개발 시: .env 파일에 VITE_GEMINI_API_KEY=your_key 형식으로 설정
// 프로덕션 배포: 환경 변수를 서버/호스팅 플랫폼에서 설정
const API_KEY = import.meta.env?.VITE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE';

/**
 * 실제 Google Gemini API를 호출하는 함수
 * @param {string} masterPrompt - AI 프롬프트
 * @returns {Promise<string>} AI 응답
 */
async function callGeminiAPI(masterPrompt) {
    // gemini-2.0-flash는 v1beta에서 작동합니다 (아까 작동했던 모델)
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
    
    try {
        // 요청 바디 구성 (Gemini API 형식)
        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: masterPrompt
                        }
                    ]
                }
            ]
        };

        console.log("📡 Gemini API 호출 중...", GEMINI_API_URL);
        console.log("📝 요청 본문:", requestBody);

        // POST 요청 전송
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log("📥 응답 상태:", response.status, response.statusText);

        // 응답 상태 확인
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { error: { message: await response.text() } };
            }
            console.error("❌ Gemini API 오류:", errorData);
            throw new Error(`API 오류: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        // JSON 응답 파싱
        const jsonResponse = await response.json();
        console.log("✅ Gemini API 응답:", jsonResponse);

        // AI 생성 텍스트 추출
        const aiText = jsonResponse?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiText) {
            console.error("❌ AI 응답이 비어있습니다. 응답 구조:", jsonResponse);
            throw new Error("AI 응답에 텍스트가 없습니다.");
        }

        console.log("✅ AI 텍스트 추출 완료, 길이:", aiText.length);
        return aiText;

    } catch (error) {
        console.error("🚨 AI API 호출 실패:", error);
        
        // 테스트 응답 반환 (개발/디버깅용)
        const testResponse = `
🎯 **AI 분석 결과 (테스트 모드)**

⚠️ 주의: 이것은 실제 API 응답이 아닙니다. 콘솔에서 오류를 확인하세요.

📊 **현재 상태:**
- API 호출 오류 발생
- 네트워크 또는 API 키 문제 가능성

🔧 **해결 방법:**
1. F12 → 콘솔 탭을 열어 정확한 오류 확인
2. API 키 유효성 확인
3. 인터넷 연결 확인
4. 콘솔의 "📡 Gemini API 호출 중" 로그 확인

원본 오류: ${error.message}
        `;
        
        console.log("⚠️ 테스트 응답 반환:", testResponse);
        return testResponse;
        
        // 상세한 에러 메시지
        let errorMessage = "🚨 AI 분석에 실패했습니다. ";
        
        if (API_KEY === 'YOUR_GOOGLE_AI_API_KEY') {
            errorMessage += "API 키가 설정되지 않았습니다. 유효한 Google Gemini API 키로 교체해주세요.";
        } else if (error.message.includes("Failed to fetch")) {
            errorMessage += "네트워크 연결을 확인해주세요.";
        } else if (error.message.includes("API 오류")) {
            errorMessage += error.message;
        } else {
            errorMessage += "API 키를 확인해주세요.";
        }
        
        return errorMessage;
    }
}

/**
 * 안전도 메터 표시
 * @param {Object} userProfile - 사용자 프로필
 * @param {Array} selectedProducts - 선택된 제품 배열
 */
function displaySafetyMeters(userProfile, selectedProducts) {
    console.log("📊 displaySafetyMeters 호출됨");
    console.log("📊 userProfile:", userProfile);
    console.log("📊 selectedProducts:", selectedProducts);
    
    const totalCaffeine = selectedProducts.reduce((sum, p) => sum + p.caffeine, 0);
    const totalSugar = selectedProducts.reduce((sum, p) => sum + (p.sugar ?? 0), 0);
    
    console.log("📊 총 카페인:", totalCaffeine, "mg");
    console.log("📊 총 설탕:", totalSugar, "g");
    console.log("📊 카페인 한도:", userProfile.caffeineLimit, "mg");
    console.log("📊 설탕 한도:", userProfile.sugarLimit, "g");
    
    const caffeinePercent = Math.min((totalCaffeine / userProfile.caffeineLimit) * 100, 100);
    const sugarPercent = Math.min((totalSugar / userProfile.sugarLimit) * 100, 100);
    
    console.log("📊 카페인 퍼센트:", caffeinePercent);
    console.log("📊 설탕 퍼센트:", sugarPercent);
    
    // 카페인 메터
    const caffeineMeter = document.getElementById('caffeine-meter');
    const caffeinePercentage = document.getElementById('caffeine-percentage');
    
    console.log("📊 caffeineMeter 엘리먼트:", caffeineMeter ? "✅ 찾음" : "❌ 못찾음");
    console.log("📊 caffeinePercentage 엘리먼트:", caffeinePercentage ? "✅ 찾음" : "❌ 못찾음");
    
    if (caffeineMeter) {
        caffeineMeter.style.width = caffeinePercent + '%';
        console.log("✅ 카페인 바 너비 설정:", caffeinePercent + '%');
    }
    
    if (caffeinePercentage) {
        const roundedCaffeine = Math.round(caffeinePercent);
        caffeinePercentage.textContent = roundedCaffeine;
        caffeinePercentage.innerText = roundedCaffeine;  // 혹시 모르니 innerText도 설정
        caffeinePercentage.innerHTML = roundedCaffeine;  // innerHTML도 설정
        console.log("✅ 카페인 퍼센트 텍스트 설정:", roundedCaffeine);
    }
    
    // 위험 상태에 따라 색상 변경
    if (caffeineMeter) {
        caffeineMeter.classList.remove('warning', 'danger');
        if (caffeinePercent > 100) {
            caffeineMeter.classList.add('danger');
        } else if (caffeinePercent > 80) {
            caffeineMeter.classList.add('warning');
        }
    }
    
    // 설탕 메터
    const sugarMeter = document.getElementById('sugar-meter');
    const sugarPercentage = document.getElementById('sugar-percentage');
    
    console.log("📊 sugarMeter 엘리먼트:", sugarMeter ? "✅ 찾음" : "❌ 못찾음");
    console.log("📊 sugarPercentage 엘리먼트:", sugarPercentage ? "✅ 찾음" : "❌ 못찾음");
    
    if (sugarMeter) {
        sugarMeter.style.width = sugarPercent + '%';
        console.log("✅ 설탕 바 너비 설정:", sugarPercent + '%');
    }
    
    if (sugarPercentage) {
        const roundedSugar = Math.round(sugarPercent);
        sugarPercentage.textContent = roundedSugar;
        sugarPercentage.innerText = roundedSugar;  // 혹시 모르니 innerText도 설정
        sugarPercentage.innerHTML = roundedSugar;  // innerHTML도 설정
        console.log("✅ 설탕 퍼센트 텍스트 설정:", roundedSugar);
    }
    
    if (sugarMeter) {
        sugarMeter.classList.remove('warning', 'danger');
        if (sugarPercent > 100) {
            sugarMeter.classList.add('danger');
        } else if (sugarPercent > 80) {
            sugarMeter.classList.add('warning');
        }
    }
    
    console.log(`📊 안전도 메터 완료: 카페인 ${Math.round(caffeinePercent)}%, 설탕 ${Math.round(sugarPercent)}%`);
}

/**
 * AI 분석 진행률 시뮬레이션
 */
function simulateLoadingProgress() {
    let progress = 0;
    const progressBar = document.getElementById('loading-progress-bar');
    const progressPercent = document.getElementById('loading-percent');
    
    const interval = setInterval(() => {
        if (progress < 90) {
            progress += Math.random() * 30;
            if (progress > 90) progress = 90;
        }
        
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
        if (progressPercent) {
            progressPercent.textContent = Math.round(progress) + '%';
        }
    }, 400);
    
    return interval;
}

/**
 * get-plan-btn 클릭 이벤트 (가장 중요한 부분!)
 * AI 최적 스케줄 생성 로직
 */
getPlanBtn.addEventListener("click", async function() {
    // 1. 로컬 스토리지에서 userProfile 가져오기
    const userProfileJSON = localStorage.getItem("userProfile");
    if (!userProfileJSON) {
        showToast("❌ 프로필을 먼저 저장해주세요!", 'error');
        showToast("💡 온보딩 단계에서 당신의 정보를 입력하고 저장해야 합니다.", 'info');
        setTimeout(() => goToPage('onboarding'), 1500);
        return;
    }
    const userProfile = JSON.parse(userProfileJSON);

    // 2. product-list에서 선택된 제품 배열 만들기
    const productCards = productList.querySelectorAll(".product-card");
    if (productCards.length === 0) {
        showToast("❌ 제품을 최소 1개 이상 선택해주세요!", 'error');
        showToast("💡 위의 드롭다운에서 마실 제품을 선택하고 추가하기 버튼을 눌러보세요.", 'info');
        return;
    }

    const selectedProducts = Array.from(productCards).map(card => {
        const productIndex = parseInt(card.dataset.productIndex);
        return caffeineDB[productIndex];
    });

    // 3. start-time에서 시작 시간 가져오기
    const startTimeValue = startTime.value;
    if (!startTimeValue) {
        showToast("❌ 카페인 섭취를 시작할 시간을 설정해주세요!", 'error');
        showToast("💡 시간을 선택하면 AI가 당신의 일정에 맞게 최적화된 계획을 만들어줍니다.", 'info');
        return;
    }
    
    showToast("🔄 AI가 최적의 스케줄을 분석 중입니다...", 'info');

    // 4. loading-spinner 표시, ai-result-display 비우기
    loadingSpinner.style.display = "flex";
    aiResultDisplay.innerHTML = "";
    aiResultDisplay.style.display = "none";
    
    // 로딩 스피너 텍스트 업데이트
    const spinnerText = loadingSpinner.querySelector('#loading-text') || document.createElement('p');
    spinnerText.textContent = '📊 데이터 분석 중...';
    spinnerText.style.marginTop = '1rem';
    spinnerText.style.color = 'var(--text-secondary)';
    spinnerText.id = 'loading-text';
    if (!loadingSpinner.contains(spinnerText)) {
        loadingSpinner.appendChild(spinnerText);
    }
    
    // 진행률 표시 초기화
    const progressBar = document.getElementById('loading-progress-bar');
    const progressPercent = document.getElementById('loading-percent');
    if (progressBar) progressBar.style.width = '0%';
    if (progressPercent) progressPercent.textContent = '0%';
    
    // 진행률 시뮬레이션 시작
    let loadingInterval = null;
    loadingInterval = simulateLoadingProgress();

    console.log("🔄 AI 분석 중...");
    console.log("사용자 프로필:", userProfile);
    console.log("선택된 제품:", selectedProducts);
    console.log("시작 시간:", startTimeValue);

    try {
        // 5. 마스터 AI 프롬프트 생성
        const masterPrompt = generateMasterPrompt(userProfile, selectedProducts, startTimeValue);
        console.log("📝 마스터 프롬프트 생성 완료");

        // 6. AI API 호출
        const aiResponse = await callGeminiAPI(masterPrompt);
        
        // 진행률 종료
        clearInterval(loadingInterval);
        if (progressBar) progressBar.style.width = '100%';
        if (progressPercent) progressPercent.textContent = '100%';

        // 7. loading-spinner 숨기기
        loadingSpinner.style.display = "none";

        // 8. 결과 데이터 처리 및 시각화
        const resultContent = document.getElementById('result-content');
        
        console.log("📊 resultContent 찾기:", resultContent);
        console.log("📊 aiResultDisplay 찾기:", aiResultDisplay);
        console.log("📊 AI 응답:", aiResponse);
        
        if (!resultContent) {
            console.error("❌ result-content 엘리먼트를 찾을 수 없습니다!");
        }
        
        if (aiResultDisplay) {
            // 마크다운 형식을 간단한 HTML로 변환
            let htmlContent = aiResponse
                .replace(/\n/g, '<br>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // **bold** → <strong>bold</strong>
                .replace(/\*(.*?)\*/g, '<em>$1</em>')            // *italic* → <em>italic</em>
                .replace(/^### (.*?)$/gm, '<h3>$1</h3>')         // ### heading
                .replace(/^## (.*?)$/gm, '<h2>$1</h2>')          // ## heading
                .replace(/^# (.*?)$/gm, '<h1>$1</h1>')           // # heading
                .replace(/^- (.*?)$/gm, '<li>$1</li>')           // - list item
                .replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>')      // wrap in ul
                .replace(/<\/li><br><li>/g, '</li><li>')         // fix list formatting
                .replace(/<br><li>/g, '<li>')                    // fix list start
                .replace(/<\/li><br>/g, '</li>');                // fix list end
            
            aiResultDisplay.innerHTML = htmlContent;
            aiResultDisplay.style.display = "block";  // 반드시 표시해야 함!
            console.log("✅ AI 결과 표시 완료, 길이:", htmlContent.length);
        } else {
            console.error("❌ ai-result-display 엘리먼트를 찾을 수 없습니다!");
        }
        
        // 안전도 메터 표시
        displaySafetyMeters(userProfile, selectedProducts);
        
        // 결과 콘텐츠 표시 - 강제 표시
        if (resultContent) {
            resultContent.style.display = "block !important";
            resultContent.style.visibility = "visible";
            resultContent.style.opacity = "1";
            console.log("✅ 결과 콘텐츠 표시됨");
        } else {
            console.error("❌ result-content를 찾을 수 없습니다!");
        }

        // 9. 계획 저장 데이터
        const totalCaffeine = selectedProducts.reduce((sum, p) => sum + p.caffeine, 0);
        const totalSugar = selectedProducts.reduce((sum, p) => sum + (p.sugar ?? 0), 0);
        
        window.currentPlan = {
            profile: userProfile,
            products: selectedProducts,
            result: aiResponse,
            startTime: startTimeValue,
            totalCaffeine,
            totalSugar
        };
        
        // 9-1. 건강 리포트에 데이터 저장
        HealthReport.saveReport(new Date(), totalCaffeine, totalSugar, selectedProducts.length);

        // 10. 결과 페이지로 이동 (페이지 전환 후 스크롤)
        showPage('result');
        
        // 결과 콘텐츠로 부드럽게 스크롤
        setTimeout(() => {
            const resultContent = document.getElementById('result-content');
            if (resultContent) {
                resultContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 300);
        
        // 10. 토스트 알림
        showToast("✅ AI 분석이 완료되었습니다! 결과를 확인하세요.", 'success');
        showToast("💡 팁: 📊 건강 리포트에서 주간/월간 통계를 볼 수 있습니다.", 'info', 4000);

        console.log("✅ AI 응답 완료!");

    } catch (error) {
        console.error("❌ AI 호출 오류:", error);
        
        // 진행률 종료
        clearInterval(loadingInterval);
        
        // 로딩 스피너 숨기기
        loadingSpinner.style.display = "none";
        
        // 결과 콘텐츠 표시
        const resultContent = document.getElementById('result-content');
        if (resultContent) {
            resultContent.style.display = "block";
        }
        
        // 에러 메시지 표시
        if (aiResultDisplay) {
            aiResultDisplay.innerHTML = `
                <div style="padding: 1.5rem; background: rgba(255, 107, 107, 0.1); border-left: 4px solid var(--error-color); border-radius: var(--radius-md);">
                    <h4 style="color: var(--error-color); margin-top: 0;">❌ AI 분석 중 오류가 발생했습니다</h4>
                    <p style="margin: 0.5rem 0; color: var(--text-secondary);">다시 시도해주세요. 문제가 계속되면:</p>
                    <ul style="margin: 0.5rem 0; padding-left: 1.5rem; color: var(--text-secondary);">
                        <li>인터넷 연결을 확인해주세요</li>
                        <li>API 키가 올바른지 확인해주세요</li>
                        <li>F12를 열어 콘솔의 오류 메시지를 확인해주세요</li>
                    </ul>
                </div>
            `;
        }
        
        showPage('result');
        showToast("❌ AI 분석 중 오류가 발생했습니다!", 'error');
    }
});

// ============================================
// 결과 페이지 이벤트 리스너
// ============================================

// 계획 저장 버튼
document.addEventListener('DOMContentLoaded', () => {
    const savePlanBtn = document.getElementById('save-plan-btn');
    const shareResultBtn = document.getElementById('share-result-btn');
    
    if (savePlanBtn) {
        savePlanBtn.addEventListener('click', function() {
            if (window.currentPlan) {
                const planId = PlanHistory.save(window.currentPlan);
                showToast(`✅ 계획이 저장되었습니다! (ID: ${planId})`, 'success');
                console.log("💾 계획 저장 완료:", window.currentPlan);
            }
        });
    }
    
    if (shareResultBtn) {
        shareResultBtn.addEventListener('click', function() {
            if (window.currentPlan) {
                const shareText = `
🎯 Caff-Fit AI 분석 결과
━━━━━━━━━━━━━━━━━━━━━━━━━━
카페인 섭취: ${window.currentPlan.totalCaffeine}mg
설탕 섭취: ${window.currentPlan.totalSugar}g
━━━━━━━━━━━━━━━━━━━━━━━━━━
${window.currentPlan.result}
                `;
                
                // 클립보드에 복사
                navigator.clipboard.writeText(shareText).then(() => {
                    // 버튼 시각 피드백
                    const originalText = shareResultBtn.textContent;
                    shareResultBtn.textContent = '✅ 복사됨!';
                    shareResultBtn.style.background = 'var(--success-color)';
                    shareResultBtn.disabled = true;
                    
                    showToast("📤 결과가 클립보드에 복사되었습니다!", 'success');
                    
                    // 2초 후 원래 상태로
                    setTimeout(() => {
                        shareResultBtn.textContent = originalText;
                        shareResultBtn.style.background = '';
                        shareResultBtn.disabled = false;
                    }, 2000);
                }).catch(() => {
                    showToast("❌ 복사 실패! 다시 시도해주세요.", 'error');
                });
            }
        });
    }
});

// ============================================
// 7️⃣ 페이지 로드 시 초기화
// ============================================

// ============================================
// 8️⃣ 로딩 애니메이션 시작 (모든 초기화 완료 후)
// ============================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // 약간의 딜레이 후 시작 (DOM이 완전히 준비되도록)
        setTimeout(initLoadingAnimation, 100);
    });
} else {
    // 페이지가 이미 로드된 경우
    setTimeout(initLoadingAnimation, 100);
}

console.log("🚀 Caff-Fit v2.0 로드 완료!");
console.log("📊 로드된 DB 통계:");
console.log(`- 카페인 제품 DB: ${caffeineDB.length}개 제품`);
console.log(`  └─ 차: 2개 | 음료: 7개 | 탄산음료: 4개`);
console.log(`  └─ 에너지드링크: 19개 | 커피: 37개`);
console.log(`  └─ 캔/병커피: 10개 | 기타: 3개`);
console.log(`- 상수 DB: 카페인/설탕 안전 기준 정의됨`);
console.log(`- 증상 DB: 건강 평가 시스템 준비됨`);
console.log("📄 페이지 구조: 홈 → 온보딩 → 플래너 → 결과");
console.log("🤖 AI 엔진: Google Gemini API (gemini-1.5-flash)");
console.log(`🔑 API 키 상태: ${API_KEY === 'YOUR_GOOGLE_AI_API_KEY' ? '⚠️ 미설정 (설정 필요!)' : '✅ 설정됨'}`);
console.log("✨ 기능: 제품 카테고리 필터링 | null 설탕값 처리 | 실시간 프롬프트 생성 | AI 분석");
console.log("🎬 로딩 애니메이션 시작!");
