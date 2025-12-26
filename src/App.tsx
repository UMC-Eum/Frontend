import "./App.css";
import BackButton from "./components/BackButton";
import CheckButton from "./components/CheckButton";
import CheckIcon from "./components/CheckIcon";
import MicButton from "./components/MicButton";

function App() {
  return (
    <>
      <div className="bg-gray-100">
        <CheckButton label="확인" disabled={true} />
        <CheckIcon />
        <BackButton />
        <MicButton status="loading" />
      </div>
    </>
  );
}

export default App;
