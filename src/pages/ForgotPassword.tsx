import { zodResolver } from "@hookform/resolvers/zod";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useState } from "react";
import { type FieldError, type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import z from "zod/v4";
import Alert from "@/components/UI/Alert";
import Button from "@/components/UI/Button";
import { FormInput } from "@/components/UI/Input";
import logo from "@/icons/squarelogo.png";
import { useSession } from "@/store/session";

const ForgotPasswordSchema = z.object({
	email: z.email("login.errors.invalidEmail"),
});

export default function ForgotPassword() {
	const { t } = useTranslation();
	const [globalError, _] = useState<string | null>(null);
	const {
		handleSubmit,
		register,
		formState: { errors, isSubmitting, isValid },
		// setError
	} = useForm<z.infer<typeof ForgotPasswordSchema>>({
		resolver: zodResolver(ForgotPasswordSchema),
	});
	const navigate = useNavigate();
	const session = useSession();

	useEffect(() => {
		if (session.currentUser) navigate("/channels/@me");
	}, [navigate, session.currentUser]);

	const onSubmit: SubmitHandler<z.infer<typeof ForgotPasswordSchema>> =
		useCallback(async () => {
			// const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
			//   method: 'POST',
			//   body: JSON.stringify(data),
			//   headers: {
			//     'Content-Type': 'application/json'
			//   },
			//   credentials: 'include'
			// });
			// if (res.status !== 204) {
			//   const json = await res.json();
			//   if (json.code === 'VALIDATION_FAILED') {
			//     for (const error of json.errors) {
			//       setError(error.path, {
			//         type: 'server',
			//         message: error.code
			//       });
			//     }
			//   } else {
			//     if (json.path !== 'global') setError(json.path, {
			//       type: 'server',
			//       message: json.message
			//     });
			//     else setGlobalError(json.code);
			//   }
			// } else {
			//   setGlobalError(null);
			//   navigate('/app');
			// }
		}, []);

	return (
		<main
			id={`forgot-password-${nanoid()}`}
			className="flex flex-row justify-center dark:bg-[#262622] dim:bg-black gap-[90px] mt-[10vh] pb-[20px] max-[850px]:flex-col max-[850px]:justify-center max-[850px]:items-center max-[850px]:gap-0 max-[850px]:mt-[5vh]"
		>
			<div className="max-[850px]:flex max-[850px]:flex-col max-[850px]:justify-center max-[850px]:items-center">
				<img
					src={logo}
					alt="logo"
					className="w-[48px] h-[48px] rounded-[8px]"
				/>
				<h1 className="text-[30px] font-semibold mb-0 text-[#101028] dark:text-white dim:text-white mt-[20.1px]">
					{t("forgotPassword.title")}
				</h1>
				<p className="my-[16px] max-w-[420px] max-[850px]:text-center">
					{t("forgotPassword.subtitle")}
				</p>
			</div>
			<div className="w-[385px]">
				{globalError && (
					<Alert variant="destructive" title="Validation error">
						{t(globalError)}
					</Alert>
				)}
				<form className="mt-[10px]" onSubmit={handleSubmit(onSubmit)}>
					<FormInput
						id={`email-${nanoid()}`}
						name="email"
						placeholder={t("login.emailPlaceholder")}
						label={t("common.email")}
						register={register}
						translatedError={{ error: errors.email as FieldError }}
					/>
					<Button
						filled
						submit
						disabled={isSubmitting || !isValid}
						style={{ width: "100%", marginBottom: "20px", marginTop: "30px" }}
					>
						{t(
							isSubmitting
								? "forgotPassword.resettingPassword"
								: "forgotPassword.resetPassword",
						)}
					</Button>
					{/*<p className="text-center mt-7 text-[#667085]">*/}
					{/*  {t("login.dontHaveAccount")}{" "}*/}
					{/*  <Link to="/register" className="text-[#D8BC21] no-underline">{t("login.signUp")}</Link>*/}
					{/*</p>*/}
					<div className="flex items-center my-[25px]">
						<div className="border-t border-1 border-[#eaecf0] dark:border-[#9b9da3] dim:border-[#9b9da3] flex-grow"></div>
						<div className="px-3 text-[#667085] dark:text-white dim:text-white">
							{t("forgotPassword.goBackTitle")}
						</div>
						<div className="border-t border-1 border-[#eaecf0] dark:border-[#9b9da3] dim:border-[#9b9da3] flex-grow"></div>
					</div>
					<Button to="/login" style={{ marginTop: "10px" }}>
						<svg
							className="mr-[5px] pointer-events-none"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							role="img"
							aria-label="arrow left icon"
						>
							<path
								d="M19 12H5M5 12L12 19M5 12L12 5"
								stroke="white"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
						{t("forgotPassword.goBack")}
					</Button>
				</form>
			</div>
		</main>
	);
	// return (
	//   <main id="forgot-password">
	//     <div className="login-form">
	//       <div className="branding">
	//         <img src={logo} alt="logo" className="form-logo" />
	//         <h1 className="form-heading">{t("forgotPassword.title")}</h1>
	//         <p className="leading">{t("forgotPassword.subtitle")}</p>
	//       </div>
	//       <div className="form">
	//         <form style={{ marginTop: "10px" }}>
	//           <Input
	//             id="email"
	//             type="text"
	//             placeholder={t("login.emailPlaceholder")}
	//             label={t("common.email")}
	//           />
	//         </form>
	//         <Button filled style={{ width: "100%", marginTop: "20px" }}>
	//           {t("forgotPassword.resetPassword")}
	//         </Button>
	//         <Button icon={ArrowLeft} to="/login" style={{ marginTop: "10px" }}>
	//           {t("forgotPassword.goBack")}
	//         </Button>
	//       </div>
	//     </div>
	//   </main>
	// );
}
