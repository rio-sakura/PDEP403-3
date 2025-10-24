// 要素取得
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const loginError = document.getElementById("loginError");
const registerMessage = document.getElementById("registerMessage");

// フォーム切り替え
document.getElementById("showRegister").addEventListener("click", () => {
  document.getElementById("loginFormContainer").classList.add("hidden");
  document.getElementById("registerFormContainer").classList.remove("hidden");
});

document.getElementById("showLogin").addEventListener("click", () => {
  document.getElementById("registerFormContainer").classList.add("hidden");
  document.getElementById("loginFormContainer").classList.remove("hidden");
});

// ログイン処理
loginForm.addEventListener("submit", function(e) {
  e.preventDefault();
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  const storedUser = JSON.parse(localStorage.getItem("userData"));

  if (storedUser && storedUser.username === user && storedUser.password === pass) {
    localStorage.setItem("loggedIn", "true");
    window.location.href = "../index.html";
  } else {
    loginError.textContent = "ユーザー名またはパスワードが間違っています。";
  }
});

// 新規登録処理
registerForm.addEventListener("submit", function(e) {
  e.preventDefault();
  const newUser = document.getElementById("newUsername").value.trim();
  const newPass = document.getElementById("newPassword").value.trim();

  if (newUser && newPass) {
    const userData = { username: newUser, password: newPass };
    localStorage.setItem("userData", JSON.stringify(userData));

    registerMessage.style.color = "green";
    registerMessage.textContent = "登録が完了しました！ログインしてください。";

    // 少し待ってログイン画面へ戻る
    setTimeout(() => {
      document.getElementById("showLogin").click();
      registerMessage.textContent = "";
    }, 1500);
  } else {
    registerMessage.style.color = "red";
    registerMessage.textContent = "すべての項目を入力してください。";
  }
});
