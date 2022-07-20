import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import {
  MapContainer,
  Rectangle,
  TileLayer,
  useMap,
  useMapEvent,
} from "react-leaflet"

import type {
  Evented,
  LeafletEventHandlerFnMap,
  LeafletMouseEvent,
  Map,
} from "leaflet"

const POSITION_CLASSES = {
  bottomleft: "leaflet-bottom leaflet-left",
  bottomright: "leaflet-bottom leaflet-right",
  topleft: "leaflet-top leaflet-left",
  topright: "leaflet-top leaflet-right",
}

const BOUNDS_STYLE = { weight: 1 }

const getZoom = (parentZoom: number) => Math.max(parentZoom - 5, 0)

function useEventHandlers(
  element: { instance: Evented },
  eventHandlers: LeafletEventHandlerFnMap | null | undefined
) {
  const eventHandlersRef = useRef<LeafletEventHandlerFnMap | null | undefined>()

  useEffect(
    function addEventHandlers() {
      if (eventHandlers != null) {
        element.instance.on(eventHandlers)
      }
      eventHandlersRef.current = eventHandlers

      return function removeEventHandlers() {
        if (eventHandlersRef.current != null) {
          element.instance.off(eventHandlersRef.current)
        }
        eventHandlersRef.current = null
      }
    },
    [element, eventHandlers]
  )
}

function MinimapBounds({ parentMap }: { parentMap: Map }) {
  const minimap = useMap()

  // Clicking a point on the minimap sets the parent's map center
  const onClick = useCallback(
    (e: LeafletMouseEvent) => {
      parentMap.setView(e.latlng, parentMap.getZoom())
    },
    [parentMap]
  )
  useMapEvent("click", onClick)

  // Keep track of bounds in state to trigger renders
  const [bounds, setBounds] = useState(parentMap.getBounds())
  const onChange = useCallback(() => {
    setBounds(parentMap.getBounds())
    // Update the minimap's view to match the parent map's center and zoom
    minimap.setView(parentMap.getCenter(), getZoom(parentMap.getZoom()))
  }, [minimap, parentMap])

  // Listen to events on the parent map
  const handlers = useMemo(
    () => ({ move: onChange, zoom: onChange }),
    [onChange]
  )
  useEventHandlers({ instance: parentMap }, handlers)

  return <Rectangle bounds={bounds} pathOptions={BOUNDS_STYLE} />
}

export default function MinimapControl({
  position,
}: {
  position: keyof typeof POSITION_CLASSES
}) {
  const parentMap = useMap()

  // Memoize the minimap so it's not affected by position changes
  const minimap = useMemo(
    () => (
      <MapContainer
        style={{
          height: 120,
          width: 120,
        }}
        center={parentMap.getCenter()}
        zoom={getZoom(parentMap.getZoom())}
        dragging={false}
        doubleClickZoom={false}
        scrollWheelZoom={false}
        attributionControl={false}
        zoomControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MinimapBounds parentMap={parentMap} />
      </MapContainer>
    ),
    [parentMap]
  )

  const positionClass =
    (position && POSITION_CLASSES[position]) || POSITION_CLASSES.topright
  return (
    <div className={positionClass}>
      <div
        className="leaflet-control leaflet-bar"
        style={{ borderRadius: "10%", overflow: "hidden" }}>
        {minimap}
      </div>
    </div>
  )
}
