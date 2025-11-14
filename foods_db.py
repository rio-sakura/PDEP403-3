import sqlite3

# --- データベース作成 ---
conn = sqlite3.connect('foods.db')
cur = conn.cursor()

# --- テーブル作成（初回のみ実行される）---
cur.execute('''
CREATE TABLE IF NOT EXISTS foods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    storage TEXT NOT NULL,
    period TEXT NOT NULL,
    label TEXT NOT NULL,
    step1 TEXT,
    step2 TEXT,
    step3 TEXT
)
''')

# --- 既存データを削除（毎回初期化したい場合） ---
cur.execute('DELETE FROM foods')

# --- 適当な食材データを追加 ---
foods = [
    ("卵", "冷蔵庫の中段", "約2週間", "冷蔵", "パックのまま保存", "ドアポケットは避ける", None),
    ("玉ねぎ", "風通しの良い常温", "約1か月", "常温", "ネットに入れて吊るす", "湿気を避ける", None),
    ("鶏もも肉", "冷凍庫", "約1か月", "冷凍", "1回分ずつラップで包む", "冷凍用袋に入れる", None),
    ("豆腐", "冷蔵庫", "約2〜3日", "冷蔵", "水に浸して保存", "毎日水を替える", None),
    ("パン", "冷凍庫", "約2週間", "冷凍", "1枚ずつラップ", "ジッパー袋に入れる", None),
    ("バナナ", "常温（日陰）", "3〜5日", "常温", "吊るして保存", "冷蔵は避ける", None)
]

cur.executemany('''
INSERT INTO foods (name, storage, period, label, step1, step2, step3)
VALUES (?, ?, ?, ?, ?, ?, ?)
''', foods)

conn.commit()
conn.close()

print("✅ foods.db にサンプル食材データを登録しました！")
