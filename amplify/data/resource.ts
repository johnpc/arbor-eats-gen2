import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Notification: a
    .model({
      endpoint: a.string().required(),
      p256dh: a.string().required(),
      auth: a.string().required(),
      expirationTime: a.integer(),
    })
    .authorization([a.allow.public("iam"), a.allow.private("iam")]),
  Profile: a
    .model({
      email: a.string().required(),
      name: a.string().required(),
      venmoHandle: a.string(),
      avatar: a.string().required(),
      userId: a.string().required(),
      posts: a.hasMany("Post"),
      likes: a.hasMany("Like"),
      comments: a.hasMany("Comment"),
    })
    .authorization([a.allow.public("iam"), a.allow.private("iam")]),
  Post: a
    .model({
      profile: a.belongsTo("Profile"),
      image: a.string(),
      title: a.string().required(),
      text: a.string().required(),
      prepDate: a.date().required(),
      price: a.integer().required(),
      comments: a.hasMany("Comment"),
      likes: a.hasMany("Like"),
    })
    .authorization([a.allow.public("iam"), a.allow.private("iam")]),
  Comment: a
    .model({
      profile: a.belongsTo("Profile"),
      post: a.belongsTo("Post"),
      text: a.string().required(),
    })
    .authorization([a.allow.public("iam"), a.allow.private("iam")]),
  Like: a
    .model({
      profile: a.belongsTo("Profile"),
      post: a.belongsTo("Post"),
      count: a.integer().required(),
    })
    .authorization([a.allow.public("iam"), a.allow.private("iam")]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "iam",
  },
});
1;
