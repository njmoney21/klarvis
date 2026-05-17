export default function SectionHero() {
  return (
    <section
      className="hero-section relative flex flex-col items-center justify-end text-center px-6"
      style={{ minHeight: '100dvh', paddingBottom: '36px', background: 'transparent', pointerEvents: 'none' }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '200px',
          background: 'linear-gradient(to bottom, transparent, #020d14)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
    </section>
  )
}
