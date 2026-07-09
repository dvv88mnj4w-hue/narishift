/*
========================================
 ナリシフト Version1
 calendar.js
 (1/6)
========================================
*/

/*======================================
  日付
======================================*/

const today = new Date();

const currentYear = today.getFullYear();
const currentMonth = today.getMonth();

/*======================================
  状態管理
======================================*/

let selectedDay = null;
let selectedStaff = "";

/*======================================
  HTML取得
======================================*/

const monthTitle = document.getElementById("monthTitle");
const calendar = document.getElementById("calendar");

const staffSelect = document.getElementById("staffSelect");
const staffTrigger = document.getElementById("staffTrigger");
const staffTriggerText = document.getElementById("staffTriggerText");
const staffOptions = document.getElementById("staffOptions");

const shiftType = document.getElementById("shiftType");

const workPattern = document.getElementById("workPattern");

const memo = document.getElementById("memo");

const selectedDate = document.getElementById("selectedDate");

const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");
const confirmButton = document.getElementById("confirmButton");

/*======================================
  初期化
======================================*/

window.addEventListener("DOMContentLoaded", init);

function init() {

    if (staffTrigger) {

        createStaffList();
showConfirmedIfNeeded();


        staffTrigger.addEventListener("click", function () {

            staffOptions.classList.toggle("open");

        });

        document.addEventListener("click", function (e) {

            if (!staffTrigger.contains(e.target) && !staffOptions.contains(e.target)) {

                staffOptions.classList.remove("open");

            }

        });

    }

if (calendar && !staffTrigger) {

        createManagerCalendar();

        updateConfirmStatus();

        renderStaffColorList("staffColorList");

        renderStaffManageList();

        const addStaffButton = document.getElementById("addStaffButton");

        if (addStaffButton) {

            addStaffButton.addEventListener("click", function () {

                const nameInput = document.getElementById("newStaffName");
                const colorInput = document.getElementById("newStaffColor");
                const patternsInput = document.getElementById("newStaffPatterns");

                const name = nameInput.value.trim();

                if (!name) {

                    showMessage("名前を入力してください");
                    return;

                }

                if (getStaff(name)) {

                    showMessage("同じ名前のスタッフが既に存在します");
                    return;

                }

                addStaffMember(name, colorInput.value, patternsInput.value);

                nameInput.value = "";
                patternsInput.value = "";

                renderStaffColorList("staffColorList");
                renderStaffManageList();
                createManagerCalendar();

                showMessage(`${name}さんを追加しました`);

            });

        }


        if (confirmButton) {

            confirmButton.addEventListener("click", function () {

                const ok = confirm(

                    `${currentYear}年${currentMonth + 1}月のシフトを確定しますか？\n確定すると編集できなくなります。`

                );

                if (!ok) return;

                localStorage.setItem(getConfirmKey(), "true");

                updateConfirmStatus();

                showMessage("確定しました。");

            });

        }

    }

}





/*======================================
 スタッフ一覧
======================================*/


function createStaffList() {

    staffOptions.innerHTML = "";

    getAllStaff().forEach(staff => {

        const option = document.createElement("div");
        option.className = "custom-select-option";

        const dot = document.createElement("span");
        dot.className = "staff-dot";
        dot.style.background = staff.color;

        const label = document.createElement("span");
        label.textContent = staff.name;

        option.appendChild(dot);
        option.appendChild(label);
option.addEventListener("click", function () {

            selectedStaff = staff.name;
            staffTriggerText.textContent = staff.name;
            staffOptions.classList.remove("open");

            createPatternList();

            if (typeof createCalendar === "function") {

                createCalendar();

            }

            showConfirmedIfNeeded();

        });


        staffOptions.appendChild(option);

    });

}


/*======================================
 スタッフ変更
======================================*/

function changeStaff() {

    selectedStaff =
        staffSelect.value;

    createPatternList();

    if (typeof createCalendar === "function") {

        createCalendar();

    }

}

/*======================================
 勤務パターン生成
======================================*/

function createPatternList() {

    workPattern.innerHTML = "";

    const first =
        document.createElement("option");

    first.value = "";

    first.textContent =
        "勤務パターンを選択";

    workPattern.appendChild(first);

    if (!selectedStaff) return;

    const patterns =
        getPatterns(selectedStaff);

    patterns.forEach(pattern => {

        const option =
            document.createElement("option");

        option.value = pattern;

        option.textContent = pattern;

        workPattern.appendChild(option);

    });

}

/*======================================
 LocalStorageキー
======================================*/

function createStorageKey(day) {

    return `${currentYear}-${currentMonth + 1}-${day}-${selectedStaff}`;

}

/*======================================
 データ取得
======================================*/

function getSavedData(day) {

    const key =
        createStorageKey(day);

    const data =
        localStorage.getItem(key);

    if (!data) {

        return null;

    }

    return JSON.parse(data);

}
/*======================================
 カレンダー表示（2/6）
======================================*/

