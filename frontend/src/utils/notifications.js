// Frontend utility functions for notification management
import { authenticatedFetch } from "./auth.js";

/**
 * Fetch user's notifications
 * @returns {Promise<Object>} - Notifications response
 */
export async function fetchNotifications() {
  try {
    console.log("📬 Fetching notifications...");
    const response = await authenticatedFetch("/api/notifications");
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Fetched ${data.notifications.length} notifications`);
      return { success: true, notifications: data.notifications };
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ Failed to fetch notifications:", response.status, errorData);
      return { success: false, error: errorData.error || "Failed to fetch notifications" };
    }
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    return { success: false, error: "Network error while fetching notifications" };
  }
}

/**
 * Send a game invite to another user
 * @param {number} receiverId - ID of user to invite
 * @param {number} matchId - ID of match to invite to
 * @param {string} message - Optional custom message
 * @returns {Promise<Object>} - Invite response
 */
export async function sendGameInvite(receiverId, matchId, message = null) {
  try {
    console.log(`🎯 Sending game invite to user ${receiverId} for match ${matchId}`);
    
    const response = await authenticatedFetch("/api/notifications/invites", {
      method: "POST",
      body: JSON.stringify({
        receiverId,
        matchId,
        message,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Game invite sent successfully`);
      return { success: true, notification: data.notification };
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ Failed to send invite:", response.status, errorData);
      return { success: false, error: errorData.error || "Failed to send invite" };
    }
  } catch (error) {
    console.error("❌ Error sending invite:", error);
    return { success: false, error: "Network error while sending invite" };
  }
}

/**
 * Accept a game invite
 * @param {number} notificationId - ID of the notification to accept
 * @returns {Promise<Object>} - Accept response
 */
export async function acceptGameInvite(notificationId) {
  try {
    console.log(`✅ Accepting game invite ${notificationId}`);
    
    const response = await authenticatedFetch(`/api/notifications/invites/${notificationId}/accept`, {
      method: "PUT",
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Invite accepted successfully`);
      return { success: true, ...data };
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ Failed to accept invite:", response.status, errorData);
      return { success: false, error: errorData.error || "Failed to accept invite" };
    }
  } catch (error) {
    console.error("❌ Error accepting invite:", error);
    return { success: false, error: "Network error while accepting invite" };
  }
}

/**
 * Decline a game invite
 * @param {number} notificationId - ID of the notification to decline
 * @returns {Promise<Object>} - Decline response
 */
export async function declineGameInvite(notificationId) {
  try {
    console.log(`❌ Declining game invite ${notificationId}`);
    
    const response = await authenticatedFetch(`/api/notifications/invites/${notificationId}/decline`, {
      method: "PUT",
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Invite declined successfully`);
      return { success: true, ...data };
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ Failed to decline invite:", response.status, errorData);
      return { success: false, error: errorData.error || "Failed to decline invite" };
    }
  } catch (error) {
    console.error("❌ Error declining invite:", error);
    return { success: false, error: "Network error while declining invite" };
  }
}

/**
 * Dismiss/delete a notification
 * @param {number} notificationId - ID of the notification to dismiss
 * @returns {Promise<Object>} - Dismiss response
 */
export async function dismissNotification(notificationId) {
  try {
    console.log(`🗑️ Dismissing notification ${notificationId}`);
    
    const response = await authenticatedFetch(`/api/notifications/${notificationId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Notification dismissed successfully`);
      return { success: true, ...data };
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ Failed to dismiss notification:", response.status, errorData);
      return { success: false, error: errorData.error || "Failed to dismiss notification" };
    }
  } catch (error) {
    console.error("❌ Error dismissing notification:", error);
    return { success: false, error: "Network error while dismissing notification" };
  }
}

/**
 * Mark a notification as read
 * @param {number} notificationId - ID of the notification to mark as read
 * @returns {Promise<Object>} - Mark read response
 */
export async function markNotificationAsRead(notificationId) {
  try {
    console.log(`👁️ Marking notification ${notificationId} as read`);
    
    const response = await authenticatedFetch(`/api/notifications/${notificationId}/read`, {
      method: "PUT",
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Notification marked as read`);
      return { success: true, notification: data.notification };
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ Failed to mark notification as read:", response.status, errorData);
      return { success: false, error: errorData.error || "Failed to mark as read" };
    }
  } catch (error) {
    console.error("❌ Error marking notification as read:", error);
    return { success: false, error: "Network error while marking as read" };
  }
}

/**
 * Get formatted time string for notification display
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} - Formatted time string
 */
export function formatNotificationTime(timestamp) {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now - time;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return "Just now";
  } else if (diffMinutes < 60) {
    return `${diffMinutes} min${diffMinutes > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return time.toLocaleDateString();
  }
}

/**
 * Get notification display color based on type
 * @param {string} type - Notification type
 * @returns {string} - CSS class for notification styling
 */
export function getNotificationColor(type) {
  switch (type) {
    case "GAME_INVITE":
      return "bg-blue-500/20 border-blue-400/30";
    case "GAME_ACCEPTED":
      return "bg-green-500/20 border-green-400/30";
    case "GAME_DECLINED":
      return "bg-red-500/20 border-red-400/30";
    case "MATCH_STARTED":
      return "bg-yellow-500/20 border-yellow-400/30";
    case "MATCH_FINISHED":
      return "bg-purple-500/20 border-purple-400/30";
    default:
      return "bg-white/10 border-white/20";
  }
}

/**
 * Check if notification is actionable (has accept/decline buttons)
 * @param {Object} notification - Notification object
 * @returns {boolean} - True if notification has actions
 */
export function isNotificationActionable(notification) {
  return notification.type === "GAME_INVITE" && notification.status === "PENDING";
}