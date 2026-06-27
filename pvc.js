/* ============================================
   PVC.JS - Permanent Voter Card Generation
   ============================================ */

function generatePVC(voterId) {
    const voter = findVoterByID(voterId);

    if (!voter) {
        return { success: false, message: 'Voter not found!' };
    }

    if (voter.status !== 'Approved' && voter.status !== 'Active') {
        return {
            success: false,
            message: 'Voter registration is not approved yet! Status: ' + voter.status
        };
    }

    const pvcData = {
        voterId: voter.voterId,
        fullName: voter.fullName,
        photo: voter.photo || null,
        dob: voter.dob,
        lga: voter.lga || 'N/A',
        pollingUnit: voter.pollingUnit || 'Unit A',
        serialNumber: generateSerialNumber(),
        qrData: JSON.stringify({
            id: voter.voterId,
            name: voter.fullName,
            nin: voter.nin
        }),
        issuedAt: getCurrentDateTime()
    };

    localStorage.setItem('pvc_' + voterId, JSON.stringify(pvcData));
    addAuditLog('PVC_GENERATED', `PVC generated for ${voter.fullName} (${voterId})`);

    return { success: true, pvc: pvcData };
}

function getPVC(voterId) {
    const data = localStorage.getItem('pvc_' + voterId);

    if (!data) {
        return { success: false, message: 'PVC not found!' };
    }

    return { success: true, pvc: JSON.parse(data) };
}

function regeneratePVC(voterId) {
    localStorage.removeItem('pvc_' + voterId);
    return generatePVC(voterId);
}

function validatePVC(voterId, serialNumber) {
    const pvcData = localStorage.getItem('pvc_' + voterId);

    if (!pvcData) {
        return { valid: false, message: 'PVC not found!' };
    }

    const pvc = JSON.parse(pvcData);

    if (pvc.serialNumber !== serialNumber) {
        return { valid: false, message: 'Invalid serial number!' };
    }

    return { valid: true, message: 'PVC is valid!' };
}

function generateSerialNumber() {
    return 'PVC' + Date.now().toString().slice(-10);
}