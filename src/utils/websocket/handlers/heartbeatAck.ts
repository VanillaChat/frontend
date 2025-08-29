export default function heartbeatAck() {
	if (import.meta.env.VERBOSE)
		console.log("[WS] Heartbeat ACK opcode received.");
}
