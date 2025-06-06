import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PlaceInformation from "./pages/PlaceInformation";
import Planning from "./pages/Planning";
import SpotDetail from "./pages/SpotDetail";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/planning" element={<Planning />} />
      <Route path="/placeInformation" element={<PlaceInformation />} />
      <Route path="/spot/:id" element={<SpotDetail />} />
    </Routes>
  );
}