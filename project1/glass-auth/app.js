import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

// Firebase 設定
const firebaseConfig = {
    apiKey: "AIzaSyBNHa6J-egik2oCCVGL_69dWjjs2fUi9vc",
    authDomain: "agent-test-1f498.firebaseapp.com",
    projectId: "agent-test-1f498",
    storageBucket: "agent-test-1f498.firebasestorage.app",
    messagingSenderId: "246957834427",
    appId: "1:246957834427:web:aa4a5c7e8f11271ed5e99e",
    measurementId: "G-G56X31416K"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const formWrapper = document.getElementById('form-wrapper');
    const toRegisterBtn = document.getElementById('to-register');
    const toLoginBtn = document.getElementById('to-login');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // Toggle Form visibility
    toRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        formWrapper.classList.remove('login-active');
        formWrapper.classList.add('register-active');
        document.getElementById('login-error').innerText = '';
        document.getElementById('reg-error').innerText = '';
    });
    
    toLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        formWrapper.classList.remove('register-active');
        formWrapper.classList.add('login-active');
        document.getElementById('login-error').innerText = '';
        document.getElementById('reg-error').innerText = '';
    });

    // Password Toggle functionality
    const togglePwds = document.querySelectorAll('.toggle-pwd');
    togglePwds.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const input = toggle.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                toggle.classList.remove('fa-eye');
                toggle.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                toggle.classList.remove('fa-eye-slash');
                toggle.classList.add('fa-eye');
            }
        });
    });

    // Shake Error Animation Helper
    function triggerError(element, messageDiv, message) {
        messageDiv.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;
        element.classList.remove('shake');
        void element.offsetWidth; // trigger reflow
        element.classList.add('shake');
    }

    // 翻譯 Firebase 錯誤碼讓使用者看懂
    function translateError(error) {
        switch (error.code) {
            case 'auth/email-already-in-use': return '此信箱已被註冊';
            case 'auth/invalid-email': return '信箱格式不正確';
            case 'auth/weak-password': return '密碼太弱（至少需要 6 個字元）';
            case 'auth/invalid-credential': return '帳號或密碼錯誤';
            case 'auth/popup-closed-by-user': return 'Google 登入視窗已被關閉';
            case 'auth/operation-not-supported-in-this-environment': 
                return '環境錯誤：Google 登入不支援 file:// 直接開啟，請使用 Live Server 或 http:// localhost 開啟';
            default: return `錯誤：${error.message}`;
        }
    }

    // --- 真實 Email 註冊邏輯 ---
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const errorDiv = document.getElementById('reg-error');
        const regBtn = document.getElementById('reg-btn');

        errorDiv.innerText = '';
        const originalText = regBtn.innerHTML;
        regBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> <span>建立中...</span>';
        regBtn.disabled = true;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // 更新 Firebase Profile 裡的顯示名稱
            await updateProfile(userCredential.user, { displayName: name });
            
            document.getElementById('success-modal').classList.remove('hidden');
            setTimeout(() => {
                document.getElementById('success-modal').classList.add('hidden');
                regBtn.innerHTML = originalText;
                regBtn.disabled = false;
                registerForm.reset();
                
                // 切換回登入畫面並自動填入信箱
                formWrapper.classList.remove('register-active');
                formWrapper.classList.add('login-active');
                document.getElementById('login-email').value = email;
            }, 2000);
        } catch (error) {
            triggerError(registerForm, errorDiv, translateError(error));
            regBtn.innerHTML = originalText;
            regBtn.disabled = false;
        }
    });

    // --- 真實 Email 登入邏輯 ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const errorDiv = document.getElementById('login-error');
        const loginBtn = document.getElementById('login-btn');

        errorDiv.innerText = '';
        const originalText = loginBtn.innerHTML;
        loginBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> <span>驗證中...</span>';
        loginBtn.disabled = true;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            
            loginBtn.innerHTML = '<i class="fa-solid fa-check"></i> <span>登入成功！</span>';
            setTimeout(() => {
                window.location.href = '../memory-game/index.html';
            }, 800);
        } catch (error) {
            triggerError(loginForm, errorDiv, translateError(error));
            loginBtn.innerHTML = originalText;
            loginBtn.disabled = false;
        }
    });

    // --- 真實 Google 登入邏輯 ---
    const googleLoginBtn = document.getElementById('google-login');
    const googleRegBtn = document.getElementById('google-register');

    async function handleGoogleAuth(btn, errorDivId, formElement) {
        const errorDiv = document.getElementById(errorDivId);
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> <span>請在彈出視窗中授權...</span>';
        btn.disabled = true;

        try {
            const result = await signInWithPopup(auth, googleProvider);
            // 登入成功
            btn.innerHTML = '<i class="fa-solid fa-check"></i> <span>Google 驗證成功！</span>';
            setTimeout(() => {
                window.location.href = '../memory-game/index.html';
            }, 800);
        } catch (error) {
            triggerError(formElement, errorDiv, translateError(error));
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => handleGoogleAuth(googleLoginBtn, 'login-error', loginForm));
    }
    if (googleRegBtn) {
        googleRegBtn.addEventListener('click', () => handleGoogleAuth(googleRegBtn, 'reg-error', registerForm));
    }
});
