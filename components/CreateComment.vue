<template>
  <div id="CreateComment" class="z-50 bottom-0 h-full w-full">
    <div class="py-2 w-full">
      <div class="flex items-center justify-between">
        <div class="flex items-center text-white">
          <img class="rounded-full h-[35px]" :src="profileAvatarUrl" />
          <div class="ml-2 font-semibold text-white text-[15px]">
            {{ profileName }}
          </div>
        </div>
      </div>
    </div>
    <div class="bg-black rounded-lg w-[calc(100%-50px)] text w-full font-light">
      <div class="pt-2 text-gray-300 bg-black w-full">
        <input
          v-model="commentText"
          style="resize: none"
          placeholder="Type your comment text here"
          id="commentText"
          class="w-full bg-black outline-none"
        />
      </div>
    </div>
    <button
      class="mt-4 mb-10 flex items-center justify-center gap-3 p-1.5 w-full border rounded-full text-lg font-semibold"
      @click="addComment"
    >
      <div v-if="isLoading" class="flex items-center gap-2 justify-center">
        <img class="w-full max-w-[30px] rounded-full" src="/loading.gif" />
      </div>
      <div v-else class="flex items-center gap-2 justify-center">
        Submit Comment
      </div>
    </button>
    <div class="h-[1px] bg-gray-800 w-full mt-3" />
  </div>
</template>

<script setup lang="ts">
import { createComment, hydratePost } from "../data/entities";
import { onMounted, ref } from "vue";
import {
  getProfileFromUser,
  defaultAvatarUrl,
} from "../helpers/userProfileHelper";
import { type AuthUser } from "aws-amplify/auth";
const props = defineProps({ post: Object, user: Object });
const isLoading = ref(false);
const commentText = ref("");
const profileName = ref("Add a Comment");
const profileAvatarUrl = ref(defaultAvatarUrl);

onMounted(async () => {
  const profile = await getProfileFromUser(props.user as AuthUser);
  profileName.value = profile.name;
  profileAvatarUrl.value = profile.avatar ?? defaultAvatarUrl;
});

async function addComment() {
  if (!commentText.value) {
    alert("Write a comment before you try to submit");
    return;
  }

  isLoading.value = true;
  const profile = await getProfileFromUser(props.user as AuthUser);
  await createComment(
    profile,
    await hydratePost(props.post!.id),
    commentText.value
  );

  commentText.value = "";
  isLoading.value = false;
}
</script>
