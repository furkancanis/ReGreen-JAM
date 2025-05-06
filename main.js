// Sayfa yüklendiğinde çalışacak kodlar
document.addEventListener('DOMContentLoaded', () => {
    console.log("EcoPick sayfası yüklendi!");

    // Düğmelere ve linklere tıklama olayları
    const signUpLink = document.querySelector('nav .nav-link');
    const signInBtn = document.querySelector('nav .btn-outline');
    const getStartedBtn = document.querySelector('.hero-text .btn-solid'); // Seçici hala doğru mu kontrol edin

    // Sign Up Linki
    if (signUpLink) {
        signUpLink.addEventListener('click', (e) => {
            console.log('Kayıt Ol linkine tıklandı.');
            // href="signup.html" zaten yönlendirir.
        });
    }

    // Sign In Düğmesi
    if (signInBtn) {
        signInBtn.addEventListener('click', (e) => {
            console.log('Giriş Yap düğmesine tıklandı.');
             // href="signin.html" zaten yönlendirir.
        });
    }

    // Başlayın Düğmesi
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', (e) => {
            // Link olduğu için preventDefault'a gerek yok, upload.html'e gidecek
            console.log('Başlayın düğmesine tıklandı, upload.html\'e gidiliyor.');
             // Eğer alert istenirse: alert('Görsel Yükleme sayfasına gidiliyor...');
        });
    }
});