<template>
  <authenticator>
    <template v-slot="{ user, signOut }">
      <MainLayout>
        <div id="IndexPage" class="w-full overflow-auto p-5">
          <div class="mx-auto max-w-[500px] overflow-hidden">
            <div id="Posts" class="px-4 max-w-[600px] mx-auto"></div>
            <div v-if="posts.length" v-for="post in posts" :key="post.id">
              <Post :post="post" :user="user" />
            </div>
            <div
              v-if="isLoading"
              class="mt-20 w-full flex items-center justify-center mx-auto"
            >
              <div
                class="text-white mx-auto flex flex-col items-center justify-center"
              >
                <Icon
                  name="eos-icons:bubble-loading"
                  size="50"
                  color="#ffffff"
                />
                <div class="w-full mt-1">Loading...</div>
              </div>
            </div>
            <div
              v-if="!isLoading && posts.length === 0"
              class="mt-20 w-full flex items-center justify-center mx-auto"
            >
              <div
                class="text-white mx-auto flex flex-col items-center justify-center"
              >
                <Icon name="tabler:mood-empty" size="50" color="#ffffff" />
                <div class="w-full">Make the first post!</div>
              </div>
            </div>
          </div>
          <div class="mt-60"></div></div
      ></MainLayout>
    </template>
  </authenticator>
</template>

<script lang="ts" setup>
import { Authenticator } from "@aws-amplify/ui-vue";
import "@aws-amplify/ui-vue/styles.css";
import { Amplify } from "aws-amplify";
import config from "../amplifyconfiguration.json";
import { onMounted, ref } from "vue";
import {
  listPosts,
  type PostEntity,
  unsubscribeListener,
  profileUpdateListener,
  commentCreateListener,
  likeCreateListener,
  likeDeleteListener,
} from "../data/entities";
import { getProfileFromUser } from "../helpers/userProfileHelper";
import { getCurrentUser } from "aws-amplify/auth";
Amplify.configure(config);

let isLoading = ref(false);
let posts = ref([] as PostEntity[]);
const listeners = ref([]);

const setup = async () => {
  isLoading.value = true;
  try {
    const postList = await listPosts();
    const user = await getCurrentUser();
    await getProfileFromUser(user);
    posts.value = postList;
    isLoading.value = false;
  } catch (error) {
    console.log(error);
  }
};
onMounted(async () => {
  await setup();
  const profileListener = profileUpdateListener(setup);
  const commentListener = commentCreateListener(setup);
  const likeListener = likeCreateListener(setup);
  const unlikeListener = likeDeleteListener(setup);
  listeners.value = [
    profileListener,
    commentListener,
    likeListener,
    unlikeListener,
  ];
  trySetupNotifications();
});
onUnmounted(() => {
  listeners.value.map((listener) => unsubscribeListener(listener));
});

const setupNotifications = async () => {
  console.log("setting up notifications!");
  if (!("serviceWorker" in navigator)) {
    console.log("serviceWorker API is not supported");
    return;
  }

  console.log("registering service worker!");
  const registration = await navigator.serviceWorker.register("/sw.js");
  console.log({ registration });
  if (!("Notification" in window)) {
    console.log("Notifications API is not supported");
    return;
  }
  console.log("Notifications API is supported");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return;
  }

  console.log("Notification permission granted.");
  const runtimeConfig = useRuntimeConfig();
  const pushSubscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: runtimeConfig.public.webNotificationPublicKey,
  });
  const pushSubscriptionJson = JSON.parse(
    JSON.stringify(pushSubscription, null, 2)
  );
  console.log("pushSubscription", {
    endpoint: pushSubscriptionJson.endpoint,
    keys: pushSubscription.keys,
  });

  try {
    await useFetch(`/api/create-notification/`, {
      method: "POST",
      body: {
        endpoint: pushSubscriptionJson.endpoint,
        p256dh: pushSubscriptionJson.keys.p256dh,
        auth: pushSubscriptionJson.keys.auth,
      },
    });
  } catch (e) {
    console.error("failed /api/create-notification/");
    console.error(e);
  }
};

const trySetupNotifications = async () => {
  try {
    await setupNotifications();
  } catch (e) {
    console.error(`Failed to set up notifications: ${e.message}`);
    console.error(e);
  }
};
</script>

<style></style>
