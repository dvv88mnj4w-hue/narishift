const staff = document.getElementById("staff");
const workTime = document.getElementById("workTime");

const pattern = {
  "山本さん": ["8:30～12:30"],
  "吉田さん": ["8:30～13:30", "8:30～16:00"],
  "市川さん": ["8:30～12:30"],
  "中村さん": ["8:30～14:00"],
  "杉浦さん": ["8:30～13:30", "17:00～21:00"]
};

staff.addEventListener("change", () => {

    workTime.innerHTML = "";

    pattern[staff.value].forEach(time => {

        const option = document.createElement("option");

        option.text = time;

        workTime.add(option);

    });

});

staff.dispatchEvent(new Event("change"));
// ===== 保存 =====

const saveButton = document.getElementById("saveButton");

if (saveButton) {

    saveButton.addEventListener("click", () => {

        const shift = {
            staff: document.getElementById("staff").value,
            date: document.getElementById("date").value,
            workTime: document.getElementById("workTime").value,
            paidLeave: document.getElementById("paidLeave").checked,
            memo: document.getElementById("memo").value
        };

        localStorage.setItem("narishift", JSON.stringify(shift));

        alert("保存しました🐾");

    });

}
