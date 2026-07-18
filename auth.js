/*
====================================
ナリシフト
合言葉によるアクセス制限（画面版）
====================================
*/

const SITE_PASSWORD = "パートのシフト";
const AUTH_STORAGE_KEY = "narishift-auth-ok";

/*======================================
 ログイン画面（login.html）用の処理
======================================*/

function initLoginPage() {

    const input = document.getElementById("loginPasswordInput");
    const button = document.getElementById("loginSubmitButton");
    const errorMsg = document.getElementById("loginErrorMsg");

    if (!input || !button) return;
const toggleBtn = document.getElementById("togglePasswordBtn");

    if (toggleBtn) {

        toggleBtn.addEventListener("click", function () {

            if (input.classList.contains("masked-input")) {

                input.classList.remove("masked-input");
                toggleBtn.textContent = "隠す";

            } else {

                input.classList.add("masked-input");
                toggleBtn.textContent = "表示";

            }

        });

    }
    
    function tryLogin() {

        if (input.value === SITE_PASSWORD) {

            sessionStorage.setItem(AUTH_STORAGE_KEY, "true");

            const redirectTo = sessionStorage.getItem("narishift-redirect-to") || "index.html";
            sessionStorage.removeItem("narishift-redirect-to");

            window.location.href = redirectTo;

        } else {

            errorMsg.style.display = "block";
            input.value = "";
            input.focus();

        }

    }

    button.addEventListener("click", tryLogin);

    input.addEventListener("keydown", function (e) {

        if (e.key === "Enter") {

            tryLogin();

        }

    });

    input.focus();

}

/*======================================
 各ページでのチェック
======================================*/

function checkAuth() {

    const alreadyOk =
        sessionStorage.getItem(AUTH_STORAGE_KEY) === "true";

    if (alreadyOk) {

        return;

    }

    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    sessionStorage.setItem("narishift-redirect-to", currentPage);

    window.location.href = "login.html";

}

/*======================================
 管理者画面専用の合言葉
======================================*/

const ADMIN_PASSWORD = "水田";
const ADMIN_AUTH_KEY = "narishift-admin-auth-ok";

function checkAdminAuth() {

    const alreadyOk =
        sessionStorage.getItem(ADMIN_AUTH_KEY) === "true";

    if (alreadyOk) {

        return;

    }

    const input = prompt("管理者用の合言葉を入力してください");

    if (input === ADMIN_PASSWORD) {

        sessionStorage.setItem(ADMIN_AUTH_KEY, "true");

    } else {

        alert("合言葉が違います。");
        window.location.href = "index.html";

    }

}

/*======================================
 自動実行（ログイン画面自身では実行しない）
======================================*/

if (!window.location.pathname.endsWith("login.html")) {

    checkAuth();

} else {

    window.addEventListener("DOMContentLoaded", initLoginPage);

}
