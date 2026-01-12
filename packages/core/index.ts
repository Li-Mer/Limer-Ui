import { makeInstaller } from "@limer-ui/utils";
import { library } from "@fortawesome/fontawesome-svg-core";
import {fas} from "@fortawesome/free-solid-svg-icons";
library.add(fas);
import components from "./components";
import'@limer-ui/theme-chalk/index.css';

const installer = makeInstaller(components);

export * from "@limer-ui/components";
export default installer;