function createCalendar() {

    calendar.innerHTML = "";

    monthTitle.textContent =
        `${currentYear}年${currentMonth + 1}月`;

    const weekDays = ["日","月","火","水","木","金","土"];

    weekDays.forEach(w => {

        const el = document.createElement("div");
        el.className = "calendar-weekday";
        el.textContent = w;
        calendar.appendChild(el);

    });

    const firstDay =
        new Date(currentYear, currentMonth, 1).getDay();

    const lastDate =
        new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {

        const empty = document.createElement("div");
        calendar.appendChild(empty);

    }

    for (let day = 1; day <= lastDate; day++) {

        const dayEl = document.createElement("div");
        dayEl.className = "calendar-day";

        const dayNumber = document.createElement("div");
        dayNumber.className = "day-number";
        dayNumber.textContent = day;
        dayEl.appendChild(dayNumber);

        const saved = getSavedData(day);

        if (saved) {

            const info = document.createElement("div");
            info.className = "day-info";

            info.textContent =
                saved.type === "勤務"
                    ? saved.pattern
                    : saved.type;

            dayEl.appendChild(info);

        }

        if (selectedDay === day) {

            dayEl.classList.add("selected");

        }

        dayEl.addEventListener("click", function () {

            selectDay(day);

        });

        calendar.appendChild(dayEl);

    }

}

/*======================================
 日付クリック時の処理
======================================*/

function selectDay(day) {

    if (!selectedStaff) {

        showMessage("先にスタッフを選択してください");
        return;

    }

    selectedDay = day;

    selectedDate.textContent =
        `${currentYear}年${currentMonth + 1}月${day}日`;

    const saved = getSavedData(day);

    if (saved) {

        shiftType.value = saved.type || "";
        workPattern.value = saved.pattern || "";
        memo.value = saved.memo || "";

    } else {

        shiftType.value = "";
        workPattern.value = "";
        memo.value = "";

    }

    createCalendar();

}
/*======================================
 保存ボタンの処理（3/6）
======================================*/

if (saveButton) {

saveButton.addEventListener("click", function () {

    if (!selectedStaff) {

        showMessage("スタッフを選択してください");
        return;

    }

    if (!selectedDay) {

        showMessage("日付を選択してください");
        return;

    }

    if (isDeadlinePassed()) {

        deadlineMessage();
        return;

    }
    if (isMonthConfirmed()) {

        confirmedMessage();
        return;

    }


    const type = shiftType.value;

    if (!type) {

        showMessage("希望区分を選択してください");
        return;

    }

    if (type === "勤務" && !workPattern.value) {

        showMessage("勤務パターンを選択してください");
        return;

    }

    const data = {

        type: type,
        pattern: type === "勤務" ? workPattern.value : "",
        memo: memo.value

    };

    const key = createStorageKey(selectedDay);

    localStorage.setItem(key, JSON.stringify(data));

    saveComplete();

    createCalendar();

});

}

/*======================================
 管理者用カレンダー表示（4/6）
======================================*/

function createManagerCalendar() {

    calendar.innerHTML = "";

    monthTitle.textContent =
        `${currentYear}年${currentMonth + 1}月`;

    const weekDays = ["日","月","火","水","木","金","土"];

    weekDays.forEach(w => {

        const el = document.createElement("div");
        el.className = "calendar-weekday";
        el.textContent = w;
        calendar.appendChild(el);

    });

    const firstDay =
        new Date(currentYear, currentMonth, 1).getDay();

    const lastDate =
        new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {

        const empty = document.createElement("div");
        calendar.appendChild(empty);

    }

    for (let day = 1; day <= lastDate; day++) {

        const dayEl = document.createElement("div");
        dayEl.className = "calendar-day";

        const dayNumber = document.createElement("div");
        dayNumber.className = "day-number";
        dayNumber.textContent = day;
        dayEl.appendChild(dayNumber);

        getAllStaff().forEach(staff => {

            const key =
                `${currentYear}-${currentMonth + 1}-${day}-${staff.name}`;

            const data =
                localStorage.getItem(key);

            if (data) {

                const parsed = JSON.parse(data);

　　　　　　　　　　const line = document.createElement("div");
                line.className = "manager-day-line";

                const dot = document.createElement("span");
                dot.className = "staff-dot";
                dot.style.background = staff.color;

                const label =
                    parsed.type === "勤務"
                        ? parsed.pattern
                        : parsed.type;

                const text = document.createElement("span");
                text.textContent = label;

                line.appendChild(dot);
                line.appendChild(text);

                dayEl.appendChild(line);
            }

        });

        calendar.appendChild(dayEl);

    }

}
/*======================================
 取消ボタンの処理（5/6）
======================================*/

if (cancelButton) {

cancelButton.addEventListener("click", function () {

    if (!selectedStaff) {

        showMessage("スタッフを選択してください");
        return;

    }

    if (!selectedDay) {

        showMessage("日付を選択してください");
        return;

    }

    if (isDeadlinePassed()) {

        deadlineMessage();
        return;

    }
    if (isMonthConfirmed()) {

        confirmedMessage();
        return;

    }
    

    const key = createStorageKey(selectedDay);

    const saved = localStorage.getItem(key);

    if (!saved) {

        showMessage("この日にはまだ入力がありません");
        return;

    }

    const ok = confirm("この日の入力を取り消しますか？");

    if (!ok) return;

    localStorage.removeItem(key);

    shiftType.value = "";
    workPattern.value = "";
    memo.value = "";

    showMessage("取り消しました。");

    createCalendar();

});

}
/*======================================
 シフト確定機能（6/6）
======================================*/

