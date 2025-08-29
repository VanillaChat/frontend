import React from "react";
import Button from "@/components/UI/Button";
import Modal from "@/components/UI/Modal";
import { useSession } from "@/store/session";

export default function EmailChangeModal() {
	const [emailChangeOpen, setEmailChangeOpen] = React.useState(false);
	const session = useSession();

	if (!session.currentAccount) return null;

	return (
		<>
			<div className="flex flex-row gap-2 mt-2 justify-between items-center bg-[#F2F2F2] dark:bg-[#302F2B] dim:bg-[#0f0f0f] rounded-[10px] px-6 py-4">
				<div className="flex flex-col justify-center">
					<p className="font-bold">Email</p>
					<p>{session.currentAccount.email}</p>
				</div>
				<Button
					className="!h-fit flex-none"
					onClick={() => setEmailChangeOpen(true)}
					filled
				>
					Change Email
				</Button>
			</div>

			<Modal
				show={emailChangeOpen}
				close={() => setEmailChangeOpen(false)}
				title="Change Email"
				subtitle="Soon."
				onConfirm={() => setEmailChangeOpen(false)}
				confirmDisabled={false}
			></Modal>
		</>
	);
}
