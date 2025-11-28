// 食材一覧を表示する関数
function displayFoods() {
    const foodList = document.getElementById("foodList");
    foodList.innerHTML = "";

    const foods = JSON.parse(localStorage.getItem("foods") || "[]");

    foods.forEach((food, index) => {
        const li = document.createElement("li");

        // 食材情報
        const text = document.createElement("span");
        text.textContent =
            `● ${food.name}（${food.category}） / 賞味期限：${food.limit}`;

        // 削除ボタン
        const delBtn = document.createElement("button");
        delBtn.textContent = "削除";
        delBtn.classList.add("delete-btn");

        // 削除処理
        delBtn.addEventListener("click", () => {
            foods.splice(index, 1); // 配列から削除
            localStorage.setItem("foods", JSON.stringify(foods)); // 保存し直す
            displayFoods(); // 最描画
        });

        li.appendChild(text);
        li.appendChild(delBtn);
        foodList.appendChild(li);
    });
}

// フォーム送信イベント
document.getElementById("foodForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("foodName").value;
    const limit = document.getElementById("foodLimit").value;
    const category = document.getElementById("foodCategory").value;

    const foods = JSON.parse(localStorage.getItem("foods") || "[]");
    foods.push({ name, limit, category });
    localStorage.setItem("foods", JSON.stringify(foods));

    document.getElementById("message").textContent =
        `「${name}」を登録しました！（カテゴリ：${category}）`;

    this.reset();

    displayFoods();
});

// ページ読み込み時に表示
window.addEventListener("load", displayFoods);