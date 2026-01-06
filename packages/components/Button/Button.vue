<script setup lang="ts">
import { ref } from 'vue'
import type { ButtonProps } from './type'
defineOptions({
    name: 'LiButton'
})
const props = withDefaults(defineProps<ButtonProps>(), {
    tag: 'button',
    nativeType: 'button',
})
const slots = defineSlots();

const _ref = ref<HTMLButtonElement>();
</script>

<template>
    <component 
        :is="props.tag"
        ref="_ref"
        class="li-button"
        :type="props.tag === 'button' ? props.nativeType : void 0"
        :disabled="props.disabled || props.loading"
        :class="{
            [`li-button--${props.type}`]: props.type,
            [`li-button--${props.size}`]: props.size,
            'is-plain': props.plain,
            'is-round': props.round,
            'is-circle': props.circle,
            'is-disabled': props.disabled,
            'is-loading': props.loading,
        }"
    >
        <slot></slot>
    </component>
</template>

<style scoped>
@import './style.css';
</style>