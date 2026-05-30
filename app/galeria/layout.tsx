export default function GaleriaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        [data-admin] { display: none !important; }
        main { margin: 0 !important; padding: 0 !important; }
        main > div { padding: 0 !important; }
        body { background: #F5EFE6; }
      `}</style>
      {children}
    </>
  )
}
