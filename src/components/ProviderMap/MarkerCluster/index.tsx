// Adapted from https://github.com/yuzhva/react-leaflet-markercluster/pull/194

import { createPathComponent } from "@react-leaflet/core"
import { LeafletEventHandlerFn, MarkerClusterGroup } from "leaflet"
// eslint-disable-next-line import/no-unassigned-import
import "leaflet.markercluster"

import "./clusterStyles.css"

import "leaflet.markercluster/dist/MarkerCluster.css"

const MarkerCluster = createPathComponent(
  ({ children: _c, ...props }, context) => {
    const clusterProps: Record<string, unknown> = {}
    const clusterEvents: Record<string, LeafletEventHandlerFn> = {}

    // Splitting props and events to different objects
    Object.entries(props).forEach(([propName, prop]) =>
      propName.startsWith("on")
        ? (clusterEvents[propName] = prop)
        : (clusterProps[propName] = prop)
    )
    const instance = new MarkerClusterGroup({
      ...clusterProps,
    })

    // Initializing event listeners
    Object.entries(clusterEvents).forEach(([eventAsProp, callback]) => {
      const clusterEvent = `cluster${eventAsProp.substring(2).toLowerCase()}`
      instance.on(clusterEvent, callback)
    })
    return {
      instance,
      context: {
        ...context,
        layerContainer: instance,
      },
    }
  }
)

export default MarkerCluster
