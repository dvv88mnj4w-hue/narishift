/*
====================================
ナリシフト Version1
スタッフデータ
====================================
*/

const DEFAULT_STAFFS = [

    { id: 1, name: "山本", color: "#2196F3", patterns: ["8:30～12:30"] },
    { id: 2, name: "吉田", color: "#F44336", patterns: ["8:30～13:30", "8:30～16:00"] },
    { id: 3, name: "市川", color: "#FBC02D", patterns: ["8:30～12:30"] },
    { id: 4, name: "中村", color: "#4CAF50", patterns: ["8:30～14:00"] },
    { id: 5, name: "杉浦", color: "#9C27B0", patterns: ["8:30～13:30", "17:00～21:00"] }

];

const STAFF_STORAGE_KEY = "narishift-staff-list";

/*
====================================
読み込み・保存
====================================
*/

function loadStaffList() {

    const saved = localStorage.getItem(STAFF_STORAGE_KEY);

    if (saved) {

        return JSON.parse(saved);

    }

    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(DEFAULT_STAFFS));

    return DEFAULT_STAFFS;

}

function saveStaffList(list) {

    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(list));

}

/*
====================================
共通関数
====================================
*/

// 全スタッフ取得
function getAllStaff() {

    return loadStaffList();

}

// 名前からスタッフ情報を取得
function getStaff(name) {

    return getAllStaff().find(staff => staff.name === name);

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

/*
====================================
追加・削除
====================================
*/

function addStaffMember(name, color, patternsText) {

    const list = getAllStaff();

    const patterns = patternsText
        .split(",")
        .map(p => p.trim())
        .filter(p => p.length > 0);

    const newId =
        list.length > 0
            ? Math.max(...list.map(s => s.id)) + 1
            : 1;

    list.push({

        id: newId,
        name: name,
        color: color,
        patterns: patterns

    });

    saveStaffList(list);

}

function deleteStaffMember(name) {

    let list = getAllStaff();

    list = list.filter(staff => staff.name !== name);

    saveStaffList(list);

}
