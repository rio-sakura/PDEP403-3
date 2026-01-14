from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# --- データベース設定 ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///foods.db'  # SQLiteファイルを作成
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- モデル定義（テーブル構造） ---
class Food(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    storage = db.Column(db.String(50), nullable=False)
    period = db.Column(db.String(50), nullable=False)
    label = db.Column(db.String(20), nullable=False)
    step1 = db.Column(db.String(200))
    step2 = db.Column(db.String(200))
    step3 = db.Column(db.String(200))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "storage": self.storage,
            "period": self.period,
            "label": self.label,
            "steps": [self.step1, self.step2, self.step3]
        }

# --- 初回だけ実行：テーブルを作成 ---
with app.app_context():
    db.create_all()

# --- API: 食材一覧を取得 ---
@app.route("/api/foods", methods=["GET"])
def get_foods():
    foods = Food.query.all()
    return jsonify([f.to_dict() for f in foods])

# --- API: 新しい食材を追加 ---
@app.route("/api/foods", methods=["POST"])
def add_food():
    data = request.get_json()
    new_food = Food(
        name=data["name"],
        storage=data["storage"],
        period=data["period"],
        label=data["label"],
        step1=data["steps"][0],
        step2=data["steps"][1] if len(data["steps"]) > 1 else None,
        step3=data["steps"][2] if len(data["steps"]) > 2 else None
    )
    db.session.add(new_food)
    db.session.commit()
    return jsonify({"message": "追加完了", "data": new_food.to_dict()}), 201

if __name__ == "__main__":
    app.run(debug=True)
