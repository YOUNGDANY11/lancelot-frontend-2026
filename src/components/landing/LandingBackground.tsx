export function LandingBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="landing-gradient" />
      <div className="landing-grid" />
      <div className="absolute -top-32 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-(--landing-glow-a) blur-3xl" />
      <div className="absolute top-1/3 -right-40 size-[28rem] rounded-full bg-(--landing-glow-b) blur-3xl" />
      <div className="absolute bottom-0 -left-40 size-[24rem] rounded-full bg-(--landing-glow-a) opacity-60 blur-3xl" />
    </div>
  )
}
