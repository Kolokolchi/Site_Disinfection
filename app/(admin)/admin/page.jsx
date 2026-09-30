import AdminPanel from "../../../components/AdminPanel";

export const metadata = {
  title: "Dis Cleaning Admin — Панель заявок",
  robots: { index: false, follow: false },
  icons: { icon: "/images/favicon.png" },
};

export default function AdminPage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
      />
      <link rel="stylesheet" href="/css/admin.css" />
      <AdminPanel />
    </>
  );
}
