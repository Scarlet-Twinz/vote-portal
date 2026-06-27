/* ============================================
   DATABASE.JS - Local Storage Operations
   ============================================ */

// ----- VOTERS -----
function getVoters() {
    return JSON.parse(localStorage.getItem('voters')) || [];
}

function saveVoters(voters) {
    localStorage.setItem('voters', JSON.stringify(voters));
}

function addVoter(voterData) {
    const voters = getVoters();
    voters.push(voterData);
    saveVoters(voters);
    return voterData;
}

function findVoterByNIN(nin) {
    const voters = getVoters();
    return voters.find(v => v.nin === nin);
}

function findVoterByID(voterId) {
    const voters = getVoters();
    return voters.find(v => v.voterId === voterId);
}

function findVoterByApplication(appNumber) {
    const voters = getVoters();
    return voters.find(v => v.applicationNumber === appNumber);
}

function updateVoter(voterId, updatedData) {
    const voters = getVoters();
    const index = voters.findIndex(v => v.voterId === voterId);
    if (index !== -1) {
        voters[index] = { ...voters[index], ...updatedData };
        saveVoters(voters);
        return true;
    }
    return false;
}

function deleteVoter(voterId) {
    const voters = getVoters();
    const filtered = voters.filter(v => v.voterId !== voterId);
    saveVoters(filtered);
}

function getVoterStats() {
    const voters = getVoters();
    return {
        total: voters.length,
        pending: voters.filter(v => v.status === 'Pending').length,
        approved: voters.filter(v => v.status === 'Approved').length,
        rejected: voters.filter(v => v.status === 'Rejected').length,
        active: voters.filter(v => v.status === 'Active').length
    };
}

// ----- APPOINTMENTS -----
function getAppointments() {
    return JSON.parse(localStorage.getItem('appointments')) || [];
}

function saveAppointments(appointments) {
    localStorage.setItem('appointments', JSON.stringify(appointments));
}

function addAppointment(appointmentData) {
    const appointments = getAppointments();
    appointments.push(appointmentData);
    saveAppointments(appointments);
    return appointmentData;
}

// ----- AUDIT LOGS -----
function getAuditLogs() {
    return JSON.parse(localStorage.getItem('auditLogs')) || [];
}

function saveAuditLogs(logs) {
    localStorage.setItem('auditLogs', JSON.stringify(logs));
}

function addAuditLog(action, details, user = 'System') {
    const logs = getAuditLogs();
    logs.push({
        id: 'log_' + Date.now(),
        user: user,
        action: action,
        details: details,
        timestamp: new Date().toISOString()
    });
    saveAuditLogs(logs);
}

// ----- POLLING UNITS -----
function getPollingUnits() {
    return JSON.parse(localStorage.getItem('pollingUnits')) || [
        { id: 'PU001', name: 'Unit A', lga: 'Alimosho', address: '123 Main St' },
        { id: 'PU002', name: 'Unit B', lga: 'Alimosho', address: '456 Oak Ave' },
        { id: 'PU003', name: 'Unit C', lga: 'Ikeja', address: '789 Pine Rd' },
        { id: 'PU004', name: 'Unit D', lga: 'Ikeja', address: '321 Elm Blvd' }
    ];
}

// ----- LGAs -----
function getLGAList() {
    return [
        'Alimosho', 'Ajeromi-Ifelodun', 'Kosofe', 'Mushin',
        'Oshodi-Isolo', 'Shomolu', 'Agege', 'Ifako-Ijaiye',
        'Surulere', 'Lagos Island', 'Lagos Mainland', 'Apapa',
        'Eti-Osa', 'Ikeja', 'Ikorodu', 'Badagry'
    ];
}

function clearAllData() {
    localStorage.removeItem('voters');
    localStorage.removeItem('appointments');
    localStorage.removeItem('auditLogs');
    addAuditLog('CLEAR_DATA', 'All data cleared by admin');
}