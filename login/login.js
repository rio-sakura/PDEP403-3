// 要素取得
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const loginError = document.getElementById("loginError");
const registerMessage = document.getElementById("registerMessage");
const clickSound = document.getElementById("clickSound");

// フォーム切り替え
document.getElementById("showRegister").addEventListener("click", () => {
  document.getElementById("loginFormContainer").classList.add("hidden");
  document.getElementById("registerFormContainer").classList.remove("hidden");
  clickSound.play();
});

document.getElementById("showLogin").addEventListener("click", () => {
  document.getElementById("registerFormContainer").classList.add("hidden");
  document.getElementById("loginFormContainer").classList.remove("hidden");
  clickSound.play();
});

// 新規登録処理
registerForm.addEventListener("submit", function (e) {
  e.preventDefault();
  clickSound.play();

  const newUser = document.getElementById("newUsername").value.trim();
  const newPass = document.getElementById("newPassword").value.trim();

  if (!newUser || !newPass) {
    registerMessage.style.color = "red";
    registerMessage.textContent = "すべての項目を入力してください。";
    return;
  }

  // 既存ユーザー取得
  let allUsers = JSON.parse(localStorage.getItem("allUsers")) || {};

  if (allUsers[newUser]) {
    registerMessage.style.color = "red";
    registerMessage.textContent = "このユーザー名はすでに存在します。";
    return;
  }

  // 新規ユーザー登録
  allUsers[newUser] = {
    password: newPass,
    data: {} // ← 各ユーザー専用データを格納する場所
  };

  localStorage.setItem("allUsers", JSON.stringify(allUsers));

  registerMessage.style.color = "green";
  registerMessage.textContent = "登録が完了しました！ログインしてください。";

  setTimeout(() => {
    document.getElementById("showLogin").click();
    registerMessage.textContent = "";
  }, 2000);
});

// ログイン処理
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  clickSound.play();

  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  const allUsers = JSON.parse(localStorage.getItem("allUsers")) || {};

  if (allUsers[user] && allUsers[user].password === pass) {
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("userName", user); // ログイン中のユーザー名
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1000);
  } else {
    loginError.textContent = "ユーザー名またはパスワードが間違っています。";
  }
});
