import React, {useCallback, useEffect, useState} from "react";
import logo from "@/icons/squarelogo.png";
import "@/styles/Pages/Login.css";
import {FormInput} from "@/components/UI/Input";
import Button from "@/components/UI/Button";
import DiscordIcon from "@/icons/discord-icon.png";
import {Link, useNavigate} from "react-router-dom";
import useMeta from "@/hooks/useMeta";
import {useTranslation} from "react-i18next";
import z from "zod/v4";
import {SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import Alert from "@/components/UI/Alert";
import CookieMaster from "@/utils/CookieMaster";

export const UserSchema = z.object({
   email: z.email("register.errors.invalidEmail"),
   username: z.string()
       .min(2, "register.errors.usernameTooShort")
       .max(64, "register.errors.usernameTooLong"),
   password: z
       .string()
       .min(8, "register.errors.passwordTooShort")
       .max(128, "register.errors.passwordTooLong")
       .refine(password => /[a-z]/.test(password), "register.errors.passwordLowercase")
       .refine(password => /[A-Z]/.test(password), "register.errors.passwordUppercase")
       .refine(password => /[0-9]/.test(password), "register.errors.passwordDigit")
       .refine(password => /[$&+,:;=?@#|'<>.^*()%!-]/.test(password), "register.errors.passwordSpecialCharacter"),
    confirmPassword: z.string(),
    inviteCode: z.string().nullable()
}).refine(data => data.password === data.confirmPassword, {
    message: "register.errors.passwordNotConfirmed",
    path: ['confirmPassword']
});

export default function Register() {
  // const [data, setData] = useState({
  //   email: "",
  //   password: "",
  //   confirmPassword: "",
  //   username: ""
  // });
  const [globalError, setGlobalError] = useState<string | null>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  useMeta("Sign up");
  const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting, isValid },
      setError
  } = useForm<z.infer<typeof UserSchema>>({
      resolver: zodResolver(UserSchema)
  });

    useEffect(() => {
        if (CookieMaster.get(import.meta.env.PROD ? '__Host-Token' : 'token')) navigate('/channels/@me');
    }, []);

  const onSubmit: SubmitHandler<z.infer<typeof UserSchema>> = useCallback(async (data) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
         method: 'POST',
         body: JSON.stringify(data),
          headers: {
             'Content-Type': 'application/json'
          },
          credentials: "include"
      });
      if (res.status !== 204) {
          const json = await res.json();
          if (json.code === 'VALIDATION_FAILED') {
              for (const error of json.errors) {
                  setError(error.path, {
                      type: 'server',
                      message: error.code,
                  });
              }
          } else {
              if (json.path !== 'global') setError(json.path, {
                  type: 'server',
                  message: json.code
              });
              else setGlobalError(json.code);
          }
      } else {
          setGlobalError(null);
          navigate('/channels/@me');
      }
  }, []);

  // useEffect(() => {
  //     console.log(data);
  // }, [data]);

  // const onPost = useCallback(async () => {
  //     const result = UserSchema.safeParse(data);
  //     if (!result.success) {
  //         console.log(data);
  //         console.log(result.error);
  //         console.log(result.error.issues);
  //         console.log(result.error.message);
  //         console.log(result.error.stack);
  //         console.log(result.error.cause);
  //         setError(result.error.issues[0].message);
  //     } else {
  //         const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
  //             method: 'POST',
  //             body: JSON.stringify(result.data),
  //             headers: {
  //                 'Content-Type': 'application/json'
  //             },
  //             credentials: "include"
  //         });
  //         if (res.status !== 204) {
  //             const json = await res.json();
  //             setError(json.message);
  //             return;
  //         } else {
  //             setError(null);
  //             navigate('/app');
  //         }
  //     }
  // }, []);

    return (
        <main id="register" className="flex flex-row justify-center dark:bg-[#262622] dim:bg-black gap-[90px] mt-[10vh] pb-[20px] max-[850px]:flex-col max-[850px]:justify-center max-[850px]:items-center max-[850px]:gap-0 max-[850px]:mt-[5vh]">
            <div className="max-[850px]:flex max-[850px]:flex-col max-[850px]:justify-center max-[850px]:items-center">
                <img src={logo} alt="logo" className="w-[48px] h-[48px] rounded-[8px]" />
                <h1 className="text-[30px] font-semibold mb-0 text-[#101028] dark:text-white dim:text-white mt-[20.1px]">{t('register.title')}</h1>
                <p className="my-[16px]">{t("register.subtitle", { appName: import.meta.env.VITE_APP_NAME })}</p>
            </div>
            <div className="w-[385px]">
                {globalError && <Alert variant="destructive" title="Validation error">{t(globalError)}</Alert>}
                <form className="mt-[10px]" onSubmit={handleSubmit(onSubmit)}>
                    <FormInput
                        type="text"
                        placeholder={t("placeholder.username")}
                        label={t("common.username")}
                        name="username"
                        id="username"
                        register={register}
                        translatedError={{error: errors.username!, params: {minLength: 2, maxLength: 64}}}
                        // onChange={(e) => setData(d => ({...d, username: e.target.value}))}
                    />
                    <FormInput
                        type="text"
                        placeholder="example@example.com"
                        label={t("common.email")}
                        name="email"
                        id="email"
                        labelStyle={{ marginTop: "15px" }}
                        register={register}
                        translatedError={{error: errors.email!}}
                        // onChange={(e) => setData(d => ({...d, email: e.target.value}))}
                    />
                    {import.meta.env.VITE_REGISTRATION_CLOSED && <FormInput
                        type="text"
                        placeholder="Invite Code"
                        label={t("common.inviteCode")}
                        name="inviteCode"
                        id="inviteCode"
                        labelStyle={{ marginTop: "15px" }}
                        register={register}
                        translatedError={{error: errors.inviteCode!}}
                        // onChange={(e) => setData(d => ({...d, email: e.target.value}))}
                    />}
                    <FormInput
                        type="password"
                        placeholder="•••••••••••"
                        label={t("common.password")}
                        labelStyle={{ marginTop: "15px" }}
                        name="password"
                        id="password"
                        register={register}
                        translatedError={{error: errors.password!, params: {minLength: 8, maxLength: 128}}}
                        // onChange={(e) => setData(d => ({...d, password: e.target.value}))}
                    />
                    <FormInput
                        type="password"
                        placeholder="•••••••••••"
                        label={t("common.repeatPassword")}
                        labelStyle={{ marginTop: "15px" }}
                        name="confirmPassword"
                        id="confirmPassword"
                        register={register}
                        translatedError={{error: errors.confirmPassword!}}
                        // onChange={(e) => setData(d => ({...d, confirmPassword: e.target.value}))}
                    />
                    <Button
                        filled
                        style={{ width: "100%", marginTop: "20px", marginBottom: "20px" }}
                        submit
                        disabled={isSubmitting || !isValid}
                    >
                        {t(isSubmitting ? "register.creatingAccount" : "common.getStarted")}
                    </Button>
                </form>
                <div className="flex items-center my-[25px]">
                    <div className="border-t border-1 border-[#eaecf0] dark:border-[#9b9da3] dim:border-[#9b9da3] flex-grow"></div>
                    <div className="px-3 text-[#667085] dark:text-white dim:text-white">{t('common.or')}</div>
                    <div className="border-t border-1 border-[#eaecf0] dark:border-[#9b9da3] dim:border-[#9b9da3] flex-grow"></div>
                </div>
                <Button
                    style={{ width: "100%", marginTop: "20px" }}
                    icon={DiscordIcon}
                >
                    {t("register.useDiscord")}
                </Button>
                <p className="text-center mt-7 text-[#667085] dark:text-white dim:text-white">
                    {t("register.alreadyHaveAccount")}{" "}
                    <Link to="/login" className="text-[#D8BC21] no-underline">{t("register.signIn")}</Link>
                </p>
            </div>
        </main>
    )

  // return (
  //   <main id="register" className="login-form">
  //     <div className="branding">
  //         <img src={logo} alt="logo" className="form-logo" />
  //         <h1 className="form-heading">{t("register.title")}</h1>
  //         <p>
  //             {t("register.subtitle", { appName: import.meta.env.VITE_APP_NAME })}
  //         </p>
  //     </div>
  //     <div className="form" onSubmit={() => console.log("form submitted")}>
  //         {globalError && <Alert variant="destructive" title="Validation error">{t(globalError)}</Alert>}
  //       <form style={{ marginTop: "10px" }} onSubmit={handleSubmit(onSubmit)}>
  //         <FormInput
  //           type="text"
  //           placeholder={t("placeholder.username")}
  //           label={t("common.username")}
  //           name="username"
  //           id="username"
  //           register={register}
  //           translatedError={{error: errors.username!, params: {minLength: 2, maxLength: 64}}}
  //           // onChange={(e) => setData(d => ({...d, username: e.target.value}))}
  //         />
  //         <FormInput
  //           type="text"
  //           placeholder="example@example.com"
  //           label={t("common.email")}
  //           name="email"
  //           id="email"
  //           labelStyle={{ marginTop: "15px" }}
  //           register={register}
  //           translatedError={{error: errors.email!}}
  //             // onChange={(e) => setData(d => ({...d, email: e.target.value}))}
  //         />
  //         <FormInput
  //           type="password"
  //           placeholder="•••••••••••"
  //           label={t("common.password")}
  //           labelStyle={{ marginTop: "15px" }}
  //           name="password"
  //           id="password"
  //           register={register}
  //           translatedError={{error: errors.password!, params: {minLength: 8, maxLength: 128}}}
  //           // onChange={(e) => setData(d => ({...d, password: e.target.value}))}
  //         />
  //         <FormInput
  //           type="password"
  //           placeholder="•••••••••••"
  //           label={t("common.repeatPassword")}
  //           labelStyle={{ marginTop: "15px" }}
  //           name="confirmPassword"
  //           id="confirmPassword"
  //           register={register}
  //           translatedError={{error: errors.confirmPassword!}}
  //           // onChange={(e) => setData(d => ({...d, confirmPassword: e.target.value}))}
  //         />
  //           <Button
  //               filled
  //               style={{ width: "100%", marginTop: "20px", marginBottom: "20px" }}
  //               submit
  //               disabled={isSubmitting || !isValid}
  //           >
  //               {t(isSubmitting ? "register.creatingAccount" : "common.getStarted")}
  //           </Button>
  //       </form>
  //         {/*{import.meta.env.DEV && <Button style={{width: '100%', marginTop: '20px', marginBottom: '20px'}} onClick={async () => {*/}
  //         {/*    await fetch(`${import.meta.env.VITE_API_URL}/auth/clear-db`, {*/}
  //         {/*        method: 'DELETE',*/}
  //         {/*        headers: {*/}
  //         {/*            'Content-Type': 'application/json'*/}
  //         {/*        }*/}
  //         {/*    });*/}
  //         {/*}}>Clear database (dev only)</Button> }*/}
  //       <p className="line">{t("common.or")}</p>
  //       <Button
  //         style={{ width: "385px", marginTop: "20px" }}
  //         icon={DiscordIcon}
  //       >
  //         {t("register.useDiscord")}
  //       </Button>
  //       <p className="sign-up-text">
  //         {t("register.alreadyHaveAccount")}{" "}
  //         <Link to="/login">{t("register.signIn")}</Link>
  //       </p>
  //     </div>
  //   </main>
  // );
}
