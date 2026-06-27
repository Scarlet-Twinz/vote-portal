/* ============================================
   AUTH.JS - Authentication System
   ============================================ */

// ----- USERS -----
function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// ----- PASSWORD HASHING -----
function hashPassword(password) {
    return btoa(password + 'voterportal_salt_2026');
}

function verifyPassword(inputPassword, storedPassword) {
    return hashPassword(inputPassword) === storedPassword;
}

// ----- INIT: Create default users -----
function initAuth() {
    const users = getUsers();
    if (users.length === 0) {
        const defaultUsers = [
            {
                id: 'user_001',
                username: 'admin',
                password: hashPassword('admin123'),
                fullName: 'System Administrator',
                email: 'admin@voters.com',
                role: 'admin',
                status: 'ACTIVE',
                createdAt: new Date().toISOString()
            },
            {
                id: 'user_002',
                username: 'officer',
                password: hashPassword('officer123'),
                fullName: 'Registration Officer',
                email: 'officer@voters.com',
                role: 'officer',
                status: 'ACTIVE',
                createdAt: new Date().toISOString()
            },
            {
                id: 'user_003',
                username: 'voter',
                password: hashPassword('voter123'),
                fullName: 'Test Voter',
                email: 'voter@voters.com',
                role: 'voter',
                status: 'ACTIVE',
                createdAt: new Date().toISOString()
            }
        ];
        saveUsers(defaultUsers);
        console.log('✅ Default users created!');
        addAuditLog('INIT', 'System initialized with default users');
    }
}

// ----- REGISTER USER -----
function registerUser(username, password, fullName, email, role = 'voter') {
    const users = getUsers();
    
    if (users.find(u => u.username === username)) {
        return { success: false, message: 'Username already exists!' };
    }
    
    if (users.find(u => u.email === email)) {
        return { success: false, message: 'Email already registered!' };
    }
    
    const verificationCode = generateVerificationCode();
    
    const newUser = {
        id: 'user_' + Date.now(),
        username: username,
        password: hashPassword(password),
        fullName: fullName,
        email: email,
        role: role,
        status: 'PENDING',
        verificationCode: verificationCode,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    storeVerificationCode(username, verificationCode);
    addAuditLog('REGISTER', `${username} registered (PENDING)`);
    
    return {
        success: true,
        message: 'Registration successful! Please verify your account.',
        verificationCode: verificationCode,
        username: username,
        user: {
            id: newUser.id,
            username: newUser.username,
            fullName: newUser.fullName,
            role: newUser.role,
            status: 'PENDING'
        }
    };
}

// ----- VERIFY ACCOUNT -----
function verifyAccount(username, enteredCode) {
    const result = verifyCode(username, enteredCode);
    
    if (result.success) {
        const users = getUsers();
        const index = users.findIndex(u => u.username === username);
        if (index !== -1) {
            users[index].status = 'ACTIVE';
            users[index].verifiedAt = new Date().toISOString();
            saveUsers(users);
            clearVerificationCode(username);
            addAuditLog('VERIFY', `${username} verified account`);
        }
    }
    
    return result;
}

// ----- LOGIN USER -----
function loginUser(username, password) {
    const users = getUsers();
    const user = users.find(u => u.username === username);
    
    if (!user) {
        return { success: false, message: 'User not found!' };
    }
    
    if (user.status === 'PENDING') {
        return {
            success: false,
            message: 'Account not verified! Please verify your account first.',
            requiresVerification: true,
            username: username
        };
    }
    
    if (user.status === 'BLOCKED') {
        return { success: false, message: 'Account blocked! Contact admin.' };
    }
    
    if (!verifyPassword(password, user.password)) {
        return { success: false, message: 'Incorrect password!' };
    }
    
    const sessionUser = {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status
    };
    
    localStorage.setItem('currentUser', JSON.stringify(sessionUser));
    addAuditLog('LOGIN', `${username} logged in`);
    
    return {
        success: true,
        message: 'Login successful!',
        user: sessionUser
    };
}

// ----- FORGOT PASSWORD -----
function requestPasswordReset(email) {
    const users = getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
        return { success: false, message: 'Email not found!' };
    }
    
    const resetCode = generateResetCode();
    storeResetCode(email, resetCode);
    const securityQuestion = user.securityQuestion || 'What is your date of birth? (YYYY-MM-DD)';
    
    return {
        success: true,
        message: 'Reset code generated!',
        resetCode: resetCode,
        email: email,
        username: user.username,
        securityQuestion: securityQuestion
    };
}

function verifySecurityAndReset(email, securityAnswer, newPassword) {
    const users = getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
        return { success: false, message: 'User not found!' };
    }
    
    if (!verifySecurityAnswer(user.username, securityAnswer)) {
        return { success: false, message: 'Security answer is incorrect!' };
    }
    
    const resetData = getResetCode(email);
    if (!resetData) {
        return { success: false, message: 'No reset request found. Please request again.' };
    }
    
    if (Date.now() > resetData.expiresAt) {
        clearResetCode(email);
        return { success: false, message: 'Reset code expired. Please request again.' };
    }
    
    const index = users.findIndex(u => u.id === user.id);
    users[index].password = hashPassword(newPassword);
    users[index].updatedAt = new Date().toISOString();
    saveUsers(users);
    clearResetCode(email);
    addAuditLog('PASSWORD_RESET', `${user.username} reset password`);
    
    return { success: true, message: 'Password reset successful! You can now login.' };
}

function setSecurityQuestion(username, question, answer) {
    return saveSecurityAnswer(username, question, answer);
}

// ----- LOGOUT -----
function logoutUser() {
    const current = getCurrentUser();
    if (current) {
        addAuditLog('LOGOUT', `${current.username} logged out`);
    }
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// ----- GET CURRENT USER -----
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

function hasRole(requiredRole) {
    const user = getCurrentUser();
    if (!user) return false;
    if (Array.isArray(requiredRole)) {
        return requiredRole.includes(user.role);
    }
    return user.role === requiredRole;
}

function deleteUser(userId) {
    const users = getUsers();
    const filtered = users.filter(u => u.id !== userId);
    if (filtered.length === users.length) {
        return { success: false, message: 'User not found!' };
    }
    saveUsers(filtered);
    addAuditLog('DELETE_USER', `User ${userId} deleted`);
    return { success: true, message: 'User deleted!' };
}