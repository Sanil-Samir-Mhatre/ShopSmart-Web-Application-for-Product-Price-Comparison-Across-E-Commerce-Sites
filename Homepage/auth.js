document.addEventListener("DOMContentLoaded", () => {
    // Check if user is already logged in
    const token = localStorage.getItem('shopsmart_token');
    if (token) {
        updateNavbarUser();
    }

    const authForm = document.getElementById('authForm');
    const authToggleBtn = document.getElementById('authToggleBtn');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const usernameGroup = document.getElementById('usernameGroup');
    const authBannerTitle = document.getElementById('authBannerTitle');
    const authErrorMsg = document.getElementById('authErrorMsg');

    let isLoginMode = false; // default to register mode

    function toggleMode() {
        isLoginMode = !isLoginMode;
        authErrorMsg.innerText = '';
        if (isLoginMode) {
            authBannerTitle.innerText = "Welcome Back!";
            usernameGroup.style.display = "none";
            authSubmitBtn.innerText = "LOGIN";
            authToggleBtn.innerText = "Switch to Sign Up";
        } else {
            authBannerTitle.innerText = "Join the Smart Shoppers!";
            usernameGroup.style.display = "flex";
            authSubmitBtn.innerText = "REGISTER";
            authToggleBtn.innerText = "Switch to Login";
        }
    }

    // Initialize UI to starting state
    toggleMode();

    if(authToggleBtn) {
        authToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleMode();
        });
    }

    if(authSubmitBtn) {
        authSubmitBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            authErrorMsg.innerText = '';
            
            const email = document.getElementById('authEmail').value.trim();
            const password = document.getElementById('authPassword').value.trim();
            
            if (!email || !password) {
                authErrorMsg.innerText = 'Please fill in all fields.';
                return;
            }

            // We default age/gender/phone to null initially and let them fill it on their profile page
            const payload = { email, password };

            if (!isLoginMode) {
                const username = document.getElementById('authUsername').value.trim();
                if (!username) {
                    authErrorMsg.innerText = 'Please provide a username.';
                    return;
                }
                payload.username = username;
                payload.age = null;
                payload.gender = null;
                payload.phone = null;

                try {
                    authSubmitBtn.innerText = "Registering...";
                    const res = await fetch('http://127.0.0.1:5000/api/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const data = await res.json();
                    if (res.ok) {
                        // After successful register, auto switch to login
                        toggleMode();
                        document.getElementById('authPassword').value = '';
                        authErrorMsg.style.color = 'var(--secondary-turquoise)';
                        authErrorMsg.innerText = "Success! Please log in.";
                    } else {
                        authErrorMsg.style.color = '#ff4d4d';
                        authErrorMsg.innerText = data.error || "Registration failed.";
                    }
                } catch (err) {
                    authErrorMsg.style.color = '#ff4d4d';
                    authErrorMsg.innerText = "Server connection error.";
                } finally {
                    authSubmitBtn.innerText = "REGISTER";
                }
            } else {
                // Login
                try {
                    authSubmitBtn.innerText = "Authorizing...";
                    const res = await fetch('http://127.0.0.1:5000/api/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const data = await res.json();
                    if (res.ok) {
                        localStorage.setItem('shopsmart_token', data.token);
                        localStorage.setItem('shopsmart_username', data.user.username);
                        window.location.href = 'search.html';
                    } else {
                        authErrorMsg.style.color = '#ff4d4d';
                        authErrorMsg.innerText = data.error || "Login failed.";
                        authSubmitBtn.innerText = "LOGIN";
                    }
                } catch (err) {
                    authErrorMsg.style.color = '#ff4d4d';
                    authErrorMsg.innerText = "Server connection error.";
                    authSubmitBtn.innerText = "LOGIN";
                }
            }
        });
    }
});

function updateNavbarUser() {
    const userPillName = document.getElementById('navbarUserName');
    const username = localStorage.getItem('shopsmart_username');
    if (userPillName && username) {
        userPillName.innerText = username;
    }
}
