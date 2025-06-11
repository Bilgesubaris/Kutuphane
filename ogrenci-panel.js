// DOM elementlerini seçme
const activityList = document.querySelector('.activity-list');

// Kullanıcı bilgilerini alma
function getCurrentUser() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    return user;
}

// Kullanıcı adını güncelleme
function updateUserName() {
    const user = getCurrentUser();
    if (user) {
        const welcomeText = document.querySelector('.header-title h1');
        welcomeText.textContent = `Hoş Geldin, ${user.name}`;
    }
}

// Son aktiviteleri gösterme
function showRecentActivities() {
    const user = getCurrentUser();
    if (!user) return;

    // Kullanıcının randevularını al
    const randevular = JSON.parse(localStorage.getItem('randevular')) || [];
    const userRandevular = randevular.filter(randevu => randevu.userId === user.id);

    // Kullanıcının kitap işlemlerini al (örnek olarak)
    const kitapIslemleri = JSON.parse(localStorage.getItem('kitapIslemleri')) || [];
    const userKitapIslemleri = kitapIslemleri.filter(islem => islem.userId === user.id);

    // Tüm aktiviteleri birleştir ve tarihe göre sırala
    const activities = [
        ...userRandevular.map(randevu => ({
            type: 'randevu',
            title: 'Randevu İşlemi',
            description: `${randevu.tarih} tarihinde ${randevu.saat} saatinde ${randevu.calismaAlani} için randevu oluşturuldu.`,
            time: new Date(randevu.tarih + 'T' + randevu.saat),
            status: randevu.durum
        })),
        ...userKitapIslemleri.map(islem => ({
            type: 'kitap',
            title: 'Kitap İşlemi',
            description: `${islem.kitapAdi} kitabı ${islem.islemTipi} işlemi gerçekleştirildi.`,
            time: new Date(islem.tarih)
        }))
    ].sort((a, b) => b.time - a.time);

    // Son 5 aktiviteyi göster
    const recentActivities = activities.slice(0, 5);

    // Aktivite listesini oluştur
    activityList.innerHTML = recentActivities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas ${activity.type === 'randevu' ? 'fa-calendar-alt' : 'fa-book'}"></i>
            </div>
            <div class="activity-info">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
                ${activity.status ? `<span class="activity-status ${activity.status}">${activity.status}</span>` : ''}
            </div>
            <div class="activity-time">
                ${formatDate(activity.time)}
            </div>
        </div>
    `).join('');
}

// Tarih formatını düzenleme
function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
        return 'Bugün';
    } else if (days === 1) {
        return 'Dün';
    } else if (days < 7) {
        return `${days} gün önce`;
    } else {
        return date.toLocaleDateString('tr-TR');
    }
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    updateUserName();
    showRecentActivities();
});

// Çıkış yapma işlemi
document.querySelector('.logout').addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}); 