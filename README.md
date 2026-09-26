#  Voter Registration Portal

A browser-based voter registration portal built with HTML, CSS, and JavaScript. The project demonstrates a multi-page voter workflow with registration, authentication, voter records, appointments, PVC-related interfaces, administration, analytics, and browser-side persistence.

> **Project scope:** This is a front-end demonstration project. Application data and authentication state are handled in the browser with `localStorage`; it is not a production electoral system or secure government identity platform.

## Features

- Voter registration workflow
- Login and account management
- Role-based interfaces for voter, officer, and administrator workflows
- Voter dashboard and admin dashboard
- Registration statistics and analytics
- Appointment management
- PVC-related interface
- Biometric workflow interface
- Voter record lookup and status handling
- Audit logging
- Browser-side data persistence with `localStorage`
- Responsive Bootstrap-based interface

## How It Works

The application is organized as a set of HTML pages with JavaScript modules for shared behavior and data handling. The main modules include:

- `database.js` — stores and retrieves voter, appointment, audit-log, and polling-unit data from `localStorage`.
- `auth.js` — handles demo users, login, registration, roles, sessions, and account-related flows.
- `app.js` — provides shared application behavior and UI helpers.
- `registration.js` — supports the voter registration workflow.
- `appointment.js` — handles appointment interactions.
- `analytics.js` — provides registration analytics behavior.
- `biometric.js` — supports the biometric workflow interface.
- `pvc.js` — supports the PVC-related interface.

## Main Pages

- `index.html` — portal home and registration statistics
- `register.html` — voter registration
- `login.html` — authentication
- `dashboard.html` — user dashboard
- `admin.html` — administration interface
- `appointment.html` — appointment workflow
- `pvc.html` — PVC-related workflow

## Tech Stack

- HTML5
- CSS3
- JavaScript
- Bootstrap 5.3
- Font Awesome 6
- Browser `localStorage`

## Project Structure

```text
vote-portal/
├── index.html
├── register.html
├── login.html
├── dashboard.html
├── admin.html
├── appointment.html
├── pvc.html
├── app.js
├── auth.js
├── database.js
├── registration.js
├── appointment.js
├── analytics.js
├── biometric.js
└── pvc.js
```

## Running Locally

No package installation or backend server is required by the current browser-based implementation.

1. Clone the repository.
2. Open `index.html` in a modern browser.
3. Navigate through the registration, login, dashboard, appointment, PVC, and administration pages.

The pages load Bootstrap and Font Awesome from CDNs, so an internet connection may be required for those external assets.

## Data and Security Notes

This project is intended for learning and portfolio demonstration. It uses browser `localStorage` instead of a server-side database and authentication service. It should not be used to store real voter information or credentials. Client-side authentication and simulated biometric/PVC workflows do not provide the security guarantees required for a real electoral system.

## Author

**Anthony Emmanuella Mmasinachi**

**GitHub Repository:** https://github.com/Scarlet-Twinz/vote-portal

## Project Links

- **Repository:** https://github.com/Scarlet-Twinz/vote-portal
- **Author:** Anthony Emmanuella Mmasinachi
- **GitHub:** https://github.com/Scarlet-Twinz
