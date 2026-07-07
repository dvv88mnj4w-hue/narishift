/*
=====================================
 ナリシフト Version1
 共通JavaScript
=====================================
*/

/*------------------------------
 画面遷移
------------------------------*/

// スタッフ画面へ
function goStaff() {
    window.location.href = "staff.html";
}

// 管理者画面へ
function goManager() {
    window.location.href = "manager.html";
}

// トップへ戻る
function goHome() {
    window.location.href = "index.html";
}


/*------------------------------
 日付取得
------------------------------*/

function getToday() {
    return new Date();
}

function getYear() {
    return getToday().getFullYear();
}

function getMonth() {
    return getToday().getMonth() + 1;
}

function getDateNumber() {
    return getToday().getDate();
}


/*------------------------------
 締切判定

15日まで
スタッフ編集可能

16日以降
スタッフ編集不可
------------------------------*/

function isDeadlinePassed() {
    return getDateNumber() >= 16;
}


/*------------------------------
 メッセージ表示
------------------------------*/

function showMessage(message) {
    alert(message);
}


/*------------------------------
 保存完了
------------------------------*/

function saveComplete() {
    showMessage("保存しました。");
}


/*------------------------------
 編集不可
------------------------------*/

function deadlineMessage() {
    showMessage("16日以降は編集できません。");
}


/*------------------------------
 初期化
------------------------------*/

window.onload = function () {
    console.log("NariShift Version1");
};
