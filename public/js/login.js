document
    .getElementById("showRegisterForm")
    .addEventListener("click", function(event) {
        event.preventDefault();
        document.getElementById("loginFormDiv").style.display = "none";
        document.getElementById("registerFormDiv").style.display = "block";
    });

document
    .getElementById("showLoginForm")
    .addEventListener("click", function(event) {
        event.preventDefault();
        document.getElementById("registerFormDiv").style.display = "none";
        document.getElementById("loginFormDiv").style.display = "block";
    });

document
    .getElementById("showForgotPasswordForm")
    .addEventListener("click", function(event) {
        event.preventDefault();
        document.getElementById("loginFormDiv").style.display = "none";
        document.getElementById("forgotPasswordFormDiv").style.display = "block";
    });

// Giriş işlemi
document
    .getElementById("loginForm")
    .addEventListener("submit", async(event) => {
        event.preventDefault();
        const mail = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ mail, password }),
            });

            // Yanıt durumu
            const data = await response.json(); // Yanıtı JSON 


            if (response.ok) {
                window.location.href = data.redirectUrl;

            } else {
                console.error("Login failed:", data.message); // Hata mesajını göster
                document.getElementById("error-message").style.display = "block";
            }
        } catch (error) {
            console.error("Login error:", error);
        }
    });

// Kayıt işlemi
document
    .getElementById("registerForm")
    .addEventListener("submit", async function(event) {
        event.preventDefault();

        // Form verilerini al
        const username = document.getElementById("name").value;
        const mail = document.getElementById("email").value;
        const password = document.getElementById("password2").value;


        // POST isteği için verileri hazırla
        const registerData = { username, mail, password, role_id: 1 };



        try {
            const response = await fetch("http://localhost:3000/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(registerData),
            });

            // Yanıtı kontrol et
            if (response.ok) {
                const result = await response.json();
                window.location.href = "/"; // Giriş sayfasına yönlendirme
            } else {
                const error = await response.json();
            }
        } catch (error) {
            console.error("Registration error:", error);
            alert("An error occurred while registering. Please try again later.");
        }
    });