<script setup lang="ts">
import { ref } from 'vue'
import type { ButtonProps, ButtonInstance, ButtonEmits } from './type'
import {throttle} from 'lodash-es'
defineOptions({
    name: 'LiButton'
})
const props = withDefaults(defineProps<ButtonProps>(), {
    tag: 'button',
    nativeType: 'button',
    useThrottle:true,
})
const emits = defineEmits<ButtonEmits>();
const slots = defineSlots();

const _ref = ref<HTMLButtonElement>();

const handleBtnClick = (e: MouseEvent) => emits('click', e);
const handleBtnClickThrottle = throttle(handleBtnClick, props.throttleDuration ?? 1000, {
    'trailing': false,
});

defineExpose<ButtonInstance>({
    ref: _ref,
})
</script>

<template>
    <component 
        :is="props.tag"
        ref="_ref"
        class="li-button"
        :type="props.tag === 'button' ? props.nativeType : void 0"
        :disabled="props.disabled || props.loading?true:void 0"
        :class="{
            [`li-button--${props.type}`]: props.type,
            [`li-button--${props.size}`]: props.size,
            'is-plain': props.plain,
            'is-round': props.round,
            'is-circle': props.circle,
            'is-disabled': props.disabled,
            'is-loading': props.loading,
        }"
        @click="(e:MouseEvent) =>
            props.useThrottle ? handleBtnClickThrottle(e) : handleBtnClick(e)"
    >
        <slot></slot>
    </component>
</template>

<style scoped>
@import './style.css';
</style>