import { useEffect, useRef } from 'react'

const MAP_TOKEN = import.meta.env.VITE_MAP_TOKEN

export default function MapBox({ listing }) {
  const mapContainer = useRef(null)
  const map = useRef(null)

  useEffect(() => {
    if (!listing?.geometry?.coordinates || map.current) return

    // Dynamically load mapbox-gl
    import('mapbox-gl').then(mapboxgl => {
      mapboxgl.default.accessToken = MAP_TOKEN
      map.current = new mapboxgl.default.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: listing.geometry.coordinates,
        zoom: 8,
      })

      new mapboxgl.default.Marker({ color: '#fe424d' })
        .setLngLat(listing.geometry.coordinates)
        .setPopup(
          new mapboxgl.default.Popup({ offset: 25 }).setHTML(
            `<h4 style="font-weight:600;margin:0 0 4px">${listing.title}</h4>
             <p style="margin:0;font-size:12px;color:#555">Exact location provided after booking.</p>`
          )
        )
        .addTo(map.current)
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [listing])

  if (!MAP_TOKEN) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-100 rounded-xl text-gray-500 text-sm text-center px-4">
        Map not available. Set <code className="font-mono bg-white px-1 rounded">VITE_MAP_TOKEN</code> in <code className="font-mono bg-white px-1 rounded">frontend/.env</code> and restart the dev server.
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Where you'll be</h3>
      <div ref={mapContainer} id="map" className="rounded-xl h-72" />
    </div>
  )
}
