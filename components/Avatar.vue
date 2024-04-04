<template>
  <div class="content-center">
    <img
      v-if="path"
      :src="path"
      alt="Avatar"
      class="avatar image"
      :style="{ height: size + 'em', width: size + 'em' }"
    />
    <div
      v-else
      class="avatar no-image"
      :style="{ height: size + 'em', width: size + 'em' }"
    />

    <div style="width: 10em; position: relative">
      <label class="button primary block" for="single">
        {{ uploading ? "Uploading ..." : "Upload" }}
        <Icon class="inline" name="mdi:upload-outline" size="25" />
      </label>
      <input
        style="position: absolute; visibility: hidden"
        type="file"
        id="single"
        accept="image/*"
        @change="uploadAvatar"
        :disabled="uploading"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { uploadImageData } from "../helpers/uploadFileHelper";
const props = defineProps(["path", "size"]);
const { path, size } = toRefs(props);

const emit = defineEmits(["update:path", "upload"]);

const uploading = ref(false);
const src = ref("");
const files = ref();
const downloadImage = async () => {
  src.value = path!.value;
};

const uploadAvatar = async (evt: any) => {
  files.value = evt.target.files;
  try {
    uploading.value = true;
    if (!files.value || files.value.length === 0) {
      throw new Error("You must select an image to upload.");
    }
    const file = files.value[0];
    const fileExt = file.name.split(".").pop();
    const filePath = `${Math.random()}.${fileExt}`;
    const { key, href } = await uploadImageData(filePath, file);
    emit("update:path", href);
    emit("upload", key);
  } catch (error) {
    alert((error as Error).message);
  } finally {
    uploading.value = false;
  }
};

downloadImage();

watch(path!, () => {
  if (path!.value) {
    downloadImage();
  }
});
</script>
