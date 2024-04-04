<template>
  <div id="Comment" class="z-50 bottom-0 h-full w-full">
    <div class="py-2 w-full">
      <div class="flex items-center justify-between">
        <div class="flex items-center text-white">
          <img class="rounded-full h-[35px]" :src="avatar" />
          <div class="ml-2 font-semibold text-[12px]">
            {{ commentText }} - {{ commentName }}
          </div>
          <div class="ml-2 text-[12px]">
            {{ formatDate(new Date(comment.createdAt)) }}
          </div>
        </div>
      </div>
    </div>

    <div class="h-[1px] bg-gray-800 w-full mt-3" />
  </div>
</template>

<script setup>
import { onBeforeMount, ref } from "vue";
import { hydrateComment, hydrateProfile } from "../data/entities";

const props = defineProps({ comment: Object });
const avatar = ref();
const commentText = ref(props.comment.text);
const commentName = ref();
const commentDate = ref(props.comment.createdAt);

const formatDate = (date) => {
  const formatter = new Intl.DateTimeFormat("en-US", { dateStyle: "short" });
  const formattedDate = formatter.format(date);
  return formattedDate;
};

onBeforeMount(async () => {
  const comment = await hydrateComment(props.comment.id);
  const profile = await hydrateProfile(comment.profile.id);
  commentName.value = profile.name;
  commentText.value = comment.text;
  commentDate.value = comment.createdAt;
  avatar.value = profile.avatar;
});
</script>
