class KutuphaneYonetimi {
    constructor() {
        this.kitaplar = JSON.parse(localStorage.getItem('kitaplar')) || [];
        this.form = document.getElementById('kitapForm');
        this.kitapListesi = document.getElementById('kitapListesi');
        this.aramaKutusu = document.getElementById('aramaKutusu');

        this.form.addEventListener('submit', (e) => this.kitapEkle(e));
        this.aramaKutusu.addEventListener('input', () => this.kitapAra());
        this.kitaplariGoster();
    }

    kitapEkle(e) {
        e.preventDefault();
        const yeniKitap = {
            id: Date.now(),
            kitapAdi: document.getElementById('kitapAdi').value,
            yazar: document.getElementById('yazar').value,
            isbn: document.getElementById('isbn').value,
            durum: document.getElementById('durum').value
        };

        this.kitaplar.push(yeniKitap);
        this.kaydet();
        this.kitaplariGoster();
        this.form.reset();
    }

    kitapSil(id) {
        if (confirm('Bu kitabı silmek istediğinizden emin misiniz?')) {
            this.kitaplar = this.kitaplar.filter(kitap => kitap.id !== id);
            this.kaydet();
            this.kitaplariGoster();
        }
    }

    kitapDuzenle(id) {
        const kitap = this.kitaplar.find(k => k.id === id);
        if (kitap) {
            document.getElementById('kitapAdi').value = kitap.kitapAdi;
            document.getElementById('yazar').value = kitap.yazar;
            document.getElementById('isbn').value = kitap.isbn;
            document.getElementById('durum').value = kitap.durum;
            
            this.kitaplar = this.kitaplar.filter(k => k.id !== id);
            this.kaydet();
            this.kitaplariGoster();
        }
    }

    kitapAra() {
        const aramaMetni = this.aramaKutusu.value.toLowerCase();
        const filtrelenmisKitaplar = this.kitaplar.filter(kitap => 
            kitap.kitapAdi.toLowerCase().includes(aramaMetni) ||
            kitap.yazar.toLowerCase().includes(aramaMetni) ||
            kitap.isbn.toLowerCase().includes(aramaMetni)
        );
        this.kitaplariGoster(filtrelenmisKitaplar);
    }

    kitaplariGoster(gosterilecekKitaplar = this.kitaplar) {
        this.kitapListesi.innerHTML = '';
        gosterilecekKitaplar.forEach(kitap => {
            const satir = document.createElement('tr');
            satir.innerHTML = `
                <td>${kitap.kitapAdi}</td>
                <td>${kitap.yazar}</td>
                <td>${kitap.isbn}</td>
                <td>${kitap.durum}</td>
                <td>
                    <button class="duzenle-btn" onclick="kutuphane.kitapDuzenle(${kitap.id})">Düzenle</button>
                    <button class="sil-btn" onclick="kutuphane.kitapSil(${kitap.id})">Sil</button>
                </td>
            `;
            this.kitapListesi.appendChild(satir);
        });
    }

    kaydet() {
        localStorage.setItem('kitaplar', JSON.stringify(this.kitaplar));
    }
}

class KullaniciYonetimi {
    constructor() {
        this.kullanicilar = [
            { tip: 'admin', kullaniciAdi: 'admin', sifre: 'admin123' },
            { tip: 'kullanici', kullaniciAdi: 'user', sifre: 'user123' }
        ];
        this.aktifKullanici = null;
    }

    girisYap(kullaniciAdi, sifre, tip) {
        const kullanici = this.kullanicilar.find(k => 
            k.kullaniciAdi === kullaniciAdi && 
            k.sifre === sifre && 
            k.tip === tip
        );
        if (kullanici) {
            this.aktifKullanici = kullanici;
            return true;
        }
        return false;
    }

    cikisYap() {
        this.aktifKullanici = null;
    }
}

