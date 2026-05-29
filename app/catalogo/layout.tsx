export default function CatalogoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        [data-admin] { display: none !important; }
        main { margin: 0 !important; padding: 0 !important; min-height: 100vh; }
        main > div { padding: 0 !important; }
      `}</style>
      {children}
    </>
  )
}
