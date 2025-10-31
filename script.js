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

// 通知表示
function showNotification(name, date, daysLeft) {
  if (Notification.permission !== "granted") return;

  const options = {
    body: `${name} がもう少しで期限切れになります (${date})`,
    icon: "icon.png" // 任意
  };
  new Notification("食材期限のお知らせ", options);
}

// 期限チェック
function checkExpirationNotifications() {
  const now = new Date();
  items.forEach(item => {
    const itemDate = new Date(item.date);
    const diffDays = Math.ceil((itemDate - now) / (1000 * 60 * 60 * 24));

    if (diffDays >= 0 && diffDays <= 3) {
      showNotification(item.name, item.date, diffDays);
    }
  });
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
