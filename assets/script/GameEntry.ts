import { _decorator, Node, sys } from "cc";

import { CORE, FGUI } from "./header";
const { ccclass, property,menu } = _decorator;
/**
 * 游戏入口
 * 初始化游戏环境
 */
@ccclass("GameEntry")
@menu("exia/GameEntry")
export class GameEntry extends CORE.CocosEntry {
    @property(Node)
    // eslint-disable-next-line @typescript-eslint/naming-convention
    private root: Node = null;

    /**初始化游戏环境*/
    onInit(): void {
        // 初始化设备ID
        let deviceId = sys.localStorage.getItem("xBBres") as string;
        if (!deviceId || deviceId === "") {
            deviceId = "browser@" + Date.now().toString();
            sys.localStorage.setItem("xBBres", deviceId);
        }
        CORE.Platform.deviceId = deviceId;

        // 加载FGUI资源
        FGUI.UIPackage.loadPackage("ui/common/Basics", () => {
            this.onResourceLoadComplete();
        });
    }

    /**资源加载完成*/
    private onResourceLoadComplete(): void {
        CORE.GlobalTimer.startTimer(() => {
            this.intoGame();
        },1.5,0);
    }

    /** 进入游戏*/
    private intoGame(): void {
        // UI.WindowManager.showWindow("GameWindow",{}).then(() => {
        //     CORE.log("显示游戏窗口成功");
        // }).catch((err: Error) => {
        //     CORE.log("显示游戏窗口失败",err.message);
        // });
    }

}


