<template>
  <div class="z-50 bottom-0 h-full w-full">
    <div class="py-2 w-full">
      <div class="flex items-center justify-between">
        <div class="flex items-center text-white">
          <img class="rounded-full h-[20px]" :src="post.profile.avatar" />
          <div @click="viewPost(post)" class="ml-2 text-slate text-[18px]">
            {{ post.title ?? post.text }}
          </div>
        </div>
        <div
          v-if="props.user.userId == post.userId"
          @click="isMenu = !isMenu"
          class="relative"
        >
          <button
            :disabled="isDeleting"
            class="flex items-center text-white p-1 h-[24px] w-[24px] hover:bg-gray-800 rounded-full cursor-pointer"
            :class="isMenu ? 'bg-gray-800' : ''"
          >
            <Icon
              v-if="!isDeleting"
              name="bi:three-dots"
              color="#ffffff"
              size="18"
            />
            <Icon
              v-else
              name="eos-icons:bubble-loading"
              color="#ffffff"
              size="18"
            />
          </button>

          <div
            v-if="isMenu"
            class="absolute border border-gray-600 right-0 z-20 mt-1 rounded"
          >
            <button
              @click="deleteUserPost(post.id, post.picture)"
              class="flex items-center rounded gap-2 text-red-500 justify-between bg-black w-full pl-4 pr-3 py-1 hover:bg-gray-900"
            >
              <div>Delete</div>
              <Icon name="solar:trash-bin-trash-broken" size="20" />
            </button>
          </div>
        </div>
      </div>
      <div class="p-2 text-white ml-2 text-[8px]">
        Posted on {{ new Date(post.createdAt).toDateString() }} at
        {{
          new Date(post.createdAt).getHours() > 12
            ? new Date(post.createdAt).getHours() - 12
            : new Date(post.createdAt).getHours()
        }}:{{ new Date(post.createdAt).getMinutes()
        }}{{ new Date(post.createdAt).getHours() > 12 ? "pm" : "am" }}
      </div>
      <div class="relative flex items-center w-full">
        <div class="w-[42px] mx-auto">
          <div class="absolute ml-4 mt-1 top-0 w-[1px] bg-gray-700 h-full" />
        </div>
        <div
          class="bg-black rounded-lg w-[calc(100%-50px)] text-sm w-full font-light"
        >
          <div class="py-2 text-gray-300">{{ post.text }}</div>
          <hr />
          <div class="py-2 text-gray-300">
            {{ post.profile.name.split(" ")[0].split("@")[0] }} - ${{
              post.price
            }}
            - Available {{ formatDate(new Date(post.prepDate)) }}
          </div>
          <img
            v-if="post && post.image"
            class="mx-auto w-full mt-2 pr-2 rounded"
            :src="post.image"
          />

          <div class="absolute mt-2 w-full ml-2">
            <button
              :disabled="isLike"
              @click.stop="likesFunc()"
              class="flex items-center gap-1"
            >
              <Icon
                v-if="!hasLikedComputed"
                class="p-1 text-white hover:bg-gray-800 rounded-full cursor-pointer"
                name="mdi:cards-heart-outline"
                size="28"
              />
              <Icon
                v-else
                class="p-1 text-red-500 hover:bg-gray-800 rounded-full cursor-pointer"
                name="mdi:cards-heart"
                size="28"
              />
              <span class="text-white"
                >You're <span v-if="!hasLikedComputed">out</span
                ><span v-else>in</span>. Tap the heart if you want
                <span v-if="!hasLikedComputed">in</span
                ><span v-else>out</span>.</span
              >
            </button>
            <div class="relative text-sm text-gray-500">
              <div>
                <span v-if="!isLike">{{ post.likes.length }}</span>
                <span v-else>
                  <Icon
                    name="eos-icons:bubble-loading"
                    color="#ffffff"
                    size="13"
                  />
                </span>
                friend{{ post.likes.length === 1 ? "" : "s" }} getting
                {{
                  post.likes
                    .map((like) => like.count)
                    .reduce((partialSum, a) => partialSum + a, 0)
                }}
                servings.
                <div @click="viewPost(post)" class="inline pr-10">
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  {{ post.comments.length }}&nbsp;&nbsp;
                  <span>
                    <Icon
                      name="mdi:comment-user-outline"
                      color="#ffffff"
                      size="13"
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="relative inline-block text-gray-500 pt-1 pb-1.5">
      <div class="flex items-center">
        <div class="flex items-center flex-wrap text-white gap-1 w-[42px]">
          <div class="flex gap-0.5">
            <img
              v-if="likeEntities[0]"
              class="rounded-full h-[14px] mt-2"
              :src="likeEntities[0].profile.avatar"
            />
            <img
              v-else
              class="rounded-full h-[14px] mt-2"
              src="https://picsum.photos/id/202/50"
            />
            <img
              v-if="likeEntities[1]"
              class="rounded-full h-[17px]"
              :src="likeEntities[1].profile.avatar"
            />
            <img
              v-else
              class="rounded-full h-[17px]"
              src="https://picsum.photos/id/223/50"
            />
          </div>
          <div class="flex items-center">
            <img
              v-if="likeEntities[2]"
              class="rounded-full h-[11px] ml-4"
              :src="likeEntities[2].profile.avatar"
            />
            <img
              v-else
              class="rounded-full h-[11px] ml-4"
              src="https://picsum.photos/id/99/50"
            />
          </div>
        </div>
      </div>
    </div>

    <ul
      v-if="likeEntities.length"
      v-for="like in likeEntities"
      :key="like"
      class="list-outside list-disc pt-2"
    >
      <li class="w-full text-xs text-slate-200 overflow-auto">
        🍔 {{ like.profile.name.split("@")[0] }} getting
        {{ like.count }} servings (${{ like.count * post.price }})
      </li>
    </ul>

    <div class="h-[1px] bg-gray-800 w-full mt-3" />
  </div>
