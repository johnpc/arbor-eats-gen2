import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "arborEatsImageStorage",
  access: ({ authenticated, guest }) => ({
    "public/*": [
      authenticated.to(["read", "write"]),
      guest.to(["read", "write"]),
    ],
    "private/*": [
      authenticated.to(["read", "write"]),
      guest.to(["read", "write"]),
    ],
  }),
});
