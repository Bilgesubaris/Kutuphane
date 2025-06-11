// DOM elementlerini seç
const randevuForm = document.querySelector('.randevu-form');
const randevuCards = document.querySelector('.randevu-cards');
const filterButtons = document.querySelectorAll('.filter-btn');

// Kullanıcı kontrolü
function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    if (!userData) {
        return {
            id: Date.now(),
            name: 'Misafir Kullanıcı'
        };
    }
    try {
        const user = JSON.parse(userData);
        return user || {
            id: Date.now(),
            name: 'Misafir Kullanıcı'
        };
    } catch (error) {
        return {
            id: Date.now(),
            name: 'Misafir Kullanıcı'
        };
    }
}

// Randevuları localStorage'dan al
function getRandevular() {
    const randevular = localStorage.getItem('randevular');
    return randevular ? JSON.parse(randevular) : [];
}

// Randevuları localStorage'a kaydet
function saveRandevular(randevular) {
    localStorage.setItem('randevular', JSON.stringify(randevular));
}

// E-posta gönderme fonksiyonu
function sendEmail(email, randevu) {
    const emailBody = `
        Sayın ${randevu.kullaniciAdi},
        
        Randevunuz başarıyla oluşturuldu.
        
        Randevu Detayları:
        Tarih: ${randevu.tarih}
        Saat: ${randevu.saat}
        Çalışma Alanı: ${randevu.calismaAlani}
        Durum: ${randevu.durum}
        
        Randevunuzla ilgili herhangi bir değişiklik olduğunda size bilgi verilecektir.
        
        İyi çalışmalar dileriz.
        Kütüphane Yönetim Sistemi
    `;

    Email.send({
        SecureToken: "YOUR_SMTP_SECURE_TOKEN", // SMTP.js'den alınacak token
        To: email,
        From: "kutuphane@example.com",
        Subject: "Kütüphane Randevu Onayı",
        Body: emailBody
    }).then(
        message => console.log("E-posta gönderildi:", message)
    );
}

// Randevu oluştur
function randevuOlustur(e) {
    e.preventDefault();
    
    const user = getCurrentUser();
    const formData = new FormData(randevuForm);
    const randevu = {
        id: Date.now(),
        kullaniciId: user.id,
        kullaniciAdi: user.name,
        tarih: formData.get('tarih'),
        saat: formData.get('saat'),
        calismaAlani: formData.get('calismaAlani'),
        email: formData.get('email'),
        notlar: formData.get('notlar'),
        durum: 'beklemede',
        olusturmaTarihi: new Date().toISOString()
    };

    const randevular = getRandevular();
    randevular.push(randevu);
    saveRandevular(randevular);

    // E-posta gönder
    sendEmail(randevu.email, randevu);

    // Formu temizle
    randevuForm.reset();

    // Randevuları göster
    randevulariGoster();

    // Başarı mesajı göster
    alert('Randevunuz başarıyla oluşturuldu. E-posta adresinize bilgilendirme gönderilecektir.');
}

// Randevuları göster
function randevulariGoster(filter = 'tumu') {
    const randevular = getRandevular();
    const today = new Date().toISOString().split('T')[0];
    const currentUser = getCurrentUser();

    let filteredRandevular = randevular;
    if (filter === 'bugun') {
        filteredRandevular = randevular.filter(r => r.tarih === today);
    } else if (filter === 'gelecek') {
        filteredRandevular = randevular.filter(r => r.tarih > today);
    } else if (filter === 'gecmis') {
        filteredRandevular = randevular.filter(r => r.tarih < today);
    }

    // Randevuları tarihe göre sırala (en yeniden en eskiye)
    filteredRandevular.sort((a, b) => new Date(b.olusturmaTarihi) - new Date(a.olusturmaTarihi));

    randevuCards.innerHTML = filteredRandevular.length ? filteredRandevular.map(randevu => `
        <div class="randevu-card">
            <div class="randevu-header">
                <h4>${randevu.calismaAlani}</h4>
                <span class="durum ${randevu.durum}">${randevu.durum}</span>
            </div>
            <div class="randevu-body">
                <p><i class="fas fa-user"></i> ${randevu.kullaniciAdi}</p>
                <p><i class="fas fa-calendar"></i> ${randevu.tarih}</p>
                <p><i class="fas fa-clock"></i> ${randevu.saat}</p>
                <p><i class="fas fa-envelope"></i> ${randevu.email}</p>
                ${randevu.notlar ? `<p><i class="fas fa-sticky-note"></i> ${randevu.notlar}</p>` : ''}
            </div>
            ${randevu.durum === 'beklemede' && randevu.kullaniciId === currentUser.id ? `
                <div class="randevu-footer">
                    <button class="btn-danger" onclick="randevuIptal(${randevu.id})">İptal Et</button>
                </div>
            ` : ''}
        </div>
    `).join('') : '<p class="no-randevu">Henüz randevu bulunmamaktadır.</p>';
}

// Randevu iptal et
function randevuIptal(randevuId) {
    const currentUser = getCurrentUser();
    const randevular = getRandevular();
    const randevuIndex = randevular.findIndex(r => r.id === randevuId);
    
    if (randevuIndex === -1) {
        alert('Randevu bulunamadı!');
        return;
    }

    const randevu = randevular[randevuIndex];
    
    // Sadece randevuyu oluşturan kişi iptal edebilir
    if (randevu.kullaniciId !== currentUser.id) {
        alert('Bu randevuyu sadece oluşturan kişi iptal edebilir!');
        return;
    }

    if (!confirm('Randevuyu iptal etmek istediğinizden emin misiniz?')) return;

    randevular[randevuIndex].durum = 'iptal';
    saveRandevular(randevular);
    
    // İptal e-postası gönder
    sendEmail(randevu.email, {
        ...randevu,
        durum: 'İptal Edildi'
    });
    
    randevulariGoster();
    alert('Randevu başarıyla iptal edildi.');
}

// Event Listeners
randevuForm.addEventListener('submit', randevuOlustur);

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        randevulariGoster(button.dataset.filter);
    });
});

// Sayfa yüklendiğinde randevuları göster
document.addEventListener('DOMContentLoaded', () => {
    randevulariGoster();
});
