class OgrenciPaneli {
    constructor() {
        this.kitapIslemleriPanel = document.getElementById('kitapIslemleriPanel');
        this.randevuPanel = document.getElementById('randevuPanel');
        this.profilPanel = document.getElementById('profilPanel');
        
        this.randevular = JSON.parse(localStorage.getItem('randevular')) || [];
        
        this.initializeEventListeners();
        this.kitaplariGoster();
        this.randevulariGoster();
    }

    initializeEventListeners() {
        // Navbar butonları
        document.getElementById('kitapIslemleriBtn').addEventListener('click', () => this.panelGoster('kitapIslemleri'));
        document.getElementById('randevuIslemleriBtn').addEventListener('click', () => this.panelGoster('randevu'));
        document.getElementById('profilBtn').addEventListener('click', () => this.panelGoster('profil'));
        
        // Randevu formu
        document.getElementById('randevuForm').addEventListener('submit', (e) => this.randevuOlustur(e));
        
        // Profil formu
        document.getElementById('profilForm').addEventListener('submit', (e) => this.profilGuncelle(e));
    }

    panelGoster(panel) {
        this.kitapIslemleriPanel.classList.add('hidden');
        this.randevuPanel.classList.add('hidden');
        this.profilPanel.classList.add('hidden');

        switch(panel) {
            case 'kitapIslemleri':
                this.kitapIslemleriPanel.classList.remove('hidden');
                break;
            case 'randevu':
                this.randevuPanel.classList.remove('hidden');
                break;
            case 'profil':
                this.profilPanel.classList.remove('hidden');
                break;
        }
    }

    kitaplariGoster() {
        const kitaplar = JSON.parse(localStorage.getItem('kitaplar')) || [];
        const kitapListesi = document.getElementById('kitapListesi');
        kitapListesi.innerHTML = '';

        kitaplar.forEach(kitap => {
            const satir = document.createElement('tr');
            satir.innerHTML = `
                <td>${kitap.kitapAdi}</td>
                <td>${kitap.yazar}</td>
                <td>${kitap.isbn}</td>
                <td>${kitap.durum}</td>
                <td>
                    <button onclick="ogrenciPaneli.kitapOduncAl(${kitap.id})" 
                            ${kitap.durum === 'Ödünç Verildi' ? 'disabled' : ''}>
                        Ödünç Al
                    </button>
                </td>
            `;
            kitapListesi.appendChild(satir);
        });
    }

    randevuOlustur(e) {
        e.preventDefault();
        const yeniRandevu = {
            id: Date.now(),
            tarih: document.getElementById('randevuTarihi').value,
            saat: document.getElementById('randevuSaati').value,
            not: document.getElementById('randevuNotu').value,
            durum: 'Beklemede'
        };

        this.randevular.push(yeniRandevu);
        localStorage.setItem('randevular', JSON.stringify(this.randevular));
        this.randevulariGoster();
        e.target.reset();
    }

    randevulariGoster() {
        const randevuListesi = document.getElementById('randevuListesi');
        randevuListesi.innerHTML = '';

        this.randevular.forEach(randevu => {
            const satir = document.createElement('tr');
            satir.innerHTML = `
                <td>${randevu.tarih}</td>
                <td>${randevu.saat}</td>
                <td>${randevu.not}</td>
                <td>${randevu.durum}</td>
                <td>
                    <button onclick="ogrenciPaneli.randevuIptal(${randevu.id})"
                            ${randevu.durum !== 'Beklemede' ? 'disabled' : ''}>
                        İptal Et
                    </button>
                </td>
            `;
            randevuListesi.appendChild(satir);
        });
    }

    randevuIptal(id) {
        if (confirm('Randevuyu iptal etmek istediğinizden emin misiniz?')) {
            this.randevular = this.randevular.filter(r => r.id !== id);
            localStorage.setItem('randevular', JSON.stringify(this.randevular));
            this.randevulariGoster();
        }
    }

    kitapOduncAl(kitapId) {
        const kitaplar = JSON.parse(localStorage.getItem('kitaplar')) || [];
        const kitap = kitaplar.find(k => k.id === kitapId);
        
        if (kitap && kitap.durum === 'Mevcut') {
            kitap.durum = 'Ödünç Verildi';
            localStorage.setItem('kitaplar', JSON.stringify(kitaplar));
            this.kitaplariGoster();
        }
    }

    profilGuncelle(e) {
        e.preventDefault();
        const profilBilgileri = {
            ad: document.getElementById('ad').value,
            email: document.getElementById('email').value,
            ogrenciNo: document.getElementById('ogrenciNo').value
        };

        localStorage.setItem('profilBilgileri', JSON.stringify(profilBilgileri));
        alert('Profil bilgileri güncellendi!');
    }
}

const ogrenciPaneli = new OgrenciPaneli();