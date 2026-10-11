/**
 * MapSearch — a map with a location search box.
 *
 * Uses Leaflet + OpenStreetMap tiles and the free Nominatim geocoder,
 * so no API key is needed.
 *
 * Install:
 *   npm install leaflet react-leaflet@4     (React 18)
 *   npm install leaflet react-leaflet       (React 19 → react-leaflet v5)
 *
 * Usage:
 *   <div style={{ height: "100vh" }}>
 *     <MapSearch onSelect={(place) => console.log(place)} />
 *   </div>
 *
 * Note: Nominatim's usage policy allows ~1 request/second and asks for
 * light use. For production traffic, point `geocodeUrl` at your own
 * Nominatim instance or swap in a commercial geocoder.
 */
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import addressArray from "../utils/warehouses_southeast_1200.json";

import "leaflet/dist/leaflet.css";
import "../css/mapSearch.css";
import SearchBox from "./SearchBox";

const GEOCODE_URL: string = "https://nominatim.openstreetmap.org/search";
const OSM_URL: string = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIB: string =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
// Leaflet's default marker icons break under most bundlers; point them at a CDN.
const blueMarkerIcon = L.icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const markerIcon: L.Icon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/** Moves the map whenever the selected place changes. */
function FlyTo({ place }: { place: any }): null {
  const map = useMap();
  useEffect(() => {
    if (!place) return;
    if (place.bounds) {
      map.flyToBounds(place.bounds, { maxZoom: 16, duration: 1.2 });
    } else {
      map.flyTo([place.lat, place.lon], 14, { duration: 1.2 });
    }
  }, [place, map]);
  return null;
}

export default function MapSearch({
  center = [25.7617, -80.1918],
  zoom = 12,
  onSelect,
  placeholder = "Search for a place",
  geocodeUrl = GEOCODE_URL,
}: {
  center?: [number, number];
  zoom?: number;
  onSelect?: (place: any) => void;
  placeholder?: string;
  geocodeUrl?: string;
}): React.JSX.Element {
  const [place, setPlace] = useState(null);

  const handlePick = (p) => {
    setPlace(p);
    onSelect?.(p);
  };

  return (
    <article className="mapSearch">
      <MapContainer
        center={center}
        zoom={zoom}
        className="mapSearch__mapContainer"
        zoomControl={false}
      >
        <TileLayer attribution={OSM_ATTRIB} url={OSM_URL} />
        <FlyTo place={place} />
        {place && (
          <Marker position={[place.lat, place.lon]} icon={blueMarkerIcon}>
            <Popup>
              <strong>{place.name}</strong>
              <br />
              {place.address}
            </Popup>
          </Marker>
        )}
        {addressArray.map((address, index) => (
          <Marker
            key={index}
            position={[address.latitude, address.longitude]}
            icon={markerIcon}
          >
            <Popup>
              <strong>{address.name}</strong>
              <br />
              {address.address}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <SearchBox
        onPick={handlePick}
        geocodeUrl={geocodeUrl}
        placeholder={placeholder}
      />
    </article>
  );
}
