<template>
  <input
    class="mt-4 p-4 text-black overflow-auto rounded-md"
    ref="inputRef"
    type="text"
    placeholder="Price in dollars"
  />
</template>

<script>
import { useCurrencyInput } from "vue-currency-input";

export default {
  name: "CurrencyInput",
  props: {
    modelValue: Number,
    options: Object,
  },
  setup(props) {
    const { inputRef } = useCurrencyInput(props.options);

    return { inputRef };
  },
};
</script>
