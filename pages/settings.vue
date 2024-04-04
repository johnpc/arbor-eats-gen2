<template>
  <authenticator>
    <template v-slot="{ user, signOut }">
      <MainLayout>
        <div
          id="Account"
          class="w-full"
        >
          <div
            class="bg-black w-full rounded-lg text-white border border-gray-600 p-2"
            v-if="profile?.id"
          >
            <form class="form-widget" @submit.prevent="updateUserProfile">
              <div class="pl-12">
                <Avatar
                  v-model:path="profile.avatar"
                  @upload="(key) => updateUserProfile(key)"
                  :size="10"
                />
              </div>
              <div class="border-b border-b-gray-700 my-1" />
              <div class="p-3">
                <label for="email">Email</label>
                <input
                  class="text-white bg-gray-800 rounded-lg pl-4 ml-4"
                  id="email"
                  type="text"
                  :value="profile.email"
                  disabled
                />
              </div>
              <div class="p-3">
                <label for="userName">Name</label>
                <input
                  class="text-black rounded-lg pl-4 ml-4"
                  id="userName"
                  type="text"
                  v-model="profile.name"
                />
              </div>
              <div class="p-3">
                <label for="venmoHandle">Venmo</label>
                <input
                  class="text-black rounded-lg pl-3 ml-3"
                  id="venmoHandle"
                  type="text"
                  v-model="profile.venmoHandle"
                />
              </div>
              <div
                class="flex items-center justify-between bg-black w-full p-3"
              >
                <label for="submitButton"
                  >Update
                  <Icon name="mdi:content-save-edit-outline" size="25" />
                </label>
                <input
                  id="submitButton"
                  type="submit"
                  class="button block primary"
                  :value="loading ? 'Loading ...' : ''"
                  :disabled="loading"
                />
              </div>
            </form>

            <div class="border-b border-b-gray-700 my-1" />
            <div class="border-b border-b-gray-700 my-1" />
            <button
              @click="() => logOut(signOut, user)"
              class="flex items-center justify-between bg-black w-full p-3"
            >
              <div>Log Out</div>
              <Icon name="ph:sign-out" size="25" />
            </button>
            <div class="border-b border-b-gray-700 my-1" />
            <button
              @click="() => deleteAccount(signOut)"
              class="flex items-center justify-between bg-black w-full p-3"
            >
              <div class="text-red-500">Delete Account</div>
              <Icon name="mdi:account-remove-outline" size="25" />
            </button>
            <div class="border-b border-b-gray-700 my-1" />
            <a href="mailto:support@arboreats.com"
              ><button
                class="flex items-center justify-between bg-black w-full p-3"
              >
                <div>support@arboreats.com</div>
                <Icon name="mdi:email-outline" size="25" /></button
            ></a>
          </div>
          <div v-else>
            <img
              v-if="profile?.id"
              class="w-full max-w-[30px] rounded-full"
              src="/loading.gif"
            />
          </div>
        </div>
      </MainLayout>
    </template>
  </authenticator>
</template>

<script lang="ts" setup>
import { getCurrentUser, deleteUser as deleteAmplifyUser } from "aws-amplify/auth";
import { getProfileFromUser } from "../helpers/userProfileHelper";
import { updateProfile, deleteUser } from "../data/entities";
import { Authenticator } from "@aws-amplify/ui-vue";
import "@aws-amplify/ui-vue/styles.css";
import {Amplify} from "aws-amplify";
import config from "../amplifyconfiguration.json";
Amplify.configure(config);

const profile = ref();
const loading = ref(false);
onMounted(async () => {
  const user = await getCurrentUser();
  const profileEntity = await getProfileFromUser(user);
  profile.value = profileEntity;
});

async function updateUserProfile(key) {
  try {
    loading.value = true;
    const updates = {
      id: profile.value.id,
      userId: profile.value.userId,
      name: profile.value.name,
      email: profile.value.email,
      venmoHandle: profile.value.venmoHandle,
      avatar: key.length ? key : profile.value.avatarKey,
    };
    const profileEntity = await updateProfile(updates);
    profile.value = profileEntity;
  } catch (error) {
    alert(error.message);
  } finally {
    loading.value = false;
  }
}

async function deleteAccount(signOut) {
  const shouldDelete = confirm("Are you sure? This action cannot be reversed.");
  if (!shouldDelete) {
    return;
  }

  try {
    loading.value = true;
    await deleteUser(profile.value);
    await deleteAmplifyUser();
    await signOut();
  } catch (e) {
    console.log(e);
    alert(error.message);
  } finally {
    loading.value = false;
  }

  console.log({ shouldDelete });
}

async function logOut(signOut, user) {
  try {
    loading.value = true;
    await signOut();
  } catch (error) {
    alert(error.message);
  } finally {
    loading.value = false;
  }
}
</script>

<style></style>
