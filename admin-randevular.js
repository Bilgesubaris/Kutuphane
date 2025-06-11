// DOM elementlerini seç
const randevuCards = document.querySelector('.randevu-cards');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');

// Sayfa yüklendiğinde çalışacak fonksiyon
document.addEventListener('DOMContentLoaded', function() {
    console.log('Randevu yönetimi yükleniyor...');
    
    // Test randevularını oluştur
    createTestRandevular();

    // Filtre butonları için event listener
    if (filterButtons) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                randevulariGoster(button.dataset.filter, searchInput.value);
            });
        });
    }

    // Arama kutusu için event listener
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
            randevulariGoster(activeFilter, searchInput.value);
        });
    }

    // İlk yüklemede randevuları göster
    randevulariGoster();
});

// Randevuları localStorage'dan al
function getRandevular() {
    const randevular = localStorage.getItem('randevular');
    return randevular ? JSON.parse(randevular) : [];
}

// Randevuları localStorage'a kaydet
function saveRandevular(randevular) {
    localStorage.setItem('randevular', JSON.stringify(randevular));
}

// Test randevuları oluştur
function createTestRandevular() {
    const testRandevular = [
        {
            id: '1',
            kullaniciAdi: 'Ahmet Yılmaz',
            email: 'ahmet.yilmaz@example.com',
            tarih: '2024-03-20',
            saat: '10:00',
            calismaAlani: 'Sessiz Çalışma Odası 1',
            durum: 'beklemede',
            notlar: 'Ders çalışmak için randevu talep edildi.',
            olusturmaTarihi: '2024-03-15T09:30:00'
        },
        {
            id: '2',
            kullaniciAdi: 'Ayşe Demir',
            email: 'ayse.demir@example.com',
            tarih: '2024-03-21',
            saat: '14:30',
            calismaAlani: 'Grup Çalışma Odası 2',
            durum: 'onaylandi',
            notlar: 'Grup projesi için toplantı.',
            olusturmaTarihi: '2024-03-14T15:45:00'
        },
        {
            id: '3',
            kullaniciAdi: 'Mehmet Kaya',
            email: 'mehmet.kaya@example.com',
            tarih: '2024-03-19',
            saat: '16:00',
            calismaAlani: 'Sessiz Çalışma Odası 3',
            durum: 'reddedildi',
            notlar: 'Araştırma için randevu talep edildi.',
            olusturmaTarihi: '2024-03-13T11:20:00'
        },
        {
            id: '4',
            kullaniciAdi: 'Zeynep Şahin',
            email: 'zeynep.sahin@example.com',
            tarih: '2024-03-22',
            saat: '09:00',
            calismaAlani: 'Grup Çalışma Odası 1',
            durum: 'iptal',
            notlar: 'Seminer hazırlığı için randevu.',
            olusturmaTarihi: '2024-03-15T10:15:00'
        },
        {
            id: '5',
            kullaniciAdi: 'Ali Öztürk',
            email: 'ali.ozturk@example.com',
            tarih: '2024-03-23',
            saat: '13:00',
            calismaAlani: 'Sessiz Çalışma Odası 2',
            durum: 'beklemede',
            notlar: 'Tez çalışması için randevu talep edildi.',
            olusturmaTarihi: '2024-03-16T14:30:00'
        }
    ];

    // Eğer localStorage'da randevu yoksa test verilerini ekle
    if (!localStorage.getItem('randevular')) {
        saveRandevular(testRandevular);
    }
}

