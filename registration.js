/* ============================================
   REGISTRATION.JS - Voter Registration Logic
   ============================================ */

function submitRegistration(formData) {
    const validation = validateRegistrationForm(formData);
    if (!validation.valid) {
        return { success: false, message: validation.message };
    }

    if (isDuplicateNIN(formData.nin)) {
        return { success: false, message: 'NIN already registered!' };
    }

    if (isDuplicateEmail(formData.email)) {
        return { success: false, message: 'Email already registered!' };
    }

    if (isDuplicateUsername(formData.username)) {
        return { success: false, message: 'Username already taken!' };
    }

    const applicationNumber = generateApplicationNumber();
    const voterId = generateVoterID();

    const voterData = {
        voterId: voterId,
        applicationNumber: applicationNumber,
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        nin: formData.nin,
        dob: formData.dob,
        gender: formData.gender,
        state: formData.state || '',
        lga: formData.lga,
        address: formData.address,
        status: 'Pending',
        createdAt: getCurrentDateTime(),
        updatedAt: getCurrentDateTime()
    };

    addVoter(voterData);

    const userResult = registerUser(
        formData.username,
        formData.password,
        formData.fullName,
        formData.email,
        'voter'
    );

    if (!userResult.success) {
        deleteVoter(voterId);
        return { success: false, message: userResult.message };
    }

    addAuditLog('VOTER_REGISTRATION', `${formData.fullName} registered with NIN ${formData.nin}`);

    return {
        success: true,
        message: 'Registration successful!',
        voterId: voterId,
        applicationNumber: applicationNumber,
        fullName: formData.fullName
    };
}

function validateRegistrationForm(data) {
    if (!data.fullName || data.fullName.trim().length < 2) {
        return { valid: false, message: 'Full name is required (min 2 characters)' };
    }

    if (!data.username || data.username.trim().length < 3) {
        return { valid: false, message: 'Username is required (min 3 characters)' };
    }

    if (!validateEmail(data.email)) {
        return { valid: false, message: 'Invalid email address!' };
    }

    if (!validatePhone(data.phone)) {
        return { valid: false, message: 'Invalid phone number! Format: 08012345678' };
    }

    if (!data.password || data.password.length < 6) {
        return { valid: false, message: 'Password must be at least 6 characters!' };
    }

    if (data.password !== data.confirmPassword) {
        return { valid: false, message: 'Passwords do not match!' };
    }

    const ninResult = validateNIN(data.nin);
    if (!ninResult.valid) {
        return { valid: false, message: ninResult.message };
    }

    if (!data.dob) {
        return { valid: false, message: 'Date of birth is required!' };
    }

    if (!data.gender) {
        return { valid: false, message: 'Gender is required!' };
    }

    if (!data.lga) {
        return { valid: false, message: 'LGA is required!' };
    }

    if (!data.address || data.address.trim().length < 5) {
        return { valid: false, message: 'Address is required (min 5 characters)' };
    }

    if (!data.terms) {
        return { valid: false, message: 'You must agree to the terms!' };
    }

    return { valid: true, message: 'Valid!' };
}

function approveRegistration(voterId, approvedBy = 'Admin') {
    const result = updateVoter(voterId, {
        status: 'Approved',
        approvedBy: approvedBy,
        approvedAt: getCurrentDateTime(),
        updatedAt: getCurrentDateTime()
    });

    if (result) {
        const voter = findVoterByID(voterId);
        addAuditLog('APPROVE_VOTER', `Voter ${voterId} (${voter?.fullName}) approved by ${approvedBy}`);
    }

    return result;
}

function rejectRegistration(voterId, reason = '', rejectedBy = 'Admin') {
    const result = updateVoter(voterId, {
        status: 'Rejected',
        rejectionReason: reason,
        rejectedBy: rejectedBy,
        rejectedAt: getCurrentDateTime(),
        updatedAt: getCurrentDateTime()
    });

    if (result) {
        const voter = findVoterByID(voterId);
        addAuditLog('REJECT_VOTER', `Voter ${voterId} (${voter?.fullName}) rejected by ${rejectedBy}. Reason: ${reason}`);
    }

    return result;
}