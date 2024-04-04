import { defineStore } from "pinia";
import {
  type PostEntity,
  createOrGetProfile,
  hydratePost,
  listPosts,
} from "../data/entities";

export const useUserStore = defineStore("user", {
  state: () => ({
    posts: [] as PostEntity[],
    post: {},
    profile: {},
  }),

  actions: {
    async getAllPosts() {
      this.posts = await listPosts();
      return this.posts;
    },
    async getProfile(args: {
      userId: string;
      userName: string;
      email: string;
      userAvatar: string;
    }) {
      this.profile = await createOrGetProfile({
        userId: args.userId,
        name: args.userName,
        email: args.email,
        avatar: args.userAvatar,
        venmoHandle: "",
      });
      return this.profile;
    },
    async getPost(postId: string) {
      this.post = await hydratePost(postId);
      return this.post;
    },
    async clearStore() {
      this.profile = {};
      this.post = {};
      this.posts = [];
      return this;
    },
  },
});
