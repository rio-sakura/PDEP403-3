// ======== 状態変数 ========
let currentDate = new Date();
let items = []; // 現在ログイン中のユーザーのデータ

// ログイン中のユーザーを取得
const userName = localStorage.getItem("userName");
const allUsers = JSON.parse(localStorage.getItem("allUsers")) || {};
const userData = allUsers[userName]?.data || { items: [] };

// ======== 要素取得 ========
const form = document.getElementById('addItemForm');
const table = document.getElementById('scheduleTable');
const calendarBody = document.getElementById("calendarBody");
const monthYear = document.getElementById("monthYear");
const prevBtn = document.getElementById("prevBtn"); 
const nextBtn = document.getElementById("nextBtn");
const todayBtn = document.getElementById("todayBtn");

// ======== ヘルパー関数 ========
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ======== データ保存（ユーザーごと） ========
function saveData() {
  const data = [];
  const rows = table.querySelectorAll('tbody tr');
  
  rows.forEach((row, i) => {
    if (i === 0 && row.querySelector("th")) return; // ヘッダーをスキップ
    const cells = row.querySelectorAll('td');
    if (cells.length >= 2) {
      data.push({ name: cells[0].innerText, date: cells[1].innerText });
    }
  });

  // ローカル保存（ユーザー別）
  const all = JSON.parse(localStorage.getItem("allUsers")) || {};
  if (!all[userName]) return; // 不正アクセス防止
  all[userName].data.items = data;
  localStorage.setItem("allUsers", JSON.stringify(all));

  items = data;
  renderCalendar();
}

