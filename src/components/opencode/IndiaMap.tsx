import { useId, useEffect, useState } from 'react'
import { geoMercator, geoPath, type GeoPermissibleObjects } from 'd3-geo'
import styles from './opencode-experience.module.css'

export default function IndiaMap() {
  const id = useId().replace(/:/g, '')
  const [outline, setOutline] = useState<string>('')

  useEffect(() => {
    // Lazy load the 6.6MB geojson data
    let mounted = true
    const loadMap = async () => {
      try {
        const res = await fetch('/data/india.geo.json')
        if (!res.ok) throw new Error('Failed to load map data')
        const geometry = await res.json() as unknown as GeoPermissibleObjects
        const projection = geoMercator().fitExtent([[28, 25], [492, 495]], geometry)
        if (mounted) {
          setOutline(geoPath(projection)(geometry) || '')
        }
      } catch (err) {
        console.error('Map loading failed', err)
      }
    }
    loadMap()
    return () => { mounted = false }
  }, [])

  return (
    <figure className={styles.mapFigure}>
      <svg viewBox="0 0 520 520" className={styles.mapSvg} role="img" aria-labelledby={`${id}-title ${id}-description`}>
        <title id={`${id}-title`}>India, connected by the spirit of creation</title>
        <desc id={`${id}-description`}>Illustrative country silhouette projected from Natural Earth geographic data, with islands retained. Generalized de facto boundaries, not an authoritative political map.</desc>
        <defs>
          <pattern id={`${id}-dots`} width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.8" fill="currentColor" opacity="0.55" />
          </pattern>
          <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.24" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        {outline && (
          <>
            <path d={outline} fill={`url(#${id}-fill)`} stroke="currentColor" strokeWidth="1.4" />
            <path d={outline} fill={`url(#${id}-dots)`} />
          </>
        )}
      </svg>
      <figcaption className={styles.mapCaption}>Many perspectives. One community.</figcaption>
    </figure>
  )
}
