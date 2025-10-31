const form = document.getElementById('addItemForm');
const table = document.getElementById('scheduleTable');
const calendarBody = document.getElementById("calendarBody");
const monthYear = document.getElementById("monthYear");
// HTML側のIDに合わせて修正
const prevBtn = document.getElementById("prevBtn"); 
const nextBtn = document.getElementById("nextBtn");
const todayBtn = document.getElementById("todayBtn"); // 今日ボタンを追加

let currentDate = new Date();
let items = []; // 食材リスト {name, date: 'YYYY-MM-DD'形式}

// ヘルパー関数: 日付を YYYY-MM-DD 形式で取得
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
// この関数はHTMLにセレクタがないため、現状では動作しませんが、既存のコードとして残します。
function fillYearMonthSelectors(){
    // yearSelect, monthSelect, now が定義されていないため、この関数は動作しません。
    // カレンダー機能には影響がないため、そのまま残します。
    const now = new Date();
    const yearSelect = document.getElementById('yearSelect'); // 存在しないID
    const monthSelect = document.getElementById('monthSelect'); // 存在しないID

    // 年は今から前後5年分表示
    const start = now.getFullYear() - 5;
    const end = now.getFullYear() + 5;
    for(let y = start; y <= end; y++){
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = `${y}年`;
      // yearSelect?.appendChild(opt); // nullチェック
    }
    for(let m = 0; m < 12; m++){
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = `${m+1}月`;
      // monthSelect?.appendChild(opt); // nullチェック
    }
}

// === データ保存 ===
function saveData() {
    const rows = document.querySelectorAll('#scheduleTable tr');
    const data = [];

    rows.forEach((row, index) => {
        if (index === 0) return;
        const cells = row.querySelectorAll('td');
        // cells[0].innerText: 食材名, cells[1].innerText: 期限
        data.push({ name: cells[0].innerText, date: cells[1].innerText }); 
    });

    localStorage.setItem('items', JSON.stringify(data));
    items = data;
    renderCalendar(); // データ更新後にカレンダーを再描画
}

