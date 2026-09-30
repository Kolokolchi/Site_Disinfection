export const metadata = {
  icons: {
    icon: "/images/favicon.png",
    shortcut: "/favicon.ico",
    apple: "/images/apple-touch-icon.png",
  },
};

export default function PublicLayout({ children }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
      />
      <link rel="stylesheet" href="/css/style.css" />
      <link rel="stylesheet" href="/css/theme.css" />
      {children}
    </>
  );
}
