import "./App.css";
import BackButton from "./components/BackButton";
import CheckButton from "./components/CheckButton";
import CheckIcon from "./components/CheckIcon";

function App() {
  return (
    <>
      <CheckButton label="확인" disabled={true} />
      <CheckIcon />
      <BackButton />
    </>
  );
}

export default App;
