import { CORE, NET } from "../header";



export class NetSys   {
    private static _inst: NetSys = null;
    private _ws: NET.Socket = null;
    private _connected: boolean = false;
    private _isAutoReconnect: boolean = false;

    public static getNet(): NetSys {
        if (this._inst === null) {
            this._inst = new NetSys();
        }
        return this._inst;
    }



    public async httpGet(route: string, params: Record<string, any>, callback: (data: any) => void, errorCallback?: (err: Error) => void) {
        const url = "Plantfrom.GetPlantfrom().Base.accountServerAddress + route";
        try {
            // await Http.get(url, params, callback, this.NetRetryNum, this.NetTimeOut);
            NET.HttpManager.get(url,params,"json",(data) => {
                callback.apply(data);
            }
        } catch (error) {
            CORE.error( `${error}`);
            if (errorCallback) {
                errorCallback.apply(error);
            } else {
                const data = {
                    msgboxId: MsgBoxType.NetTip
                };
                FrameNotiSys.GetSys().AlertShow(data);
            }
        }
    }

    public async HttpPost(route: string, params: any, callback: (data: any) => void, errorCallback?: (err: Error) => void) {
        const url = Plantfrom.GetPlantfrom().Base.accountServerAddress + route;
        try {
            await Http.post(url, params, callback, "json", this.NetRetryNum, this.NetTimeOut);
        } catch (error) {
            if (errorCallback) {
                errorCallback.apply(error);
            } else {
                const data = {
                    msgboxId: MsgBoxType.NetTip
                };
                FrameNotiSys.GetSys().AlertShow(data);
            }
        }
    }

    public connectWebSocket(serverAddress: string): void {

        if (!this._ws) {
            this._ws = new NET.Socket(serverAddress,{ timeout: 3000 });
            this._ws.onmessage = this.onmessage.bind(this);
            this._ws.onopen = this.onconnected.bind(this);
            this._ws.onclose = this.onclose.bind(this);
            this._ws.onerror = this.onerror.bind(this);
        } else {
            CORE.log("ws is connected");
        }
    }

    public reconnect(): void {
        if (this._isAutoReconnect) {
            this.clear();
            this.connectWebSocket("Plantfrom.GetPlantfrom().Base.gameServerAddress");
        } else {
            // 手动重连
        }
    }

    public Send(sendPBKey: number, params?: any, recvPBKey?: number, callback?: (recvObj) => void) {
        const request = ProtoMgr.Inst.GetFunc(sendPBKey)["encode"](params).finish();
        if (!request) {
            BaseLog.Error(BASE_LOGTAG.NET, `ws send buff is fail [sendPBkey=${sendPBKey},params=${JSON.stringify(params)}]`);
        }
        if (this._ws?.sendBuffer(sendPBKey, request)) {
            BaseLog.Info(BASE_LOGTAG.NET, `ws send sendPBKey=[${ProtoMgr.Inst.GetName(sendPBKey)}] params=[${JSON.stringify(params)}]`);
            if (recvPBKey) {
                NotifacationCenter.GetInstance().on(recvPBKey.toString(), callback, this);
            }
        } else {
            BaseLog.Error(BASE_LOGTAG.NET, `ws send data is fail [sendPBkey=${sendPBKey},params=${JSON.stringify(params)}]`);
            // 进行重试或者重连
            this.Reconnect();
        }
    }

    // 检查网络的健康性
    public CheckNetHealth() {
        if (this._connected) {
            if (this._ws?.isActive) {
                // 发送心跳包
                this.heartPackage();
            } else {
                this.Reconnect();
            }
        }
    }



    private onconnected(): void {
        this._connected = true;
    }

    private onmessage(event: WsData) {
        const unpackData = WsPacker.Unpack(new Uint8Array(event as ArrayBuffer));
        let pbHash = unpackData.Cmd;
        let pbName = ProtoMgr.Inst.GetName(pbHash);
        const data = unpackData.Data;
        // 接受网络协议没有
        if (!pbName) {
            BaseLog.Error(BASE_LOGTAG.NET, `receive unknown key [pbName=${pbName}]`);
            return;
        }
        this.resetReceiveMsgTimer();
        this.resetHeartbeatTimer();
        const func = ProtoMgr.Inst.GetFunc(pbHash);
        const obj = func["decode"](data);
        if ("S2C_DYITEM_UPDATE" == pbName || "S2C_DYTIME_UPDATE" == pbName) {
            // BaseLog.Info(BASE_LOGTAG.NET, `ws send receive=[${pbName}]------------->`);
            // BaseLog.Table(obj);
        } else {
            BaseLog.Info(BASE_LOGTAG.NET, `ws receive=[${pbName}]------------->${JSON.stringify(obj)}`);
            // BaseLog.Table(obj);
        }

        // 通用错误码处理
        if (pbHash === ProtoHashMap.S2C_ERROR) {
            pbHash = obj.pid;
            pbName = ProtoMgr.Inst.GetName(pbHash);
            this.sysError(pbName, obj.code, obj.pid);
            return;
        }
        // 分发消息
        NotifacationCenter.GetInstance().emit(pbHash.toString(), obj);
        NotifacationCenter.GetInstance().off(pbHash.toString(), null, this);
    }

    private onclose(): void {
        this.reconnect();
    }

    private onerror(err: Error): void {
        CORE.log("ws error", err.message);
    }

    // 心跳包
    private heartPackage(): void {
        // this.Send(ProtoHashMap.C2S_HEARTBEAT, null, ProtoHashMap.S2C_HEARTBEAT, (data: msg_login.msg_login.S2C_HEARTBEAT) => {
        //     const serverTime = data.serverTs;
        //     const serverTimeZone = data.timeZone;
        //     TimerSys.GetTimesSys().UpdateTime(serverTime, serverTimeZone);
        // });
    }

    /**开启计时器 */
    private resetHeartbeatTimer(): void {
        // if (this._keepAliveTimer) {
        //     clearTimeout(this._keepAliveTimer);
        // }
        // this._keepAliveTimer = setTimeout(() => {
        //     this.heartPackage();
        // }, this.NetHeartTime * 1000);
    }

    private resetReceiveMsgTimer() {
        // if (this._receiveMsgTimer !== null) {
        //     clearTimeout(this._receiveMsgTimer);
        // }

        // this._receiveMsgTimer = setTimeout(() => {
        //     BaseLog.Warning(BASE_LOGTAG.NET, "ws recvieMsgTimer close socket!");
        //     this._ws.close();
        // }, NET_RECEIVE_TIME * 1000);
    }

    /**清除计时器 */
    private clearTimer() {
        // if (this._keepAliveTimer) {
        //     clearTimeout(this._keepAliveTimer);
        //     this._keepAliveTimer = null;
        //     BaseLog.Info(BASE_LOGTAG.NET, "clear keepAliveTimer timerout succesful");
        // }

        // if (this._receiveMsgTimer) {
        //     clearTimeout(this._receiveMsgTimer);
        //     this._receiveMsgTimer = null;
        //     BaseLog.Info(BASE_LOGTAG.NET, "clear receiveMsgTimer timerout succesful");
        // }
    }

    /**清除系统的数据并且进行重置 */
    private clearSys(): void {
        // DataSys.GetDataSys().Clear();
    }

    private sysError(pbName: string, code: number, pid: number): void {
        // NotifacationCenter.GetInstance().off(pid.toString(), null, this);
        // NotifacationCenter.GetInstance().off(pbName, null, this);
        // if (!code) {
        //     return;
        // }
        // if (pbName === "S2C_AUTH") {
        //     BaseLog.Warning(BASE_LOGTAG.NET, "ws S2C_AUTH is fail");
        //     this.Reconnect();
        //     return;
        // }
        // const codeID = `ErrorCode${code}`;
        // const msg = Languange.GetInstance().getLanTxt(codeID);
        // const errMsg = "net fail---->";
        // //根据code判断需要特殊处理的case,通用情况弹Toast
        // switch (code) {
        //     default:
        //         FrameNotiSys.GetSys().Warning(codeID);
        //         break;
        // }
        // // 错误分发出去 给游戏逻辑界面处理
        // NotifacationCenter.GetInstance().emit(ENotificationsAPI.COMMON_NET_ERROR_CODE, pid);
    }

    private clear(): void {
        if (this._ws) {
            this._connected = false;
            this._ws = null;
            this._ws.onopen = null;
            this._ws.onmessage = null;
            this._ws.onclose = null;
            this._ws.onerror = null;
        }
        this.clearTimer();
        this.clearSys();
    }
}

