import { NotificationItem } from "@/types";

export const notificationsData: NotificationItem[] = [
  {
    id: "n-1024",
    title: "New Order #1024",
    body: "A new order has been placed for 2 items.",
    timeLabel: "5 min ago",
    unread: true,
    icon: "order",
    iconBg: "#fee2e2",
  },
  {
    id: "n-1023",
    title: "Payment Received",
    body: "Payment of $25.50 for order #1023 is confirmed.",
    timeLabel: "1 hr ago",
    unread: true,
    icon: "payment",
    iconBg: "#ecfdf5",
  },
  {
    id: "n-update-1",
    title: "Platform Update",
    body: "New features are now live in the app.",
    timeLabel: "Yesterday",
    unread: false,
    icon: "update",
    iconBg: "#fff1f2",
  },
  {
    id: "n-1020",
    title: "Order #1020 Delivered",
    body: "Your order to Jane Doe has been successfully delivered.",
    timeLabel: "2 days ago",
    unread: false,
    icon: "delivered",
    iconBg: "#ecfdf5",
  },
];