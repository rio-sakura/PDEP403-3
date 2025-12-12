import os
import sqlite3
from flask import Flask, jsonify, send_from_directory, request

# 現在のapp.pyがあるフォルダを基準にします
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)

# --- DB操作用関数 ---
def get_db_connection():
    conn = sqlite3.connect(os.path.join(BASE_DIR, 'foods.db'))
    conn.row_factory = sqlite3.Row
    return conn

def get_all_foods():
    conn = get_db_connection()
    cur = conn.cursor()
    # テーブルが存在するか確認（念のため）
    try:
        cur.execute('SELECT name, storage, period, label, step1, step2, step3 FROM foods')
        rows = cur.fetchall()
    except sqlite3.Error:
        rows = []
    finally:
        conn.close()

    foods = []
    for row in rows:
        foods.append({
            "name": row['name'],
            "storage": row['storage'],
            "period": row['period'],
            "label": row['label'],
            # ステップが存在する場合のみリスト化
            "steps": [s for s in [row['step1'], row['step2'], row['step3']] if s]
        })
    return foods

# ==========================================
#  ここから：各ファイルへのルーティング設定
#  写真にあるバラバラのファイルを全部つなぎます
# ==========================================

# 1. トップページ (index.html を表示)
@app.route('/')
def index():
    return send_from_directory(BASE_DIR, 'index.html')

# 2. 食材登録ページなど、ルートにある他のHTMLファイル (例: register_food.html)
@app.route('/<path:filename>.html')
def serve_html_files(filename):
    return send_from_directory(BASE_DIR, f'{filename}.html')

# 3. ルートにある JS や CSS ファイル (例: script.js, register_food.css)
#    拡張子が .js, .css のファイルをルートから探して返します
@app.route('/<path:filename>')
def serve_root_files(filename):
    if filename.endswith(('.js', '.css', '.png', '.jpg', '.ico')):
        return send_from_directory(BASE_DIR, filename)
    return "File not found", 404

# 4. 'style' フォルダの中身を配信
@app.route('/style/<path:filename>')
def serve_style_folder(filename):
    return send_from_directory(os.path.join(BASE_DIR, 'style'), filename)

# 5. 'food_storage' フォルダの中身を配信
@app.route('/food_storage/<path:filename>')
def serve_food_storage_folder(filename):
    return send_from_directory(os.path.join(BASE_DIR, 'food_storage'), filename)

# 6. 'login' フォルダの中身を配信
@app.route('/login/<path:filename>')
def serve_login_folder(filename):
    return send_from_directory(os.path.join(BASE_DIR, 'login'), filename)

# ==========================================
#  API (データのやり取り用)
# ==========================================

@app.route('/api/foods', methods=['GET'])
def api_foods():
    foods = get_all_foods()
    return jsonify(foods)

if __name__ == '__main__':
    # debug=True にするとエラーが見やすくなります
    app.run(debug=True, port=5000)