/*
====================================
ナリシフト
簡易パスワード保護
====================================
*/

const SITE_PASSWORD = "narita2026";

const AUTH_STORAGE_KEY = "narishift-auth-ok";

function checkAuth() {

    const alreadyOk =
        sessionStorage.getItem(AUTH_STORAGE_KEY) === "true";

    if (alreadyOk) {

        return;

    }

    const input = prompt("合言葉を入力してください");

    if (input === SITE_PASSWORD) {

        sessionStorage.setItem(AUTH_STORAGE_KEY, "true");

    } else {

        alert("合言葉が違います。");

        window.location.href = "about:blank";

    }

}

checkAuth();