</template>

<script setup lang="ts">
import { type AuthUser } from "aws-amplify/auth";
import { getProfileFromUser } from "../helpers/userProfileHelper";
import {
  createLike,
  hydratePost,
  hydrateLike,
  type LikeEntity,
} from "../data/entities";

// const runtimeConfig = useRuntimeConfig();
let isMenu = ref(false);
let isLike = ref(false);
let isDeleting = ref(false);
let likeEntities = ref([] as LikeEntity[]);

const emit = defineEmits(["isDeleted"]);
const props = defineProps({ post: Object, user: Object });

onBeforeMount(async () => {
  const likePromises = props.post.likes.map((likeStub) =>
    hydrateLike(likeStub.id)
  );
  const likes = await Promise.all(likePromises);
  likeEntities.value = likes;
});

const formatDate = (date) => {
  const formatter = new Intl.DateTimeFormat("en-US", { dateStyle: "short" });
  const formattedDate = formatter.format(date);
  return formattedDate;
};

const hasLikedComputed = computed(() => {
  let res = false;
  props.post.likes?.forEach((like) => {
    if (like.userId == props.user.userId && like.postId == props.post.id) {
      res = true;
    }
  });

  return res;
});

const deleteUserPost = async (id) => {
  let res = confirm("Are you sure you want to delete this post?");

  if (!res) return;

  try {
    isMenu.value = false;
    isDeleting.value = true;
    // await removeFile(picture, "arbor-eats-app-files");
    await deletePost(await hydratePost(id));
    emit("isDeleted", true);

    isDeleting.value = false;
  } catch (error) {
    console.log(error);
    isDeleting.value = false;
  }
};

const viewPost = (post) => {
  return navigateTo(`/post?post_id=${post.id}`);
};

const likePost = async (id) => {
  const servingsResponse = parseInt(prompt("How many servings?"));
  console.log({ servingsResponse });
  if (Number.isNaN(servingsResponse) || servingsResponse < 1) {
    alert("Just put a dang valid number in the box ya dingus");
    return;
  }
  isLike.value = true;
  try {
    const profile = await getProfileFromUser(props.user as AuthUser);
    await createLike(profile, await hydratePost(id), servingsResponse);

    // await userStore.getAllPosts();
    isLike.value = false;
  } catch (error) {
    console.log(error);
    isLike.value = false;
  }
};

const unlikePost = async (id) => {
  isLike.value = true;
  try {
    await deleteLike(await hydrateLike(id));
    // await userStore.getAllPosts();
    isLike.value = false;
  } catch (error) {
    console.log(error);
    isLike.value = false;
  }
};

const likesFunc = () => {
  console.log({ line: 282 });
  let likePostObj = null;

  if (props.post.likes?.length < 1) {
    console.log({ line: 286 });
    likePost(props.post.id);
    return null;
  } else {
    console.log({ line: 290 });
    props.post.likes?.forEach((like) => {
      if (like.userId == user.userId && like.postId == props.post.id) {
        console.log({ line: 293 });
        likePostObj = like;
      }
    });
  }

  console.log({ line: 299 });
  if (likePostObj) {
    console.log({ line: 301 });
    unlikePost(likePostObj.id);
    return null;
  }
  console.log({ line: 305 });
  likePost(props.post.id);
};
</script>
