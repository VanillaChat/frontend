import { Checkbox } from "@base-ui-components/react/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { nanoid } from "nanoid";
import React from "react";
import {
	Controller,
	type FieldError,
	type SubmitHandler,
	useForm,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import z from "zod/v4";
import { CheckIcon } from "@/components/App/panes/AccountSettingsPane";
import Alert from "@/components/UI/Alert";
import Button from "@/components/UI/Button";
import { FormInput } from "@/components/UI/Input";
import Modal from "@/components/UI/Modal";
import { useServers } from "@/store/servers";
import { useSession } from "@/store/session";
import cn from "@/utils/cn";

dayjs.extend(relativeTime);

const AccountDeleteSchema = z.object({
	password: z.string().min(2),
	confirm: z.literal("DELETE ACCOUNT").optional(),
	deleteMessages: z.boolean().default(false).optional(),
});

export default function DeleteAccountModal() {
	const [deleteAccountOpen, setDeleteAccountOpen] = React.useState(false);
	const [globalError, setGlobalError] = React.useState<string | null>(null);
	const servers = useServers();
	const session = useSession();
	const { t } = useTranslation();

	const serversOwned = servers.data.filter(
		(x) => x.ownerId === session.currentAccount?.id,
	);
	const {
		register,
		handleSubmit,
		formState: { errors, isValid, isSubmitting },
		setError,
		control,
		watch,
	} = useForm<z.infer<typeof AccountDeleteSchema>>({
		resolver: zodResolver(AccountDeleteSchema),
		defaultValues: {
			deleteMessages: false,
		},
	});
	const onSubmit: SubmitHandler<z.infer<typeof AccountDeleteSchema>> =
		React.useCallback(
			async (data) => {
				try {
					if (serversOwned.length > 0) {
						setDeleteAccountOpen(false);
						return;
					}
					const res = await fetch(
						`${import.meta.env.VITE_API_URL}/users/@me/request-deletion`,
						{
							method: "POST",
							credentials: "include",
							body: JSON.stringify({
								password: data.password,
								deleteMessages: data.deleteMessages,
							}),
							headers: {
								"Content-Type": "application/json",
							},
						},
					);
					const json = await res.json();
					if (res.status === 200) {
						setDeleteAccountOpen(false);
						session.setSettings({
							pendingDeletion: true,
							deleteAt: json.deleteAt,
						});
					} else {
						if (json.path === "global") setGlobalError(json.message);
						else setError(json.path, json.message);
					}
				} catch (e) {
					console.error(e);
				}
			},
			[serversOwned.length, session.setSettings, setError],
		);

	const cancelDeletion = async () => {
		const res = await fetch(
			`${import.meta.env.VITE_API_URL}/users/@me/cancel-deletion`,
			{
				method: "POST",
				credentials: "include",
			},
		);

		if (res.status === 204) {
			session.setSettings({ pendingDeletion: false });
		}
	};

	if (!session.currentAccount) return null;

	return (
		<>
			<div
				className={cn(
					"flex flex-row gap-2 mt-2 justify-between items-center bg-[#F2F2F2] dark:bg-[#302F2B] dim:bg-[#0f0f0f] rounded-[10px] outline-transparent outline-[2px] px-6 py-4",
					{
						"outline-red-500 dark:outline-red-400 dim:outline-red-400":
							session.settings.pendingDeletion,
					},
				)}
			>
				<div className="flex flex-col justify-center">
					<p className="font-bold text-red-500 dark:text-red-400 dim:text-red-400 flex items-center">
						{session.settings.pendingDeletion ? (
							<>
								Account Pending Deletion
								<small className="text-gray-500 dark:text-gray-400 dim:text-gray-400 ml-2">
									({dayjs(Number(session.settings.deleteAt)).fromNow()})
								</small>
							</>
						) : (
							"Delete Account"
						)}
					</p>
					<p>
						{session.settings.pendingDeletion
							? "Your account is scheduled for deletion. Click the following button to cancel."
							: "This action is permanent and cannot be undone."}
					</p>
				</div>
				{session.settings.pendingDeletion ? (
					<Button
						className="!h-fit flex-none"
						onClick={async () => await cancelDeletion()}
						destructive
					>
						Cancel Deletion
					</Button>
				) : (
					<Button
						className="!h-fit flex-none"
						onClick={() => setDeleteAccountOpen(true)}
						destructive
					>
						Delete Account
					</Button>
				)}
			</div>

			<Modal
				show={deleteAccountOpen}
				close={() => setDeleteAccountOpen(false)}
				title="Delete Account"
				subtitle={
					serversOwned.length > 0
						? `You can't delete your account because you own ${serversOwned.length} servers. Please transfer ownership to another member or delete the servers first.`
						: "You're about to delete your account. This action is permanent and cannot be undone. Once confirmed, your account will be scheduled for deletion and deleted after 7 days."
				}
				onConfirm={async (e) => {
					e.preventDefault();
					if (serversOwned.length > 0) {
						setDeleteAccountOpen(false);
						return;
					}
					await handleSubmit(onSubmit)();
				}}
				hideCloseButton={serversOwned.length > 0}
				destructive
				confirmText={
					serversOwned.length === 0
						? isSubmitting
							? "Submitting..."
							: "Delete Account"
						: "Confirm"
				}
				confirmDestructive={serversOwned.length === 0}
				confirmDisabled={
					serversOwned.length === 0 && (!isValid || isSubmitting)
				}
				closable={!isSubmitting}
			>
				{serversOwned.length === 0 && (
					<>
						{globalError && (
							<Alert variant="destructive" title="Server error">
								{t(globalError)}
							</Alert>
						)}
						<form
							onSubmit={handleSubmit(onSubmit)}
							className="flex flex-col gap-2 mb-2"
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									handleSubmit(onSubmit)();
								}
							}}
						>
							<Controller
								render={({ field }) => (
									// biome-ignore lint/a11y/useKeyWithClickEvents: yes
									<label
										className="flex items-center gap-2 text-base text-gray-900 dark:text-gray-100 dim:text-gray-200 mt-4 cursor-pointer group"
										htmlFor="deleteMessages"
										onClick={() => field.onChange(!field.value)}
									>
										<Checkbox.Root
											checked={field.value}
											onCheckedChange={(checked) => field.onChange(!!checked)}
											className={cn(
												"group relative flex size-5 items-center justify-center rounded border-2 transition-colors cursor-pointer",
												"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
												"border-gray-300 dark:border-gray-500 dim:border-gray-600",
												"disabled:opacity-50 disabled:cursor-not-allowed",
												{
													"bg-[#f7e26c] border-[#f7e26c] border-none":
														field.value,
													"hover:border-gray-400 dark:hover:border-gray-400 dim:hover:border-gray-500 group-hover:border-gray-400 dark:group-hover:border-gray-400 dim:group-hover:border-gray-500":
														!field.value,
												},
											)}
											name="deleteMessages"
										>
											<Checkbox.Indicator>
												<div
													className={cn(
														"absolute inset-0 flex items-center justify-center rounded-sm transition-colors",
														{
															"bg-[#f7e26c]": field.value,
															"group-hover:bg-gray-200 dark:group-hover:bg-gray-600 dim:group-hover:bg-gray-700":
																!field.value,
														},
													)}
												>
													<CheckIcon
														className={cn("size-3.5 transition-opacity", {
															"text-gray-900 dark:text-gray-900 dim:text-gray-900":
																field.value,
															"text-gray-400 opacity-0 group-hover:opacity-100 dark:group-hover:text-gray-300 dim:group-hover:text-gray-300":
																!field.value,
														})}
													/>
												</div>
											</Checkbox.Indicator>
										</Checkbox.Root>
										<span className="text-sm font-medium">
											Delete all messages
										</span>
									</label>
								)}
								control={control}
								rules={{ required: false }}
								name="deleteMessages"
							/>
							<small>
								{watch("deleteMessages")
									? "Messages will be deleted."
									: "Messages will be kept and anonymized."}
							</small>
							<FormInput
								type="text"
								placeholder="DELETE ACCOUNT"
								label='Confirm with "DELETE ACCOUNT"'
								name="confirm"
								id={`confirm-${nanoid()}`}
								labelStyle={{ marginTop: "15px" }}
								className="dark:bg-[#302F2B] dim:bg-[#0f0f0f]"
								containerClass="mt-2"
								register={register}
								translatedError={{ error: errors.confirm as FieldError }}
							/>
							<FormInput
								type="password"
								placeholder="Enter your password"
								label="Password"
								name="password"
								id={`password-${nanoid()}`}
								labelStyle={{ marginTop: "15px" }}
								className="dark:bg-[#302F2B] dim:bg-[#0f0f0f]"
								containerClass="mt-2"
								register={register}
								translatedError={{ error: errors.password as FieldError }}
							/>
						</form>
					</>
				)}
			</Modal>
		</>
	);
}
