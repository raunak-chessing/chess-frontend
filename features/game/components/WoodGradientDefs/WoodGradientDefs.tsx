export function WoodGradientDefs() {
  return (
    <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
      <defs>
        <radialGradient id="lightWoodGrad" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
          <stop offset="0%" stopColor="#fdf0e2" />
          <stop offset="65%" stopColor="#e5c5aa" />
          <stop offset="100%" stopColor="#bfa18a" />
        </radialGradient>
        <radialGradient id="darkWoodGrad" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
          <stop offset="0%" stopColor="#5d554e" />
          <stop offset="65%" stopColor="#3c342f" />
          <stop offset="100%" stopColor="#1e1815" />
        </radialGradient>
      </defs>
    </svg>
  );
}
