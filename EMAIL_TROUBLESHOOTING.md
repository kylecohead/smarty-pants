# Email Configuration Troubleshooting Guide

## Current Issue Detected
**Error:** `Client network socket disconnected before secure TLS connection was established`

This indicates a TLS/SSL connection problem with your email provider.

## Solution Steps

### 1. Check Your Email Provider
Based on your logs, you're connecting to Outlook/Office365. Update your `.env` file:

```env
# For Outlook/Hotmail/Live/Office365
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
FRONTEND_URL=http://localhost:3000
```

### 2. Gmail Configuration (Alternative)
If using Gmail, you need an App Password:

```env
# For Gmail (requires App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
FRONTEND_URL=http://localhost:3000
```

**Gmail App Password Setup:**
1. Enable 2-Factor Authentication
2. Go to Google Account Settings > Security > App Passwords
3. Generate a new app password for "Mail"
4. Use this password in `SMTP_PASS`

### 3. Test Your Configuration

After updating `.env`, restart the containers:
```bash
docker compose restart backend
```

Then test with this curl command:
```bash
curl -X POST http://localhost:5001/api/notifications/test-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"email": "your-test-email@example.com"}'
```

### 4. Common Issues & Solutions

**Issue:** Authentication fails
**Solution:** 
- For Gmail: Use App Password, not regular password
- For Outlook: Ensure account allows SMTP access
- Check username/password are correct

**Issue:** Connection timeout
**Solution:**
- Check firewall settings
- Try different ports (25, 465, 587)
- Ensure Docker can access external SMTP servers

**Issue:** Still getting TLS errors
**Solution:**
- Try `SMTP_PORT=25` (less secure but works for testing)
- Or `SMTP_PORT=465` with `secure: true` in config

### 5. Alternative Email Providers

**Yahoo:**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

**Custom SMTP (like SendGrid, Mailgun):**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-api-key
```

### 6. Debug Commands

Check backend logs:
```bash
docker compose logs backend --tail 50
```

Check if email service starts correctly:
```bash
docker compose logs backend | grep -i email
```

### 7. Testing Steps

1. **Update .env file** with correct SMTP settings
2. **Restart backend:** `docker compose restart backend` 
3. **Check logs:** Look for "✅ Email service is ready" message
4. **Test email:** Use the `/test-email` endpoint
5. **Check spam folder** if email seems to send but isn't received

### 8. Production Recommendations

For production, consider using:
- **SendGrid** (reliable, high deliverability)
- **AWS SES** (cheap, scalable)
- **Mailgun** (developer-friendly)
- **Postmark** (transactional email specialist)

These services are more reliable than personal email accounts for sending automated emails.