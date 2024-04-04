import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { type Schema } from "../amplify/data/resource";
import config from "../amplifyconfiguration.json";
import { CacheSingleton } from "./cache-singleton";
import { dateToString } from "~/helpers/dateToString";

Amplify.configure(config);
const client = generateClient<Schema>({
  authMode: "iam",
});

export type NotificationStub = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  expirationTime: number;
};

export type ProfileStub = {
  id: string;
  email: string;
  name: string;
  venmoHandle?: string | null;
  avatar: string;
  avatarKey: string;
  userId: string;
};

export type PostStub = {
  id: string;
  image?: string | null;
  title: string;
  text: string;
  prepDate: Date;
  price: number;
  createdAt: Date;
};

export type CommentStub = {
  id: string;
  text: string;
  createdAt: Date;
};

export type LikeStub = {
  id: string;
  count: number;
};

export type ProfileEntity = ProfileStub & {
  posts: PostStub[];
  likes: LikeStub[];
  comments: CommentStub[];
};

export type PostEntity = PostStub & {
  profile: ProfileStub;
  comments: CommentStub[];
  likes: LikeStub[];
};

export type CommentEntity = CommentStub & {
  profile: ProfileStub;
  post: PostStub;
};

export type LikeEntity = LikeStub & {
  profile: ProfileStub;
  post: PostStub;
};

export type NotificationEntity = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  expirationTime?: number | null;
};

export const hydrateProfile = async (id: string): Promise<ProfileEntity> => {
  const cacheInstance = await CacheSingleton.getInstance();
  return cacheInstance.hydrateProfile(id);
};

export const hydratePost = async (id: string): Promise<PostEntity> => {
  const cacheInstance = await CacheSingleton.getInstance();
  return cacheInstance.hydratePost(id);
};

export const hydrateComment = async (id: string): Promise<CommentEntity> => {
  const cacheInstance = await CacheSingleton.getInstance();
  return cacheInstance.hydrateComment(id);
};

export const hydrateLike = async (id: string): Promise<LikeEntity> => {
  const cacheInstance = await CacheSingleton.getInstance();
  return cacheInstance.hydrateLike(id);
};

export const hydrateNotification = (
  notification: Schema["Notification"]
): NotificationEntity => {
  return { ...notification };
};

export const listProfiles = async () => {
  const cacheInstance = await CacheSingleton.getInstance();
  return cacheInstance.listProfiles();
};

export const listPosts = async () => {
  const cacheInstance = await CacheSingleton.getInstance();
  return cacheInstance.listPosts();
};

export const listComments = async () => {
  const cacheInstance = await CacheSingleton.getInstance();
  return cacheInstance.listComments();
};

export const listLikes = async () => {
  const cacheInstance = await CacheSingleton.getInstance();
  return cacheInstance.listLikes();
};

export const listNotifications = async () => {
  const notificationResponse = await client.models.Notification.list();
  return notificationResponse.data.map((notificationResponse) =>
    hydrateNotification(notificationResponse)
  );
};

export const createOrGetProfile = async (profileProps: {
  name: string;
  email: string;
  avatar: string;
  userId: string;
  venmoHandle: string;
}) => {
  const matchingEmail = (await listProfiles()).find(
    (profile) => profile.email === profileProps.email
  );
  if (matchingEmail) {
    return matchingEmail;
  }
  const createdProfile = await client.models.Profile.create(profileProps);
  return await hydrateProfile(createdProfile.data.id);
};

export const updateProfile = async (profileProps: {
  id: string;
  name: string;
  email: string;
  avatar: string;
  userId: string;
  venmoHandle: string;
}) => {
  const updatedProfile = await client.models.Profile.update(profileProps);
  const cacheInstance = await CacheSingleton.getInstance();
  cacheInstance.initialize();
  return await hydrateProfile(updatedProfile.data.id);
};

export const createPost = async (
  profile: ProfileEntity,
  image: string,
  title: string,
  text: string,
  prepDate: Date,
  price: number
) => {
  const createdPost = await client.models.Post.create({
    image,
    title,
    text,
    prepDate: dateToString(prepDate),
    price,
    profilePostsId: profile.id,
  });
  const cacheInstance = await CacheSingleton.getInstance();
  cacheInstance.initialize();
  return await hydratePost(createdPost.data.id);
};

export const createComment = async (
  profile: ProfileEntity,
  post: PostEntity,
  text: string
) => {
  const createdComment = await client.models.Comment.create({
    text,
    postCommentsId: post.id,
    profileCommentsId: profile.id,
  });
  const cacheInstance = await CacheSingleton.getInstance();
  cacheInstance.initialize();
  return await hydratePost(createdComment.data.id);
};

export const createLike = async (
  profile: ProfileEntity,
  post: PostEntity,
  count: number
) => {
  const createdLike = await client.models.Like.create({
    count,
    postLikesId: post.id,
    profileLikesId: profile.id,
  });
  const cacheInstance = await CacheSingleton.getInstance();
  cacheInstance.initialize();
  return await hydratePost(createdLike.data.id);
};

export const createNotification = async (
  endpoint: string,
  p256dh: string,
  auth: string,
  expirationTime: number
) => {
  const createdNotification = await client.models.Notification.create({
    endpoint,
    p256dh,
    auth,
    expirationTime,
  });
  const cacheInstance = await CacheSingleton.getInstance();
  cacheInstance.initialize();
  return await hydrateNotification(createdNotification.data);
};

export const deleteLike = async (like: LikeEntity) => {
  await client.models.Like.delete({
    id: like.id,
  });
  const cacheInstance = await CacheSingleton.getInstance();
  cacheInstance.initialize();
  return true;
};

export const deletePost = async (post: PostEntity) => {
  await client.models.Post.delete({
    id: post.id,
  });
  const cacheInstance = await CacheSingleton.getInstance();
  cacheInstance.initialize();
  return true;
};

export const deleteUser = async (profile: ProfileEntity) => {
  await client.models.Profile.delete({
    id: profile.id,
  });
  const cacheInstance = await CacheSingleton.getInstance();
  cacheInstance.initialize();
  return true;
};

export const deleteNotification = async (notification: NotificationEntity) => {
  await client.models.Notification.delete({
    id: notification.id,
  });

  return true;
};
