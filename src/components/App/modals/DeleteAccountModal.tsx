import Modal from "@/components/UI/Modal";
import Button from "@/components/UI/Button";
import React from "react";

export default function DeleteAccountModal() {
    const [deleteAccountOpen, setDeleteAccountOpen] = React.useState(false);

    return <>
        <div className="flex flex-row gap-2 mt-2 justify-between items-center bg-[#F2F2F2] dark:bg-[#302F2B] dim:bg-[#0f0f0f] rounded-[10px] px-6 py-4">
            <div className="flex flex-col justify-center">
                <p className="font-bold text-red-500 dark:text-red-400 dim:text-red-400">Delete Account</p>
                <p>This action is permanent and cannot be undone.</p>
            </div>
            <Button className="!h-fit flex-none" onClick={() => setDeleteAccountOpen(true)} destructive>Delete Account</Button>
        </div>

        <Modal
            show={deleteAccountOpen}
            close={() => setDeleteAccountOpen(false)}
            title="Delete Account"
            subtitle="Soon."
            onConfirm={() => setDeleteAccountOpen(false)}
            hideCloseButton
            destructive
            confirmDisabled={false}
        >
        </Modal>
    </>
}