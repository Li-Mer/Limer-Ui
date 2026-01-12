<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import type { ButtonProps, ButtonInstance, ButtonEmits } from './types'
import { throttle } from 'lodash-es'
import { BUTTON_GROUP_CTX_KEY } from './constants';
import LiIcon  from '../Icon/Icon.vue';

defineOptions({
    name: 'LiButton'
})
const props = withDefaults(defineProps<ButtonProps>(), {
    tag: 'button',
    nativeType: 'button',
    useThrottle:true,
    throttleDuration: 500,
})
const emits = defineEmits<ButtonEmits>();
const slots = defineSlots();
const ctx = inject(BUTTON_GROUP_CTX_KEY, void 0);

const _ref = ref<HTMLButtonElement>();
    const iconStyle = computed(() => ({
        marginRight: slots.default ? '6px' : '0px'
    }));
const size = computed(() => ctx?.size ?? props?.size);
const type = computed(() => ctx?.type ?? props?.type);
const disabled = computed(
  () => props.disabled || ctx?.disabled || false
);
const handleBtnClick = (e: MouseEvent) => emits('click', e);
const handleBtnClickThrottle = throttle(handleBtnClick, props.throttleDuration ?? 1000, {
    'trailing': false,
});

defineExpose<ButtonInstance & { disabled: typeof disabled, size: typeof size, type: typeof type }>({
    ref: _ref,
    disabled,
    size,
    type,
})
</script>

<template>
    <component 
        :is="props.tag"
        ref="_ref"
        class="li-button"
        :autofocus="props.autofocus"
        :type="props.tag === 'button' ? props.nativeType : void 0"
        :disabled="disabled || props.loading?true:void 0"
        :class="{
            [`li-button--${type}`]: type,
            [`li-button--${size}`]: size,
            'is-plain': props.plain,
            'is-round': props.round,
            'is-circle': props.circle,
            'is-disabled': disabled,
            'is-loading': props.loading,
        }"
        @click="(e:MouseEvent) =>
            props.useThrottle ? handleBtnClickThrottle(e) : handleBtnClick(e)"
    >
    <template v-if="props.loading">
        <slot name="loading">
            <li-icon 
                class="loading-icon"
                :icon="props.loadingIcon ??'spinner'"
                :style="iconStyle"
                size="1x"
                spin    
            ></li-icon>
        </slot>
    </template>
    <li-icon 
        v-else-if="props.icon && !props.loading"
        :icon="props.icon"
        :style="iconStyle"
        size="1x"
    />
        <slot></slot>
    </component>
</template>

<style scoped>
@import './style.css';
</style>