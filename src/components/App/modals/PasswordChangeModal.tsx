import React from "react";
import Button from "@/components/UI/Button";
import Modal from "@/components/UI/Modal";

export default function PasswordChangeModal() {
	const [passwordChangeOpen, setPasswordChangeOpen] = React.useState(false);

	return (
		<>
			<div className="flex flex-row gap-2 mt-2 justify-between items-center bg-[#F2F2F2] dark:bg-[#302F2B] dim:bg-[#0f0f0f] rounded-[10px] px-6 py-4">
				<div className="flex flex-col justify-center">
					<p className="font-bold">Password</p>
					<p>Changing your password will log you out of all active sessions.</p>
				</div>
				<Button
					className="!h-fit flex-none"
					onClick={() => setPasswordChangeOpen(true)}
					filled
				>
					Change Password
				</Button>
			</div>

			<Modal
				show={passwordChangeOpen}
				close={() => setPasswordChangeOpen(false)}
				title="Change Password"
				subtitle="Soon."
				onConfirm={() => setPasswordChangeOpen(false)}
				confirmDisabled={false}
			></Modal>
		</>
	);
}
