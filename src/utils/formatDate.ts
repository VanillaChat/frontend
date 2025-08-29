import dayjs from "dayjs";

export function formatDate(input: Date | string) {
	const date = dayjs(input).utc().local();

	if (date.isToday()) {
		return `Today at ${date.format("HH:mm")}`;
	} else if (date.isYesterday()) {
		return `Yesterday at ${date.format("HH:mm")}`;
	} else if (date.isTomorrow()) {
		return `Tomorrow at ${date.format("HH:mm")}`;
	}

	return date.format("DD.MM.YYYY HH:mm");
}
