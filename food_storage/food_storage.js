const API_BASE = '../api/foods';

let foods = [];
let filteredFoods = [];  // 検索後の結果を保持
let currentIndex = 0;

// ---------------------------------------------
// 食材データ取得
// ---------------------------------------------
async function fetchFoods() {
    try {
        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error('取得に失敗しました');

        foods = await res.json();
        filteredFoods = foods; // 初期状態は全件
        currentIndex = 0;

        renderSlide();

    } catch (err) {
        document.getElementById('slide-area').innerHTML =
            `<p class="message error">${err.message}</p>`;
    }
}

// ---------------------------------------------
// スライド表示
// ---------------------------------------------
function renderSlide() {
    const area = document.getElementById('slide-area');

    if (!filteredFoods || filteredFoods.length === 0) {
        area.innerHTML = '<p class="muted">一致するデータがありません。</p>';
        return;
    }

    const food = filteredFoods[currentIndex];

    const steps = (food.steps || [])
        .filter(s => s && s.trim())
        .map(s => `<li>${s}</li>`)
        .join('');

    area.innerHTML = `
        <article class="food">
            <header>
                <h3>${food.name}</h3>
                <div class="meta">
                    <span class="chip">${food.label}</span>
                    <span class="meta-item">保管: ${food.storage}</span>
                    <span class="meta-item">期間: ${food.period}</span>
                </div>
            </header>

            ${steps
                ? `<ol class="steps-list">${steps}</ol>`
                : '<p class="muted">手順は未登録です。</p>'}
        </article>

        <p class="muted" style="text-align:center; margin-top:10px;">
            ${currentIndex + 1} / ${filteredFoods.length}
        </p>
    `;
}

// ---------------------------------------------
// 前へ
// ---------------------------------------------
document.getElementById('prev-btn').addEventListener('click', () => {
    if (filteredFoods.length === 0) return;
    currentIndex = (currentIndex - 1 + filteredFoods.length) % filteredFoods.length;
    renderSlide();
});

// ---------------------------------------------
// 次へ
// ---------------------------------------------
document.getElementById('next-btn').addEventListener('click', () => {
    if (filteredFoods.length === 0) return;
    currentIndex = (currentIndex + 1) % filteredFoods.length;
    renderSlide();
});

// ---------------------------------------------
// 再読み込み
// ---------------------------------------------
document.getElementById('refresh-btn').addEventListener('click', fetchFoods);

// ---------------------------------------------
// 🔍 検索機能（メイン）
// ---------------------------------------------
document.getElementById('search-btn').addEventListener('click', () => {
    const keyword = document.getElementById('search-input').value.trim().toLowerCase();

    if (keyword === "") {
        filteredFoods = foods; // 空 → 全件表示
        currentIndex = 0;
        renderSlide();
        return;
    }

    filteredFoods = foods.filter(food => {
        const inName = food.name?.toLowerCase().includes(keyword);
        const inLabel = food.label?.toLowerCase().includes(keyword);
        const inStorage = food.storage?.toLowerCase().includes(keyword);
        const inPeriod = food.period?.toLowerCase().includes(keyword);

        const inSteps = (food.steps || [])
            .some(step => step.toLowerCase().includes(keyword));

        return inName || inLabel || inStorage || inPeriod || inSteps;
    });

    currentIndex = 0;
    renderSlide();
});

// ---------------------------------------------
// 初回データ読み込み
// ---------------------------------------------
fetchFoods();
