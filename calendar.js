/*
========================================
 ナリシフト calendar.js（Firebase対応版）
========================================
*/

const today = new Date();

let currentYear = today.getFullYear();
let currentMonth = today.getMonth();

let selectedDay = null;
let selectedStaff = "";
let multiSelectMode = false;
let selectedDays = [];

let adminSelectedStaff = "";
let adminSelectedDay = null;

let shiftCache = {};
let confirmedCache = {};

const monthTitle = document.getElementById("monthTitle");
const calendar = document.getElementById("calendar");

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
 シフトデータのキャッシュ操作
======================================*/

function cacheKey(day, staffName) {
    return `${day}-${staffName}`;
}

function getCachedShift(day, staffName) {
    return shiftCache[cacheKey(day, staffName)] || null;
}

function setCachedShift(day, staffName, data) {
    shiftCache[cacheKey(day, staffName)] = data;
}

function removeCachedShift(day, staffName) {
    delete shiftCache[cacheKey(day, staffName)];
}

async function loadMonthShifts() {

    if (!window.fetchMonthShifts) return;

    try {

        shiftCache = await window.fetchMonthShifts(currentYear, currentMonth + 1);

    } catch (e) {

        console.error("シフトデータの取得に失敗しました:", e);
        shiftCache = {};

    }

}
async function loadConfirmStatus() {

    try {

        const key = `${currentYear}-${currentMonth + 1}`;
        confirmedCache[key] = await window.fetchConfirmStatus(currentYear, currentMonth + 1);

    } catch (e) {

        console.error("確定状態の取得に失敗しました:", e);

    }

}

/*======================================
 初期化
======================================*/

window.addEventListener("DOMContentLoaded", init);

async function init() {

    bindMonthNavButtons();

    await loadStaffListFromDB();
    await loadMonthShifts();
    await loadConfirmStatus();
showTopConfirmedNoticeIfNeeded();



    if (staffTrigger) {

        createStaffList();
        showConfirmedIfNeeded();

        const multiToggle = document.getElementById("multiSelectToggle");

        if (multiToggle) {

            multiToggle.addEventListener("change", function () {

                multiSelectMode = multiToggle.checked;
                selectedDay = null;
                selectedDays = [];
                selectedDate.textContent = "未選択";
                shiftType.value = "";
                workPattern.value = "";
                memo.value = "";

                createCalendar();

            });

        }

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

       if (confirmButton) {

            confirmButton.addEventListener("click", async function () {

                const ok = confirm(`${currentYear}年${currentMonth + 1}月のシフトを確定しますか？\n確定すると編集できなくなります。`);

                if (!ok) return;

                confirmButton.disabled = true;

                try {

                    await window.setConfirmStatus(currentYear, currentMonth + 1, true);
                    confirmedCache[getConfirmKey()] = true;

                    updateConfirmStatus();
                    showMessage("確定しました。");

                } catch (e) {

                    console.error(e);
                    showMessage("確定に失敗しました。通信状況を確認してください。");
                    confirmButton.disabled = false;

                }

            });

        }

        const unconfirmButton = document.getElementById("unconfirmButton");

        if (unconfirmButton) {

            unconfirmButton.addEventListener("click", async function () {

                const ok = confirm(`${currentYear}年${currentMonth + 1}月の確定を解除しますか？\n再び編集できるようになります。`);

                if (!ok) return;

                unconfirmButton.disabled = true;

                try {

                    await window.setConfirmStatus(currentYear, currentMonth + 1, false);
                    confirmedCache[getConfirmKey()] = false;

                    updateConfirmStatus();
                    showMessage("確定を解除しました。");

                } catch (e) {

                    console.error(e);
                    showMessage("確定解除に失敗しました。通信状況を確認してください。");

                } finally {

                    unconfirmButton.disabled = false;

                }

            });

        }


        renderStaffColorList("staffColorList");
        renderStaffManageList();

        const addStaffButton = document.getElementById("addStaffButton");

        if (addStaffButton) {

  addStaffButton.addEventListener("click", async function () {

                const nameInput = document.getElementById("newStaffName");
                const colorInput = document.getElementById("newStaffColor");
                const patternsInput = document.getElementById("newStaffPatterns");
                const name = nameInput.value.trim();

                if (!name) { showMessage("名前を入力してください"); return; }
                if (getStaff(name)) { showMessage("同じ名前のスタッフが既に存在します"); return; }

                addStaffButton.disabled = true;

                try {

                    await addStaffMember(name, colorInput.value, patternsInput.value);

                    nameInput.value = "";
                    patternsInput.value = "";

                    renderStaffColorList("staffColorList");
                    renderStaffManageList();
                    createManagerCalendar();

                    showMessage(`${name}さんを追加しました`);

                } catch (e) {

                    console.error(e);
                    showMessage("追加に失敗しました。通信状況を確認してください。");

                } finally {

                    addStaffButton.disabled = false;

                }

            });

        }

        initAdminEdit();

    }

}

