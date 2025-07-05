import Header from "./components/Header"
import { Outlet } from "react-router-dom"
export default function HeaderPage() {
  return (
    <>
      <Header/>
      <div><Outlet/></div>
    </>
  )
}