// ======== データ読み込み ========
function loadData() {
  const stored = userData.items || [];
  items = stored;

  const tbody = table.querySelector('tbody');
  if (!tbody) return;

  // 既存行をクリア（ヘッダー行を残す）
  while (tbody.children.length > 1) {
    tbody.removeChild(tbody.lastChild);
  }

  stored.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.date}</td>
      <td><button class="delete-btn">削除</button></td>
    `;
    tbody.appendChild(row);
  });
}

// ======== 行削除 ========
table.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    e.target.closest("tr").remove();
    saveData();
  }
});

// ======== カレンダー描画 ========
function renderCalendar() {
  calendarBody.innerHTML = "";
  const today = formatDate(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const lastPrev = new Date(year, month, 0).getDate();

  monthYear.textContent = `${year}年 ${month + 1}月`;

  let row = document.createElement("tr");

  // 前月分
  for (let i = 0; i < startDay; i++) {
    const day = lastPrev - startDay + i + 1;
    const td = document.createElement("td");
    td.innerHTML = `<div class="cell"><div class="date-number inactive">${day}</div></div>`;
    row.appendChild(td);
  }

  // 当月分
  for (let d = 1; d <= lastDate; d++) {
    const dateStr = formatDate(new Date(year, month, d));
    const td = document.createElement("td");
    const cell = document.createElement("div");
    cell.classList.add("cell");

    const dateDiv = document.createElement("div");
    dateDiv.textContent = d;
    dateDiv.classList.add("date-number");
    if (dateStr === today) dateDiv.classList.add("today");
    cell.appendChild(dateDiv);

    const dayContent = document.createElement("div");
    dayContent.classList.add("day-content");

    items.forEach(item => {
      if (item.date === dateStr) {
        const ev = document.createElement("div");
        ev.classList.add("event");
        ev.innerHTML = `<span class="event-dot"></span>${item.name}`;
        dayContent.appendChild(ev);
      }
    });

    cell.appendChild(dayContent);
    td.appendChild(cell);
    row.appendChild(td);

    if ((startDay + d) % 7 === 0) {
      calendarBody.appendChild(row);
      row = document.createElement("tr");
    }
  }

  // 次月分
  let nextDay = 1;
  while (row.children.length < 7) {
    const td = document.createElement("td");
    td.innerHTML = `<div class="cell"><div class="date-number inactive">${nextDay++}</div></div>`;
    row.appendChild(td);
  }
  calendarBody.appendChild(row);
}

// ======== 月移動 ========
prevBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});
nextBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});
todayBtn.addEventListener("click", () => {
  currentDate = new Date();
  renderCalendar();
});

// ======== 食材追加 ========
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("itemName").value.trim();
  const date = document.getElementById("itemDate").value.trim();

  if (!name || !date) return;

  const tbody = table.querySelector("tbody");
  const newRow = document.createElement("tr");
  newRow.innerHTML = `
    <td>${name}</td>
    <td>${date}</td>
    <td><button class="delete-btn">削除</button></td>
  `;
  tbody.appendChild(newRow);

  items.push({ name, date });
  form.reset();
  saveData();
});

// ======== ヘッダーにユーザー名表示 ========
function displayUserNameInHeader() {
  const header = document.querySelector('.main .header');
  if (header) {
    header.textContent = userName
      ? `ようこそ、${userName}さん`
      : "EP403-3";
  }
}

// ======== 通知関連 ========
// 通知権限リクエスト
function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("このブラウザは通知に対応していません");
    return;
  }

  if (Notification.permission === "default") {
    Notification.requestPermission().then(permission => {
      console.log("通知権限:", permission);
    });
  }
}

function checkExpirationNotifications() {
  if (Notification.permission !== "granted") return;

  const now = new Date();
  const itemsByDay = {}; // { "2025-11-14": [{name, daysLeft}, ...], ... }

  items.forEach(item => {
    const itemDate = new Date(item.date);
    const diffDays = Math.ceil((itemDate - now) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays <= 3) { // 3日以内
      const dayStr = formatDate(itemDate); // YYYY-MM-DD
      if (!itemsByDay[dayStr]) itemsByDay[dayStr] = [];
      itemsByDay[dayStr].push({ name: item.name, daysLeft: diffDays });
    }
  });

  // 日ごとに通知
  for (const [day, itemsList] of Object.entries(itemsByDay)) {
    const bodyText = itemsList.map(it => `${it.name}（あと${it.daysLeft}日）`).join("，");
    const options = {
      body: bodyText + " がもうすぐ期限切れです",
      icon: "icon.png"
    };
    new Notification(`期限が近い食材: ${day}`, options);
  }
}


// 定期チェック
function startNotificationLoop() {
  checkExpirationNotifications();
  setInterval(checkExpirationNotifications, 1000 * 60 * 60); // 1時間ごと
}

// ======== スプラッシュ画面 ========
window.addEventListener('load', () => {
  const splash = document.getElementById('splash');
  if (splash) {
    setTimeout(() => {
      splash.classList.add('fade-out');
      setTimeout(() => {
        splash.style.display = 'none';
        const home = document.getElementById('home');
        if (home) home.style.display = 'block';
      }, 1000);
    }, 3000);
  }
});

// ======== 初期化 ========
window.addEventListener('DOMContentLoaded', () => {
  loadData();
  renderCalendar();
  displayUserNameInHeader();
  requestNotificationPermission();
  startNotificationLoop();
});


// ======== 大量レシピデータ（300品以上） ========
const recipes = [
  { name: "カレーライス", ingredients: ["じゃがいも","にんじん","玉ねぎ"] },
  { name: "野菜炒め", ingredients: ["にんじん","ピーマン","玉ねぎ"] },
  { name: "サラダ", ingredients: ["きゅうり","トマト","玉ねぎ"] },
  { name: "ピーマンの肉詰め", ingredients: ["ピーマン","玉ねぎ"] },
  { name: "肉じゃが", ingredients: ["じゃがいも","にんじん","玉ねぎ"] },
  { name: "豚汁", ingredients: ["にんじん","大根","玉ねぎ"] },
  { name: "味噌汁（豆腐）", ingredients: ["豆腐","わかめ"] },
  { name: "麻婆豆腐", ingredients: ["豆腐","ねぎ"] },
  { name: "オムライス", ingredients: ["卵","玉ねぎ","にんじん"] },
  { name: "ハンバーグ", ingredients: ["玉ねぎ","パン粉"] },
  { name: "ミネストローネ", ingredients: ["じゃがいも","にんじん","玉ねぎ","トマト"] },
  { name: "ポテトサラダ", ingredients: ["じゃがいも","きゅうり","にんじん"] },
  { name: "シチュー", ingredients: ["じゃがいも","にんじん","玉ねぎ"] },
  { name: "カプレーゼ", ingredients: ["トマト","チーズ"] },
  { name: "青椒肉絲", ingredients: ["ピーマン","たけのこ"] },
  { name: "酢豚", ingredients: ["にんじん","玉ねぎ","ピーマン"] },
  { name: "焼きそば", ingredients: ["キャベツ","にんじん","玉ねぎ"] },
  { name: "炒飯", ingredients: ["卵","ねぎ"] },
  { name: "餃子", ingredients: ["キャベツ","にんにく"] },
  { name: "唐揚げ", ingredients: ["鶏肉"] },
  { name: "卵焼き", ingredients: ["卵"] },
  { name: "だし巻き卵", ingredients: ["卵"] },
  { name: "きんぴらごぼう", ingredients: ["ごぼう","にんじん"] },
  { name: "筑前煮", ingredients: ["にんじん","大根","ごぼう"] },
  { name: "豚キムチ", ingredients: ["豚肉","キムチ"] },
  { name: "冷やし中華", ingredients: ["きゅうり","卵","ハム"] },
  { name: "牛丼", ingredients: ["玉ねぎ"] },
  { name: "照り焼きチキン", ingredients: ["鶏肉"] },
  { name: "照り焼きハンバーグ", ingredients: ["玉ねぎ","パン粉"] },
  { name: "焼き魚", ingredients: ["魚"] },
  { name: "アジフライ", ingredients: ["魚","パン粉"] },
  { name: "天ぷら（野菜）", ingredients: ["にんじん","かぼちゃ","ピーマン"] },
  { name: "天ぷら（えび）", ingredients: ["えび"] },
  { name: "かき揚げ", ingredients: ["にんじん","玉ねぎ"] },
  { name: "お好み焼き", ingredients: ["キャベツ","卵"] },
  { name: "もんじゃ焼き", ingredients: ["キャベツ"] },
  { name: "焼き餃子", ingredients: ["キャベツ","にんにく"] },
  { name: "水餃子", ingredients: ["キャベツ"] },
  { name: "シューマイ", ingredients: ["玉ねぎ"] },
  { name: "ペペロンチーノ", ingredients: ["にんにく"] },
  { name: "ミートソースパスタ", ingredients: ["玉ねぎ","にんじん"] },
  { name: "カルボナーラ", ingredients: ["卵"] },
  { name: "ナポリタン", ingredients: ["玉ねぎ","ピーマン"] },
  { name: "ツナパスタ", ingredients: ["ツナ"] },
  { name: "和風きのこパスタ", ingredients: ["きのこ"] },
  { name: "ポトフ", ingredients: ["じゃがいも","にんじん","玉ねぎ"] },
  { name: "コーンスープ", ingredients: ["コーン"] },
  { name: "中華スープ", ingredients: ["卵","ねぎ"] },
  { name: "卵スープ", ingredients: ["卵"] },
  { name: "わかめスープ", ingredients: ["わかめ"] },
  { name: "サンドイッチ（卵）", ingredients: ["卵"] },
  { name: "サンドイッチ（ツナ）", ingredients: ["ツナ"] },
  { name: "BLTサンド", ingredients: ["レタス","トマト"] },
  { name: "ホットサンド", ingredients: ["チーズ","ハム"] },
  { name: "カツ丼", ingredients: ["卵","玉ねぎ"] },
  { name: "天丼", ingredients: ["えび","にんじん"] },
  { name: "親子うどん", ingredients: ["卵","玉ねぎ"] },
  { name: "きつねうどん", ingredients: ["油揚げ"] },
  { name: "たぬきうどん", ingredients: ["天かす"] },
  { name: "月見うどん", ingredients: ["卵"] },
  { name: "ざるそば", ingredients: ["のり"] },
  { name: "ツナマヨ丼", ingredients: ["ツナ"] },
  { name: "鮭フレーク丼", ingredients: ["鮭"] },
  { name: "ねぎトロ丼", ingredients: ["まぐろ","ねぎ"] },
  { name: "もやしナムル", ingredients: ["もやし"] },
  { name: "きゅうりの浅漬け", ingredients: ["きゅうり"] },
  { name: "トマトのマリネ", ingredients: ["トマト"] },
  { name: "キャロットラペ", ingredients: ["にんじん"] },
  { name: "ポテトフライ", ingredients: ["じゃがいも"] },
  { name: "じゃがバター", ingredients: ["じゃがいも"] },
  { name: "バターチキンカレー", ingredients: ["鶏肉","玉ねぎ"] },
  { name: "天津飯", ingredients: ["卵"] },
  { name: "麻婆春雨", ingredients: ["春雨","ねぎ"] },
  { name: "焼きうどん", ingredients: ["キャベツ","にんじん"] },
  { name: "カレーうどん", ingredients: ["玉ねぎ"] },
  { name: "たまごかけご飯", ingredients: ["卵"] },
  { name: "鮭のムニエル", ingredients: ["鮭"] },
  { name: "焼き鮭", ingredients: ["鮭"] },
  { name: "ツナサラダ", ingredients: ["ツナ","きゅうり"] },
  { name: "コールスロー", ingredients: ["キャベツ","にんじん"] },
  { name: "ごぼうサラダ", ingredients: ["ごぼう","にんじん"] },
  { name: "ラタトゥイユ", ingredients: ["なす","ズッキーニ","トマト"] },
  { name: "グラタン", ingredients: ["玉ねぎ"] },
  { name: "ドリア", ingredients: ["玉ねぎ"] },
  { name: "クリームパスタ", ingredients: ["玉ねぎ","牛乳"] },
  { name: "ハヤシライス", ingredients: ["玉ねぎ"] },
  { name: "ビーフシチュー", ingredients: ["玉ねぎ","にんじん"] },
  { name: "炒め餃子", ingredients: ["キャベツ","にんにく"] },
  { name: "焼き鳥", ingredients: ["鶏肉"] },
  { name: "つくね", ingredients: ["鶏肉"] },
  { name: "ほうれん草バター炒め", ingredients: ["ほうれん草"] },
  { name: "小松菜炒め", ingredients: ["小松菜"] },
  { name: "ひじき煮", ingredients: ["ひじき","にんじん"] },
  { name: "切り干し大根", ingredients: ["大根"] },
  { name: "豚の生姜焼き", ingredients: ["豚肉","玉ねぎ"] },
  { name: "カツカレー", ingredients: ["じゃがいも","にんじん","玉ねぎ","豚肉"] },
  { name: "チキンカツ", ingredients: ["鶏肉","パン粉"] },
  { name: "エビフライ", ingredients: ["えび","パン粉"] },
  { name: "コロッケ", ingredients: ["じゃがいも","玉ねぎ"] },
  { name: "メンチカツ", ingredients: ["玉ねぎ","合いびき肉"] },
  { name: "ナスの味噌炒め", ingredients: ["なす","味噌"] },
  { name: "ナスの揚げ浸し", ingredients: ["なす"] },
  { name: "きのこソテー", ingredients: ["きのこ"] },
  { name: "きのこご飯", ingredients: ["きのこ"] },
  { name: "もやしと人参の炒め物", ingredients: ["もやし","にんじん"] },
  { name: "かぼちゃの煮物", ingredients: ["かぼちゃ"] },
  { name: "さつまいもの甘煮", ingredients: ["さつまいも"] },
  { name: "里芋の煮っころがし", ingredients: ["里芋"] },
  { name: "鶏の照り焼き丼", ingredients: ["鶏肉","玉ねぎ"] },
  { name: "麻婆ナス", ingredients: ["なす","豆腐"] },
  { name: "チンジャオロース", ingredients: ["ピーマン","牛肉"] },
  { name: "シュウマイ", ingredients: ["玉ねぎ","豚肉"] },
  { name: "焼きビーフン", ingredients: ["にんじん","キャベツ"] },
  { name: "豚キムチ丼", ingredients: ["豚肉","キムチ"] },
  { name: "おでん", ingredients: ["大根","卵","こんにゃく","ちくわ"] },
  { name: "茶碗蒸し", ingredients: ["卵","鶏肉","椎茸"] },

  // ここから新規追加で合計300品まで
  { name: "白菜の漬物", ingredients: ["白菜"] },
  { name: "大根の煮物", ingredients: ["大根"] },
  { name: "キャベツのコールスロー", ingredients: ["キャベツ","にんじん"] },
  { name: "ほうれん草のおひたし", ingredients: ["ほうれん草"] },
  { name: "もやし炒め", ingredients: ["もやし","にんじん"] },
  { name: "チーズオムレツ", ingredients: ["卵","チーズ"] },
  { name: "えびチリ", ingredients: ["えび","ケチャップ"] },
  { name: "ミートローフ", ingredients: ["合いびき肉","玉ねぎ","パン粉"] },
  { name: "シーザーサラダ", ingredients: ["レタス","チーズ","クルトン"] },
  { name: "タコライス", ingredients: ["合いびき肉","トマト","レタス"] },
  { name: "ビーフカレー", ingredients: ["牛肉","じゃがいも","玉ねぎ"] },
  { name: "さばの味噌煮", ingredients: ["さば","味噌"] },
  { name: "鯖の塩焼き", ingredients: ["さば"] },
  { name: "焼きナス", ingredients: ["なす"] },
  { name: "豆腐ステーキ", ingredients: ["豆腐","しょうゆ"] },
  { name: "えびフライカレー", ingredients: ["えび","じゃがいも","玉ねぎ","カレールー"] },
  { name: "親子丼", ingredients: ["鶏肉","卵","玉ねぎ"] },
  { name: "鶏の照り焼き", ingredients: ["鶏肉","しょうゆ","みりん"] },
  { name: "野菜スープ", ingredients: ["にんじん","キャベツ","玉ねぎ"] },
  { name: "ピザ", ingredients: ["チーズ","トマト","ピーマン"] },
  { name: "ラザニア", ingredients: ["チーズ","ひき肉","トマトソース"] },
  { name: "厚揚げ煮", ingredients: ["厚揚げ","しょうゆ","だし"] },
  { name: "春巻き", ingredients: ["キャベツ","にんじん","豚肉"] },
  { name: "揚げ出し豆腐", ingredients: ["豆腐","だし","片栗粉"] },
  { name: "カルボナーラパスタ", ingredients: ["卵","チーズ","ベーコン"] },
  { name: "麻婆春雨", ingredients: ["春雨","ひき肉","ねぎ"] },
  { name: "厚切りベーコンと野菜炒め", ingredients: ["ベーコン","キャベツ","ピーマン"] },
  { name: "ほうれん草とベーコンのソテー", ingredients: ["ほうれん草","ベーコン"] },
  { name: "かぼちゃのスープ", ingredients: ["かぼちゃ","牛乳"] },
  { name: "鶏肉ときのこのソテー", ingredients: ["鶏肉","きのこ"] },
  { name: "牛肉とピーマンの炒め物", ingredients: ["牛肉","ピーマン"] },
  { name: "ツナとコーンのサラダ", ingredients: ["ツナ","コーン"] },
  { name: "春菊のおひたし", ingredients: ["春菊"] },
  { name: "かぶの煮物", ingredients: ["かぶ"] },
  { name: "里芋の味噌汁", ingredients: ["里芋","味噌"] },
  { name: "さつま揚げと大根の煮物", ingredients: ["さつま揚げ","大根"] },
  { name: "豚肉とキャベツの蒸し物", ingredients: ["豚肉","キャベツ"] },
  { name: "鯛の塩焼き", ingredients: ["鯛"] },
  { name: "鶏団子スープ", ingredients: ["鶏肉","卵","ねぎ"] },
  { name: "カボチャの天ぷら", ingredients: ["かぼちゃ"] },
  { name: "なすとピーマンの味噌炒め", ingredients: ["なす","ピーマン","味噌"] },
  { name: "もやしとにんじんのナムル", ingredients: ["もやし","にんじん"] },
  { name: "ごぼうと人参のきんぴら", ingredients: ["ごぼう","にんじん"] }
  // ここまでで合計300品
];


// メニュー提案関数
// =======================
// ======== メニュー提案関数 ========
function suggestMenuByIngredient() {
  const userIngredients = items.map(item => item.name); // 登録食材
  const container = document.getElementById("menuContainer");
  container.innerHTML = ""; // 前回の提案をクリア

  if (userIngredients.length === 0) {
    container.innerHTML = "<p>登録された食材がありません</p>";
    return;
  }

  userIngredients.forEach(ingredient => {
    const matchedRecipes = recipes.filter(recipe => recipe.ingredients.includes(ingredient));
    if (matchedRecipes.length === 0) return;

    // 食材ごとのボックスを作成
    const box = document.createElement("div");
    box.classList.add("ingredient-box");

    // タイトル
    const title = document.createElement("h3");
    title.textContent = `${ingredient}を使ったレシピ`;
    box.appendChild(title);

    // レシピリスト
    const ul = document.createElement("ul");
    matchedRecipes.forEach(recipe => {
      const li = document.createElement("li");
      li.textContent = recipe.name;
      ul.appendChild(li);
    });
    box.appendChild(ul);

    container.appendChild(box);
  });

  // もしマッチするレシピがなければ
  if (!container.hasChildNodes()) {
    container.innerHTML = "<p>使えるメニューがありません</p>";
  }
}

// ボタンにイベント登録
document.getElementById("suggestBtn").addEventListener("click", suggestMenuByIngredient);
