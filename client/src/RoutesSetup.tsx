import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PlaceInformation from "./pages/PlaceInformation";
import Planning from "./pages/Planning";
import TourDetailPage from "./pages/TourDetailPage";

export default function RoutesSetup() {
  return (
    <Routes>
      <Route index element={<Home/>}/>
      <Route path="/planning" element={<Planning/>}/>
      <Route path="/placeInformation" element={<PlaceInformation/>}/>
      <Route path="/detail/:contentId/:contentTypeId" element={<TourDetailPage />} />
    </Routes>
  )
}