function getConfirmKey() {

    return `confirmed-${currentYear}-${currentMonth + 1}`;

}

function isMonthConfirmed() {

    return localStorage.getItem(getConfirmKey()) === "true";

}

function confirmedMessage() {

    showMessage("この月のシフトは確定済みのため編集できません。");

}

function updateConfirmStatus() {

    const statusEl = document.getElementById("confirmStatus");

    if (!statusEl) return;

    if (isMonthConfirmed()) {

        statusEl.textContent = "確定済み";
        statusEl.className = "status-confirmed";

        if (confirmButton) confirmButton.disabled = true;

    } else {

        statusEl.textContent = "未確定";
        statusEl.className = "status-pending";

        if (confirmButton) confirmButton.disabled = false;

    }

}
/*======================================
 確定シフトの表示（スタッフ画面・全員分）
======================================*/

function showConfirmedIfNeeded() {

    const area = document.getElementById("confirmedArea");

    if (!area) return;

    if (!selectedStaff || !isMonthConfirmed()) {

        area.style.display = "none";
        return;

    }

    const monthLabel = document.getElementById("confirmedMonthLabel");
    const confirmedCalendar = document.getElementById("confirmedCalendar");

    monthLabel.textContent =
        `${currentYear}年${currentMonth + 1}月`;

    confirmedCalendar.innerHTML = "";
    confirmedCalendar.style.display = "grid";
    confirmedCalendar.style.gridTemplateColumns = "repeat(7,1fr)";
    confirmedCalendar.style.gap = "6px";

    const weekDays = ["日","月","火","水","木","金","土"];

    weekDays.forEach(w => {

        const el = document.createElement("div");
        el.className = "calendar-weekday";
        el.textContent = w;
        confirmedCalendar.appendChild(el);

    });

    const firstDay =
        new Date(currentYear, currentMonth, 1).getDay();

    const lastDate =
        new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {

        const empty = document.createElement("div");
        confirmedCalendar.appendChild(empty);

    }

    for (let day = 1; day <= lastDate; day++) {

        const dayEl = document.createElement("div");
        dayEl.className = "calendar-day";

        const dayNumber = document.createElement("div");
        dayNumber.className = "day-number";
        dayNumber.textContent = day;
        dayEl.appendChild(dayNumber);

        getAllStaff().forEach(staff => {

            const key =
                `${currentYear}-${currentMonth + 1}-${day}-${staff.name}`;

            const data = localStorage.getItem(key);

            if (data) {

                const parsed = JSON.parse(data);

                const line = document.createElement("div");
                line.className = "manager-day-line";

                const dot = document.createElement("span");
                dot.className = "staff-dot";
                dot.style.background = staff.color;

                const labelText =
                    parsed.type === "勤務"
                        ? parsed.pattern
                        : parsed.type;

                const text = document.createElement("span");
                text.textContent = labelText;

                line.appendChild(dot);
                line.appendChild(text);

                dayEl.appendChild(line);

            }

        });

        confirmedCalendar.appendChild(dayEl);

    }

    area.style.display = "block";

}
/*======================================
 スタッフ一覧の表示（共通）
======================================*/

function renderStaffColorList(containerId) {

    const container = document.getElementById(containerId);

    if (!container) return;

    container.innerHTML = "";

    getAllStaff().forEach(staff => {

        const row = document.createElement("div");
        row.className = "staff-list-item";

        const dot = document.createElement("span");
        dot.className = "staff-dot";
        dot.style.background = staff.color;

        row.appendChild(dot);
        row.appendChild(document.createTextNode(staff.name));

        container.appendChild(row);

    });

}

/*======================================
 スタッフ管理一覧（削除ボタン付き）
======================================*/

function renderStaffManageList() {

    const container = document.getElementById("staffManageList");

    if (!container) return;

    container.innerHTML = "";

    getAllStaff().forEach(staff => {

        const row = document.createElement("div");
        row.className = "staff-manage-row";

        const dot = document.createElement("span");
        dot.className = "staff-dot";
        dot.style.background = staff.color;

        const name = document.createElement("span");
        name.textContent = staff.name;
        name.style.flex = "1";

        const patterns = document.createElement("span");
        patterns.className = "staff-manage-patterns";
        patterns.textContent = staff.patterns.join(" / ");

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "削除";
        deleteBtn.className = "cancel-button";

        deleteBtn.addEventListener("click", function () {

            const ok = confirm(`${staff.name}さんを削除しますか？\n（過去の入力データは残りますが、一覧には表示されなくなります）`);

            if (!ok) return;

            deleteStaffMember(staff.name);

            renderStaffColorList("staffColorList");
            renderStaffManageList();
            createManagerCalendar();

        });

        row.appendChild(dot);
        row.appendChild(name);
        row.appendChild(patterns);
        row.appendChild(deleteBtn);

        container.appendChild(row);

    });

}
