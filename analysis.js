// analysis.js (Barkod sonuçlarını göstermek için)

document.addEventListener('DOMContentLoaded', () => {
    // --- HTML Elementlerini Seç ---
    const resultDataContainer = document.getElementById('result-data');
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const analysisErrorMessageEl = document.getElementById('analysis-error-message');

    // Sonuçları gösterecek elementler
    const barcodeDataEl = document.getElementById('barcode-data');
    const barcodeTypeEl = document.getElementById('barcode-type');
    const productNameEl = document.getElementById('product-name'); // HTML'de ekledik
    const materialTypeEl = document.getElementById('material-type');
    const wasteCategoryEl = document.getElementById('waste-category');
    const recyclingDetailsEl = document.getElementById('recycling-details');
    // const rawLabelListEl = document.getElementById('raw-label-list'); // Şimdilik kullanmayacağız

    // Elementlerin varlığını kontrol et
    const requiredElements = [resultDataContainer, loadingState, errorState, analysisErrorMessageEl, barcodeDataEl, barcodeTypeEl, productNameEl, materialTypeEl, wasteCategoryEl, recyclingDetailsEl];
    if (requiredElements.some(el => !el)) { // Biri bile eksikse
        console.error("Hata: analysis.html içindeki gerekli sonuç elementlerinden biri veya birkaçı bulunamadı. ID'leri kontrol edin.");
        if(loadingState) loadingState.style.display = 'none';
        if(errorState) {
             analysisErrorMessageEl.textContent = "Sonuçlar görüntülenirken bir sayfa hatası oluştu.";
             errorState.style.display = 'block';
        }
        return;
    }

    // --- Veriyi Al ve İşle ---
    const storedResult = localStorage.getItem('analysisResult');
    localStorage.removeItem('analysisResult'); // Veriyi aldıktan sonra temizle!

    if (!storedResult) {
        console.error("Analiz sonucu bulunamadı (Local Storage boş veya temizlenmiş).");
        showError("Analiz sonucu bulunamadı. Lütfen tekrar deneyin.");
        return;
    }

    try {
        // Veriyi JSON'dan objeye çevir
        const resultData = JSON.parse(storedResult);
        console.log("Alınan analiz verisi:", resultData);

        // Başarılı bir sonuç mu? (Backend'den gelen yapıya göre)
        if (resultData && resultData.success === true && resultData.barcode_data) {

            // ---- VERİYİ GÖSTER ----

            // 1. Barkod Bilgisi
            barcodeDataEl.textContent = resultData.barcode_data || 'Okunamadı';
            barcodeTypeEl.textContent = resultData.barcode_type || 'Bilinmiyor';

            // 2. Ürün Adı (Backend gönderiyorsa)
            productNameEl.textContent = resultData.product_name || 'Ürün adı bulunamadı';

            // 3. Materyal ve Atık Bilgisi (Backend gönderiyorsa VEYA burada yorumlanacaksa)
            const material = resultData.material || 'Bilinmiyor'; // Backend'den gelmeli
            const wasteInfo = getWasteInfo(material); // Materyale göre bilgiyi al

            materialTypeEl.textContent = material;
            wasteCategoryEl.textContent = wasteInfo.category;
            recyclingDetailsEl.textContent = wasteInfo.details;

            // 4. Ham Etiketler (Eğer backend hala gönderiyorsa, opsiyonel)
            // if (resultData.labels && rawLabelListEl) {
            //     rawLabelListEl.innerHTML = '';
            //     resultData.labels.forEach(label => {
            //         const li = document.createElement('li');
            //         li.textContent = label.description || label;
            //         rawLabelListEl.appendChild(li);
            //     });
            //     // Ham etiket bölümünü görünür yap
            //     const rawLabelsSection = document.querySelector('.raw-labels');
            //     if(rawLabelsSection) rawLabelsSection.style.display = 'block';
            // }


            // Yükleniyor durumunu gizle, sonuçları göster
            loadingState.style.display = 'none';
            errorState.style.display = 'none';
            resultDataContainer.style.display = 'block';

        } else {
            // Başarısız veya beklenen formatta olmayan yanıt
            throw new Error(resultData.error || "Geçerli barkod verisi alınamadı.");
        }

    } catch (error) {
        console.error("Sonuç işlenirken hata:", error);
        showError(`Sonuçlar işlenirken bir hata oluştu: ${error.message}`);
    }

    // --- Yardımcı Fonksiyonlar ---

    // Hata gösterme fonksiyonu
    function showError(message) {
        loadingState.style.display = 'none';
        resultDataContainer.style.display = 'none'; // Başarılı veriyi gizle
        analysisErrorMessageEl.textContent = message;
        errorState.style.display = 'block';
    }

     // Materyal tipine göre atık bilgilerini döndüren fonksiyon (Aynı kalabilir)
     function getWasteInfo(materialType) {
        const infoMap = {
            'Plastik': { category: 'Mavi Atık Kutusu (Geri Dönüşüm)', details: 'Temiz ve kuru plastikleri (şişe, kap, ambalaj) buraya atın. Yağlı veya kirli plastikleri genel çöpe atın.' },
            'Kağıt/Karton': { category: 'Mavi Atık Kutusu (Geri Dönüşüm)', details: 'Gazete, dergi, karton kutu gibi temiz kağıtları buraya atın. Islak, yağlı kağıtlar veya peçeteler geri dönüştürülemez.' },
            'Cam': { category: 'Yeşil Atık Kutusu (Geri Dönüşüm)', details: 'Sadece cam şişe ve kavanozları buraya atın. Ampul, pencere camı, ayna veya porselen atmayın.' },
            'Metal': { category: 'Gri Atık Kutusu (Geri Dönüşüm)', details: 'İçecek kutuları, konserve kutuları gibi metal ambalajları buraya atın. Piller veya elektronik atıkları buraya atmayın.' },
            'Organik': { category: 'Kahverengi Atık Kutusu (Kompost) veya Genel Çöp', details: 'Meyve/sebze artıkları, yumurta kabukları gibi organik atıklar kompost yapılabilir. Bölgenizdeki uygulamaya göre ayrı toplayın veya genel çöpe atın.' },
            'Bilinmiyor': { category: 'Genel Çöp (Gri/Siyah Kutu)', details: 'Materyal türü belirlenemedi veya geri dönüştürülemez. Genel çöp kutusuna atın.' }
            // Diğer kategoriler eklenebilir...
        };
        // Küçük/büyük harf duyarlılığını kaldır
        const lookupKey = Object.keys(infoMap).find(key => key.toLowerCase() === materialType.toLowerCase()) || 'Bilinmiyor';
        return infoMap[lookupKey];
    }

}); // DOMContentLoaded Sonu