import React from "react";
import cn from "@/utils/cn";

export type AvatarProps = {
    width: string | number;
    height: string | number;
    id: string;
    avatar?: string | null;
    className?: string;
    style?: React.CSSProperties;
}

export default function Avatar(props: AvatarProps) {
    return <img
        width={props.width}
        height={props.height}
        src={`${import.meta.env.VITE_API_URL}/cdn/${props.avatar ? `/avatars/${props.id}/${props.avatar}.webp` : `/embed/avatars/${(BigInt(props.id) >> 22n) % 6n}.webp`}`}
        alt="user avatar"
        className={cn(
            "rounded-full shrink-0",
            props.className
        )}
        style={props.style}
    />
}