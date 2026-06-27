/* ============================================
   APP.JS - Main Application Controller
   ============================================ */

// ----- ON PAGE LOAD -----
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Voters Registration Portal Loaded');

    if (typeof initAuth === 'function') {
        initAuth();
    }

    updateNavigation();
});

// ----- UPDATE NAVIGATION -----
function updateNavigation() {
    const currentUser = getCurrentUser();
    const nav = document.querySelector('.navbar-nav');

    if (!nav) return;

    if (currentUser) {
        let dashboardLink = 'dashboard.html';
        if (currentUser.role === 'admin') {
            dashboardLink = 'admin.html';
        }

        nav.innerHTML = `
            <li class="nav-item"><a class="nav-link" href="${dashboardLink}">Dashboard</a></li>
            <li class="nav-item"><a class="nav-link" href="#" onclick="handleLogout()">Logout</a></li>
        `;
    } else {
        nav.innerHTML = `
            <li class="nav-item"><a class="nav-link" href="register.html">Register</a></li>
            <li class="nav-item"><a class="nav-link" href="status.html">Check Status</a></li>
            <li class="nav-item"><a class="nav-link" href="login.html">Login</a></li>
        `;
    }
}

// ----- HANDLE LOGOUT -----
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        if (typeof logoutUser === 'function') {
            logoutUser();
        } else {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        }
    }
}

// ----- SHOW NOTIFICATION -----
function showNotification(message, type = 'success') {
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };

    const div = document.createElement('div');
    div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.success};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 9999;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        font-weight: 500;
        max-width: 350px;
        animation: slideIn 0.5s ease;
    `;
    div.textContent = message;

    document.body.appendChild(div);

    setTimeout(() => {
        div.style.opacity = '0';
        div.style.transition = 'opacity 0.5s ease';
        setTimeout(() => div.remove(), 500);
    }, 4000);
}

function showError(message) {
    showNotification(message, 'error');
}

function showSuccess(message) {
    showNotification(message, 'success');
}

// ----- SLIDE IN ANIMATION -----
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);