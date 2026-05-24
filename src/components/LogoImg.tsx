import { useEffect, useState } from 'react'

interface Props {
  height: number
  style?: React.CSSProperties
}

export default function LogoImg({ height, style }: Props) {
  const [src, setSrc] = useState('/logo.png')

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = img.naturalWidth
      c.height = img.naturalHeight
      const ctx = c.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const d = ctx.getImageData(0, 0, c.width, c.height)
      const px = d.data
      // Sample background from top-left corner pixel
      const bgR = px[0], bgG = px[1], bgB = px[2]
      for (let i = 0; i < px.length; i += 4) {
        const dist = Math.hypot(px[i] - bgR, px[i + 1] - bgG, px[i + 2] - bgB)
        if (dist < 35) {
          px[i + 3] = 0
        } else if (dist < 60) {
          px[i + 3] = Math.round((dist - 35) / 25 * 255)
        }
      }
      ctx.putImageData(d, 0, 0)
      setSrc(c.toDataURL())
    }
    img.src = '/logo.png'
  }, [])

  return <img src={src} alt="Runly" style={{ height, width: 'auto', ...style }} />
}
