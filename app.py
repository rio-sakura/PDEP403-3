from flask import Flask, jsonify, send_from_directory
import sqlite3

app = Flask(__name__)

# --- DBから食材一覧を取得 ---
def get_all_foods():
    conn = sqlite3.connect('foods.db')
    cur = conn.cursor()
    cur.execute('SELECT name, storage, period, label, step1, step2, step3 FROM foods')
    rows = cur.fetchall()
    conn.close()

    foods = []
    for row in rows:
        foods.append({
            "name": row[0],
            "storage": row[1],
            "period": row[2],
            "label": row[3],
            "steps": [s for s in row[4:] if s]  # Noneを除外
        })
    return foods

# --- HTML画面を返す ---
@app.route('/')
def serve_html():
    return send_from_directory('food_storage', 'food_storage.html')

# --- CSS・JS配信 ---
@app.route('/food_storage/<path:filename>')
def serve_static_files(filename):
    return send_from_directory('food_storage', filename)

# --- API（閲覧用）---
@app.route('/api/foods', methods=['GET'])
def api_foods():
    foods = get_all_foods()
    return jsonify(foods)

if __name__ == '__main__':
    app.run(debug=True)
