// register.js (index.html専用)

document.addEventListener('DOMContentLoaded', () => {
    // index.htmlの要素を取得
    const form = document.getElementById('addItemForm');
    const table = document.getElementById('scheduleTable');

    // フォームが存在しない場合は処理を終了
    if (!form || !table) {
        return; 
    }

    // ======== 食材追加 (メインフォーム) 処理 ========
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const nameInput = document.getElementById("itemName");
        const dateInput = document.getElementById("itemDate");
        
        const name = nameInput.value.trim();
        const date = dateInput.value.trim();

        if (!name || !date) {
            alert("食材名と期限を両方入力してください。");
            return;
        }

        // 1. テーブルに行を追加
        const tbody = table.querySelector("tbody");
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td>${name}</td>
            <td>${date}</td>
            <td><button class="delete-btn">削除</button></td>
        `;
        tbody.appendChild(newRow);

        // 2. saveData()を呼び出す
        // これにより、データ保存とカレンダー更新（renderCalendar()）が実行される。
        if (typeof saveData === 'function') {
            saveData();
        } else {
            // エラー表示は script.js が読み込まれていない可能性を示唆
            console.error("saveData関数が利用できません。index.htmlのスクリプト読み込み順を確認してください。");
        }

        form.reset(); // フォームをクリア
    });
});