import { clientsClaim } from "workbox-core";
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";

self.skipWaiting();
clientsClaim();
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

//You can remove this code if you aren't precaching anything, or leave it in and live with the warning message
try {
  const handler = createHandlerBoundToURL("/");
  const route = new NavigationRoute(handler);
  registerRoute(route);
} catch (error) {
  console.warn("Error while registering cache route", { error });
}

//Your service-worker code here.
self.addEventListener("push", (event) => {
  console.log("push event", { event });

  const data = event.data;
  const message = data.text();
  console.log({ message, data, event });
  console.log({ registration: self.registration });

  const pushMessage = data.json();
  console.log({ pushMessage });
  event.waitUntil(self.registration.showNotification(pushMessage.message));
});

self.addEventListener("message", function handler(event) {
  console.log("message event", { event });
});

self.addEventListener("error", function handler(event) {
  console.log("error event", { event });
});

self.addEventListener("statechange", function handler(event) {
  console.log("statechange event", { event });
});

self.addEventListener("install", (event) => {
  console.log("install event", { event });
});

self.addEventListener("fetch", (event) => {
  // console.log("fetch event", { event });
});