class KutuphaneYonetimi {
    constructor() {
        this.kitaplar = JSON.parse(localStorage.getItem('kitaplar')) || [];
        this.kullaniciYonetimi = new KullaniciYonetimi();
        
        // Modal ve buton elementleri
        this.kullaniciModal = document.getElementById('kullaniciGirisModal');
        this.adminModal = document.getElementById('adminGirisModal');
        this.kullaniciGirisBtn = document.getElementById('kullaniciGirisBtn');
        this.adminGirisBtn = document.getElementById('adminGirisBtn');
        this.closeButtons = document.getElementsByClassName('close');
        
        // Form elementleri
        this.kullaniciGirisForm = document.getElementById('kullaniciGirisForm');
        this.adminGirisForm = document.getElementById('adminGirisForm');
        
        // İçerik elementleri
        this.anaSayfa = document.getElementById('anaSayfa');
        this.kutuphaneIcerik = document.getElementById('kutuphaneIcerik');
        this.kitapYonetimPaneli = document.getElementById('kitapYonetimPaneli');
        
        // Event listeners
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Giriş butonları
        this.kullaniciGirisBtn.addEventListener('click', () => this.modalAc('kullanici'));
        this.adminGirisBtn.addEventListener('click', () => this.modalAc('admin'));

        // Modal kapatma butonları
        Array.from(this.closeButtons).forEach(button => {
            button.addEventListener('click', () => this.modalKapat());
        });

        // Giriş formları
        this.kullaniciGirisForm.addEventListener('submit', (e) => this.girisYap(e, 'kullanici'));
        this.adminGirisForm.addEventListener('submit', (e) => this.girisYap(e, 'admin'));

        // Menü linkleri
        document.getElementById('cikisLink').addEventListener('click', () => this.cikisYap());

        // Pencere dışı tıklama
        window.addEventListener('click', (e) => {
            if (e.target == this.kullaniciModal || e.target == this.adminModal) {
                this.modalKapat();
            }
        });
    }

    modalAc(tip) {
        if (tip === 'kullanici') {
            this.kullaniciModal.style.display = 'block';
        } else {
            this.adminModal.style.display = 'block';
        }
    }

    modalKapat() {
        this.kullaniciModal.style.display = 'none';
        this.adminModal.style.display = 'none';
    }

    girisYap(e, tip) {
        e.preventDefault();
        const kullaniciAdi = document.getElementById(tip === 'kullanici' ? 'kullaniciAdi' : 'adminKullaniciAdi').value;
        const sifre = document.getElementById(tip === 'kullanici' ? 'kullaniciSifre' : 'adminSifre').value;

        if (this.kullaniciYonetimi.girisYap(kullaniciAdi, sifre, tip)) {
            this.modalKapat();
            this.anaSayfa.style.display = 'none';
            this.kutuphaneIcerik.classList.remove('hidden');
            if (tip === 'admin') {
                this.kitapYonetimPaneli.classList.remove('hidden');
            }
        } else {
            alert('Hatalı kullanıcı adı veya şifre!');
        }
    }

    cikisYap() {
        this.kullaniciYonetimi.cikisYap();
        this.anaSayfa.style.display = 'block';
        this.kutuphaneIcerik.classList.add('hidden');
        this.kitapYonetimPaneli.classList.add('hidden');
    }

    kitapEkle(e) {
        e.preventDefault();
        const yeniKitap = {
            id: Date.now(),
            kitapAdi: document.getElementById('kitapAdi').value,
            yazar: document.getElementById('yazar').value,
            isbn: document.getElementById('isbn').value,
            durum: document.getElementById('durum').value
        };

        this.kitaplar.push(yeniKitap);
        this.kaydet();
        this.kitaplariGoster();
        this.form.reset();
    }

    kitapSil(id) {
        if (confirm('Bu kitabı silmek istediğinizden emin misiniz?')) {
            this.kitaplar = this.kitaplar.filter(kitap => kitap.id !== id);
            this.kaydet();
            this.kitaplariGoster();
        }
    }

    kitapDuzenle(id) {
        const kitap = this.kitaplar.find(k => k.id === id);
        if (kitap) {
            document.getElementById('kitapAdi').value = kitap.kitapAdi;
            document.getElementById('yazar').value = kitap.yazar;
            document.getElementById('isbn').value = kitap.isbn;
            document.getElementById('durum').value = kitap.durum;
            
            this.kitaplar = this.kitaplar.filter(k => k.id !== id);
            this.kaydet();
            this.kitaplariGoster();
        }
    }

    kitapAra() {
        const aramaMetni = this.aramaKutusu.value.toLowerCase();
        const filtrelenmisKitaplar = this.kitaplar.filter(kitap => 
            kitap.kitapAdi.toLowerCase().includes(aramaMetni) ||
            kitap.yazar.toLowerCase().includes(aramaMetni) ||
            kitap.isbn.toLowerCase().includes(aramaMetni)
        );
        this.kitaplariGoster(filtrelenmisKitaplar);
    }

