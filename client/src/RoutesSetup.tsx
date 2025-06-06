import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PlaceInformation from "./pages/PlaceInformation";
import Planning from "./pages/Planning";
import SpotDetail from "./pages/SpotDetail";

export default function RoutesSetup() {
  return (
    <Routes>
      <Route index element={<Home/>}/>
      <Route path="/planning" element={<Planning/>}/>
      <Route path="/placeInformation" element={<PlaceInformation/>}/>
      <Route path="/spot/:id" element={<SpotDetail />} />
    </Routes>
  )
}