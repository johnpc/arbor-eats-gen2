import { getUrl } from "aws-amplify/storage";

export const getFileUrl = async (key: string): Promise<string> => {
  const url = await getUrl({ key });
  return url.url.href;
};
