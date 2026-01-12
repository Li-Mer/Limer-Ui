import type { Component, Ref } from 'vue';

export type ButtonType = 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type ButtonSize = 'small' | 'default' | 'large';
export type NativeType = 'button' | 'submit' | 'reset';

export interface ButtonProps {
    tag?: string|Component;
    type?: ButtonType;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    nativeType?: NativeType;
    icon?: string;
    circle?: boolean;
    plain?: boolean;
    round?: boolean;
    loadingIcon?: string;
    autofocus?: boolean;
    useThrottle?: boolean;
    throttleDuration?: number;
}

export interface ButtonGroupProps { 
    size?: ButtonSize;
    type?: ButtonType;
    disabled?: boolean;
}
export interface ButtonGroupContext { 
    size?: ButtonSize;
    type?: ButtonType;
    disabled?: boolean;
}

export interface ButtonEmits {
    (e: 'click', val: MouseEvent): void;
}

export interface ButtonInstance { 
    ref:Ref<HTMLButtonElement | void>;
}