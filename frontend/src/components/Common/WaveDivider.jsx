import React from 'react'

/**
 * WaveDivider - A decorative SVG wave divider component for smooth transitions between sections
 * @param {string} toColor - The color to transition to (bottom)
 * @param {string} fromColor - The color to transition from (top)
 */
const WaveDivider = ({ toColor = '#ffffff', fromColor = '#f8fafc' }) => {
    return (
        <div className="relative w-full" style={{ backgroundColor: fromColor }}>
            <svg
                className="w-full h-auto"
                viewBox="0 0 1440 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
            >
                <path
                    d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
                    fill={toColor}
                />
            </svg>
        </div>
    )
}

export default WaveDivider