/*======================================
 スタッフ選択（プルダウン）
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
            createCalendar();
            showConfirmedIfNeeded();

        });

        staffOptions.appendChild(option);

    });

}

function createPatternList() {

    workPattern.innerHTML = "";

    const first = document.createElement("option");
    first.value = "";
    first.textContent = "勤務パターンを選択";
    workPattern.appendChild(first);

    if (!selectedStaff) return;

    getPatterns(selectedStaff).forEach(pattern => {

        const option = document.createElement("option");
        option.value = pattern;
        option.textContent = pattern;
        workPattern.appendChild(option);

    });

}

/*======================================
 スタッフ用カレンダー
======================================*/

function getSavedData(day) {

    return getCachedShift(day, selectedStaff);

}

function createCalendar() {

    calendar.innerHTML = "";
    monthTitle.textContent = `${currentYear}年${currentMonth + 1}月`;

    const weekDays = ["日","月","火","水","木","金","土"];

    weekDays.forEach(w => {

        const el = document.createElement("div");
        el.className = "calendar-weekday";
        el.textContent = w;
        calendar.appendChild(el);

    });

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {

        calendar.appendChild(document.createElement("div"));

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
            info.textContent = saved.type === "勤務" ? saved.pattern : saved.type;
            dayEl.appendChild(info);

        }

        if (multiSelectMode ? selectedDays.includes(day) : selectedDay === day) {

            dayEl.classList.add("selected");

        }

        dayEl.addEventListener("click", function () {

            selectDay(day);

        });

        calendar.appendChild(dayEl);

    }

}

