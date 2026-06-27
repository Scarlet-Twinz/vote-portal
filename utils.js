/* ============================================
   UTILS.JS - Helper Functions
   ============================================ */

// ----- DATE FORMATTING -----
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

function getCurrentDateTime() {
    return new Date().toISOString();
}

// ----- ID GENERATORS -----
function generateApplicationNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return 'APP' + year + random;
}

function generateVoterID() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return 'PVC' + year + random;
}

// ----- VALIDATION -----
function validateNIN(nin) {
    nin = String(nin).trim();
    
    if (!/^\d{11}$/.test(nin)) {
        return { valid: false, message: 'NIN must be exactly 11 digits' };
    }
    
    if (new Set(nin).size === 1) {
        return { valid: false, message: 'Invalid NIN' };
    }
    
    let sequential = true;
    for (let i = 1; i < nin.length; i++) {
        if (parseInt(nin[i]) !== (parseInt(nin[i-1]) + 1) % 10) {
            sequential = false;
            break;
        }
    }
    if (sequential) {
        return { valid: false, message: 'Invalid NIN' };
    }
    
    const firstDigit = parseInt(nin[0]);
    if (firstDigit < 1 || firstDigit > 9) {
        return { valid: false, message: 'Invalid NIN' };
    }
    
    return { valid: true, message: 'Valid NIN' };
}

function validatePhone(phone) {
    return /^(0[7-9][0-1]\d{8}|[0-9]{11})$/.test(phone);
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ----- MASKING -----
function maskNIN(nin) {
    if (!nin) return 'N/A';
    if (nin.length !== 11) return nin;
    return nin.slice(0, 4) + '****' + nin.slice(-3);
}

// ----- DUPLICATE CHECKS -----
function isDuplicateNIN(nin) {
    const voters = getVoters();
    return voters.some(v => v.nin === nin);
}

function isDuplicateEmail(email) {
    const voters = getVoters();
    return voters.some(v => v.email === email);
}

function isDuplicateUsername(username) {
    const users = getUsers();
    return users.some(u => u.username === username);
}

// ----- VERIFICATION CODE FUNCTIONS -----
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function storeVerificationCode(username, code) {
    const codes = JSON.parse(localStorage.getItem('verificationCodes')) || {};
    codes[username] = {
        code: code,
        expiresAt: Date.now() + (10 * 60 * 1000)
    };
    localStorage.setItem('verificationCodes', JSON.stringify(codes));
}

function getVerificationCode(username) {
    const codes = JSON.parse(localStorage.getItem('verificationCodes')) || {};
    return codes[username] || null;
}

function verifyCode(username, enteredCode) {
    const stored = getVerificationCode(username);
    if (!stored) {
        return { success: false, message: 'No verification code found. Please register again.' };
    }
    
    if (Date.now() > stored.expiresAt) {
        localStorage.removeItem('verificationCodes');
        return { success: false, message: 'Verification code expired. Please register again.' };
    }
    
    if (stored.code !== enteredCode) {
        return { success: false, message: 'Invalid verification code!' };
    }
    
    return { success: true, message: 'Verification successful!' };
}

function clearVerificationCode(username) {
    const codes = JSON.parse(localStorage.getItem('verificationCodes')) || {};
    delete codes[username];
    localStorage.setItem('verificationCodes', JSON.stringify(codes));
}

function generateResetCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function storeResetCode(email, code) {
    const resets = JSON.parse(localStorage.getItem('resetCodes')) || {};
    resets[email] = {
        code: code,
        expiresAt: Date.now() + (15 * 60 * 1000)
    };
    localStorage.setItem('resetCodes', JSON.stringify(resets));
}

function getResetCode(email) {
    const resets = JSON.parse(localStorage.getItem('resetCodes')) || {};
    return resets[email] || null;
}

function clearResetCode(email) {
    const resets = JSON.parse(localStorage.getItem('resetCodes')) || {};
    delete resets[email];
    localStorage.setItem('resetCodes', JSON.stringify(resets));
}

function saveSecurityAnswer(username, question, answer) {
    const users = getUsers();
    const index = users.findIndex(u => u.username === username);
    if (index !== -1) {
        users[index].securityQuestion = question;
        users[index].securityAnswer = answer.toLowerCase().trim();
        saveUsers(users);
        return true;
    }
    return false;
}

function verifySecurityAnswer(username, answer) {
    const users = getUsers();
    const user = users.find(u => u.username === username);
    if (!user) return false;
    return user.securityAnswer === answer.toLowerCase().trim();
}