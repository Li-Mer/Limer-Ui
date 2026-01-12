<script setup lang='ts'>
import type { ButtonGroupProps } from './types';
import { provide, reactive, toRef } from 'vue';
import { BUTTON_GROUP_CTX_KEY } from './constants';


defineOptions({
  name: 'LiButtonGroup'
})
const props = defineProps<ButtonGroupProps>();

provide(
    BUTTON_GROUP_CTX_KEY,
    reactive({
        size: toRef(props, 'size'),
        disabled: toRef(props, 'disabled'),
        type: toRef(props, 'type')
    })
);
</script>

<template>
  <div class="li-button-group">
    <slot></slot>
  </div>
</template>

<style scoped>
@import "./style.css";
</style>