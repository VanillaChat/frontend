import {createPortal} from "react-dom";
import {JSX, ReactNode, useEffect, useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import {serverLinkStyle} from "@/utils/serverLinkStyle";
import {FaXmark} from "react-icons/fa6";
import {useAppStore} from "@/store/app";

type ModalProps = {
    children?: ReactNode;
    ButtonElement: (props: {onClick: () => void}) => JSX.Element;
};

const FullScreen = ({
                   children,
                   ButtonElement
               }: ModalProps): ReactNode => {
    const [show, setShow] = useState(false);
    const appStore = useAppStore();
    const handleKeyDown = (event: KeyboardEvent) => {
        switch (event.key) {
            case "Escape":
                if (show) {
                    setShow(false);
                    appStore.setHasModal(false);
                }
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [show]);
    return <>
        <ButtonElement onClick={() => {
            setShow(true);
            appStore.setHasModal(true);
        }} />
        {createPortal(
            <AnimatePresence initial={false} onExitComplete={() => void 0}>
                {show && (
                    <motion.div
                        className="fixed z-50 w-[100%] h-[100%] flex transition-opacity duration-[0.25s] ease-in-out rounded-[12px] bg-white dark:bg-[#2C2B27] dim:bg-[#141413] backdrop-blur-[5px] shadow-modal"
                        initial={{
                            opacity: 0,
                            scale: 1.2,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            transition: {
                                ease: "easeIn",
                                duration: 0.3,
                            },
                        }}
                        exit={{
                            opacity: 0,
                            scale: 1.2,
                            transition: {
                                ease: "easeOut",
                                duration: 0.15,
                            },
                        }}
                    >
                        <div
                            onClick={() => {
                                setShow(false);
                                appStore.setHasModal(false);
                            }}
                            className={serverLinkStyle({
                                isActive: false,
                                className: 'absolute right-0 mr-12 mt-11 w-[42px] h-[42px] rounded-[12px] z-[100]'
                            })}
                        >
                            <FaXmark />
                        </div>
                        {/*<div className="absolute top-0 bottom-0 right-0 left-0" onClick={() => void 0} />*/}
                        <main className="flex flex-row w-full">{children}</main>
                    </motion.div>
                )}
            </AnimatePresence>,
            document.getElementById("where-modals")!
        )}
    </>;
};

export default FullScreen;
