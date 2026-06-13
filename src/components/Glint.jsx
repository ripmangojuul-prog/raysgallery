import React from 'react'

// Four-pointed sparkle — the ✦ glint from the style bible.
export default function Glint({ size = 12, className = '', style }) {
  return (
    <svg
      className={`glint ${className}`}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill="currentColor" />
    </svg>
  )
}
