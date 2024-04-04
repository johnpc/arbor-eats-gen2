import {
  type ProfileEntity,
  type PostEntity,
  type CommentEntity,
  type LikeEntity,
} from "./entities";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { type Schema } from "../amplify/data/resource";
import config from "../amplifyconfiguration.json";
import { defaultAvatarUrl } from "../helpers/userProfileHelper";
import { getFileUrl } from "../helpers/getFileUrl";

Amplify.configure(config);
const client = generateClient<Schema>({
  authMode: "iam",
});
export class CacheSingleton {
  static instance: CacheSingleton | undefined;
  private profiles: ProfileEntity[] = [];
  private posts: PostEntity[] = [];
  private comments: CommentEntity[] = [];
  private likes: LikeEntity[] = [];

  static async getInstance(): Promise<CacheSingleton> {
    if (!CacheSingleton.instance) {
      CacheSingleton.instance = new CacheSingleton();
      await CacheSingleton.instance.initialize();
    }
    return CacheSingleton.instance;
  }

  private isInitialized = () => {
    return (
      [...this.profiles, ...this.posts, ...this.comments, ...this.likes]
        .length > 0
    );
  };

  clear = () => {
    this.profiles = [];
    this.posts = [];
    this.comments = [];
    this.likes = [];
  };

  initialize = async () => {
    this.clear();
    const likeResponse = await client.models.Like.list({
      selectionSet: ["id", "count", "profile.*", "post.*"],
      limit: 10000,
    });

    const likeStubs = likeResponse.data?.map
      ? likeResponse.data?.map((likeResponse) => ({
          ...likeResponse,
        }))
      : [];

    const commentResponse = await client.models.Comment.list({
      selectionSet: ["id", "text", "profile.*", "post.*", "createdAt"],
      limit: 10000,
    });

    const commentStubs = commentResponse.data?.map
      ? commentResponse.data?.map((commentResponse) => ({
          ...commentResponse,
          createdAt: new Date(commentResponse.createdAt),
        }))
      : [];

    const postResponse = await client.models.Post.list({
      selectionSet: [
        "id",
        "title",
        "text",
        "image",
        "prepDate",
        "price",
        "profile.*",
        "comments.*",
        "likes.*",
        "createdAt",
      ],
      limit: 10000,
    });
    const postStubPromises = postResponse.data.map
      ? postResponse.data.map(async (postResponse) => ({
          ...postResponse,
          prepDate: new Date(postResponse.prepDate),
          createdAt: new Date(postResponse.createdAt),
          image: postResponse.image
            ? await getFileUrl(postResponse.image)
            : postResponse.image,
        }))
      : [];

    const postStubs = await Promise.all(postStubPromises);
    const profileResponse = await client.models.Profile.list({
      selectionSet: [
        "id",
        "name",
        "email",
        "venmoHandle",
        "avatar",
        "userId",
        "posts.*",
        "likes.*",
        "comments.*",
      ],
      limit: 10000,
    });

    const profileStubPromises = profileResponse.data.map
      ? profileResponse.data.map(async (profileResponse) => ({
          ...profileResponse,
          avatarKey: profileResponse.avatar,
          avatar:
            profileResponse.avatar === defaultAvatarUrl
              ? profileResponse.avatar
              : profileResponse.avatar
              ? await getFileUrl(profileResponse.avatar)
              : defaultAvatarUrl,
        }))
      : [];

    const profileStubs = await Promise.all(profileStubPromises);
    const profileEntities = profileStubs.map((profileStub) => ({
      ...profileStub,
      posts: postStubs.filter(
        (postStub) => postStub.profile.id === profileStub.id
      ),
      comments: commentStubs.filter(
        (commentStub) => commentStub.profile.id === profileStub.id
      ),
      likes: likeStubs.filter(
        (likeStub) => likeStub.profile.id === profileStub.id
      ),
    }));

    const postEntities = postStubs.map((postStub) => ({
      ...postStub,
      profile: profileStubs.find(
        (profileStub) => postStub.profile.id === profileStub.id
      )!,
      comments: commentStubs.filter((commentStub) =>
        postStub.comments.map((com) => com.id).includes(commentStub.id)
      ),
      likes: likeStubs.filter((likeStub) =>
        postStub.likes.map((like) => like.id).includes(likeStub.id)
      ),
    }));

    const commentEntities = commentStubs.map((commentStub) => ({
      ...commentStub,
      profile: profileStubs.find(
        (profileStub) => profileStub.id === commentStub.profile.id
      )!,
      post: postStubs.find((postStub) => postStub.id === commentStub.post.id)!,
    }));

    const likeEntities = likeStubs.map((likeStub) => ({
      ...likeStub,
      profile: profileStubs.find(
        (profileStub) => profileStub.id === likeStub.profile.id
      )!,
      post: postStubs.find((postStub) => postStub.id === likeStub.post.id)!,
    }));

    this.profiles = profileEntities;
    this.posts = postEntities;
    this.comments = commentEntities;
    this.likes = likeEntities;
  };

  hydrateProfile = async (id: string): Promise<ProfileEntity> => {
    if (!this.isInitialized()) {
      await this.initialize();
    }
    return this.profiles.find((profile) => profile.id === id)!;
  };

  hydratePost = async (id: string): Promise<PostEntity> => {
    if (!this.isInitialized()) {
      await this.initialize();
    }
    return this.posts.find((post) => post.id === id)!;
  };

  hydrateComment = async (id: string): Promise<CommentEntity> => {
    if (!this.isInitialized()) {
      await this.initialize();
    }
    return this.comments.find((comment) => comment.id === id)!;
  };

  hydrateLike = async (id: string): Promise<LikeEntity> => {
    if (!this.isInitialized()) {
      await this.initialize();
    }
    return this.likes.find((like) => like.id === id)!;
  };

  listProfiles = async (): Promise<ProfileEntity[]> => {
    if (!this.isInitialized()) {
      await this.initialize();
    }
    return this.profiles;
  };
  listPosts = async (): Promise<PostEntity[]> => {
    if (!this.isInitialized()) {
      await this.initialize();
    }
    return this.posts;
  };
  listComments = async (): Promise<CommentEntity[]> => {
    if (!this.isInitialized()) {
      await this.initialize();
    }
    return this.comments;
  };
  listLikes = async (): Promise<LikeEntity[]> => {
    if (!this.isInitialized()) {
      await this.initialize();
    }
    return this.likes;
  };
}
