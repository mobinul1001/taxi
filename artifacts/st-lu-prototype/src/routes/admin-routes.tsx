import { Route, Routes } from "react-router-dom";
import { AdminShell } from "@/components/admin-shell";
import { AdminLogin, Dashboard } from "@/pages/admin/dashboard";
import { Bookings } from "@/pages/admin/bookings";
import { LiveMap } from "@/pages/admin/live-map";
import { DriverDetail, Drivers } from "@/pages/admin/drivers";
import { Pricing, Refunds } from "@/pages/admin/money";
import { PassengerDetail, Passengers } from "@/pages/admin/passengers";
import { Reports } from "@/pages/admin/reports";
import { Settings } from "@/pages/admin/settings";
import { AdminForgotPassword } from "@/pages/admin/forgot-password";

/**
 * Every admin screen in one module so the office side is a chunk of its own. Someone who opens the
 * start page on a hotel connection should not be downloading the dashboard, the reports and the
 * passenger list before the first screen can paint.
 *
 * `notFound` comes from App so the 404 stays one component, rendered inside the admin shell here.
 */
export default function AdminRoutes({ notFound }: { notFound: React.ReactNode }) {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route path="forgot-password" element={<AdminForgotPassword />} />
      <Route path="/" element={<AdminShell />}>
        <Route index element={<Dashboard />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="live-map" element={<LiveMap />} />
        <Route path="drivers" element={<Drivers />} />
        <Route path="drivers/:id" element={<DriverDetail />} />
        <Route path="passengers" element={<Passengers />} />
        <Route path="passengers/:email" element={<PassengerDetail />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="refunds" element={<Refunds />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={notFound} />
      </Route>
      <Route path="*" element={notFound} />
    </Routes>
  );
}