    kitaplariGoster(gosterilecekKitaplar = this.kitaplar) {
        this.kitapListesi.innerHTML = '';
        gosterilecekKitaplar.forEach(kitap => {
            const satir = document.createElement('tr');
            satir.innerHTML = `
                <td>${kitap.kitapAdi}</td>
                <td>${kitap.yazar}</td>
                <td>${kitap.isbn}</td>
                <td>${kitap.durum}</td>
                <td>
                    <button class="duzenle-btn" onclick="kutuphane.kitapDuzenle(${kitap.id})">Düzenle</button>
                    <button class="sil-btn" onclick="kutuphane.kitapSil(${kitap.id})">Sil</button>
                </td>
            `;
            this.kitapListesi.appendChild(satir);
        });
    }

    kaydet() {
        localStorage.setItem('kitaplar', JSON.stringify(this.kitaplar));
    }
}

class KullaniciYonetimi {
    constructor() {
        this.kullanicilar = [
            { tip: 'admin', kullaniciAdi: 'admin', sifre: 'admin123' },
            { tip: 'kullanici', kullaniciAdi: 'user', sifre: 'user123' }
        ];
        this.aktifKullanici = null;
    }

    girisYap(kullaniciAdi, sifre, tip) {
        const kullanici = this.kullanicilar.find(k => 
            k.kullaniciAdi === kullaniciAdi && 
            k.sifre === sifre && 
            k.tip === tip
        );
        if (kullanici) {
            this.aktifKullanici = kullanici;
            return true;
        }
        return false;
    }

    cikisYap() {
        this.aktifKullanici = null;
    }
}

class KutuphaneYonetimi {
    constructor() {
        this.kitaplar = JSON.parse(localStorage.getItem('kitaplar')) || [];
        this.kullaniciYonetimi = new KullaniciYonetimi();
        
        // Modal ve buton elementleri
        this.kullaniciModal = document.getElementById('kullaniciGirisModal');
        this.adminModal = document.getElementById('adminGirisModal');
        this.kullaniciGirisBtn = document.getElementById('kullaniciGirisBtn');
        this.adminGirisBtn = document.getElementById('adminGirisBtn');
        this.closeButtons = document.getElementsByClassName('close');
        
        // Form elementleri
        this.kullaniciGirisForm = document.getElementById('kullaniciGirisForm');
        this.adminGirisForm = document.getElementById('adminGirisForm');
        
        // İçerik elementleri
        this.anaSayfa = document.getElementById('anaSayfa');
        this.kutuphaneIcerik = document.getElementById('kutuphaneIcerik');
        this.kitapYonetimPaneli = document.getElementById('kitapYonetimPaneli');
        
        // Event listeners
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Giriş butonları
        this.kullaniciGirisBtn.addEventListener('click', () => this.modalAc('kullanici'));
        this.adminGirisBtn.addEventListener('click', () => this.modalAc('admin'));

        // Modal kapatma butonları
        Array.from(this.closeButtons).forEach(button => {
            button.addEventListener('click', () => this.modalKapat());
        });

        // Giriş formları için event listener'ları güncelle
        // Giriş butonları için event listener'ları güncelle
        document.getElementById('kullaniciGirisBtn').addEventListener('click', function() {
            window.location.href = 'login.html';
        });

        document.getElementById('adminGirisBtn').addEventListener('click', function() {
            window.location.href = 'admin-login.html';
        });

        if (document.getElementById('kullaniciGirisForm')) {
            document.getElementById('kullaniciGirisForm').addEventListener('submit', function(e) {
                e.preventDefault();
                const kullaniciAdi = document.getElementById('kullaniciAdi').value;
                const sifre = document.getElementById('kullaniciSifre').value;
        
                if (kutuphane.kullaniciYonetimi.girisYap(kullaniciAdi, sifre, 'kullanici')) {
                    window.location.href = 'ogrenci-panel.html'; // Burayı güncelledik
                } else {
                    alert('Hatalı kullanıcı adı veya şifre!');
                }
            });
        }
        
        if (document.getElementById('adminGirisForm')) {
            document.getElementById('adminGirisForm').addEventListener('submit', function(e) {
                e.preventDefault();
                const adminKullaniciAdi = document.getElementById('adminKullaniciAdi').value;
                const adminSifre = document.getElementById('adminSifre').value;
        
                if (kutuphane.kullaniciYonetimi.girisYap(adminKullaniciAdi, adminSifre, 'admin')) {
                    window.location.href = 'index.html';
                } else {
                    alert('Hatalı admin kullanıcı adı veya şifre!');
                }
            });
        }

        // Menü linkleri
        document.getElementById('cikisLink').addEventListener('click', () => this.cikisYap());

        // Pencere dışı tıklama
        window.addEventListener('click', (e) => {
            if (e.target == this.kullaniciModal || e.target == this.adminModal) {
                this.modalKapat();
            }
        });
    }

