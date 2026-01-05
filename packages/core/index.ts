import { makeInstaller } from "@limer-ui/utils";
import components from "./components";
import'@limer-ui/theme-chalk/index.css';

const installer = makeInstaller(components);

export * from "@limer-ui/components";
export default installer;