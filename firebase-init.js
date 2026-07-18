import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js"
import { initializeFirestore, doc, setDoc, getDoc, deleteDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";;import { getFirestore, doc, setDoc, getDoc, deleteDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBrMCKSIau29AsXCSq8i1fIFyNR3gE5Cik",
    authDomain: "naritashift.firebaseapp.com",
    projectId: "naritashift",
    storageBucket: "naritashift.firebasestorage.app",
    messagingSenderId: "554478364266",
    appId: "1:554478364266:web:3bf8492a786479cea94c13"
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true
});


/*======================================
 シフトデータの保存・取得・削除
======================================*/

function shiftDocId(year, month, day, staffName) {
    return `${year}-${month}-${day}-${staffName}`;
}

window.saveShift = async function (year, month, day, staffName, data) {

    const ref = doc(db, "shifts", shiftDocId(year, month, day, staffName));

    await setDoc(ref, {
        year: year,
        month: month,
        day: day,
        staff: staffName,
        type: data.type,
        pattern: data.pattern,
        memo: data.memo
    });

};

window.deleteShift = async function (year, month, day, staffName) {

    const ref = doc(db, "shifts", shiftDocId(year, month, day, staffName));
    await deleteDoc(ref);

};

window.fetchMonthShifts = async function (year, month) {

    const shiftsRef = collection(db, "shifts");

    const q = query(
        shiftsRef,
        where("year", "==", year),
        where("month", "==", month)
    );

    const snapshot = await getDocs(q);

    const result = {};

    snapshot.forEach(docSnap => {

        const d = docSnap.data();
        const key = `${d.day}-${d.staff}`;

        result[key] = {
            type: d.type,
            pattern: d.pattern,
            memo: d.memo
        };

    });

    return result;

};
/*======================================
 スタッフ一覧の保存・取得・削除
======================================*/

window.fetchAllStaffFromDB = async function () {

    const staffRef = collection(db, "staff");
    const snapshot = await getDocs(staffRef);

    const result = [];

    snapshot.forEach(docSnap => {

        result.push(docSnap.data());

    });

    result.sort((a, b) => a.id - b.id);

    return result;

};

window.saveStaffToDB = async function (staff) {

    const ref = doc(db, "staff", String(staff.id));

    await setDoc(ref, staff);

};

window.deleteStaffFromDB = async function (staffId) {

    const ref = doc(db, "staff", String(staffId));
    await deleteDoc(ref);

};
/*======================================
 シフト確定状態の保存・取得
======================================*/

window.fetchConfirmStatus = async function (year, month) {

    const ref = doc(db, "confirmed", `${year}-${month}`);
    const snap = await getDoc(ref);

    return snap.exists() ? snap.data().confirmed === true : false;

};

window.setConfirmStatus = async function (year, month, value) {

    const ref = doc(db, "confirmed", `${year}-${month}`);

    if (value) {

        await setDoc(ref, { confirmed: true });

    } else {

        await deleteDoc(ref);

    }

};
