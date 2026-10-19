// ============================================================
// script.js - Logika halaman jadwal & aturan piket
// Sumber data: Google Sheets (dipublikasikan sebagai CSV)
// ============================================================

// ------------------------------------------------------------
// GANTI BARIS INI dengan link CSV dari Google Sheets Anda
// Cara dapat link: File > Share > Publish to web > pilih CSV > Publish
// ------------------------------------------------------------
const CSV_URL = 'TARUH_LINK_CSV_ANDA_DI_SINI';

// ------------------------------------------------------------
// 1. Tampilkan tanggal hari ini di bagian atas
// ------------------------------------------------------------
function tampilkanTanggalAtas() {
  const el = document.getElementById('today-date');
  if (!el) return;

  const sekarang = new Date();
  const opsi = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  el.textContent = sekarang.toLocaleDateString('id-ID', opsi);
}

// ------------------------------------------------------------
// 2. Ambil nama hari ini dalam Bahasa Indonesia
// ------------------------------------------------------------
function namaHariIni() {
  const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  return hari[new Date().getDay()];
}

// ------------------------------------------------------------
// 3. Parsing CSV sederhana (tanpa library)
//    Asumsi: tidak ada koma di dalam isi sel
// ------------------------------------------------------------
function parseCSV(teks) {
  const baris = teks.split('\n').filter((b) => b.trim() !== '');
  if (baris.length < 2) return [];

  // Baris pertama = header
  const header = baris[0].split(',').map((h) => h.trim().toLowerCase());

  const hasil = [];
  for (let i = 1; i < baris.length; i++) {
    const kolom = baris[i].split(',');
    const objek = {};
    header.forEach((namaKolom, idx) => {
      objek[namaKolom] = (kolom[idx] || '').trim();
    });
    hasil.push(objek);
  }
  return hasil;
}

// ------------------------------------------------------------
// 4. Ambil data dari Google Sheets (CSV)
// ------------------------------------------------------------
async function ambilDataJadwal() {
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) throw new Error('Gagal mengambil data');
    const teks = await response.text();
    return parseCSV(teks);
  } catch (error) {
    console.error('Error ambil data:', error);
    return null;
  }
}

// ------------------------------------------------------------
// 5. Tampilkan jadwal untuk hari tertentu
// ------------------------------------------------------------
async function tampilkanJadwal(hari) {
  const container = document.getElementById('schedule-display');
  if (!container) return;

  container.innerHTML = '<div class="placeholder"><p>Memuat data...</p></div>';

  const data = await ambilDataJadwal();

  if (data === null) {
    container.innerHTML =
      '<div class="placeholder"><p>Gagal memuat data. Periksa koneksi atau link CSV.</p></div>';
    return;
  }

  if (data.length === 0) {
    container.innerHTML =
      '<div class="placeholder"><p>Data jadwal kosong.</p></div>';
    return;
  }

  // Cari baris sesuai hari (case-insensitive)
  const baris = data.find(
    (item) => (item.hari || '').toLowerCase() === hari.toLowerCase()
  );

  if (!baris) {
    container.innerHTML =
      '<div class="placeholder"><p>Tidak ada jadwal untuk hari ' + hari + '.</p></div>';
    return;
  }

  // Susun tampilan
  const aturan = baris.aturan || '-';
  const petugas = baris.petugas || '-';

  container.innerHTML = `
    <h2 class="schedule-day">Jadwal Hari ${hari}</h2>
    <div class="schedule-section">
      <h3>Aturan Piket</h3>
      <p>${aturan}</p>
    </div>
    <div class="schedule-section">
      <h3>Petugas Jaga</h3>
      <p>${petugas}</p>
    </div>
  `;

  // Tandai tombol hari yang aktif
  tandaiTombolAktif(hari);
}

// ------------------------------------------------------------
// 6. Tandai tombol hari yang sedang dipilih
// ------------------------------------------------------------
function tandaiTombolAktif(hari) {
  const tombol = document.querySelectorAll('.day-btn');
  tombol.forEach((btn) => {
    if (btn.dataset.day.toLowerCase() === hari.toLowerCase()) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// ------------------------------------------------------------
// 7. Inisialisasi saat halaman dimuat
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  tampilkanTanggalAtas();

  // Pasang event ke semua tombol hari
  const tombolHari = document.querySelectorAll('.day-btn');
  tombolHari.forEach((btn) => {
    btn.addEventListener('click', () => {
      tampilkanJadwal(btn.dataset.day);
    });
  });

  // Tombol "Tampilkan Hari Ini"
  const btnToday = document.getElementById('btn-today');
  if (btnToday) {
    btnToday.addEventListener('click', () => {
      tampilkanJadwal(namaHariIni());
    });
  }
});