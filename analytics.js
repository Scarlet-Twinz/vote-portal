/* ============================================
   ANALYTICS.JS - Charts, Stats & Reports
   ============================================ */

let chartInstances = {};

function getCompleteStats() {
    const voters = getVoters();
    const users = getUsers();
    const appointments = getAppointments();

    const ageGroups = {
        '18-25': 0,
        '26-35': 0,
        '36-50': 0,
        '51-65': 0,
        '65+': 0
    };

    voters.forEach(v => {
        if (v.dob) {
            const age = calculateAge(v.dob);
            if (age >= 18 && age <= 25) ageGroups['18-25']++;
            else if (age >= 26 && age <= 35) ageGroups['26-35']++;
            else if (age >= 36 && age <= 50) ageGroups['36-50']++;
            else if (age >= 51 && age <= 65) ageGroups['51-65']++;
            else if (age > 65) ageGroups['65+']++;
        }
    });

    const gender = { Male: 0, Female: 0, Other: 0 };
    voters.forEach(v => {
        if (v.gender) {
            gender[v.gender] = (gender[v.gender] || 0) + 1;
        }
    });

    const lgaDistribution = {};
    voters.forEach(v => {
        if (v.lga) {
            lgaDistribution[v.lga] = (lgaDistribution[v.lga] || 0) + 1;
        }
    });

    const statusDistribution = {
        Pending: 0,
        Approved: 0,
        Rejected: 0,
        Active: 0
    };
    voters.forEach(v => {
        if (v.status) {
            statusDistribution[v.status] = (statusDistribution[v.status] || 0) + 1;
        }
    });

    const dailyTrends = {};
    voters.forEach(v => {
        if (v.createdAt) {
            const date = v.createdAt.split('T')[0];
            dailyTrends[date] = (dailyTrends[date] || 0) + 1;
        }
    });

    return {
        totalVoters: voters.length,
        totalUsers: users.length,
        totalAppointments: appointments.length,
        pendingAppointments: appointments.filter(a => a.status === 'Scheduled').length,
        ageGroups: ageGroups,
        gender: gender,
        lgaDistribution: lgaDistribution,
        statusDistribution: statusDistribution,
        dailyTrends: dailyTrends,
        recentActivity: getAuditLogs().slice(-10).reverse()
    };
}

function calculateAge(dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function createStatusChart(canvasId, stats) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }

    const labels = Object.keys(stats.statusDistribution);
    const data = Object.values(stats.statusDistribution);
    const colors = ['#ffc107', '#28a745', '#dc3545', '#0d6efd'];

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, data.length),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function createLGABarChart(canvasId, stats) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }

    const labels = Object.keys(stats.lgaDistribution);
    const data = Object.values(stats.lgaDistribution);

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.length > 0 ? labels : ['No Data'],
            datasets: [{
                label: 'Voters per LGA',
                data: data.length > 0 ? data : [0],
                backgroundColor: 'rgba(13, 110, 253, 0.6)',
                borderColor: '#0d6efd',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function createDailyTrendChart(canvasId, stats) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }

    const sortedDates = Object.keys(stats.dailyTrends).sort();
    const labels = sortedDates.map(d => formatDate(d));
    const data = sortedDates.map(d => stats.dailyTrends[d]);

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.length > 0 ? labels : ['No Data'],
            datasets: [{
                label: 'Registrations per Day',
                data: data.length > 0 ? data : [0],
                borderColor: '#0d6efd',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function createGenderChart(canvasId, stats) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }

    const labels = Object.keys(stats.gender);
    const data = Object.values(stats.gender);
    const colors = ['#0d6efd', '#dc3545', '#6c757d'];

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data.length > 0 ? data : [0],
                backgroundColor: colors.slice(0, data.length || 1),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}