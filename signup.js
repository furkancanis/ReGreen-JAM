document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const messageDiv = document.getElementById('message');

    if (signupForm) {
        signupForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const fullname = document.getElementById('fullname').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            messageDiv.textContent = '';
            messageDiv.className = 'message';

            if (!fullname || !email || !password || !confirmPassword) {
                showMessage('Lütfen tüm alanları doldurun.', 'error');
                return;
            }

            if (password.length < 6) {
                showMessage('Şifre en az 6 karakter olmalıdır.', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showMessage('Şifreler eşleşmiyor!', 'error');
                passwordInput.style.borderColor = '#ef4444';
                confirmPasswordInput.style.borderColor = '#ef4444';
                return;
            }

            // Kullanıcı bilgilerini localStorage'a kaydet
            const userData = {
                fullname: fullname,
                email: email,
                password: password // Gerçek uygulamada şifreler hash'lenmelidir
            };

            // E-posta adresi zaten kayıtlı mı kontrol et
            const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const userExists = existingUsers.some(user => user.email === email);

            if (userExists) {
                showMessage('Bu e-posta adresi zaten kayıtlı.', 'error');
                return;
            }

            // Yeni kullanıcıyı ekle
            existingUsers.push(userData);
            localStorage.setItem('users', JSON.stringify(existingUsers));

            showMessage('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...', 'success');

            // 2 saniye sonra giriş sayfasına yönlendir
            setTimeout(() => {
                window.location.href = 'signin.html';
            }, 2000);
        });
    }

    if(passwordInput) passwordInput.addEventListener('input', resetInputBorder);
    if(confirmPasswordInput) confirmPasswordInput.addEventListener('input', resetInputBorder);
});

// Şifre görünürlüğünü değiştirme fonksiyonu
function togglePasswordVisibility(inputId, iconElement) {
    const input = document.getElementById(inputId);
    const icon = iconElement.querySelector('i');
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

// Hata/Başarı mesajını gösterme fonksiyonu
function showMessage(msg, type) {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = msg;
        messageDiv.className = `message ${type}`;
    }
}

// Input kenarlık rengini sıfırlama
function resetInputBorder(event){
    event.target.style.borderColor = '#bbf7d0';
}