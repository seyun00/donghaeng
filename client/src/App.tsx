import { BrowserRouter } from "react-router-dom";
import RoutesSetup from "./RoutesSetup";

export default function App() {
  return (
    <BrowserRouter>
      <RoutesSetup></RoutesSetup>
    </BrowserRouter>
  );
}