// === データ読み込み ===
function loadData() {
    const stored = localStorage.getItem('items');
    if (!stored) return;
    const loadedItems = JSON.parse(stored);
    items = loadedItems;

    // テーブルの初期化（ヘッダー行は残す）
    const tableBody = table.querySelector('tbody') || table;
    while(tableBody.children.length > 1) {
        tableBody.removeChild(tableBody.lastChild);
    }
    
    loadedItems.forEach(item => {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${item.name}</td>
            <td>${item.date}</td>
            <td><button onclick="deleteRow(this)">削除</button></td>
        `;
        table.appendChild(newRow);
    });
}

// === 行削除 ===
function deleteRow(button) {
    const row = button.parentNode.parentNode;
    row.remove();
    saveData();
}

// === メッセージフィルター ===
function filterMessages(type) {
    const messages = document.querySelectorAll('.message');
    const buttons = document.querySelectorAll('.tabs button');

    buttons.forEach(btn => btn.classList.remove('active'));

    if (type === 'all') {
        messages.forEach(msg => {
            msg.style.display = 'block';
            msg.style.backgroundColor = '';
        });
        document.getElementById('tabAll').classList.add('active');
    } else if (type === 'unread') {
        messages.forEach(msg => {
            const show = msg.classList.contains('unread');
            msg.style.display = show ? 'block' : 'none';

            if (msg.classList.contains('matched') && show) {
                msg.style.backgroundColor = '#d0f0ff';
            } else {
                msg.style.backgroundColor = '';
            }
        });
        document.getElementById('tabUnread').classList.add('active');
    } else if (type === 'read') {
        messages.forEach(msg => {
            const show = msg.classList.contains('read');
            msg.style.display = show ? 'block' : 'none';

            if (msg.classList.contains('matched') && show) {
                msg.style.backgroundColor = '#ffe5b4';
            } else {
                msg.style.backgroundColor = '';
            }
        });
        document.getElementById('tabRead').classList.add('active');
    }

    localStorage.setItem('filter', type);
}

function loadFilter() {
    const filter = localStorage.getItem('filter') || 'all';
    filterMessages(filter);
}

// === 検索処理 (メッセージリストの検索) ===
document.getElementById('searchBox').addEventListener('input', () => {
    const keyword = document.getElementById('searchBox').value.trim().toLowerCase();

    const messageList = document.getElementById('messageList');
    const messages = Array.from(document.querySelectorAll('.message'));
    const matched = [];
    const unmatched = [];

    messages.forEach(msg => {
        const fromText = msg.querySelector('.from')?.textContent.toLowerCase() || '';
        const isMatch = fromText.includes(keyword);

        msg.classList.remove('matched');
        msg.style.backgroundColor = '';
        
        // フィルター状態を維持するために display の操作を調整
        const currentFilter = localStorage.getItem('filter') || 'all';
        const isFilteredOut = (currentFilter === 'unread' && msg.classList.contains('read')) || 
                              (currentFilter === 'read' && msg.classList.contains('unread'));
        
        if (!isFilteredOut) {
            msg.style.display = isMatch ? 'block' : 'none';
        } else {
            msg.style.display = 'none';
        }

        if (isMatch) {
            msg.classList.add('matched');
            if (msg.classList.contains('unread')) {
                msg.style.backgroundColor = '#d0f0ff';
            } else if (msg.classList.contains('read')) {
                msg.style.backgroundColor = '#ffe5b4';
            }
            matched.push(msg);
        } else {
            unmatched.push(msg);
        }
    });

    // 検索結果をリストの先頭に持ってくる処理
    messageList.innerHTML = '';
    // 一致したものを先頭に表示、一致しないもののうち表示されているもの（現在のフィルターで許可されているもの）を後に表示
    const visibleMessages = [...matched, ...unmatched].filter(msg => msg.style.display !== 'none');
    visibleMessages.forEach(msg => messageList.appendChild(msg));
});

// === カレンダー描画 ===
function renderCalendar() {
    calendarBody.innerHTML = "";
    const today = formatDate(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // 当月の1日
    const firstDayOfMonth = new Date(year, month, 1);
    // 1日の曜日 (0:日, 6:土)
    const startingDayOfWeek = firstDayOfMonth.getDay();
    // 当月の日数
    const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
    // 前月の日数
    const lastDateOfPrevMonth = new Date(year, month, 0).getDate();
    
    monthYear.textContent = `${year}年 ${month + 1}月`;

    let dayCounter = 1;
    let row = document.createElement("tr");

    // 1. 前月の日付のセルを埋める
    for (let i = 0; i < startingDayOfWeek; i++) {
        const day = lastDateOfPrevMonth - startingDayOfWeek + i + 1;
        const cell = document.createElement("td");
        const cellContent = document.createElement("div");
        cellContent.classList.add("cell");

        const dateDiv = document.createElement("div");
        dateDiv.textContent = day;
        dateDiv.classList.add("date-number", "inactive"); // inactive クラスを追加
        cellContent.appendChild(dateDiv);
        cell.appendChild(cellContent);
        row.appendChild(cell);
    }

    // 2. 当月の日付のセルを埋める
    for (let day = 1; day <= lastDateOfMonth; day++) {
        const fullDate = new Date(year, month, day);
        const dateStr = formatDate(fullDate);

        const cell = document.createElement("td");
        const cellContent = document.createElement("div");
        cellContent.classList.add("cell");

        const dateDiv = document.createElement("div");
        dateDiv.textContent = day;
        dateDiv.classList.add("date-number");
        
        // 今日なら 'today' クラスを追加
        if (dateStr === today) {
            dateDiv.classList.add("today");
        }

        cellContent.appendChild(dateDiv);
        
        // 期限のイベントを表示
        const dayContent = document.createElement("div");
        dayContent.classList.add("day-content");
        
        items.forEach(item => {
            // 日付が一致する場合にのみ表示
            if (item.date === dateStr) { 
                const eventDiv = document.createElement("div");
                eventDiv.classList.add("event");
                // アイコンまたはドットを追加
                eventDiv.innerHTML = `<span class="event-dot"></span>${item.name}`;
                dayContent.appendChild(eventDiv);
            }
        });

        cellContent.appendChild(dayContent);
        cell.appendChild(cellContent);
        row.appendChild(cell);

        // 土曜日（6）で1週間が終了したら行を終了
        if ((startingDayOfWeek + day) % 7 === 0) {
            calendarBody.appendChild(row);
            row = document.createElement("tr");
        }
    }
    
    // 3. 次月の日付のセルを埋める
    let dayInNextMonth = 1;
    while (row.children.length < 7) {
        const cell = document.createElement("td");
        const cellContent = document.createElement("div");
        cellContent.classList.add("cell");

        const dateDiv = document.createElement("div");
        dateDiv.textContent = dayInNextMonth;
        dateDiv.classList.add("date-number", "inactive"); // inactive クラスを追加
        
        cellContent.appendChild(dateDiv);
        cell.appendChild(cellContent);
        row.appendChild(cell);
        dayInNextMonth++;
    }
    if (row.children.length > 0) calendarBody.appendChild(row);
}

// === 月移動 ===
prevBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});
nextBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// === 今日へ移動 ===
todayBtn.addEventListener("click", () => {
    currentDate = new Date();
    renderCalendar();
});

// === 食材追加（テーブル＋カレンダー） ===
form.addEventListener("submit", function (e) {
    e.preventDefault();
    const itemName = document.getElementById("itemName").value.trim();
    const itemDateInput = document.getElementById("itemDate").value.trim(); // YYYY-MM-DD 形式

    if (itemName && itemDateInput) {
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td>${itemName}</td>
            <td>${itemDateInput}</td>
            <td><button onclick="deleteRow(this)">削除</button></td>
        `;
        table.appendChild(newRow);
        // YYYY-MM-DD 形式で保存
        items.push({ name: itemName, date: itemDateInput }); 
        form.reset();
        saveData();
    }
});

