import { BrowserRouter, Routes, Route } from "react-router-dom";
import ArogyaKavachDashboard from "./ArogyaKavachDashboard";
import AshaReportingPortal from "./AshaReportingPortal";
import DoctorPortal from "./DoctorPortal";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ArogyaKavachDashboard />} />
        <Route path="/AshaReportingPortal" element={<AshaReportingPortal />} />
        <Route path="/DoctorPortal" element={<DoctorPortal />} />
      </Routes>
    </BrowserRouter>
  );
}