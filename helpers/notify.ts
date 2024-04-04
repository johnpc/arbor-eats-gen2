import webpush from "web-push";
import { env } from "process";
import { deleteNotification, listNotifications } from "../data/entities";

export const notify = async (body: {
  title: string;
  name: string;
  text: string;
  price: number;
}) => {
  // ntfy push
  fetch("https://ntfy.sh/arbor-eats-app", {
    method: "POST", // PUT works too
    body: `${body.title}: ${body.name}: ${body.text} ($${body.price})`,
  });

  if (env.SKIP_NOTIFICATIONS) {
    return;
  }
  // Web Push
  const notificationRecords = await listNotifications();

  webpush.setVapidDetails(
    "mailto:support@arboreats.app",
    env.WEB_NOTIFICATION_PUBLIC_KEY!,
    env.WEB_NOTIFICATION_PRIVATE_KEY!
  );
  const sendAllNotifications = notificationRecords.map(async (notification) => {
    try {
      await webpush.sendNotification(
        {
          endpoint: notification.endpoint,
          keys: {
            p256dh: notification.p256dh,
            auth: notification.auth,
          },
        },
        JSON.stringify({ message: "New Eat Available!" })
      );
    } catch (e) {
      console.error("Removing failed notification record");
      console.error(e);
      await deleteNotification(notification);
    }
  });
  console.log(`sending ${sendAllNotifications.length} notifications`);
  await Promise.all(sendAllNotifications);
};
