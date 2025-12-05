// register_page.js (register_food.html専用)

document.addEventListener('DOMContentLoaded', () => {
    const foodForm = document.getElementById('foodForm');
    const foodNameInput = document.getElementById('foodName');
    const foodLimitInput = document.getElementById('foodLimit');
    const foodCategoryInput = document.getElementById('foodCategory');
    const message = document.getElementById('message');

    if (!foodForm) return;

    foodForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = foodNameInput.value.trim();
        const date = foodLimitInput.value.trim();
        const category = foodCategoryInput.value;

        if (!name || !date) {
            message.textContent = "食材名と賞味期限をすべて入力してください。";
            return;
        }

        // データの取得と保存
        const userName = localStorage.getItem("userName");
        if (!userName) {
            message.textContent = "ログインユーザー情報がありません。";
            return;
        }

        const allUsers = JSON.parse(localStorage.getItem("allUsers")) || {};
        if (!allUsers[userName]) {
            message.textContent = "ユーザーデータが見つかりません。";
            return;
        }
        
        // 既存のデータに追加
        const items = allUsers[userName].data.items || [];
        items.push({ name: name, date: date, category: category });

        allUsers[userName].data.items = items;
        localStorage.setItem("allUsers", JSON.stringify(allUsers));

        message.textContent = `✅ ${name}を登録しました。一覧ページに戻ってカレンダーをご確認ください。`;
        foodForm.reset();
        
        // 登録が完了したら、メインページに戻って loadData() と renderCalendar() が実行されます。
    });
});