// Randevuları göster
function randevulariGoster(filter = 'tumu', searchTerm = '') {
    if (!randevuCards) {
        console.error('Randevu kartları elementi bulunamadı!');
        return;
    }

    const randevular = getRandevular();
    randevuCards.innerHTML = '';

    // Filtreleme ve arama
    const filteredRandevular = randevular.filter(randevu => {
        const matchesFilter = filter === 'tumu' || randevu.durum === filter;
        const matchesSearch = !searchTerm || 
            randevu.kullaniciAdi.toLowerCase().includes(searchTerm.toLowerCase()) ||
            randevu.calismaAlani.toLowerCase().includes(searchTerm.toLowerCase()) ||
            randevu.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Randevuları tarihe göre sırala (en yeniden en eskiye)
    filteredRandevular.sort((a, b) => new Date(b.olusturmaTarihi) - new Date(a.olusturmaTarihi));

    if (filteredRandevular.length === 0) {
        randevuCards.innerHTML = '<div class="no-data">Randevu bulunamadı</div>';
        return;
    }

    filteredRandevular.forEach(randevu => {
        const card = document.createElement('div');
        card.className = 'randevu-card';
        card.innerHTML = `
            <div class="randevu-header">
                <h4>${randevu.kullaniciAdi}</h4>
                <span class="durum ${randevu.durum}">${randevu.durum.charAt(0).toUpperCase() + randevu.durum.slice(1)}</span>
            </div>
            <div class="randevu-body">
                <p><i class="fas fa-calendar"></i> ${randevu.tarih}</p>
                <p><i class="fas fa-clock"></i> ${randevu.saat}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${randevu.calismaAlani}</p>
                <p><i class="fas fa-envelope"></i> ${randevu.email}</p>
                ${randevu.notlar ? `<p><i class="fas fa-sticky-note"></i> ${randevu.notlar}</p>` : ''}
            </div>
            <div class="randevu-footer">
                ${randevu.durum === 'beklemede' ? `
                    <button class="btn-success" onclick="randevuDurumDegistir('${randevu.id}', 'onaylandi')">
                        <i class="fas fa-check"></i> Onayla
                    </button>
                    <button class="btn-danger" onclick="randevuDurumDegistir('${randevu.id}', 'reddedildi')">
                        <i class="fas fa-times"></i> Reddet
                    </button>
                ` : ''}
                ${randevu.durum === 'onaylandi' ? `
                    <button class="btn-danger" onclick="randevuDurumDegistir('${randevu.id}', 'iptal')">
                        <i class="fas fa-ban"></i> İptal Et
                    </button>
                ` : ''}
            </div>
        `;
        randevuCards.appendChild(card);
    });
}

// Randevu durumunu değiştir
function randevuDurumDegistir(randevuId, yeniDurum) {
    const randevular = getRandevular();
    const randevuIndex = randevular.findIndex(r => r.id === randevuId);
    
    if (randevuIndex === -1) {
        alert('Randevu bulunamadı!');
        return;
    }

    const randevu = randevular[randevuIndex];
    randevu.durum = yeniDurum;
    
    saveRandevular(randevular);
    randevulariGoster(document.querySelector('.filter-btn.active').dataset.filter, searchInput.value);

    // E-posta bildirimi gönder
    const durumMesaji = {
        'onaylandi': 'Randevunuz onaylanmıştır.',
        'reddedildi': 'Randevunuz reddedilmiştir.',
        'iptal': 'Randevunuz iptal edilmiştir.'
    };

    const emailBody = `
        Sayın ${randevu.kullaniciAdi},
        
        ${durumMesaji[yeniDurum]}
        
        Randevu Detayları:
        Tarih: ${randevu.tarih}
        Saat: ${randevu.saat}
        Çalışma Alanı: ${randevu.calismaAlani}
        
        İyi çalışmalar dileriz.
        Kütüphane Yönetimi
    `;

    sendEmail(randevu.email, 'Randevu Durumu Güncellendi', emailBody);
}

// E-posta gönder
function sendEmail(to, subject, body) {
    Email.send({
        SecureToken: "YOUR-SECURE-TOKEN", // SMTP.js'den alınacak token
        To: to,
        From: "kutuphane@example.com",
        Subject: subject,
        Body: body
    }).then(
        message => console.log("E-posta gönderildi:", message)
    );
} 