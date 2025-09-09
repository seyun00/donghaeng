import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PlaceInformation from "./pages/PlaceInformation";
import Planning from "./pages/Planning";
import TourDetailPage from "./pages/TourDetailPage";
import HeaderPage from "./HeaderPage";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import FindPw from "./pages/FindPw";
import ResetPw from "./pages/ResetPw";
import MyPage from "./pages/MyPage";
import PlanManagement from "./pages/PlanManagement";

export default function RoutesSetup() {
  return (
    <Routes>
      <Route path="/" element={<HeaderPage/>}>
        <Route index element={<Home/>}/>
        <Route path="signup" element={<Signup/>}/>
        <Route path="signin" element={<Signin/>}/>
        <Route path="findPw" element={<FindPw/>}/>
        <Route path="resetPw" element={<ResetPw/>}/>
        <Route path="mypage" element={<MyPage/>}/>
        <Route path="plans" element={<PlanManagement />} />
      </Route>
      <Route path="/planning/:planId" element={<Planning/>}/>
      <Route path="/placeInformation" element={<PlaceInformation/>}/>
      <Route path="/detail/:contentId/:contentTypeId" element={<TourDetailPage />} />
    </Routes>
  )
}