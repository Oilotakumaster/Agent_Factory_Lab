document.addEventListener('DOMContentLoaded', () => {
    // ---- Mock Database using LocalStorage ----
    // Array of users: [{name, email, password}]
    function getUsers() {
        return JSON.parse(localStorage.getItem('nexus_users') || '[]');
    }

    function saveUser(user) {
        const users = getUsers();
        users.push(user);
        localStorage.setItem('nexus_users', JSON.stringify(users));
    }

    function findUserByEmail(email) {
        return getUsers().find(u => u.email === email);
    }

    // Session functions
    function loginSession(user) {
        localStorage.setItem('nexus_session', JSON.stringify({
            isLoggedIn: true,
            user: { name: user.name, email: user.email }
        }));
    }

    function logoutSession() {
        localStorage.removeItem('nexus_session');
    }

    // Toggle Password Visibility Logic
    const toggleBtns = document.querySelectorAll('.toggle-pwd');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const input = btn.previousElementSibling;
            const icon = btn.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // ---- Register Logic ----
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        const errorMsg = document.getElementById('auth-error');
        const successModal = document.getElementById('success-modal');
        const registerBtn = document.getElementById('register-btn');

        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            // Check if user exists
            if (findUserByEmail(email)) {
                errorMsg.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> 該電子郵件已註冊，請直接登入。';
                errorMsg.classList.remove('hidden');
                return;
            }

            errorMsg.classList.add('hidden');
            
            // Visual loading
            const originalText = registerBtn.innerHTML;
            registerBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 處理中...';
            registerBtn.disabled = true;

            setTimeout(() => {
                // Save user
                saveUser({ name, email, password });
                
                // Show success modal
                successModal.classList.remove('hidden');
                
                // Redirect to login after 2s
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            }, 1000);
        });
    }

    // ---- Login Logic ----
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const errorMsg = document.getElementById('auth-error');
        const loginBtn = document.getElementById('login-btn');

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            // Simple validation
            const user = findUserByEmail(email);

            if (!user || user.password !== password) {
                errorMsg.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> 找不到帳號，或是密碼輸入錯誤。';
                errorMsg.classList.remove('hidden');
                // Shake animation
                loginForm.classList.remove('shake');
                void loginForm.offsetWidth; // trigger reflow
                loginForm.classList.add('shake');
                return;
            }

            errorMsg.classList.add('hidden');
            
            // Visual loading
            loginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 登入中...';
            loginBtn.disabled = true;

            setTimeout(() => {
                loginSession(user);
                window.location.href = 'dashboard.html';
            }, 800);
        });
    }

    // ---- Dashboard Logout Logic ----
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logoutSession();
            window.location.href = 'index.html';
        });
    }
});
