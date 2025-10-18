import SibApiV3Sdk from 'sib-api-v3-sdk';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Brevo (SendinBlue) API client
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

console.log('🔧 Email Configuration:', {
  service: 'Brevo API',
  apiKeyConfigured: !!process.env.BREVO_API_KEY,
  senderEmail: process.env.BREVO_SENDER_EMAIL || 'not-configured'
});

console.log('📧 Email service using Brevo API (bypasses Docker SMTP issues!)');

export async function sendGameInviteEmail({
  to,
  senderName,
  gameTitle,
  matchId,
  inviteId,
  frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
}) {
  // These should point to the backend API endpoints, not frontend
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
  const acceptUrl = `${backendUrl}/api/notifications/invite/accept/${inviteId}`;
  const declineUrl = `${backendUrl}/api/notifications/invite/decline/${inviteId}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Smartie Pants Game Invitation</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1>🎯 Smartie Pants</h1>
            <h2>You're Invited to Play!</h2>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
            <p>Hey there!</p>
            <p><strong>${senderName}</strong> has invited you to join a trivia game on Smartie Pants!</p>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea;">
                <h3>🎮 Game Details:</h3>
                <p><strong>Game:</strong> ${gameTitle}</p>
                <p><strong>Invited by:</strong> ${senderName}</p>
                <p><strong>Match ID:</strong> ${matchId}</p>
            </div>
            
            <p>Ready to test your knowledge? Click one of the buttons below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${acceptUrl}" style="display: inline-block; padding: 12px 30px; margin: 10px; text-decoration: none; border-radius: 5px; font-weight: bold; background-color: #28a745; color: white;">✅ Accept Invitation</a>
                <a href="${declineUrl}" style="display: inline-block; padding: 12px 30px; margin: 10px; text-decoration: none; border-radius: 5px; font-weight: bold; background-color: #dc3545; color: white;">❌ Decline Invitation</a>
            </div>
            
            <p><em>Note: This invitation will expire after 24 hours.</em></p>
        </div>
    </body>
    </html>
  `;

  const textContent = `
Smartie Pants Game Invitation

Hey there!

${senderName} has invited you to join a trivia game on Smartie Pants!

Game Details:
- Game: ${gameTitle}
- Invited by: ${senderName}
- Match ID: ${matchId}

To accept the invitation, visit: ${acceptUrl}
To decline the invitation, visit: ${declineUrl}

Note: This invitation will expire after 24 hours.
  `;

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.subject = `🎯 ${senderName} invited you to play Smartie Pants!`;
  sendSmtpEmail.htmlContent = htmlContent;
  sendSmtpEmail.textContent = textContent;
  sendSmtpEmail.sender = {
    name: "Smartie Pants",
    email: process.env.BREVO_SENDER_EMAIL || "noreply@your-domain.com"
  };
  sendSmtpEmail.to = [{ email: to }];

  console.log('📧 Sending email via Brevo API to:', to);
  
  try {
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Email sent successfully via Brevo API!');
    console.log('   📨 Message ID:', response.messageId);
    
    return {
      success: true,
      messageId: response.messageId,
      to: to,
      acceptUrl: acceptUrl,
      declineUrl: declineUrl
    };
  } catch (error) {
    console.error('❌ Brevo API call failed:', error);
    throw new Error(`Failed to send email via Brevo API: ${error.message}`);
  }
}

export async function sendTestEmail(to) {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.subject = '🧪 Test Email from Smartie Pants (Brevo API)';
  sendSmtpEmail.htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>🧪 Test Email</h2>
      <p>This is a test email to verify your Brevo API configuration is working correctly.</p>
      <p><strong>Time sent:</strong> ${new Date().toISOString()}</p>
      <p><strong>Method:</strong> Brevo API (not SMTP)</p>
    </div>
  `;
  sendSmtpEmail.textContent = 'This is a test email to verify your Brevo API configuration is working correctly.';
  sendSmtpEmail.sender = {
    name: "Smartie Pants Test",
    email: process.env.BREVO_SENDER_EMAIL || "noreply@your-domain.com"
  };
  sendSmtpEmail.to = [{ email: to }];

  console.log('🧪 Sending test email via Brevo API to:', to);
  
  try {
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Test email sent successfully via Brevo API!');
    
    return {
      success: true,
      messageId: response.messageId,
      to: to
    };
  } catch (error) {
    console.error('❌ Test email failed:', error);
    throw new Error(`Test email failed: ${error.message}`);
  }
}

export default {
  sendGameInviteEmail,
  sendTestEmail
};
