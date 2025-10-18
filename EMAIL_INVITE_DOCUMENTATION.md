# Email Invite Feature

## Overview
The application now supports sending game invitations via email in addition to the existing username-based invites.

## Features Added

### Backend
1. **Email Service** (`/backend/src/services/emailService.js`)
   - Uses nodemailer for sending emails
   - Supports multiple SMTP providers (Gmail, Outlook, Yahoo)
   - Sends HTML-formatted emails with accept/decline buttons

2. **Email Invite API** (`/backend/src/routes/notifications.js`)
   - `POST /api/notifications/invites/email` - Send invite via email
   - `GET /api/notifications/invite/accept/:id` - Accept invite from email link
   - `GET /api/notifications/invite/decline/:id` - Decline invite from email link

### Frontend
1. **Email Input in CreateGame** (`/frontend/src/pages/CreateGame.jsx`)
   - Email address input field
   - Add/remove email invites
   - Visual email invite chips

2. **Email Invite Utility** (`/frontend/src/utils/notifications.js`)
   - `sendEmailInvite(email, matchId, message)` function

## Configuration

### Email Service Setup
1. Copy `/backend/.env.example` to `/backend/.env`
2. Configure SMTP settings for your email provider:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FRONTEND_URL=http://localhost:3000
```

### Gmail Setup (Recommended)
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings > Security > 2-Step Verification
   - Select "App passwords" at the bottom
   - Generate a password for "Mail"
   - Use this 16-character password in `SMTP_PASS`

## Usage

### Sending Email Invites
1. Create a private game
2. Enter email addresses in the "Email address" field
3. Press Enter or click "Add" to add emails to invite list
4. Create the game - emails will be sent automatically

### Receiving Email Invites
1. Recipients receive an HTML email with game details
2. Click "Accept Invitation" or "Decline Invitation" buttons
3. Accepting redirects to the game lobby
4. Declining shows a confirmation message

## Email Template Features
- Responsive HTML design
- Game information (title, host, category)
- Direct accept/decline action buttons
- Fallback links for email clients that don't support buttons
- Professional styling with game branding

## API Endpoints

### Send Email Invite
```
POST /api/notifications/invites/email
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "email": "player@example.com",
  "matchId": 123,
  "message": "Optional custom message"
}
```

### Accept Invite (Public - no auth required)
```
GET /api/notifications/invite/accept/:inviteId
```

### Decline Invite (Public - no auth required)
```
GET /api/notifications/invite/decline/:inviteId
```

## Error Handling
- Invalid email addresses are rejected
- Non-existent email addresses return 404
- Duplicate invites to same email are prevented
- Email sending failures don't block game creation
- Graceful fallback messages for all error conditions

## Security Notes
- Email invite links are secure and contain unique notification IDs
- Public accept/decline routes validate invitation authenticity
- SMTP credentials should be secured in production
- Consider using professional email service (SendGrid, AWS SES) for production