function selectDay(day) {

    if (!selectedStaff) { showMessage("先にスタッフを選択してください"); return; }

    if (multiSelectMode) {

        const idx = selectedDays.indexOf(day);

        if (idx === -1) { selectedDays.push(day); } else { selectedDays.splice(idx, 1); }

        selectedDays.sort((a, b) => a - b);

        selectedDate.textContent =
            selectedDays.length > 0
                ? `${selectedDays.length}日選択中（${selectedDays.join("日, ")}日）`
                : "未選択";

        shiftType.value = "";
        workPattern.value = "";
        memo.value = "";

        createCalendar();
        return;

    }

    selectedDay = day;
    selectedDate.textContent = `${currentYear}年${currentMonth + 1}月${day}日`;

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
 保存・取消（Firebase対応）
======================================*/

if (saveButton) {

saveButton.addEventListener("click", async function () {

    if (!selectedStaff) { showMessage("スタッフを選択してください"); return; }

    const targetDays = multiSelectMode ? selectedDays : (selectedDay ? [selectedDay] : []);

    if (targetDays.length === 0) { showMessage("日付を選択してください"); return; }
    if (isDeadlinePassed()) { deadlineMessage(); return; }
    if (isMonthConfirmed()) { confirmedMessage(); return; }

    const type = shiftType.value;

    if (!type) { showMessage("希望区分を選択してください"); return; }
    if (type === "勤務" && !workPattern.value) { showMessage("勤務パターンを選択してください"); return; }

    const data = {
        type: type,
        pattern: type === "勤務" ? workPattern.value : "",
        memo: memo.value
    };

    saveButton.disabled = true;

    try {

        for (const day of targetDays) {

            await window.saveShift(currentYear, currentMonth + 1, day, selectedStaff, data);
            setCachedShift(day, selectedStaff, data);

        }

        saveComplete();

        if (multiSelectMode) {

            selectedDays = [];
            selectedDate.textContent = "未選択";

        }

        createCalendar();

    } catch (e) {

        console.error(e);
        showMessage("保存に失敗しました。通信状況を確認してもう一度お試しください。");

    } finally {

        saveButton.disabled = false;

    }

});

}

if (cancelButton) {

cancelButton.addEventListener("click", async function () {

    if (!selectedStaff) { showMessage("スタッフを選択してください"); return; }

    const targetDays = multiSelectMode ? selectedDays : (selectedDay ? [selectedDay] : []);

    if (targetDays.length === 0) { showMessage("日付を選択してください"); return; }
    if (isDeadlinePassed()) { deadlineMessage(); return; }
    if (isMonthConfirmed()) { confirmedMessage(); return; }

    const hasAny = targetDays.some(day => getCachedShift(day, selectedStaff));

    if (!hasAny) { showMessage("選択した日に入力がありません"); return; }

    const ok = confirm(`選択した${targetDays.length}日分の入力を取り消しますか？`);
    if (!ok) return;

    cancelButton.disabled = true;

    try {

        for (const day of targetDays) {

            await window.deleteShift(currentYear, currentMonth + 1, day, selectedStaff);
            removeCachedShift(day, selectedStaff);

        }

        shiftType.value = "";
        workPattern.value = "";
        memo.value = "";

        showMessage("取り消しました。");

        if (multiSelectMode) {

            selectedDays = [];
            selectedDate.textContent = "未選択";

        }

        createCalendar();

    } catch (e) {

        console.error(e);
        showMessage("取消に失敗しました。通信状況を確認してもう一度お試しください。");

    } finally {

        cancelButton.disabled = false;

    }

});

}

/*======================================
 管理者用カレンダー
======================================*/

function createManagerCalendar() {

    calendar.innerHTML = "";
    monthTitle.textContent = `${currentYear}年${currentMonth + 1}月`;

    const weekDays = ["日","月","火","水","木","金","土"];

    weekDays.forEach(w => {

        const el = document.createElement("div");
        el.className = "calendar-weekday";
        el.textContent = w;
        calendar.appendChild(el);

    });

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {

        calendar.appendChild(document.createElement("div"));

    }

    for (let day = 1; day <= lastDate; day++) {

        const dayEl = document.createElement("div");
        dayEl.className = "calendar-day";

        const dayNumber = document.createElement("div");
        dayNumber.className = "day-number";
        dayNumber.textContent = day;
        dayEl.appendChild(dayNumber);

        getAllStaff().forEach(staff => {

            const parsed = getCachedShift(day, staff.name);

            if (parsed) {

                const line = document.createElement("div");
                line.className = "manager-day-line";

                const dot = document.createElement("span");
                dot.className = "staff-dot";
                dot.style.background = staff.color;

                const labelText = parsed.type === "勤務" ? parsed.pattern : parsed.type;

                const text = document.createElement("span");
                text.textContent = labelText;

                line.appendChild(dot);
                line.appendChild(text);

                dayEl.appendChild(line);

            }

        });

        calendar.appendChild(dayEl);

    }

}

/*======================================
 シフト確定
======================================*/

function getConfirmKey() {

    return `${currentYear}-${currentMonth + 1}`;

}

function isMonthConfirmed() {

    return confirmedCache[getConfirmKey()] === true;

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
 管理者による代理編集
======================================*/

function initAdminEdit() {

    const trigger = document.getElementById("adminStaffTrigger");

    if (!trigger) return;

    const triggerText = document.getElementById("adminStaffTriggerText");
    const options = document.getElementById("adminStaffOptions");
    const area = document.getElementById("adminCalendarArea");

    options.innerHTML = "";

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

            adminSelectedStaff = staff.name;
            adminSelectedDay = null;
            triggerText.textContent = staff.name;
            options.classList.remove("open");

            area.style.display = "block";

            renderAdminPatternList();
            createAdminCalendar();

        });

        options.appendChild(option);

    });

    trigger.addEventListener("click", function () {

        options.classList.toggle("open");

    });

    document.addEventListener("click", function (e) {

        if (!trigger.contains(e.target) && !options.contains(e.target)) {

            options.classList.remove("open");

        }

    });

    document.getElementById("adminSaveButton").addEventListener("click", adminSaveShift);
    document.getElementById("adminCancelButton").addEventListener("click", adminCancelShift);

}

