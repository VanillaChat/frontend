import {create} from "zustand/react";
import {devtools} from "zustand/middleware";

type GatewayStore = {
    isConnected: boolean;
    setConnectionStatus: (state: boolean) => void;
}

export const useGateway = create<GatewayStore>()(devtools((set) => ({
    isConnected: false,
    setConnectionStatus: (state: boolean) => set(() => ({isConnected: state}))
})));