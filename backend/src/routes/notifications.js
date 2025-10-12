import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import authMiddleware from "../middleware/authMiddleware.js";

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

    console.log(`📬 Fetched ${notifications.length} notifications for user ${req.user.id}`);
    res.json({ notifications });
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
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

    console.log(`🎯 Game invite sent from user ${senderId} to user ${receiverId} for match ${matchId}`);
    res.json({ notification });
  } catch (error) {
    console.error("❌ Error sending invite:", error);
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

    console.log(`✅ User ${userId} accepted invite ${notificationId} and joined match ${notification.matchId}`);
    res.json({ 
      message: "Invite accepted successfully",
      matchId: notification.matchId,
      matchTitle: notification.match.title 
    });
  } catch (error) {
    console.error("❌ Error accepting invite:", error);
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

    console.log(`❌ User ${userId} declined invite ${notificationId}`);
    res.json({ message: "Invite declined successfully" });
  } catch (error) {
    console.error("❌ Error declining invite:", error);
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

    console.log(`🗑️ User ${userId} deleted notification ${notificationId}`);
    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting notification:", error);
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

    console.log(`👁️ User ${userId} marked notification ${notificationId} as read`);
    res.json({ notification: updatedNotification });
  } catch (error) {
    console.error("❌ Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

export default router;