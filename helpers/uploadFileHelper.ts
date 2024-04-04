import { getUrl, uploadData } from "aws-amplify/storage";

export const uploadImageData = async (
  fileName: string,
  file: ArrayBuffer
): Promise<{ key: string; href: string }> => {
  try {
    const result = await uploadData({
      key: fileName,
      data: file,

      options: {
        onProgress: ({ transferredBytes, totalBytes }) => {
          if (totalBytes) {
            console.log(
              `Upload progress ${
                Math.round(transferredBytes / totalBytes) * 100
              } %`
            );
          }
        },
      },
    }).result;
    const url = await getUrl({
      key: result.key,
    });

    return {
      href: url.url.href,
      key: result.key,
    };
  } catch (error) {
    console.log("Error : ", error);
    return {
      href: "",
      key: "",
    };
  }
};
