import { useEffect } from "react";
import { toast } from "sonner";

interface NotificationConfig {
  enabled: boolean;
  interval?: number; // in milliseconds
}

const notifications = [
  {
    title: "Stock Alert: AAPL",
    description: "Apple is up 2.3% today! Your portfolio gained $234.",
    type: "success"
  },
  {
    title: "Market Update",
    description: "Tech sector showing strong performance. +3.2% today.",
    type: "info"
  },
  {
    title: "Portfolio Milestone",
    description: "Congratulations! Your portfolio reached $10,000.",
    type: "success"
  },
  {
    title: "AI Suggestion",
    description: "Consider reviewing TSLA - AI confidence at 85% BUY.",
    type: "info"
  },
  {
    title: "Price Alert",
    description: "MSFT hit your target price of $375. Time to review?",
    type: "success"
  }
];

export const useNotifications = (config: NotificationConfig = { enabled: true, interval: 30000 }) => {
  useEffect(() => {
    if (!config.enabled) return;

    let notificationIndex = 0;

    const showNotification = () => {
      const notification = notifications[notificationIndex];
      
      if (notification.type === "success") {
        toast.success(notification.title, {
          description: notification.description,
        });
      } else {
        toast.info(notification.title, {
          description: notification.description,
        });
      }

      notificationIndex = (notificationIndex + 1) % notifications.length;
    };

    // Show first notification after 10 seconds
    const initialTimeout = setTimeout(showNotification, 10000);

    // Then show periodic notifications
    const interval = setInterval(showNotification, config.interval || 30000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [config.enabled, config.interval]);
};
