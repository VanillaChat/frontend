import { createPortal } from "react-dom";
import { ReactNode } from "react";
import Button from "./Button";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/Modal.css";
import Server from "../icons/Server.svg";
import ChipIcon from "./ChipIcon";

type ModalProps = {
  show: boolean;
  close: () => void;
  title: string;
  children?: ReactNode;
  confirmText?: string;
  onConfirm?: () => void;
  subtitle?: string;
};

const Modal = ({
  show,
  close,
  title,
  children,
  onConfirm,
  confirmText,
  subtitle,
}: ModalProps) => {
  return createPortal(
    <AnimatePresence initial={false} onExitComplete={() => void 0}>
      {show && (
        <div className="modalContainer">
          <div id="additional" onClick={close} />
          <motion.div
            className="modal"
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
            <header className="modal_header">
              <ChipIcon icon={Server} />
              <p className="modal_header-title">{title}</p>
              {subtitle && <p className="modal_header-subtitle">{subtitle}</p>}
            </header>
            <main className="modal_content">{children}</main>
            <footer className="modal_footer">
              <Button onClick={() => close()}>Cancel</Button>
              <Button onClick={onConfirm} filled>
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
