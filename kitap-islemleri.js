class KitapIslemleri {
    constructor() {
        this.kitaplar = [
            {
                id: 1,
                kitapAdi: "Suç ve Ceza",
                yazar: "Fyodor Dostoyevski",
                isbn: "9789750719387",
                durum: "Mevcut",
                fiyat: 45.90,
                teslimSuresi: 14,
                gecikmeBedeli: 2,
                kapakResmi: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Crime_and_Punishment_cover.jpg/800px-Crime_and_Punishment_cover.jpg"
            },
            {
                id: 2,
                kitapAdi: "1984",
                yazar: "George Orwell",
                isbn: "9789750719388",
                durum: "Mevcut",
                fiyat: 35.90,
                teslimSuresi: 14,
                gecikmeBedeli: 2,
                kapakResmi: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/1984first.jpg/800px-1984first.jpg"
            },
            {
                id: 3,
                kitapAdi: "Küçük Prens",
                yazar: "Antoine de Saint-Exupéry",
                isbn: "9789750719389",
                durum: "Mevcut",
                fiyat: 25.90,
                teslimSuresi: 14,
                gecikmeBedeli: 2,
                kapakResmi: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Le_Petit_Prince_%28book_cover%29.jpg/800px-Le_Petit_Prince_%28book_cover%29.jpg"
            },
            {
                id: 4,
                kitapAdi: "Simyacı",
                yazar: "Paulo Coelho",
                isbn: "9789750719390",
                durum: "Mevcut",
                fiyat: 30.90,
                teslimSuresi: 14,
                gecikmeBedeli: 2,
                kapakResmi: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/The_Alchemist_%28book%29.jpg/800px-The_Alchemist_%28book%29.jpg"
            },
            {
                id: 5,
                kitapAdi: "Sefiller",
                yazar: "Victor Hugo",
                isbn: "9789750719387",
                durum: "Mevcut",
                fiyat: 45.90,
                teslimSuresi: 14,
                gecikmeBedeli: 2,
                kapakResmi: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Les_Mis%C3%A9rables_cover_art.jpg/800px-Les_Mis%C3%A9rables_cover_art.jpg"
            },
            {
                id: 6,
                kitapAdi: "Don Kişot",
                yazar: "Miguel de Cervantes",
                isbn: "9789750719392",
                durum: "Mevcut",
                fiyat: 40.90,
                teslimSuresi: 14,
                gecikmeBedeli: 2,
                kapakResmi: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Don_Quixote_1605_%28title_page%29.jpg/800px-Don_Quixote_1605_%28title_page%29.jpg"
            },
            {
                id: 7,
                kitapAdi: "Savaş ve Barış",
                yazar: "Lev Tolstoy",
                isbn: "9789750719393",
                durum: "Mevcut",
                fiyat: 65.90,
                teslimSuresi: 14,
                gecikmeBedeli: 2,
                kapakResmi: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Tolstoy_-_War_and_Peace_-_first_edition%2C_1869.jpg/800px-Tolstoy_-_War_and_Peace_-_first_edition%2C_1869.jpg"
            },
            {
                id: 8,
                kitapAdi: "Madam Bovary",
                yazar: "Gustave Flaubert",
                isbn: "9789750719394",
                durum: "Mevcut",
                fiyat: 35.90,
                teslimSuresi: 14,
                gecikmeBedeli: 2,
                kapakResmi: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Madame_Bovary_%28Flaubert%29_-_title_page.jpg/800px-Madame_Bovary_%28Flaubert%29_-_title_page.jpg"
            }
        ];
        
        // Kitapları localStorage'a kaydet
        localStorage.setItem('kitaplar', JSON.stringify(this.kitaplar));
        
        this.init();
    }

    init() {
        this.aramaKutusu = document.getElementById('kitapArama');
        this.kitapGrid = document.getElementById('kitapGrid');
        this.modal = document.getElementById('kitapDetayModal');
        
        this.initializeEventListeners();
        this.kitaplariGoster();
    }

    initializeEventListeners() {
        // Arama işlevi
        this.aramaKutusu.addEventListener('input', () => this.kitapAra());

        // Filtre butonları
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filtreUygula(e));
        });

        // Modal kapatma
        document.querySelector('.close').addEventListener('click', () => {
            this.modal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target == this.modal) {
                this.modal.style.display = 'none';
            }
        });
    }

    kitapAra() {
        const aramaMetni = this.aramaKutusu.value.toLowerCase();
        const filtrelenmisKitaplar = this.kitaplar.filter(kitap => 
            kitap.kitapAdi.toLowerCase().includes(aramaMetni) ||
            kitap.yazar.toLowerCase().includes(aramaMetni) ||
            kitap.isbn.includes(aramaMetni)
        );
        this.kitaplariGoster(filtrelenmisKitaplar);
    }

    filtreUygula(e) {
        const filterType = e.target.dataset.filter;
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        let filtrelenmisKitaplar = this.kitaplar;
        switch(filterType) {
            case 'mevcut':
                filtrelenmisKitaplar = this.kitaplar.filter(k => k.durum === 'Mevcut');
                break;
            case 'odunc':
                filtrelenmisKitaplar = this.kitaplar.filter(k => k.durum === 'Ödünç Alındı');
                break;
            case 'geciken':
                filtrelenmisKitaplar = this.kitaplar.filter(k => k.durum === 'Gecikmiş');
                break;
        }
        this.kitaplariGoster(filtrelenmisKitaplar);
    }

    kitaplariGoster(gosterilecekKitaplar = this.kitaplar) {
        this.kitapGrid.innerHTML = '';
        gosterilecekKitaplar.forEach(kitap => {
            const kitapCard = document.createElement('div');
            kitapCard.className = 'kitap-card';
            kitapCard.innerHTML = `
                <div class="kitap-kapak">
                    <img src="${kitap.kapakResmi}" alt="${kitap.kitapAdi}" onerror="this.src='images/default-cover.jpg'">
                </div>
                <div class="kitap-ozet">
                    <h3>${kitap.kitapAdi}</h3>
                    <p><i class="fas fa-user"></i> ${kitap.yazar}</p>
                    <p><i class="fas fa-barcode"></i> ${kitap.isbn}</p>
                    <span class="durum ${kitap.durum.toLowerCase()}">${kitap.durum}</span>
                    <p class="fiyat">${kitap.fiyat} TL</p>
                </div>
            `;
            kitapCard.addEventListener('click', () => this.kitapDetayGoster(kitap));
            this.kitapGrid.appendChild(kitapCard);
        });
    }

    kitapDetayGoster(kitap) {
        document.getElementById('kitapKapak').src = kitap.kapakResmi;
        document.getElementById('kitapAdi').textContent = kitap.kitapAdi;
        document.getElementById('yazarAdi').textContent = kitap.yazar;
        document.getElementById('isbnNo').textContent = kitap.isbn;
        document.getElementById('kitapDurum').textContent = kitap.durum;
        document.getElementById('kitapFiyat').textContent = kitap.fiyat;
        document.getElementById('teslimSuresi').textContent = kitap.teslimSuresi;
        document.getElementById('gecikmeBedeli').textContent = kitap.gecikmeBedeli;

        const oduncAlBtn = document.getElementById('oduncAlBtn');
        const satinAlBtn = document.getElementById('satinAlBtn');

        if (kitap.durum === 'Mevcut') {
            oduncAlBtn.style.display = 'block';
            satinAlBtn.style.display = 'block';
            oduncAlBtn.onclick = () => this.kitapOduncAl(kitap.id);
            satinAlBtn.onclick = () => this.kitapSatinAl(kitap.id);
        } else {
            oduncAlBtn.style.display = 'none';
            satinAlBtn.style.display = 'none';
        }

        this.modal.style.display = 'block';
    }

    kitapOduncAl(kitapId) {
        const kitap = this.kitaplar.find(k => k.id === kitapId);
        if (kitap && kitap.durum === 'Mevcut') {
            kitap.durum = 'Ödünç Alındı';
            kitap.oduncAlinmaTarihi = new Date();
            kitap.sonTeslimTarihi = new Date();
            kitap.sonTeslimTarihi.setDate(kitap.sonTeslimTarihi.getDate() + kitap.teslimSuresi);
            
            localStorage.setItem('kitaplar', JSON.stringify(this.kitaplar));
            this.kitaplariGoster();
            this.modal.style.display = 'none';
            alert(`${kitap.kitapAdi} başarıyla ödünç alındı. Son teslim tarihi: ${kitap.sonTeslimTarihi.toLocaleDateString()}`);
        }
    }

    kitapSatinAl(kitapId) {
        const kitap = this.kitaplar.find(k => k.id === kitapId);
        if (kitap && kitap.durum === 'Mevcut') {
            kitap.durum = 'Satıldı';
            localStorage.setItem('kitaplar', JSON.stringify(this.kitaplar));
            this.kitaplariGoster();
            this.modal.style.display = 'none';
            alert(`${kitap.kitapAdi} başarıyla satın alındı. Toplam ödeme: ${kitap.fiyat} TL`);
        }
    }
}

// Sınıfı başlat
document.addEventListener('DOMContentLoaded', () => {
    const kitapIslemleri = new KitapIslemleri();
});