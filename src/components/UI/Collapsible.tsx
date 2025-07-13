import "../../styles/UI/Collapsible.css";
import {ReactNode, useState} from "react";
import collapse from "../../icons/collapse.svg";

export type CollapsibleProps = {
    title: string;
    expandedTitle?: string;
    children: ReactNode;
}

export default function Collapsible(props: CollapsibleProps) {
    const [open, setOpen] = useState(false);
    return <div className="border-[2px] border-[#e6e6e6] rounded-[8px] whitespace-pre-wrap max-w-[80vw] max-h-[40vh] overflow-auto select-text pointer-events-auto p-[16px_18px]">
        <div className="flex flex-row gap-[6px] mb-[12px] cursor-pointer items-center opacity-[.7] transition-all duration-[.2s]" onClick={() => setOpen(value => !value)}>
            <img src={collapse} alt="collapse icon" className="transition-all duration-[.2s]" style={{transform: open ? 'rotate(-180deg)' : 'rotate(0deg)'}} />
            <p>{(open && props.expandedTitle) ? props.expandedTitle : props.title}</p>
        </div>
        {open && props.children}
    </div>
}