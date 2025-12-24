import "./App.css";
import CheckButton from "./components/CheckButton";
import CheckIcon from "./components/CheckIcon";

function App() {
  return (
    <>
      <CheckButton label="확인" disabled={true} />
      <CheckIcon />
    </>
  );
}

export default App;
