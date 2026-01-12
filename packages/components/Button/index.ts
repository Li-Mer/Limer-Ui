import Button from './Button.vue';
import ButtonGroup from './ButtonGroup.vue';
import { withInstall } from '@limer-ui/utils/install';


export const LiButton = withInstall(Button);
export const LiButtonGroup = withInstall(ButtonGroup);

export * from './types';