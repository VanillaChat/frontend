import { zodResolver } from "@hookform/resolvers/zod";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useState } from "react";
import { type FieldError, type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import z from "zod/v4";
import Alert from "@/components/UI/Alert";
import { FormInput } from "@/components/UI/Input";
import { useSession } from "@/store/session";
import Button from "../components/UI/Button";
import DiscordIcon from "../icons/discord-icon.png";
import logo from "../icons/squarelogo.png";

const LoginSchema = z.object({
	email: z.email("login.errors.invalidEmail"),
	password: z.string("login.errors.invalidPassword"),
});

export default function Login() {
	const { t } = useTranslation();
	// const [data, setData] = useState({
	//   email: "",
	//   password: ""
	// });
	const [globalError, setGlobalError] = useState<string | null>(null);
	const navigate = useNavigate();
	const {
		handleSubmit,
		register,
		formState: { errors, isSubmitting, isValid },
		setError,
	} = useForm<z.infer<typeof LoginSchema>>({
		resolver: zodResolver(LoginSchema),
	});
	const session = useSession();

	useEffect(() => {
		if (session.currentUser) navigate("/channels/@me");
	}, [navigate, session.currentUser]);

	const onSubmit: SubmitHandler<z.infer<typeof LoginSchema>> = useCallback(
		async (data) => {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
				method: "POST",
				body: JSON.stringify(data),
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});
			if (res.status !== 204) {
				const json = await res.json();
				if (json.code === "VALIDATION_FAILED") {
					for (const error of json.errors) {
						setError(error.path, {
							type: "server",
							message: error.code,
						});
					}
				} else {
					if (json.path !== "global")
						setError(json.path, {
							type: "server",
							message: json.message,
						});
					else setGlobalError(json.code);
				}
			} else {
				setGlobalError(null);
				navigate("/channels/@me");
			}
		},
		[navigate, setError],
	);

	// const onPost = useCallback(async () => {
	//   const result = LoginSchema.safeParse(data);
	//   if (!result.success) {
	//     setError(result.error.issues[0].message);
	//   } else {
	//     const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
	//       method: 'POST',
	//       body: JSON.stringify(result.data),
	//       headers: {
	//         'Content-Type': 'application/json'
	//       },
	//       credentials: 'include'
	//     });
	//     if (res.status !== 204) {
	//       const json = await res.json();
	//       setError(json.message);
	//       return;
	//     } else {
	//       setError(null);
	//       navigate('/app');
	//     }
	//   }
	// }, [])

	return (
		<main
			id={`login-${nanoid()}`}
			className="flex flex-row justify-center dark:bg-[#262622] dim:bg-black gap-[90px] mt-[10vh] pb-[20px] max-[850px]:flex-col max-[850px]:justify-center max-[850px]:items-center max-[850px]:gap-0 max-[850px]:mt-[5vh]"
		>
			<div className="max-[850px]:flex max-[850px]:flex-col max-[850px]:justify-center max-[850px]:items-center">
				<img
					src={logo}
					alt="logo"
					className="w-[48px] h-[48px] rounded-[8px]"
				/>
				<h1 className="text-[30px] font-semibold mb-0 text-[#101028] mt-[20.1px] dark:text-white dim:text-white">
					{t("login.title")}
				</h1>
				<p className="my-[16px] text-[#667085] dark:text-white dim:text-white">
					{t("login.subtitle")}
				</p>
			</div>
			<div className="w-[385px]">
				{globalError && (
					<Alert variant="destructive" title="Validation error">
						{t(globalError)}
					</Alert>
				)}
				<form
					className="mt-[10px]"
					onSubmit={handleSubmit(onSubmit)}
					autoComplete="off"
				>
					<FormInput
						id={`email-${nanoid()}`}
						name="email"
						placeholder={t("login.emailPlaceholder")}
						label={t("common.email")}
						register={register}
						translatedError={{ error: errors.email as FieldError }}
					/>
					<FormInput
						id={`password-${nanoid()}`}
						name="password"
						type="password"
						placeholder="•••••••••••"
						label={t("common.password")}
						labelStyle={{ marginTop: "15px" }}
						register={register}
						translatedError={{ error: errors.password as FieldError }}
					/>
					<div className="flex justify-end w-[385px] py-[20px] px-0">
						<Link to="/forgot-password" className="text-[#d8bc21] no-underline">
							{t("login.forgotPassword")}
						</Link>
					</div>
					<Button
						filled
						submit
						disabled={isSubmitting || !isValid}
						style={{ width: "100%", marginBottom: "20px" }}
					>
						{t(isSubmitting ? "login.loggingIn" : "login.loginButton")}
					</Button>
					<div className="flex items-center my-[25px]">
						<div className="border-t border-1 border-[#eaecf0] dark:border-[#9b9da3] dim:border-[#9b9da3] flex-grow"></div>
						<div className="px-3 text-[#667085] dark:text-white dim:text-white">
							{t("common.or")}
						</div>
						<div className="border-t border-1 border-[#eaecf0] dark:border-[#9b9da3] dim:border-[#9b9da3] flex-grow"></div>
					</div>
					<Button
						style={{ width: "100%", marginTop: "20px" }}
						icon={DiscordIcon}
					>
						{t("login.signInWithDiscord")}
					</Button>
					<p className="text-center mt-7 text-[#667085] dark:text-white dim:text-white">
						{t("login.dontHaveAccount")}{" "}
						<Link to="/register" className="text-[#D8BC21] no-underline">
							{t("login.signUp")}
						</Link>
					</p>
				</form>
			</div>
		</main>
	);

	// return (
	//   <main id="login" className="login-form">
	//     <div className="branding">
	//       <img src={logo} alt="logo" className="form-logo" />
	//       <h1 className="form-heading">{t("login.title")}</h1>
	//       <p>{t("login.subtitle")}</p>
	//     </div>
	//     <div className="form" onSubmit={handleSubmit(onSubmit)}>
	//       {globalError && <Alert variant="destructive" title="Validation error">{t(globalError)}</Alert>}
	//       <form style={{ marginTop: "10px" }}>
	//         <FormInput
	//           id="email"
	//           type="text"
	//           placeholder={t("login.emailPlaceholder")}
	//           label={t("common.email")}
	//           name="email"
	//           register={register}
	//           translatedError={{error: errors.email!}}
	//         />
	//         <FormInput
	//           type="password"
	//           placeholder="•••••••••••"
	//           label={t("common.password")}
	//           labelStyle={{ marginTop: "15px" }}
	//           id="password"
	//           name="password"
	//           register={register}
	//           translatedError={{error: errors.password!}}
	//         />
	//         <div className="fe">
	//           <Link to="/forgot-password" className="forgot-password">
	//             {t("login.forgotPassword")}
	//           </Link>
	//         </div>
	//         <Button
	//             filled
	//             submit
	//             disabled={isSubmitting || !isValid}
	//             style={{ width: "100%", marginTop: "20px", marginBottom: "20px" }}
	//         >
	//           {t(isSubmitting ? "login.loggingIn" : "login.loginButton")}
	//         </Button>
	//         <p className="line">{t("common.or")}</p>
	//         <Button
	//             style={{ width: "385px", marginTop: "20px" }}
	//             icon={DiscordIcon}
	//         >
	//           {t("login.signInWithDiscord")}
	//         </Button>
	//         <p className="sign-up-text">
	//           {t("login.dontHaveAccount")}{" "}
	//           <Link to="/register">{t("login.signUp")}</Link>
	//         </p>
	//       </form>
	//     </div>
	//   </main>
	// );
}
