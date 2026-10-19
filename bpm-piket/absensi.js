// ============================================================
// absensi.js - Kirim data absensi ke Google Sheets via Apps Script
// ============================================================

// Tempel URL Web App dari langkah deploy di sini
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxzqQ7KfwpQ0FATK8uWr0wL719g6B5lfiCOvmxeJg55cmp6sEns8bpDPrHeJ9A8h4ewdA/exec';

// 1. Isi tanggal hari ini otomatis
function isiTanggalHariIni() {
  const inputTanggal = document.getElementById('tanggal');
  if (!inputTanggal) return;
  const sekarang = new Date();
  const tahun = sekarang.getFullYear();
  const bulan = String(sekarang.getMonth() + 1).padStart(2, '0');
  const hari = String(sekarang.getDate()).padStart(2, '0');
  inputTanggal.value = `${tahun}-${bulan}-${hari}`;
}

// 2. Tampilkan tanggal di header
function tampilkanTanggalAtas() {
  const el = document.getElementById('today-date');
  if (!el) return;
  const sekarang = new Date();
  const opsi = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  el.textContent = sekarang.toLocaleDateString('id-ID', opsi);
}

// 3. Tampilkan pesan status
function tampilkanStatus(pesan, tipe) {
  const el = document.getElementById('absensi-status');
  if (!el) return;
  el.textContent = pesan;
  el.className = 'absensi-status ' + (tipe === 'sukses' ? 'sukses' : 'gagal');
  setTimeout(() => {
    el.textContent = '';
    el.className = 'absensi-status';
  }, 4000);
}

// 4. Kirim data ke Google Sheets
async function kirimAbsensi(entri) {
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8' // Kunci anti-CORS
      },
      body: JSON.stringify(entri)
    });
    
    const hasil = await response.json();
    if (hasil.status !== 'ok') {
      throw new Error(hasil.message || 'Gagal menyimpan');
    }
    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

// 5. Tangani submit form
async function tanganiSubmit(event) {
  event.preventDefault();

  const nama = document.getElementById('nama').value.trim();
  const jabatan = document.getElementById('jabatan').value.trim();
  const tanggal = document.getElementById('tanggal').value;
  const status = document.getElementById('status').value;
  const keterangan = document.getElementById('keterangan').value.trim();

  if (!nama || !jabatan || !tanggal || !status) {
    tampilkanStatus('Mohon lengkapi semua field wajib.', 'gagal');
    return;
  }

  const tombol = event.target.querySelector('button[type="submit"]');
  tombol.disabled = true;
  tombol.textContent = 'Mengirim...';

  const entri = { nama, jabatan, tanggal, status, keterangan };
  const berhasil = await kirimAbsensi(entri);

  if (berhasil) {
    tampilkanStatus('Absensi berhasil disimpan ke Google Sheets.', 'sukses');
    event.target.reset();
    isiTanggalHariIni();
  } else {
    tampilkanStatus('Gagal menyimpan. Periksa koneksi atau coba lagi.', 'gagal');
  }

  tombol.disabled = false;
  tombol.textContent = 'Kirim Absensi';
}

// 6. Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
  isiTanggalHariIni();
  tampilkanTanggalAtas();
  const form = document.getElementById('absensi-form');
  if (form) {
    form.addEventListener('submit', tanganiSubmit);
  }
});