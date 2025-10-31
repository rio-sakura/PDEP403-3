const fruits = [
  {
    id: 1,
    name: "りんご",
    image: "https://cdn.pixabay.com/photo/2014/02/01/17/28/apple-256261_1280.jpg",
    description: "甘くてシャキシャキした食感の代表的な果物。"
  },
  {
    id: 2,
    name: "ナババ",
    image: "https://osharetecho.com/official/wp-content/uploads/2022/12/pixta_94622130_S.jpg",
    description: "エネルギー補給にぴったり。手軽に食べられる。"
  },
  {
    id: 3,
    name: "みかん",
    image: "https://www.ito-noen.com/dictionary/wp-content/uploads/2022/08/top-1.jpg",
    description: "冬の定番。ビタミンCが豊富で酸味と甘味が絶妙。"
  },
  {
    id: 4,
    name:"~~~",
    image:"URL",
    description:"~~~~~~~~~~~~"
  }
];
// --- 検索機能の追加 ---
    const searchBox = document.getElementById("searchBox");

    // 検索ボックスの内容が変わるたびに実行する関数
    searchBox.addEventListener("input", () => {
      const keyword = searchBox.value.toLowerCase().trim(); // 入力値を小文字・空白除去

      // フィルタリング
      const filteredFruits = fruits.filter(fruit => {
        // 果物の名前を小文字にして、キーワードが含まれているかチェック
        return fruit.name.toLowerCase().includes(keyword);
      });

      // 現在のリストをクリア
      listContainer.innerHTML = "";

      // フィルタリングされた果物のみを再表示
      filteredFruits.forEach(fruit => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <img src="${fruit.image}" alt="${fruit.name}">
          <h3>${fruit.name}</h3>
        `;
        // クリックイベントも再設定
        card.addEventListener("click", () => {
          window.location.href = `detail.html?id=${fruit.id}`;
        });
        listContainer.appendChild(card);
      });
    });
    // --- 検索機能の追加 終了 ---
