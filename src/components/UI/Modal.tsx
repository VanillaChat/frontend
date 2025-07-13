import {createPortal} from "react-dom";
import {ReactNode, ReactPortal, useEffect} from "react";
import Button from "./Button";
import {AnimatePresence, motion} from "framer-motion";
import "../../styles/UI/Modal.css";
import Server from "../../icons/Server.svg";
import ChipIcon from "./ChipIcon";
import {useTranslation} from "react-i18next";

type ModalProps = {
  show: boolean;
  close: () => void;
  title: string;
  children?: ReactNode;
  confirmText?: string;
  onConfirm?: () => void;
  subtitle?: string;
  onClose?: () => void;
  confirmDisabled?: boolean;
  closable?: boolean;
};

const Modal = ({
                 show,
                 close,
                 title,
                 children,
                 onConfirm,
                 confirmText,
                 subtitle,
                 closable = true,
                 confirmDisabled
               }: ModalProps): ReactPortal => {
  const { t } = useTranslation();
  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "Escape":
        if (show && closable) close();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [show, closable]);
  return createPortal(
      <AnimatePresence initial={false} onExitComplete={() => void 0}>
        {show && (
            <div className="fixed top-0 z-50 bottom-0 left-0 right-0 bg-backdrop-modal dark:bg-backdrop-modal-dark dim:bg-backdrop-modal-dark backdrop-blur-[5px] flex justify-center items-center transition-opacity duration-[0.25s] ease-in-out">
              <div className="absolute top-0 bottom-0 right-0 left-0" onClick={closable ? close : void 0} />
              <motion.div
                  className="flex flex-col w-[500px] p-8 rounded-[12px] bg-white dark:bg-[#2C2B27] dim:bg-[#1B1A17] backdrop-blur-[5px] shadow-modal"
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
                  onClick={(e) => e.stopPropagation()}
              >
                <header className="relative flex justify-center items-center flex-col">
                  <ChipIcon icon={Server} />
                  <p className="text-center font-semibold text-[18px] flex flex-col items-center justify-center mt-[15px] mb-[5px]">{title}</p>
                  {subtitle && <p className="text-[#667085] dark:text-white dim:text-white text-[14px] font-normal text-center mt-[5px]">{subtitle}</p>}
                </header>
                <main className="py-4">{children}</main>
                <footer className="flex flex-row justify-center items-center w-[100%] mt-auto first:mr-2 gap-2 [&>button]:rounded-[8px] [&>button]:flex [&>button]:w-[100%]">
                  <Button onClick={closable ? close : void 0} disabled={!closable}>{t("common.cancel")}</Button>
                  <Button onClick={onConfirm} filled disabled={confirmDisabled}>
                    {confirmText ?? "Confirm"}
                  </Button>
                </footer>
              </motion.div>
            </div>
        )}
      </AnimatePresence>,
      document.getElementById("where-modals")!
  );
};

export default Modal;
