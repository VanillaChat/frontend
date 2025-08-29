import { useAppStore } from "@/store/app";
import { useSession } from "@/store/session";
import type { Payload } from "@/utils/websocket/handlers";
import type ReconnectingWebSocket from "@/utils/websocket/ReconnectingWebSocket";

export default function inviteCodeDelete(
	_ws: ReconnectingWebSocket,
	data: Payload,
) {
	const session = useSession.getState();
	const appStore = useAppStore.getState();

	console.log("codeDelete");

	if (data.d.executor !== session.currentUser?.id) {
		appStore.setSettings({
			inviteCodes: appStore.settings.inviteCodes.filter(
				(code) => code.id !== data.d.id,
			),
		});
	}
}

export function inviteCodeUse(_ws: ReconnectingWebSocket, data: Payload) {
	const appStore = useAppStore.getState();
	const obj = appStore.settings.inviteCodes.find((x) => x.id === data.d.code);
	const arr = [...appStore.settings.inviteCodes];

	if (obj) {
		const index = arr.indexOf(obj);

		obj.used = true;
		obj.usedBy = data.d.executor;

		arr[index] = obj;
	}

	appStore.setSettings({
		inviteCodes: arr,
	});
}
