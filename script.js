import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.x/firebase-database.js";

const db = getDatabase();
const parkingRef = ref(db, 'parking_slots/');

// Listener otomatis: Terpicu setiap ada perubahan di Firebase
onValue(parkingRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    // Gunakan 'let', bukan 'int' (JavaScript tidak mengenal 'int' untuk loop)
    for (let i = 1; i <= 3; i++) {
        // SESUAIKAN: Gunakan underscore (_) sesuai image_c56665.png
        const slotKey = "slot_" + i; 
        const slotData = data[slotKey];
        
        const element = document.getElementById("slot-" + i);
        const statusText = document.getElementById("status-text-" + i);

        if (!slotData) continue;

        // LOGIKA PRIORITAS: Fisik > Reservasi
        if (slotData.physical_status === "occupied") {
            // Jika mobil terdeteksi sensor fisik
            updateUI(element, statusText, "Terisi (Occupied)", "occupied");
        } 
        else if (slotData.is_reserved === true) {
            // Jika dipesan via web tapi mobil belum datang
            updateUI(element, statusText, "Dipesan (Reserved)", "reserved");
        } 
        else {
            // Slot kosong dan siap digunakan
            updateUI(element, statusText, "Tersedia", "available");
        }
    }
});

function updateUI(el, textEl, label, className) {
    if (el && textEl) {
        el.className = "slot-card " + className; // Pastikan class sesuai CSS Anda
        textEl.innerText = label;
    }
}

// Listener untuk Tabel Riwayat
db.ref('history').limitToLast(5).on('value', (snapshot) => {
    const historyData = snapshot.val();
    const tableBody = document.getElementById('history-list');
    tableBody.innerHTML = ''; 

    if (historyData) {
        // Balik urutan: Data terbaru di paling atas
        Object.keys(historyData).reverse().forEach(key => {
            const entry = historyData[key];
            tableBody.innerHTML += `
                <tr style="border-bottom: 1px solid #f8fafc;">
                    <td style="padding: 12px; font-weight: bold; color: var(--primary);">Slot ${entry.slot}</td>
                    <td><code>${entry.uid}</code></td>
                    <td><span style="color: var(--green);">● Berhasil Parkir</span></td>
                </tr>
            `;
        });
    }
});

// Update fungsi Booking agar memasukkan UID secara dinamis
function confirmBooking() {
    const slotKey = document.getElementById('select-slot').value;
    const userRFID = "8A 32 BF 12"; // Simulasi UID User yang login

    db.ref(`parking_slots/${slotKey}`).update({
        is_reserved: true,
        reserved_by_id: userRFID, // Simpan UID pemesan ke Firebase
        reservation_time: Date.now()
    }).then(() => {
        alert("Booking Berhasil!");
        switchMenu('res');
    });
}