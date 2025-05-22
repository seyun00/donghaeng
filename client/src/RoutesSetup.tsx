import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Planning from "./pages/Planning"
import PlaceInformation from "./pages/PlaceInformation"

export default function RoutesSetup() {
  return (
    <Routes>
      <Route index element={<Home/>}/>
      <Route path="/planning" element={<Planning/>}/>
      <Route path="/placeInformation" element={<PlaceInformation/>}/>
    </Routes>
  )
}