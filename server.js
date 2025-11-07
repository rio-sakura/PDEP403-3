// npm install express express-session cors body-parser

const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();

// セッション設定
app.use(session({
  secret: "secret-key", // セッション暗号鍵
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 600000 } // 10分有効
}));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // HTMLなどを置く場所

// 簡易ユーザー情報（本来はDBで管理）
const USERS = [
  { username: "test", password: "1234" },
  { username: "rio", password: "pd2025" }
];

// ログイン処理
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find(u => u.username === username && u.password === password);

  if (user) {
    req.session.user = { name: username };
    res.json({ success: true });
  } else {
    res.json({ success: false, message: "ユーザー名またはパスワードが間違っています。" });
  }
});

// セッション確認
app.get("/check-session", (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

// ログアウト
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
});

// サーバー起動
app.listen(3000, () => {
  console.log("Server running: http://localhost:3000");
});
