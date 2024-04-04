import type { AuthUser } from "aws-amplify/auth";
import { createOrGetProfile } from "~/data/entities";
export const defaultAvatarUrl =
  "https://fdocizdzprkfeigbnlxy.supabase.co/storage/v1/object/public/arbor-eats-app-files/missing-avatar.png";
export const getProfileFromUser = async (user: AuthUser) => {
  return await createOrGetProfile({
    name: user.signInDetails?.loginId || user.username || user.userId,
    email: user.signInDetails!.loginId!,
    avatar: defaultAvatarUrl,
    userId: user.userId,
    venmoHandle: "",
  });
};
