document.addEventListener('DOMContentLoaded', () => {
    const sourceText = document.getElementById('source-text');
    const targetText = document.getElementById('target-text');
    const sourceLang = document.getElementById('source-lang');
    const targetLang = document.getElementById('target-lang');
    
    const translateBtn = document.getElementById('translate-btn');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');
    const swapBtn = document.getElementById('swap-btn');
    
    const charCurrent = document.getElementById('char-current');
    const loadingOverlay = document.getElementById('loading');
    const toast = document.getElementById('toast');
    
    // Modal Elements
    const infoModal = document.getElementById('info-modal');
    const infoBtn = document.getElementById('info-btn');
    const closeInfoBtn = document.getElementById('close-info-btn');

    const MAX_CHARS = 5000; 

    // View Info logic
    infoBtn.addEventListener('click', () => {
        infoModal.classList.remove('hidden');
    });

    closeInfoBtn.addEventListener('click', () => {
        infoModal.classList.add('hidden');
    });

    // Close modal when clicking outside content
    infoModal.addEventListener('click', (e) => {
        if (e.target === infoModal) {
            infoModal.classList.add('hidden');
        }
    });

    // Character countdown
    sourceText.addEventListener('input', () => {
        let text = sourceText.value;
        if (text.length > MAX_CHARS) {
            sourceText.value = text.substring(0, MAX_CHARS);
            text = sourceText.value;
        }
        charCurrent.textContent = text.length;
    });

    // Clear contents
    clearBtn.addEventListener('click', () => {
        sourceText.value = '';
        targetText.value = '';
        charCurrent.textContent = '0';
        sourceText.focus();
    });

    // Swap languages
    swapBtn.addEventListener('click', () => {
        if (sourceLang.value === 'Autodetect') {
            sourceLang.value = 'en'; 
        }
        const tempLang = sourceLang.value;
        sourceLang.value = targetLang.value;
        targetLang.value = tempLang;

        if (targetText.value) {
            const tempText = sourceText.value;
            sourceText.value = targetText.value;
            targetText.value = tempText;
            charCurrent.textContent = sourceText.value.length;
        }
    });

    // Copy to clipboard
    copyBtn.addEventListener('click', () => {
        if (!targetText.value) return;
        
        navigator.clipboard.writeText(targetText.value).then(() => {
            showToast('已複製翻譯結果！');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            showToast('複製失敗！');
        });
    });

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }

    async function performTranslation() {
        const textToTranslate = sourceText.value.trim();
        if (!textToTranslate) return;

        const src = sourceLang.value;
        const tgt = targetLang.value;
        
        translateBtn.disabled = true;
        loadingOverlay.classList.remove('hidden');

        try {
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textToTranslate, src, tgt })
            });
            
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Network response error');
            }

            const data = await response.json();
            targetText.value = data.translatedText;
        } catch (error) {
            console.error('Translation error:', error);
            targetText.value = '翻譯發生錯誤，請稍後再試。';
        } finally {
            translateBtn.disabled = false;
            loadingOverlay.classList.add('hidden');
        }
    }

    translateBtn.addEventListener('click', performTranslation);

    sourceText.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            performTranslation();
        }
    });
});
