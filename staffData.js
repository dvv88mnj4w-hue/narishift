/*
====================================
ナリシフト Version1
スタッフデータ
====================================
*/

const STAFFS = [

    {
        id: 1,
        name: "山本",
        color: "#2196F3",
        icon: "🔵",
        patterns: [
            "8:30～12:30"
        ]
    },

    {
        id: 2,
        name: "吉田",
        color: "#F44336",
        icon: "🔴",
        patterns: [
            "8:30～13:30",
            "8:30～16:00"
        ]
    },

    {
        id: 3,
        name: "市川",
        color: "#FBC02D",
        icon: "🟡",
        patterns: [
            "8:30～12:30"
        ]
    },

    {
        id: 4,
        name: "中村",
        color: "#4CAF50",
        icon: "🟢",
        patterns: [
            "8:30～14:00"
        ]
    },

    {
        id: 5,
        name: "杉浦",
        color: "#9C27B0",
        icon: "🟣",
        patterns: [
            "8:30～13:30",
            "17:00～21:00"
        ]
    }

];

/*
====================================
共通関数
====================================
*/

// 名前からスタッフ情報を取得
function getStaff(name) {

    return STAFFS.find(staff => staff.name === name);

}

// 全スタッフ取得
function getAllStaff() {

    return STAFFS;

}

// 勤務パターン取得
function getPatterns(name) {

    const staff = getStaff(name);

    if (!staff) return [];

    return staff.patterns;

}

// 色取得
function getColor(name) {

    const staff = getStaff(name);

    if (!staff) return "#999999";

    return staff.color;

}

// アイコン取得
function getIcon(name) {

    const staff = getStaff(name);

    if (!staff) return "";

    return staff.icon;

}
