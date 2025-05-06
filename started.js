// started.js (Barkod okuma konsepti için güncellendi)

document.addEventListener('DOMContentLoaded', () => {
    // --- HTML Elementlerini Seç ---
    const scanArea = document.getElementById('scan-area');              // Güncellendi
    const scanPlaceholder = document.querySelector('.scan-placeholder'); // Güncellendi
    const selectBarcodeButton = document.getElementById('select-barcode-button'); // Güncellendi
    const cameraButton = document.getElementById('camera-button');
    const captureButton = document.getElementById('capture-button');
    const hiddenFileInput = document.getElementById('barcode-image-input'); // Güncellendi
    const messageDiv = document.getElementById('scan-message');           // Güncellendi
    const cameraPreview = document.getElementById('camera-preview');
    const cameraCanvas = document.getElementById('camera-canvas');
    const fileNameDisplay = document.getElementById('file-name-display');
    let currentStream = null;

    // Gerekli elementlerin varlığını kontrol et
    if (!scanArea || !scanPlaceholder || !selectBarcodeButton || !cameraButton || !captureButton || !hiddenFileInput || !messageDiv || !cameraPreview || !cameraCanvas) {
        console.error("Hata: Gerekli HTML elementlerinden biri veya birkaçı 'started.html' içinde bulunamadı. ID'leri kontrol edin.");
        return;
    }

    // --- Backend URL'si ---
    // Backend'in barkod okuma için endpoint'ini varsayalım (şimdilik aynı kalsın)
    const BACKEND_URL = 'http://127.0.0.1:5000/analyze'; // VEYA '/read_barcode'

    // --- Olay Dinleyicileri ---
    scanPlaceholder.addEventListener('click', () => hiddenFileInput.click());
    selectBarcodeButton.addEventListener('click', () => hiddenFileInput.click()); // Güncellendi
    hiddenFileInput.addEventListener('change', handleFileSelect);
    cameraButton.addEventListener('click', toggleCamera);
    captureButton.addEventListener('click', capturePhoto);

    // Sürükle-Bırak
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        scanPlaceholder.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    ['dragenter', 'dragover'].forEach(eventName => {
        scanPlaceholder.addEventListener(eventName, () => scanPlaceholder.classList.add('highlight'), false);
    });
    ['dragleave', 'drop'].forEach(eventName => {
        scanPlaceholder.addEventListener(eventName, () => scanPlaceholder.classList.remove('highlight'), false);
    });
    scanPlaceholder.addEventListener('drop', handleDrop, false);

    // --- Fonksiyonlar ---
    function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }

    function handleDrop(e) {
        stopCamera();
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function handleFileSelect(event) {
        stopCamera();
        const files = event.target.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (!file.type.startsWith('image/')) {
                showMessage('Lütfen geçerli bir resim dosyası seçin.', 'error');
                clearState();
                return;
            }
            console.log('Dosya işlenecek:', file.name);
            clearState();
            if (fileNameDisplay) fileNameDisplay.textContent = `Seçilen: ${file.name}`;
            // Backend'e GÖRSEL gönderiyoruz, backend barkodu okuyacak
            uploadAndAnalyzeImage(file);
        }
    }

    async function toggleCamera() {
        if (currentStream) {
            stopCamera();
        } else {
            try {
                clearState();
                showMessage('Kamera başlatılıyor...', 'loading');
                // Mobil cihazlar için arka kamerayı tercih etmeye çalış
                const constraints = {
                    video: { facingMode: "environment" }
                };
                currentStream = await navigator.mediaDevices.getUserMedia(constraints);
                cameraPreview.srcObject = currentStream;
                cameraPreview.style.display = 'block';
                scanPlaceholder.style.display = 'none';
                captureButton.style.display = 'inline-flex';
                cameraButton.innerHTML = '<i class="fas fa-times"></i> Kamerayı Kapat';
                showMessage('', '');
            } catch (err) {
                 // Arka kamera çalışmazsa ön kamerayı dene (fallback)
                 console.warn("Arka kamera hatası, ön kamera deneniyor:", err);
                 try {
                      currentStream = await navigator.mediaDevices.getUserMedia({ video: true }); // Sadece video iste
                      cameraPreview.srcObject = currentStream;
                      cameraPreview.style.display = 'block';
                      scanPlaceholder.style.display = 'none';
                      captureButton.style.display = 'inline-flex';
                      cameraButton.innerHTML = '<i class="fas fa-times"></i> Kamerayı Kapat';
                      showMessage('', '');
                 } catch (finalErr) {
                     console.error('Ön kamera erişimi de başarısız:', finalErr);
                     showMessage('Kameraya erişilemedi. İzinleri kontrol edin.', 'error');
                     currentStream = null;
                 }
            }
        }
    }


    function stopCamera() {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
            currentStream = null;
            cameraPreview.srcObject = null;
            cameraPreview.style.display = 'none';
            scanPlaceholder.style.display = 'flex';
            captureButton.style.display = 'none';
            cameraButton.innerHTML = '<i class="fas fa-camera"></i> Kamera ile Okut'; // Metin güncellendi
            console.log("Kamera durduruldu.");
        }
    }

    function capturePhoto() {
        if (!currentStream) return;
        showMessage('Barkod okunuyor...', 'loading'); // Mesaj güncellendi
        cameraCanvas.width = cameraPreview.videoWidth;
        cameraCanvas.height = cameraPreview.videoHeight;
        const context = cameraCanvas.getContext('2d');
        context.drawImage(cameraPreview, 0, 0, cameraCanvas.width, cameraCanvas.height);

        cameraCanvas.toBlob(function(blob) {
            if (blob) {
                console.log('Fotoğraf çekildi, analiz ediliyor...');
                stopCamera();
                uploadAndAnalyzeImage(blob, 'camera-barcode-scan.jpg'); // Backend'e gönder
            } else {
                showMessage('Fotoğraf alınırken hata oluştu.', 'error');
                stopCamera();
            }
        }, 'image/jpeg', 0.9);
    }

    // Backend'e GÖRSEL YÜKLEYEN ve sonucu results.html'e yönlendiren fonksiyon
    async function uploadAndAnalyzeImage(fileOrBlob, fileName = 'barcode_image') { // Dosya adı güncellendi
        const formData = new FormData();
        // Backend hala 'imageFile' bekliyor (backend güncellenince bu değişebilir)
        formData.append('imageFile', fileOrBlob, fileOrBlob.name || fileName);

        setLoadingState(true, 'Barkodlu görsel analiz ediliyor...');
        clearStateExceptMessage();

        try {
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json(); // Backend'den gelen yanıt

            if (!response.ok) {
                console.error('Backend Hata:', data);
                throw new Error(data.error || `Sunucu hatası: ${response.status}`);
            }

            console.log('Backend Yanıtı:', data);

            // --- Yönlendirme Kısmı ---
            // Backend'den barkod verisi veya hata gelmesini bekliyoruz
            if (data.success === false && data.error) { // Backend'in hata döndürme şekli
                 throw new Error(data.error); // Hata mesajını fırlat
            } else if (data.success === true && (data.barcode_data || data.labels)) { // Başarılı yanıt (barkod veya etiket)
                 // Backend'den gelen TÜM sonucu sakla
                 localStorage.setItem('analysisResult', JSON.stringify(data));
                 showMessage('Analiz tamamlandı! Sonuç sayfasına yönlendiriliyor...', 'success');
                 setTimeout(() => {
                     window.location.href = 'results.html'; // Sonuç sayfasına git
                 }, 1000);
            } else {
                // Beklenmedik veya geçersiz yanıt
                 throw new Error("Backend'den geçerli veya beklenen formatta yanıt alınamadı.");
            }
            // --- Yönlendirme Sonu ---

        } catch (error) {
            console.error('İstek Hatası:', error);
            showMessage(`Bir hata oluştu: ${error.message}`, 'error');
            setLoadingState(false); // Hata durumunda butonları aktif et
        } finally {
             if (hiddenFileInput) hiddenFileInput.value = null; // Dosya inputunu her zaman temizle
        }
    }

     // Arayüzü yükleme/normal durumuna getiren fonksiyon
     function setLoadingState(isLoading, message = '') {
         if (isLoading) {
             selectBarcodeButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Okunuyor...'; // Metin güncellendi
             selectBarcodeButton.disabled = true;
             if(cameraButton) cameraButton.disabled = true;
             if(captureButton) captureButton.disabled = true;
             showMessage(message, 'loading');
         } else {
             selectBarcodeButton.innerHTML = '<i class="fas fa-image"></i> Resim Seç'; // Metin güncellendi
             selectBarcodeButton.disabled = false;
             if(cameraButton) cameraButton.disabled = false;
             if(captureButton) captureButton.disabled = false;
         }
     }

    // Sonuç hariç diğer durumları temizleme
    function clearState() {
        if(fileNameDisplay) fileNameDisplay.textContent = '';
        showMessage('', '');
        stopCamera();
        if(hiddenFileInput) hiddenFileInput.value = null;
    }
     // Sadece dosya adı ve inputu temizleme (mesaj kalsın diye)
     function clearStateExceptMessage() {
         if(fileNameDisplay) fileNameDisplay.textContent = '';
         if(hiddenFileInput) hiddenFileInput.value = null;
         stopCamera();
     }

    // Mesaj gösterme fonksiyonu
    function showMessage(msg, type) {
        if (messageDiv) {
             messageDiv.textContent = msg;
             messageDiv.className = `message ${type}`;
             messageDiv.style.display = msg ? 'block' : 'none';
        }
    }

}); // DOMContentLoaded Sonu