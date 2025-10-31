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

// ... (中略) ...

// ログイン処理
loginForm.addEventListener("submit", function(e) {
  e.preventDefault();
  clickSound.play(); // ← 音を鳴らす

  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  const storedUser = JSON.parse(localStorage.getItem("userData"));

  if (storedUser && storedUser.username === user && storedUser.password === pass) {
    // ★★★ ここにユーザー名を保存する処理を追加 ★★★
    localStorage.setItem("userName", user); // ユーザー名を 'userName' というキーで保存

    localStorage.setItem("loggedIn", "true");
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1500); // 音が鳴る時間を確保
  } else {
    loginError.textContent = "ユーザー名またはパスワードが間違っています。";
  }
});

// ... (後略) ...

// 新規登録処理
registerForm.addEventListener("submit", function(e) {
  e.preventDefault();
  clickSound.play(); // ← 登録時も鳴らす

  const newUser = document.getElementById("newUsername").value.trim();
  const newPass = document.getElementById("newPassword").value.trim();

  if (newUser && newPass) {
    const userData = { username: newUser, password: newPass };
    localStorage.setItem("userData", JSON.stringify(userData));

    registerMessage.style.color = "green";
    registerMessage.textContent = "登録が完了しました！ログインしてください。";

    setTimeout(() => {
      document.getElementById("showLogin").click();
      registerMessage.textContent = "";
    }, 3000);
  } else {
    registerMessage.style.color = "red";
    registerMessage.textContent = "すべての項目を入力してください。";
  }
});
