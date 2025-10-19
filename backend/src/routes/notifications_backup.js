import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import authMiddleware from "../middleware/authMiddleware.js";
import { sendGameInviteEmail, sendTestEmail } from "../services/emailService.js";

const prisma = new PrismaClient();
const router = Router();

// GET /notifications - Get user's notifications
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { receiverId: req.user.id },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        match: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(` Fetched ${notifications.length} notifications for user ${req.user.id}`);
    res.json({ notifications });
  } catch (error) {
    console.error(" Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// POST /invites - Send a game invite
router.post("/invites", authMiddleware, async (req, res) => {
  try {
    const { receiverId, matchId, message } = req.body;
    const senderId = req.user.id;

    // Validate that receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      return res.status(404).json({ error: "User not found" });
    }

    // Validate that match exists and sender is the host
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { host: true },
    });

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    if (match.hostId !== senderId) {
      return res.status(403).json({ error: "Only match host can send invites" });
    }

    // Check if invite already exists
    const existingInvite = await prisma.notification.findFirst({
      where: {
        senderId,
        receiverId,
        matchId,
        type: "GAME_INVITE",
        status: "PENDING",
      },
    });

    if (existingInvite) {
      return res.status(400).json({ error: "Invite already sent" });
    }

    // Create the notification
    const notification = await prisma.notification.create({
      data: {
        type: "GAME_INVITE",
        senderId,
        receiverId,
        matchId,
        message: message || `${match.host.username} invited you to join "${match.title}"`,
        data: {
          matchTitle: match.title,
          matchCategory: match.category,
          senderUsername: match.host.username,
        },
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        match: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
          },
        },
      },
    });

    console.log(` Game invite sent from user ${senderId} to user ${receiverId} for match ${matchId}`);
    res.json({ notification });
  } catch (error) {
    console.error(" Error sending invite:", error);
    res.status(500).json({ error: "Failed to send invite" });
  }
});

// PUT /invites/:id/accept - Accept a game invite
router.put("/invites/:id/accept", authMiddleware, async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = req.user.id;

    // Find the notification
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      include: { match: true, sender: true },
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    if (notification.receiverId !== userId) {
      return res.status(403).json({ error: "Not authorized to accept this invite" });
    }

    if (notification.type !== "GAME_INVITE") {
      return res.status(400).json({ error: "Not a game invite" });
    }

    if (notification.status !== "PENDING") {
      return res.status(400).json({ error: "Invite already processed" });
    }

    // Check if match still exists and is in LOBBY status
    if (!notification.match || notification.match.status !== "LOBBY") {
      // Update notification to dismissed
      await prisma.notification.update({
        where: { id: notificationId },
        data: { status: "DISMISSED" },
      });
      return res.status(400).json({ error: "Match no longer available" });
    }

    // Check if user is already in the match
    const existingPlayer = await prisma.matchPlayer.findUnique({
      where: {
        matchId_userId: {
          matchId: notification.matchId,
          userId: userId,
        },
      },
    });

    if (existingPlayer) {
      // Mark notification as read
      await prisma.notification.update({
        where: { id: notificationId },
        data: { status: "READ", readAt: new Date() },
      });
      return res.status(400).json({ error: "Already joined this match" });
    }

    // Check if match is full
    const playerCount = await prisma.matchPlayer.count({
      where: { matchId: notification.matchId },
    });

    if (playerCount >= notification.match.maxPlayers) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { status: "DISMISSED" },
      });
      return res.status(400).json({ error: "Match is full" });
    }

    // Add user to match and update notification
    const [matchPlayer, updatedNotification] = await prisma.$transaction([
      prisma.matchPlayer.create({
        data: {
          matchId: notification.matchId,
          userId: userId,
        },
      }),
      prisma.notification.update({
        where: { id: notificationId },
        data: { status: "READ", readAt: new Date() },
      }),
    ]);

    // Create acceptance notification for the sender
    await prisma.notification.create({
      data: {
        type: "GAME_ACCEPTED",
        senderId: userId,
        receiverId: notification.senderId,
        matchId: notification.matchId,
        message: `${req.user.username || "A player"} accepted your invite to "${notification.match.title}"`,
        data: {
          matchTitle: notification.match.title,
          accepterUsername: req.user.username,
        },
      },
    });

    console.log(` User ${userId} accepted invite ${notificationId} and joined match ${notification.matchId}`);
    res.json({ 
      message: "Invite accepted successfully",
      matchId: notification.matchId,
      matchTitle: notification.match.title 
    });
  } catch (error) {
    console.error(" Error accepting invite:", error);
    res.status(500).json({ error: "Failed to accept invite" });
  }
});

