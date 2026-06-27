/* ============================================
   APPOINTMENT.JS - Appointment CRUD Operations
   ============================================ */

function bookAppointment(voterId, lga, date, time) {
    if (!voterId || !lga || !date || !time) {
        return { success: false, message: 'All fields are required!' };
    }

    const voter = findVoterByID(voterId);
    if (!voter) {
        return { success: false, message: 'Voter not found!' };
    }

    const existing = getVoterAppointments(voterId);
    const scheduled = existing.filter(a => a.status === 'Scheduled');

    if (scheduled.length > 0) {
        return {
            success: false,
            message: 'You already have a scheduled appointment!',
            existing: scheduled[0]
        };
    }

    const available = checkAvailability(lga, date, time);
    if (!available) {
        return { success: false, message: 'This time slot is not available!' };
    }

    const appointment = {
        id: 'app_' + Date.now(),
        voterId: voterId,
        fullName: voter.fullName,
        lga: lga,
        date: date,
        time: time,
        status: 'Scheduled',
        createdAt: getCurrentDateTime()
    };

    addAppointment(appointment);
    addAuditLog('APPOINTMENT_BOOKED', `${voter.fullName} booked appointment on ${date} at ${time}`);

    return {
        success: true,
        message: 'Appointment booked successfully!',
        appointment: appointment
    };
}

function checkAvailability(lga, date, time) {
    const appointments = getAppointments();
    const existing = appointments.filter(a =>
        a.lga === lga &&
        a.date === date &&
        a.time === time &&
        a.status === 'Scheduled'
    );
    return existing.length < 5;
}

function getVoterAppointments(voterId) {
    const appointments = getAppointments();
    return appointments.filter(a => a.voterId === voterId);
}

function cancelAppointment(appointmentId, reason = '') {
    const appointments = getAppointments();
    const index = appointments.findIndex(a => a.id === appointmentId);

    if (index === -1) {
        return { success: false, message: 'Appointment not found!' };
    }

    appointments[index].status = 'Cancelled';
    appointments[index].cancelledAt = getCurrentDateTime();
    appointments[index].cancellationReason = reason;
    saveAppointments(appointments);

    addAuditLog('APPOINTMENT_CANCELLED', `Appointment ${appointmentId} cancelled. Reason: ${reason}`);

    return { success: true, message: 'Appointment cancelled successfully!' };
}

function completeAppointment(appointmentId) {
    const appointments = getAppointments();
    const index = appointments.findIndex(a => a.id === appointmentId);

    if (index === -1) {
        return { success: false, message: 'Appointment not found!' };
    }

    if (appointments[index].status === 'Cancelled') {
        return { success: false, message: 'Cannot complete a cancelled appointment!' };
    }

    appointments[index].status = 'Completed';
    appointments[index].completedAt = getCurrentDateTime();
    saveAppointments(appointments);

    addAuditLog('APPOINTMENT_COMPLETED', `Appointment ${appointmentId} completed`);

    return { success: true, message: 'Appointment completed successfully!' };
}