export default function trimString(str: string, length: number = 16) {
    return str.length > 16 ? str.slice(0, length) + '…' : str;
}