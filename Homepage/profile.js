// profile.js

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem('shopsmart_token');
    
    // Safety check - boot them to login if trying to access without token
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const res = await fetch('http://127.0.0.1:5000/api/profile', {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        const data = await res.json();
        if (res.ok) {
            // Populate User info
            document.getElementById('profUsername').innerText = data.user.username;
            document.getElementById('profEmail').innerText = data.user.email;
            
            // Populate optional info
            if(data.user.age) document.getElementById('profAge').value = data.user.age;
            if(data.user.gender) document.getElementById('profGender').value = data.user.gender;
            if(data.user.phone) document.getElementById('profPhone').value = data.user.phone;
            
            // Loop and build History
            const historyList = document.getElementById('historyList');
            historyList.innerHTML = ''; // clear loading text

            if (data.history && data.history.length > 0) {
                data.history.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'history-item';
                    
                    const pName = document.createElement('span');
                    pName.className = 'product-name';
                    pName.innerText = item.product_name;

                    const pTime = document.createElement('span');
                    pTime.className = 'timestamp';
                    pTime.innerText = new Date(item.timestamp).toLocaleString();

                    div.appendChild(pName);
                    div.appendChild(pTime);
                    historyList.appendChild(div);
                });
            } else {
                historyList.innerHTML = '<p style="text-align: center; color: #888; font-style: italic;">No search history yet. Start finding deals!</p>';
            }
        } else {
            alert(data.error || "Failed to load profile");
            logout();
        }
    } catch (err) {
        console.error(err);
        alert("Failed to connect to backend");
    }
});

// Bound to the logout pill in the navbar
function logout() {
    localStorage.removeItem('shopsmart_token');
    localStorage.removeItem('shopsmart_username');
    window.location.href = 'index.html';
}