// PUT /invites/:id/decline - Decline a game invite
router.put("/invites/:id/decline", authMiddleware, async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = req.user.id;

    // Find the notification
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      include: { match: true },
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    if (notification.receiverId !== userId) {
      return res.status(403).json({ error: "Not authorized to decline this invite" });
    }

    if (notification.type !== "GAME_INVITE") {
      return res.status(400).json({ error: "Not a game invite" });
    }

    if (notification.status !== "PENDING") {
      return res.status(400).json({ error: "Invite already processed" });
    }

    // Update notification status
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { status: "DISMISSED", readAt: new Date() },
    });

    // Create decline notification for the sender
    await prisma.notification.create({
      data: {
        type: "GAME_DECLINED",
        senderId: userId,
        receiverId: notification.senderId,
        matchId: notification.matchId,
        message: `${req.user.username || "A player"} declined your invite to "${notification.match?.title}"`,
        data: {
          matchTitle: notification.match?.title,
          declinerUsername: req.user.username,
        },
      },
    });

    console.log(` User ${userId} declined invite ${notificationId}`);
    res.json({ message: "Invite declined successfully" });
  } catch (error) {
    console.error(" Error declining invite:", error);
    res.status(500).json({ error: "Failed to decline invite" });
  }
});

// DELETE /notifications/:id - Dismiss/delete a notification
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = req.user.id;

    // Verify notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    if (notification.receiverId !== userId) {
      return res.status(403).json({ error: "Not authorized to delete this notification" });
    }

    // Delete the notification
    await prisma.notification.delete({
      where: { id: notificationId },
    });

    console.log(` User ${userId} deleted notification ${notificationId}`);
    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

// PUT /notifications/:id/read - Mark notification as read
router.put("/:id/read", authMiddleware, async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = req.user.id;

    // Verify notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    if (notification.receiverId !== userId) {
      return res.status(403).json({ error: "Not authorized to modify this notification" });
    }

    // Update notification status
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { status: "READ", readAt: new Date() },
    });

    console.log(` User ${userId} marked notification ${notificationId} as read`);
    res.json({ notification: updatedNotification });
  } catch (error) {
    console.error(" Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

// GET /invite/accept/:id - Accept invite from email link (public route)
router.get("/invite/accept/:id", async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);

    // Find the notification
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      include: { 
        match: true, 
        sender: true,
        receiver: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        }
      },
    });

    if (!notification) {
      return res.status(404).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>❌ Invitation Not Found</h1>
            <p>This invitation link is invalid or has expired.</p>
          </body>
        </html>
      `);
    }

    if (notification.type !== "GAME_INVITE") {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>❌ Invalid Invitation</h1>
            <p>This is not a valid game invitation.</p>
          </body>
        </html>
      `);
    }

    if (notification.status !== "PENDING") {
      const status = notification.status === "READ" ? "already accepted" : "already declined";
      return res.send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>ℹ️ Invitation ${status.charAt(0).toUpperCase() + status.slice(1)}</h1>
            <p>This invitation has been ${status}.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/landing" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Game</a>
          </body>
        </html>
      `);
    }

    // Accept the invitation
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { 
        status: "READ",
        readAt: new Date(),
      },
    });

    console.log(` Email invite accepted: notification ${notificationId}`);

    // Create an interactive page that redirects to login and handles post-login flow
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invitation Accepted - Smartie Pants</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            background: rgba(255, 255, 255, 0.95);
            color: #333;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            max-width: 500px;
            width: 90%;
          }
          .button {
            display: inline-block;
            background: #28a745;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 10px;
            transition: background 0.3s;
            border: none;
            cursor: pointer;
            font-size: 16px;
          }
          .button:hover {
            background: #218838;
          }
          .button.secondary {
            background: #007bff;
          }
          .button.secondary:hover {
            background: #0056b3;
          }
          #status {
            margin: 20px 0;
            font-weight: bold;
          }
          .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #007bff;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🎉 Invitation Accepted!</h1>
          <p>You've successfully accepted the invitation to join <strong>${notification.match.title}</strong>!</p>
          
          <div id="status">
            <div class="spinner"></div>
            Redirecting you to login and join the game...
          </div>
          
          <p style="margin-top: 30px; color: #666;">
            Game hosted by: ${notification.sender.username}<br>
            Category: ${notification.match.category}
          </p>
          
          <p style="font-size: 14px; color: #888;">
            If you're not redirected automatically, 
            <button class="button" onclick="redirectToLogin()">click here</button>
          </p>
        </div>

        <script>
          const matchId = '${notification.matchId}';
          const receiverEmail = '${notification.receiver.email}';
          const gameTitle = '${notification.match.title}';
          const senderName = '${notification.sender.username}';
          
          function redirectToLogin() {
            // Store invite info for after login in localStorage
            const inviteData = {
              inviteAccepted: 'true',
              matchId: matchId,
              email: receiverEmail,
              gameTitle: gameTitle,
              senderName: senderName,
              timestamp: Date.now(),
              requireLogin: 'true'
            };
            
            // Store in localStorage so it persists through login process
            localStorage.setItem('pendingGameInvite', JSON.stringify(inviteData));
            
            // Redirect to frontend landing page with invite parameters
            // The frontend will detect requireLogin=true and handle auth flow
            const frontendUrl = '${process.env.FRONTEND_URL || 'http://localhost:5173'}';
            const params = new URLSearchParams({
              inviteAccepted: 'true',
              matchId: matchId,
              email: receiverEmail,
              gameTitle: gameTitle,
              senderName: senderName,
              requireLogin: 'true'
            });
            
            window.location.href = \`\${frontendUrl}/landing?\${params.toString()}\`;
          }
          
          // Auto-redirect after 2 seconds
          setTimeout(redirectToLogin, 2000);
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error(" Error accepting email invite:", error);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>❌ Error</h1>
          <p>There was an error processing your request. Please try again later.</p>
        </body>
      </html>
    `);
  }
});