// === ヘッダーにユーザー名を表示 ===
function displayUserNameInHeader() {
    const headerElement = document.querySelector('.main .header');
    // ログイン時に保存した 'userName' キーからユーザー名を読み込む
    const storedUserName = localStorage.getItem('userName'); 

    if (headerElement && storedUserName) {
        headerElement.textContent = `ようこそ、${storedUserName}さん`;
    } else if (headerElement) {
        // ユーザー名が見つからない場合はデフォルト値またはメッセージを表示
        headerElement.textContent = "EP403-3"; // デフォルトの値を残す
    }
}

// === 初期読み込み ===
window.addEventListener('DOMContentLoaded', () => {
    // HTML側で input type="date" に変更したため、入力形式を気にしなくてよくなった
    loadData();
    loadFilter();
    renderCalendar();
    // ★ ユーザー名表示を追加
    displayUserNameInHeader();
});

// グローバルスコープに関数を公開
window.deleteRow = deleteRow;
window.filterMessages = filterMessages;

// ページロード後5秒でスプラッシュを消してホーム表示
window.addEventListener('load', () => {
    setTimeout(() => {
        const splash = document.getElementById('splash');
        if (splash) { // splash要素が存在するか確認
            splash.classList.add('fade-out');

            setTimeout(() => {
                splash.style.display = 'none';
                // document.getElementById('home')が存在しないため、処理を調整
                // メインコンテンツを表示する特別な処理は不要だが、既存のコードを残す
                const home = document.getElementById('home');
                if (home) {
                    home.style.display = 'block';
                }
            }, 1000); // CSSのfade-outが終わるまで待つ
        }
    }, 5000); // 表示時間：5秒
});