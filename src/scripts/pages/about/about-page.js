export default class AboutPage {
  async render() {
    return `
      <section class="container about-page" aria-labelledby="about-title">
        <div class="about-card">
          <div class="about-header">
            <h1 id="about-title">Tentang Story App</h1>
            <p class="section-subtitle">Aplikasi berbagi momen inspiratif dan cerita komunitas berbasis Single Page Application (SPA).</p>
          </div>

          <div class="about-content">
            <article class="about-article">
              <h2>Mengenai Proyek</h2>
              <p>
                Story App dirancang sebagai platform modern bagi komunitas Dicoding untuk membagikan kisah, dokumentasi kegiatan, serta foto momen penting lengkap dengan informasi geolokasi interaktif.
              </p>
            </article>

            <article class="about-article">
              <h2>Fitur Unggulan</h2>
              <ul class="about-feature-list">
                <li><strong>Eksplorasi Cerita & Peta Digital:</strong> Menampilkan cerita komunitas dengan visualisasi titik lokasi interaktif menggunakan multi-layer Leaflet (OpenStreetMap, OpenTopoMap, dan citra satelit).</li>
                <li><strong>Berbagi Cerita Fleksibel:</strong> Mendukung pengunggahan berkas gambar dengan kompresi otomatis di bawah 1 MB serta pengambilan foto langsung melalui kamera gawai.</li>
                <li><strong>Desain Aksesibel & Responsif:</strong> Memenuhi kaidah aksesibilitas WCAG (kontras tinggi, label form eksplisit, navigasi keyboard, serta skip-to-content).</li>
              </ul>
            </article>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Teardown or analytics hook if needed
  }
}