function renderAdminPatternList() {

    const select = document.getElementById("adminWorkPattern");

    select.innerHTML = "";

    const first = document.createElement("option");
    first.value = "";
    first.textContent = "勤務パターンを選択";
    select.appendChild(first);

    getPatterns(adminSelectedStaff).forEach(pattern => {

        const option = document.createElement("option");
        option.value = pattern;
        option.textContent = pattern;
        select.appendChild(option);

    });

}

function createAdminCalendar() {

    const container = document.getElementById("adminCalendar");

    container.innerHTML = "";
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(7,1fr)";
    container.style.gap = "6px";

    const weekDays = ["日","月","火","水","木","金","土"];

    weekDays.forEach(w => {

        const el = document.createElement("div");
        el.className = "calendar-weekday";
        el.textContent = w;
        container.appendChild(el);

    });

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {

        container.appendChild(document.createElement("div"));

    }

    for (let day = 1; day <= lastDate; day++) {

        const dayEl = document.createElement("div");
        dayEl.className = "calendar-day";

        const dayNumber = document.createElement("div");
        dayNumber.className = "day-number";
        dayNumber.textContent = day;
        dayEl.appendChild(dayNumber);

        const parsed = getCachedShift(day, adminSelectedStaff);

        if (parsed) {

            const info = document.createElement("div");
            info.className = "day-info";
            info.textContent = parsed.type === "勤務" ? parsed.pattern : parsed.type;
            dayEl.appendChild(info);

        }

        if (adminSelectedDay === day) {

            dayEl.classList.add("selected");

        }

        dayEl.addEventListener("click", function () {

            adminSelectDay(day);

        });

        container.appendChild(dayEl);

    }

}

function adminSelectDay(day) {

    adminSelectedDay = day;

    document.getElementById("adminSelectedDate").textContent =
        `${currentYear}年${currentMonth + 1}月${day}日`;

    const parsed = getCachedShift(day, adminSelectedStaff);

    const typeEl = document.getElementById("adminShiftType");
    const patternEl = document.getElementById("adminWorkPattern");
    const memoEl = document.getElementById("adminMemo");

    if (parsed) {

        typeEl.value = parsed.type || "";
        patternEl.value = parsed.pattern || "";
        memoEl.value = parsed.memo || "";

    } else {

        typeEl.value = "";
        patternEl.value = "";
        memoEl.value = "";

    }

    createAdminCalendar();

}

async function adminSaveShift() {

    if (!adminSelectedStaff) { showMessage("スタッフを選択してください"); return; }
    if (!adminSelectedDay) { showMessage("日付を選択してください"); return; }
    if (isMonthConfirmed()) { showMessage("確定済みです。先に「確定を解除」してください。"); return; }

    const type = document.getElementById("adminShiftType").value;

    if (!type) { showMessage("希望区分を選択してください"); return; }

    const pattern = document.getElementById("adminWorkPattern").value;

    if (type === "勤務" && !pattern) { showMessage("勤務パターンを選択してください"); return; }

    const data = {
        type: type,
        pattern: type === "勤務" ? pattern : "",
        memo: document.getElementById("adminMemo").value
    };

    try {

        await window.saveShift(currentYear, currentMonth + 1, adminSelectedDay, adminSelectedStaff, data);
        setCachedShift(adminSelectedDay, adminSelectedStaff, data);

        showMessage("保存しました（管理者による編集）。");

        createAdminCalendar();
        createManagerCalendar();

    } catch (e) {

        console.error(e);
        showMessage("保存に失敗しました。通信状況を確認してもう一度お試しください。");

    }

}

