import InactiveMic from "./InactiveMic";
import LoadingMic from "./LoadingMic";
import RecordingMic from "./RecordingMic";
interface MicButtonProps {
  status?: "recording" | "inactive" | "loading";
}
const MicButton = ({ status }: MicButtonProps) => {
  return (
    <>
      {status === "inactive" && <InactiveMic />}
      {status === "recording" && <RecordingMic />}
      {status === "loading" && <LoadingMic />}
    </>
  );
};

export default MicButton;
