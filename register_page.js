// register_page.js (登録日追加後の全体)

document.addEventListener('DOMContentLoaded', () => {
    const foodForm = document.getElementById('foodForm');
    const foodNameInput = document.getElementById('foodName');
    const foodLimitInput = document.getElementById('foodLimit');
    const foodPriceInput = document.getElementById('foodPrice');
    const foodCategoryInput = document.getElementById('foodCategory');
    const message = document.getElementById('message');
    
    const tableBody = document.getElementById('registerFoodBody');
    const userName = localStorage.getItem("userName");
    
    if (!userName) {
        if (message) message.textContent = "ログインユーザー情報がありません。";
        return;
    }
    
    // ユーザーデータをロードする関数
    function loadUserData() {
        const allUsers = JSON.parse(localStorage.getItem("allUsers")) || {};
        return allUsers[userName]?.data?.items || [];
    }

    // 💡 食材一覧をテーブルに描画する関数
    function renderFoodTable() {
        if (!tableBody) return;
        tableBody.innerHTML = ''; // 既存の行をクリア
        
        const items = loadUserData();
        
        items.forEach((item, index) => {
            const row = document.createElement('tr');
            row.dataset.index = index; 
            
            const category = item.category || '未設定'; 
            const price = item.price ? `${item.price.toLocaleString()}円` : '未設定'; 
            
            // 💡 登録日を表示用に整形 (日付のみ表示)
            const registerDate = item.registerDate 
                ? item.registerDate.substring(0, 10) // YYYY-MM-DD 形式
                : '不明'; 

            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.date}</td>
                <td>${category}</td>
                <td>${price}</td>
                <td>${registerDate}</td> 
                <td><button class="delete-food-btn">削除</button></td>
            `;
            tableBody.appendChild(row);
        });
    }

    // 💡 フォームの登録処理
    if (foodForm) {
        foodForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = foodNameInput.value.trim();
            const date = foodLimitInput.value.trim();
            const category = foodCategoryInput.value;
            const price = parseInt(foodPriceInput.value.trim()); 
            
            // 💡 現在の登録日時を取得し、ISO文字列として保存
            const registerDate = new Date().toISOString(); 

            if (!name || !date || isNaN(price) || price < 0) {
                message.textContent = "食材名、賞味期限、値段をすべて正しく入力してください。";
                return;
            }

            const allUsers = JSON.parse(localStorage.getItem("allUsers")) || {};
            if (!allUsers[userName]) {
                message.textContent = "ユーザーデータが見つかりません。";
                return;
            }
            
            const items = allUsers[userName].data.items || [];
            // 💡 登録日 (registerDate) を含めて保存
            items.push({ name: name, date: date, category: category, price: price, registerDate: registerDate }); 

            allUsers[userName].data.items = items;
            localStorage.setItem("allUsers", JSON.stringify(allUsers));

            message.textContent = `✅ ${name}（${price.toLocaleString()}円）を登録しました。`;
            foodForm.reset();
            
            renderFoodTable(); 
        });
    }
    
    // 💡 削除ボタンのイベントリスナー（省略。変更なし）
    if (tableBody) {
        tableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains("delete-food-btn")) {
                const row = e.target.closest("tr");
                const indexToDelete = parseInt(row.dataset.index);

                if (!isNaN(indexToDelete)) {
                    const allUsers = JSON.parse(localStorage.getItem("allUsers")) || {};
                    const items = allUsers[userName]?.data?.items || [];
                    
                    items.splice(indexToDelete, 1);
                    
                    allUsers[userName].data.items = items;
                    localStorage.setItem("allUsers", JSON.stringify(allUsers));
                    
                    message.textContent = "アイテムを削除しました。";
                    renderFoodTable(); 
                }
            }
        });
    }

    // 初期化時: 食材一覧を表示
    renderFoodTable(); 
});