    const API_BASE = '../api/foods';

    async function fetchFoods() {
    try {
        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error('取得に失敗しました');
        const data = await res.json();
        renderFoods(data);
    } catch (err) {
        document.getElementById('foods-list').innerHTML = `<p class="message error">${err.message}</p>`;
    }
    }

    function renderFoods(list) {
    const container = document.getElementById('foods-list');

    if (!Array.isArray(list) || list.length === 0) {
        container.innerHTML = '<p class="muted">データが登録されていません。</p>';
        return;
    }

    container.innerHTML = list.map(food => {
        const steps = (food.steps || [])
        .filter(s => s && s.trim())
        .map(step => `<li>${step}</li>`)
        .join('');

        return `
        <article class="food">
            <header>
            <h3>${food.name}</h3>
            <div class="meta">
                <span class="chip">${food.label}</span>
                <span class="meta-item">保管: ${food.storage}</span>
                <span class="meta-item">期間: ${food.period}</span>
            </div>
            </header>
            ${steps ? `<ol class="steps-list">${steps}</ol>` : '<p class="muted">手順は未登録です。</p>'}
        </article>
        `;
    }).join('');
    }

    document.getElementById('refresh-btn').addEventListener('click', fetchFoods);
    fetchFoods();
