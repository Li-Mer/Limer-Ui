<script setup lang='ts'>
import type { IconProps } from './types'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { omit } from "lodash-es";
import {computed} from "vue";

defineOptions({
    name: 'LiIcon',
    inheritAttrs: false,
});

const props = defineProps<IconProps>();
const filterProps = computed(() => {
    return omit(props, ['type','color']);
});
const customStyles = computed(() => {
    return props.color ? { color: props.color } : {};
});
</script>

<template>
  <i
    class="li-icon"
    :class="[`li-icon--${props.type}`]"
    :style="customStyles"
    v-bind="$attrs"
  >
    <font-awesome-icon v-bind="filterProps"></font-awesome-icon>
  </i>
</template>

<style scoped>
@import "./style.css";
</style>