// GET /invite/decline/:id - Decline invite from email link (public route)
router.get("/invite/decline/:id", async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);

    // Find the notification
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      include: { match: true, sender: true },
    });

    if (!notification) {
      return res.status(404).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>❌ Invitation Not Found</h1>
            <p>This invitation link is invalid or has expired.</p>
          </body>
        </html>
      `);
    }

    if (notification.type !== "GAME_INVITE") {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>❌ Invalid Invitation</h1>
            <p>This is not a valid game invitation.</p>
          </body>
        </html>
      `);
    }

    if (notification.status !== "PENDING") {
      const status = notification.status === "READ" ? "already accepted" : "already declined";
      return res.send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>ℹ️ Invitation ${status.charAt(0).toUpperCase() + status.slice(1)}</h1>
            <p>This invitation has been ${status}.</p>
          </body>
        </html>
      `);
    }

    // Decline the invitation
    await prisma.notification.update({
      where: { id: notificationId },
      data: { 
        status: "DISMISSED",
        readAt: new Date(),
      },
    });

    console.log(`❌ Email invite declined: notification ${notificationId}`);

    res.send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>📝 Invitation Declined</h1>
          <p>You've declined the invitation to join <strong>${notification.match.title}</strong>.</p>
          <p style="color: #666;">
            Game hosted by: ${notification.sender.username}<br>
            Maybe next time!
          </p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("❌ Error declining email invite:", error);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>❌ Error</h1>
          <p>There was an error processing your request. Please try again later.</p>
        </body>
      </html>
    `);
  }
});

// POST /test-email - Test email configuration (development only)
router.post("/test-email", authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email address is required" });
    }

    console.log(` Testing email configuration with ${email}`);
    
    const result = await sendTestEmail(email);
    
    res.json({
      success: true,
      message: "Test email sent successfully",
      messageId: result.messageId,
      to: result.to
    });
  } catch (error) {
    console.error(" Test email failed:", error);
    res.status(500).json({ 
      error: "Test email failed",
      details: error.message 
    });
  }
});

// POST /invites/email - Send a game invite via email
router.post("/invites/email", authMiddleware, async (req, res) => {
  try {
    const { email, matchId, message } = req.body;
    const senderId = req.user.id;

    // Find user by email
    const receiver = await prisma.user.findUnique({
      where: { email: email },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    if (!receiver) {
      return res.status(404).json({ error: "User with this email not found" });
    }

    // Validate that match exists and sender is the host
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { 
        host: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        }
      },
    });

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    if (match.hostId !== senderId) {
      return res.status(403).json({ error: "Only match host can send invites" });
    }

    // Check if invite already exists
    const existingInvite = await prisma.notification.findFirst({
      where: {
        senderId,
        receiverId: receiver.id,
        matchId,
        type: "GAME_INVITE",
        status: "PENDING",
      },
    });

    if (existingInvite) {
      return res.status(400).json({ error: "Invite already sent to this user" });
    }

    // Create the notification in database
    const notification = await prisma.notification.create({
      data: {
        type: "GAME_INVITE",
        senderId,
        receiverId: receiver.id,
        matchId,
        message: message || `${match.host.username} invited you to join "${match.title}"`,
        data: {
          matchTitle: match.title,
          matchCategory: match.category,
          senderUsername: match.host.username,
          inviteMethod: "email",
        },
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        match: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
          },
        },
      },
    });

    // Send email invitation
    try {
      await sendGameInviteEmail({
        to: receiver.email,
        senderName: match.host.username,
        gameTitle: match.title,
        matchId: match.id,
        inviteId: notification.id,
      });
      
      console.log(` Email invite sent from ${match.host.username} to ${receiver.email} for match ${matchId}`);
    } catch (emailError) {
      console.error(" Failed to send email, but notification was created:", emailError);
      // Don't fail the whole request if email fails, notification still exists
    }

    res.json({ 
      notification,
      emailSent: true,
      recipient: {
        username: receiver.username,
        email: receiver.email,
      }
    });
  } catch (error) {
    console.error(" Error sending email invite:", error);
    res.status(500).json({ error: "Failed to send email invite" });
  }
});

export default router;