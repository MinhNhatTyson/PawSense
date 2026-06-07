export function PawLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Main pad */}
      <ellipse cx="20" cy="26" rx="11" ry="10" fill="#4a7c5f"/>
      {/* Toe pads */}
      <circle cx="12" cy="16" r="4.5" fill="#4a7c5f"/>
      <circle cx="19" cy="12" r="3.8" fill="#4a7c5f"/>
      <circle cx="27" cy="12.5" r="3.8" fill="#4a7c5f"/>
      <circle cx="33" cy="17.5" r="4" fill="#4a7c5f"/>
      {/* Inner highlight */}
      <ellipse cx="20" cy="26" rx="7" ry="6.5" fill="#2d5a3d" opacity="0.5"/>
    </svg>
  )
}

export function PawLogoLight({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="20" cy="26" rx="11" ry="10" fill="#c4956a"/>
      <circle cx="12" cy="16" r="4.5" fill="#c4956a"/>
      <circle cx="19" cy="12" r="3.8" fill="#c4956a"/>
      <circle cx="27" cy="12.5" r="3.8" fill="#c4956a"/>
      <circle cx="33" cy="17.5" r="4" fill="#c4956a"/>
      <ellipse cx="20" cy="26" rx="7" ry="6.5" fill="#8b6340" opacity="0.4"/>
    </svg>
  )
}