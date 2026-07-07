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

/*======================================
  初期化
======================================*/

window.addEventListener("DOMContentLoaded", init);

function init() {

    if (staffTrigger) {

        createStaffList();

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
