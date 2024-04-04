<script setup lang="ts">
import { Authenticator } from "@aws-amplify/ui-vue";
import "@aws-amplify/ui-vue/styles.css";
import { Amplify } from "aws-amplify";
import config from "../amplifyconfiguration.json";
Amplify.configure(config);
</script>

<template>
  <authenticator>
    <template v-slot="{ user, signOut }">
      <h1>Hello {{ user.username }}!</h1>
      <button @click="signOut">Sign Out</button>
      <!-- <feed :user="user" /> -->
      <!-- <example :user="user" /> -->

      <MainLayout>
        <div>Hello World</div>
      </MainLayout>
    </template>
  </authenticator>
</template>
