import type { Component } from 'vue';

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
}