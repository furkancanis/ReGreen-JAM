// script-signin.js

document.addEventListener('DOMContentLoaded', () => {
    const signinForm = document.getElementById('signin-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const messageDiv = document.getElementById('message');

    if (signinForm) {
        signinForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            messageDiv.textContent = '';
            messageDiv.className = 'message';

            if (!email || !password) {
                showMessage('Lütfen e-posta ve şifrenizi girin.', 'error');
                return;
            }

            // localStorage'dan kullanıcı bilgilerini al
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(user => user.email === email && user.password === password);

            if (user) {
                // Giriş başarılı
                showMessage('Giriş başarılı! Yönlendiriliyorsunuz...', 'success');
                
                // Kullanıcı oturumunu kaydet
                localStorage.setItem('currentUser', JSON.stringify({
                    email: user.email,
                    fullname: user.fullname
                }));

                // 2 saniye sonra ana sayfaya yönlendir
                setTimeout(() => {
                    window.location.href = 'started.html';
                }, 2000);
            } else {
                showMessage('E-posta veya şifre hatalı.', 'error');
            }
        });
    }
});

// === Şifre Görünürlüğü Fonksiyonu (signup.js ile aynı) ===
function togglePasswordVisibility(inputId, iconElement) {
    const input = document.getElementById(inputId);
    const icon = iconElement.querySelector('i');
    if (!input || !icon) return;

    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}

// === Mesaj Gösterme Fonksiyonu (signup.js ile aynı) ===
function showMessage(msg, type) {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = msg;
        messageDiv.className = `message ${type}`;
    }
}