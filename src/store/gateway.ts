import { devtools } from "zustand/middleware";
import { create } from "zustand/react";

type GatewayStore = {
	isConnected: boolean;
	setConnectionStatus: (state: boolean) => void;
};

export const useGateway = create<GatewayStore>()(
	devtools((set) => ({
		isConnected: false,
		setConnectionStatus: (state: boolean) =>
			set(() => ({ isConnected: state })),
	})),
);
