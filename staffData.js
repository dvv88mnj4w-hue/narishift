/*
====================================
ナリシフト
スタッフデータ（Firebase対応版）
====================================
*/

const DEFAULT_STAFFS = [

    { id: 1, name: "山本", color: "#2196F3", patterns: ["8:30～12:30"] },
    { id: 2, name: "吉田", color: "#F44336", patterns: ["8:30～13:30", "8:30～16:00"] },
    { id: 3, name: "市川", color: "#FBC02D", patterns: ["8:30～12:30"] },
    { id: 4, name: "中村", color: "#4CAF50", patterns: ["8:30～14:00"] },
    { id: 5, name: "杉浦", color: "#9C27B0", patterns: ["8:30～13:30", "17:00～21:00"] }

];

let STAFF_LIST_CACHE = [];

/*
====================================
Firebaseからの読み込み
====================================
*/

async function loadStaffListFromDB() {

    try {

        const list = await window.fetchAllStaffFromDB();

        if (list.length === 0) {

            for (const staff of DEFAULT_STAFFS) {

                await window.saveStaffToDB(staff);

            }

            STAFF_LIST_CACHE = DEFAULT_STAFFS;

        } else {

            STAFF_LIST_CACHE = list;

        }

    } catch (e) {

        console.error("スタッフ一覧の取得に失敗しました:", e);
        STAFF_LIST_CACHE = DEFAULT_STAFFS;

    }

}

/*
====================================
共通関数（今まで通りの呼び方のまま使えます）
====================================
*/

function getAllStaff() {

    return STAFF_LIST_CACHE;

}

function getStaff(name) {

    return STAFF_LIST_CACHE.find(staff => staff.name === name);

}

function getPatterns(name) {

    const staff = getStaff(name);
    if (!staff) return [];
    return staff.patterns;

}

function getColor(name) {

    const staff = getStaff(name);
    if (!staff) return "#999999";
    return staff.color;

}

/*
====================================
追加・削除（Firebase対応）
====================================
*/

async function addStaffMember(name, color, patternsText) {

    const patterns = patternsText
        .split(",")
        .map(p => p.trim())
        .filter(p => p.length > 0);

    const newId =
        STAFF_LIST_CACHE.length > 0
            ? Math.max(...STAFF_LIST_CACHE.map(s => s.id)) + 1
            : 1;

    const newStaff = { id: newId, name: name, color: color, patterns: patterns };

    await window.saveStaffToDB(newStaff);

    STAFF_LIST_CACHE.push(newStaff);

}

async function deleteStaffMember(name) {

    const staff = getStaff(name);

    if (!staff) return;

    await window.deleteStaffFromDB(staff.id);

    STAFF_LIST_CACHE = STAFF_LIST_CACHE.filter(s => s.name !== name);

}
