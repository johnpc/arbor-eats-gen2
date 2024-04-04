<template>
  <authenticator>
    <template v-slot="{ user, signOut }">
      <MainLayout>
        <div
          id="CreatePost"
          class="z-50 bottom-0 h-full w-full overflow-hidden p-5"
        >
          <div
            v-if="profile?.name"
            class="bg-black h-full w-full text-white overflow-auto"
          >
            <div
              class="flex items-center justify-start py-4 max-w-[500px] mx-auto border-b border-b-gray-700"
            >
              <div class="text-[16px] font-semibold">
                New Eat (our word for Tweet / Post)
              </div>
            </div>

            <div
              id="Post"
              class="z-40 bottom-0 max-h-[100vh-200px] w-full px-3 max-w-[500px] mx-auto"
            >
              <div class="py-2 w-full">
                <div class="flex items-center">
                  <div v-if="user" class="flex items-center text-white">
                    <img class="rounded-full h-[35px]" :src="profile.avatar" />
                    <div class="ml-2 font-semibold text-[18px]">
                      {{ profile.name }}
                    </div>
                  </div>
                </div>
                <div class="relative flex items-center w-full">
                  <div class="w-[42px] mx-auto">
                    <div
                      class="absolute ml-4 mt-1 top-0 w-[1px] bg-gray-700 h-full"
                    />
                  </div>
                  <div
                    class="bg-black rounded-lg w-[calc(100%-50px)] text w-full font-light"
                  >
                    <div class="pt-2 text-gray-300 bg-black w-full">
                      <input
                        v-model="title"
                        style="resize: none"
                        placeholder="Give your post a title"
                        id="title"
                        class="w-full bg-black outline-none"
                      />
                    </div>
                    <hr class="mt-4" />
                    <div class="pt-2 text-gray-300 bg-black w-full">
                      <textarea
                        v-model="text"
                        style="resize: none"
                        placeholder="Share details about what you're making..."
                        id="textarea"
                        @input="adjustTextareaHeight()"
                        class="w-full bg-black outline-none"
                      ></textarea>
                    </div>
                    <hr class="mb-4" />
                    <div>
                      <Datepicker
                        v-model="prepDate"
                        model-type="timestamp"
                        id="prepDate"
                        uid="prepDate"
                        name="prepDate"
                        :min-date="new Date()"
                        :enable-time-picker="false"
                        placeholder="Prep Date"
                        auto-apply
                      />
                      <CurrencyInput
                        class="w-full text-black overflow-auto"
                        :options="{ currency: 'USD', locale: 'en' }"
                        v-model="price"
                        id="currencyInput"
                      />
                    </div>
                    <div class="w-full">
                      <div class="flex flex-col gap-2 py-1">
                        <div v-if="fileDisplay">
                          <img
                            class="mx-auto w-full mt-2 mr-2 rounded-lg"
                            :src="fileDisplay"
                          />
                        </div>

                        <label for="fileInput" class="mt-4">
                          <Icon
                            name="clarity:paperclip-line"
                            color="#ffffff"
                            size="25"
                          />
                          <input
                            ref="file"
                            type="file"
                            id="fileInput"
                            @input="onChange"
                            hidden
                            accept=".jpg,.jpeg,.png"
                          />
                          Attach Image
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="fileDisplay" class="mt-16"></div>
            <button
              :disabled="isLoading || !title || !prepDate || !price"
              @click.stop="createUserPost"
              class="bottom-0 font-bold text-lg w-full bg-black inline-block float-right p-4 border-t border-t-gray-700"
            >
              <small v-if="!title || !prepDate || !price"
                >Fill out fields to post</small
              >
              <div v-else-if="!isLoading">Post Eat</div>
              <div v-else class="flex items-center gap-2 justify-center">
                <Icon name="eos-icons:bubble-loading" size="25" />
                <div>Please wait...</div>
              </div>
            </button>
          </div>
          <div v-else>loading...</div>
        </div>
      </MainLayout>
    </template>
  </authenticator>
</template>

<script lang="ts" setup>
import { Authenticator } from "@aws-amplify/ui-vue";
import "@aws-amplify/ui-vue/styles.css";
import { Amplify } from "aws-amplify";
import config from "../amplifyconfiguration.json";
import { onBeforeMount, ref } from "vue";
import { createPost } from "../data/entities";
import { getCurrentUser } from "aws-amplify/auth";
import Datepicker from "@vuepic/vue-datepicker";
import { v4 as uuidv4 } from "uuid";
import { uploadImageData } from "../helpers/uploadFileHelper";
import { getProfileFromUser } from "../helpers/userProfileHelper";

import "@vuepic/vue-datepicker/dist/main.css";
Amplify.configure(config);

let isLoading = ref(false);
let profile = ref();
let text = ref();
let title = ref();
let prepDate = ref();
let price = ref();
let isMenuOverlay = ref(true);

onBeforeMount(async () => {
  isLoading.value = true;
  try {
    const user = await getCurrentUser();
    const profileEntity = await getProfileFromUser(user);
    profile.value = profileEntity;
    isLoading.value = false;
  } catch (error) {
    console.log({ error });
  }
});

const adjustTextareaHeight = () => {
  const textarea = document.getElementById("textarea")!;
  textarea.style.height = "auto";
  textarea.style.height = textarea.scrollHeight + "px";
};

let file = ref();
let fileDisplay = ref();
let fileData = ref();

const clearData = () => {
  isMenuOverlay.value = false;
  title.value = null;
  text.value = null;
  file.value = null;
  fileDisplay.value = null;
  fileData.value = null;
};

const onChange = () => {
  fileDisplay.value = URL.createObjectURL(file.value.files[0]);
  fileData.value = file.value.files[0];
};

const createUserPost = async () => {
  let key = "";

  isLoading.value = true;

  if (fileData.value) {
    const uploadResponse = await uploadImageData(
      `${uuidv4()}.jpg`,
      fileData.value,
      "arbor-eats-app-files"
    );
    key = uploadResponse.key;
  }

  try {
    console.log({ prep: prepDate.value, date: new Date(prepDate.value) });
    const createdPost = await createPost(
      profile.value,
      key,
      title.value,
      text.value,
      new Date(prepDate.value),
      price.value
    );

    console.log({ createdPost });

    clearData();
    isLoading.value = false;
  } catch (error) {
    console.log(error);
    isLoading.value = false;
  }
};
</script>

<style></style>
