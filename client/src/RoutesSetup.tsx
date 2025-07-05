import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PlaceInformation from "./pages/PlaceInformation";
import Planning from "./pages/Planning";
import TourDetailPage from "./pages/TourDetailPage";
import HeaderPage from "./HeaderPage";
import Signup from "./pages/Signup";

export default function RoutesSetup() {
  return (
    <Routes>
      <Route path="/" element={<HeaderPage/>}>
        <Route index element={<Home/>}/>
        <Route path="signup" element={<Signup/>}/>
      </Route>
      <Route path="/planning" element={<Planning/>}/>
      <Route path="/placeInformation" element={<PlaceInformation/>}/>
      <Route path="/detail/:contentId/:contentTypeId" element={<TourDetailPage />} />
    </Routes>
  )
}