    modalAc(tip) {
        if (tip === 'kullanici') {
            this.kullaniciModal.style.display = 'block';
        } else {
            this.adminModal.style.display = 'block';
        }
    }

    modalKapat() {
        this.kullaniciModal.style.display = 'none';
        this.adminModal.style.display = 'none';
    }

    girisYap(e, tip) {
        e.preventDefault();
        const kullaniciAdi = document.getElementById(tip === 'kullanici' ? 'kullaniciAdi' : 'adminKullaniciAdi').value;
        const sifre = document.getElementById(tip === 'kullanici' ? 'kullaniciSifre' : 'adminSifre').value;

        if (this.kullaniciYonetimi.girisYap(kullaniciAdi, sifre, tip)) {
            this.modalKapat();
            this.anaSayfa.style.display = 'none';
            this.kutuphaneIcerik.classList.remove('hidden');
            if (tip === 'admin') {
                this.kitapYonetimPaneli.classList.remove('hidden');
            }
        } else {
            alert('Hatalı kullanıcı adı veya şifre!');
        }
    }

    cikisYap() {
        this.kullaniciYonetimi.cikisYap();
        this.anaSayfa.style.display = 'block';
        this.kutuphaneIcerik.classList.add('hidden');
        this.kitapYonetimPaneli.classList.add('hidden');
    }

    kitapEkle(e) {
        e.preventDefault();
        const yeniKitap = {
            id: Date.now(),
            kitapAdi: document.getElementById('kitapAdi').value,
            yazar: document.getElementById('yazar').value,
            isbn: document.getElementById('isbn').value,
            durum: document.getElementById('durum').value
        };

        this.kitaplar.push(yeniKitap);
        this.kaydet();
        this.kitaplariGoster();
        this.form.reset();
    }

    kitapSil(id) {
        if (confirm('Bu kitabı silmek istediğinizden emin misiniz?')) {
            this.kitaplar = this.kitaplar.filter(kitap => kitap.id !== id);
            this.kaydet();
            this.kitaplariGoster();
        }
    }

    kitapDuzenle(id) {
        const kitap = this.kitaplar.find(k => k.id === id);
        if (kitap) {
            document.getElementById('kitapAdi').value = kitap.kitapAdi;
            document.getElementById('yazar').value = kitap.yazar;
            document.getElementById('isbn').value = kitap.isbn;
            document.getElementById('durum').value = kitap.durum;
            
            this.kitaplar = this.kitaplar.filter(k => k.id !== id);
            this.kaydet();
            this.kitaplariGoster();
        }
    }

    kitapAra() {
        const aramaMetni = this.aramaKutusu.value.toLowerCase();
        const filtrelenmisKitaplar = this.kitaplar.filter(kitap => 
            kitap.kitapAdi.toLowerCase().includes(aramaMetni) ||
            kitap.yazar.toLowerCase().includes(aramaMetni) ||
            kitap.isbn.toLowerCase().includes(aramaMetni)
        );
        this.kitaplariGoster(filtrelenmisKitaplar);
    }

    kitaplariGoster(gosterilecekKitaplar = this.kitaplar) {
        this.kitapListesi.innerHTML = '';
        gosterilecekKitaplar.forEach(kitap => {
            const satir = document.createElement('tr');
            satir.innerHTML = `
                <td>${kitap.kitapAdi}</td>
                <td>${kitap.yazar}</td>
                <td>${kitap.isbn}</td>
                <td>${kitap.durum}</td>
                <td>
                    <button class="duzenle-btn" onclick="kutuphane.kitapDuzenle(${kitap.id})">Düzenle</button>
                    <button class="sil-btn" onclick="kutuphane.kitapSil(${kitap.id})">Sil</button>
                </td>
            `;
            this.kitapListesi.appendChild(satir);
        });
    }

    kaydet() {
        localStorage.setItem('kitaplar', JSON.stringify(this.kitaplar));
    }
}

const kutuphane = new KutuphaneYonetimi();