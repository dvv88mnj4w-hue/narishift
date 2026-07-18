/*
====================================
ナリシフト
簡易パスワード保護
====================================
*/

const SITE_PASSWORD = "パートのシフト";


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