async function adminCancelShift() {

    if (!adminSelectedStaff || !adminSelectedDay) { showMessage("スタッフと日付を選択してください"); return; }
    if (isMonthConfirmed()) { showMessage("確定済みです。先に「確定を解除」してください。"); return; }

    if (!getCachedShift(adminSelectedDay, adminSelectedStaff)) { showMessage("この日にはまだ入力がありません"); return; }

    const ok = confirm("この日の入力を取り消しますか？");
    if (!ok) return;

    try {

        await window.deleteShift(currentYear, currentMonth + 1, adminSelectedDay, adminSelectedStaff);
        removeCachedShift(adminSelectedDay, adminSelectedStaff);

        document.getElementById("adminShiftType").value = "";
        document.getElementById("adminWorkPattern").value = "";
        document.getElementById("adminMemo").value = "";

        showMessage("取り消しました。");

        createAdminCalendar();
        createManagerCalendar();

    } catch (e) {

        console.error(e);
        showMessage("取消に失敗しました。通信状況を確認してもう一度お試しください。");

    }

}

/*======================================
 スタッフ一覧表示（共通）
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

        deleteBtn.addEventListener("click", async function () {

            const ok = confirm(`${staff.name}さんを削除しますか？\n（過去の入力データは残りますが、一覧には表示されなくなります）`);

            if (!ok) return;

            try {

                await deleteStaffMember(staff.name);

                renderStaffColorList("staffColorList");
                renderStaffManageList();
                createManagerCalendar();

            } catch (e) {

                console.error(e);
                showMessage("削除に失敗しました。通信状況を確認してください。");

            }

        });


        row.appendChild(dot);
        row.appendChild(name);
        row.appendChild(patterns);
        row.appendChild(deleteBtn);

        container.appendChild(row);

    });

}

/*======================================
 月送り
======================================*/

function bindMonthNavButtons() {

    const prevBtn = document.getElementById("prevMonthBtn");
    const nextBtn = document.getElementById("nextMonthBtn");

    if (prevBtn) prevBtn.addEventListener("click", goPrevMonth);
    if (nextBtn) nextBtn.addEventListener("click", goNextMonth);

}

function goPrevMonth() {

    currentMonth--;

    if (currentMonth < 0) { currentMonth = 11; currentYear--; }

    refreshCurrentView();

}

function goNextMonth() {

    currentMonth++;

    if (currentMonth > 11) { currentMonth = 0; currentYear++; }

    refreshCurrentView();

}

async function refreshCurrentView() {

    await loadMonthShifts();
    await loadConfirmStatus();


    selectedDay = null;
    adminSelectedDay = null;

    if (monthTitle) { monthTitle.textContent = `${currentYear}年${currentMonth + 1}月`; }

    if (staffTrigger && selectedStaff) {

        createPatternList();
        createCalendar();
        showConfirmedIfNeeded();
showTopConfirmedNoticeIfNeeded();

    }

    if (calendar && !staffTrigger) {

        createManagerCalendar();
        updateConfirmStatus();

        if (adminSelectedStaff) {

            createAdminCalendar();

        }

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

    monthLabel.textContent = `${currentYear}年${currentMonth + 1}月`;

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

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {

        confirmedCalendar.appendChild(document.createElement("div"));

    }

    for (let day = 1; day <= lastDate; day++) {

        const dayEl = document.createElement("div");
        dayEl.className = "calendar-day";

        const dayNumber = document.createElement("div");
        dayNumber.className = "day-number";
        dayNumber.textContent = day;
        dayEl.appendChild(dayNumber);

        getAllStaff().forEach(staff => {

            const parsed = getCachedShift(day, staff.name);

            if (parsed) {

                const line = document.createElement("div");
                line.className = "manager-day-line";

                const dot = document.createElement("span");
                dot.className = "staff-dot";
                dot.style.background = staff.color;

                const labelText = parsed.type === "勤務" ? parsed.pattern : parsed.type;

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
 名前選択前の確定お知らせ表示
======================================*/

function showTopConfirmedNoticeIfNeeded() {

    const notice = document.getElementById("topConfirmedNotice");

    if (!notice) return;

    if (!isMonthConfirmed()) {

        notice.style.display = "none";
        return;

    }

    document.getElementById("topConfirmedMonthText").textContent =
        `${currentYear}年${currentMonth + 1}月`;

    notice.style.display = "block";

}
