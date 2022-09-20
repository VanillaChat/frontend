import "../styles/ChipIcon.css";

type ChipIconProps = {
  icon: string;
};
export default function ChipIcon({ icon }: ChipIconProps) {
  return (
    <div className="chip-icon">
      <img src={icon} alt="icon" />
    </div>
  );
}
