<template>
  <authenticator>
    <template v-slot="{ user, signOut }">
      <div
        id="PostDetailPage"
        class="w-full z-50 bottom-0 h-full overflow-x-scroll"
      >
        <Icon
          @click="goHome()"
          class="absolute top-0 left-0 right-0 text-white"
          name="mdi:arrow-left"
          size="50"
        />
        <div class="py-2 w-full">
          <div class="w-full flex items-center justify-center gap-2.5 p-2">
            <img class="w-[35px]" src="/arbor-eats-logo.png" />
            <span class="font-bold text-2xl text-white">Arbor Eats</span>
          </div>
          <div v-if="post?.id" class="max-w-[500px] mx-auto px-2 text-white">
            <Post :post="post" :user="user" />
            <hr class="p-4" />
            <div v-for="comment in post.comments">
              <Comment :comment="comment" />
            </div>
            <hr class="p-4" />
            <CreateComment :post="post" :user="user" />
          </div>

          <div v-else class="max-w-[500px] mx-auto px-2 text-white">
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
            <div v-if="!isLoading" class="text-center mb-6 mt-4">
              Post Not Found
            </div>
          </div>
        </div>
        <hr class="p-20" />
      </div>
    </template>
  </authenticator>
</template>

<script setup>
import { Authenticator } from "@aws-amplify/ui-vue";
import "@aws-amplify/ui-vue/styles.css";
import { Amplify } from "aws-amplify";
import config from "../amplifyconfiguration.json";
import { useRoute } from "vue-router";
import { hydratePost } from "../data/entities";
Amplify.configure(config);
const route = useRoute();
const postId = route.query.post_id;
const post = ref(false);
const isLoading = ref(true);

onBeforeMount(async () => {
  isLoading.value = true;
  try {
    const postEntity = await hydratePost(postId);
    post.value = postEntity;
    isLoading.value = false;
  } catch (error) {
    console.log(error);
  }
});

const goHome = async () => {
  return navigateTo("/");
};
</script>
