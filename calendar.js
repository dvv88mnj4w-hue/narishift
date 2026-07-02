const monthTitle = document.getElementById("monthTitle");
const calendar = document.getElementById("calendar");

const today = new Date();

const year = today.getFullYear();
const month = today.getMonth() + 1;

monthTitle.textContent = `${year}年 ${month}月`;

// 曜日
const week = ["月","火","水","木","金","土","日"];

week.forEach(day => {

    const w = document.createElement("div");

    w.textContent = day;

    w.style.fontWeight = "bold";
    w.style.textAlign = "center";
    w.style.padding = "10px";

    calendar.appendChild(w);

});

// 日付
for(let i=1;i<=31;i++){

    const button=document.createElement("button");

    button.textContent=i;

    button.onclick=()=>{

        alert(`${month}月${i}日`);

    }

    calendar.appendChild(button);

}
