class KullaniciYonetimi {
    constructor() {
        this.kullanicilar = [
            { tip: 'admin', kullaniciAdi: 'admin', sifre: 'admin123' },
            { tip: 'kullanici', kullaniciAdi: 'user', sifre: 'user123' }
        ];
    }

    girisYap(kullaniciAdi, sifre, tip) {
        const kullanici = this.kullanicilar.find(k => 
            k.kullaniciAdi === kullaniciAdi && 
            k.sifre === sifre && 
            k.tip === tip
        );
        return kullanici !== undefined;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const kullaniciYonetimi = new KullaniciYonetimi();
    const girisForm = document.getElementById('kullaniciGirisForm');
    const sifreInput = document.getElementById('kullaniciSifre');
    const togglePassword = document.querySelector('.toggle-password');

    // Şifre göster/gizle fonksiyonu
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const type = sifreInput.getAttribute('type') === 'password' ? 'text' : 'password';
            sifreInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    // Form gönderme işlemi
    if (girisForm) {
        girisForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const kullaniciAdi = document.getElementById('kullaniciAdi').value;
            const sifre = document.getElementById('kullaniciSifre').value;
            const hatirla = document.getElementById('hatirla').checked;

            if (hatirla) {
                localStorage.setItem('hatirlanacakKullanici', kullaniciAdi);
            } else {
                localStorage.removeItem('hatirlanacakKullanici');
            }

            if (kullaniciYonetimi.girisYap(kullaniciAdi, sifre, 'kullanici')) {
                // Giriş başarılı animasyonu
                girisForm.classList.add('success');
                setTimeout(() => {
                    window.location.href = 'ogrenci-panel.html';
                }, 1000);
            } else {
                // Hata animasyonu
                girisForm.classList.add('error');
                setTimeout(() => {
                    girisForm.classList.remove('error');
                }, 500);
                alert('Hatalı kullanıcı adı veya şifre!');
            }
        });
    }

    // Hatırlanan kullanıcı adını doldur
    const hatirlanacakKullanici = localStorage.getItem('hatirlanacakKullanici');
    if (hatirlanacakKullanici) {
        document.getElementById('kullaniciAdi').value = hatirlanacakKullanici;
        document.getElementById('hatirla').checked = true;
    }
});