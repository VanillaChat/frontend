import clsx from "clsx";

export type AlertProps = {
	variant?: "neutral" | "primary" | "success" | "warning" | "destructive";
	title?: string;
	children: string;
};

export default function Alert(props: AlertProps) {
	return (
		<div className={clsx("alert", props.variant || "neutral")}>
			{props.title && <span className="title">{props.title}</span>}
			<span className="description">{props.children}</span>
		</div>
	);
}
