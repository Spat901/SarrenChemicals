'use client'

import dynamic from 'next/dynamic'

const Spline = dynamic(() => import('@splinetool/react-spline'), { ssr: false })

export default function SplineHero() {
  return (
    <Spline
      scene="https://prod.spline.design/lBrpFkf2OKh8zVRPWJx2CrdC/scene.splinecode"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  )
}
