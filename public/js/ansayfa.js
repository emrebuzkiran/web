document.addEventListener("DOMContentLoaded", async() => {
    // Token'ı localStorage'dan alma kodunu kaldır
    const response = await fetch("http://localhost:3000/anasayfa", {
        method: "GET",
        headers: {
            // Authorization başlığı kaldırıldı
            "Content-Type": "application/json",
        },
    });

    const result = await response.json();

    if (response.ok) {
        // Korumalı rotadan başarılı bir şekilde veri geldi
        document.getElementById("protected-content").innerText = result.message;
    } else {
        alert("Access denied: " + result.message);
        window.location.href = "/";
    }
});

document.addEventListener("DOMContentLoaded", function() {
    // Log Out linkine tıklanma olayını dinleyin
    document
        .getElementById("logoutLink")
        .addEventListener("click", async function(event) {
            event.preventDefault(); // Varsayılan link davranışını engelle

            try {
                // /logout endpoint'ine POST isteği gönder
                const response = await fetch("/logout", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (response.ok) {
                    // Başarılı bir yanıt geldiğinde anasayfaya yönlendir
                    window.location.href = "/";
                } else {
                    alert("Logout failed! Please try again.");
                }
            } catch (error) {
                console.error("Logout error:", error);
                alert("An error occurred while logging out. Please try again later.");
            }
        });
});