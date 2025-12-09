"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { GoogleMap, Marker, Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { MapPin, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface LocationPickerProps {
  latitude: number | string;
  longitude: number | string;
  onLocationChange: (lat: number, lng: number) => void;
  className?: string;
}

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

const LocationPicker = ({
  latitude,
  longitude,
  onLocationChange,
  className = "",
}: LocationPickerProps) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const [searchValue, setSearchValue] = useState("");
  const [error, setError] = useState("");
  const [center, setCenter] = useState<google.maps.LatLngLiteral>({ lat: 21.0278, lng: 105.8342 });

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey,
    libraries,
  });

  const parseCoordinate = (value: number | string): number => {
    const parsed = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(parsed) ? 0 : parsed;
  };

  const currentLat = parseCoordinate(latitude) || 21.0278;
  const currentLng = parseCoordinate(longitude) || 105.8342;

  // Update center when coordinates change externally
  useEffect(() => {
    setCenter({ lat: currentLat, lng: currentLng });
  }, [currentLat, currentLng]);

  useEffect(() => {
    if (loadError) {
      setError("Không thể tải Google Maps");
    }
  }, [loadError]);  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        onLocationChange(lat, lng);
        setCenter({ lat, lng });
      }
    },
    [onLocationChange]
  );

  const handleMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        onLocationChange(lat, lng);
        setCenter({ lat, lng });
      }
    },
    [onLocationChange]
  );

  const handlePlaceChanged = useCallback(() => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();

      if (!place.geometry || !place.geometry.location) {
        setError("Không tìm thấy địa điểm");
        return;
      }

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      onLocationChange(lat, lng);
      setCenter({ lat, lng });
      setError("");
      setSearchValue(place.formatted_address || place.name || "");

      if (mapRef.current) {
        mapRef.current.setZoom(17);
      }
    }
  }, [onLocationChange]);

  const handleGetCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Trình duyệt không hỗ trợ định vị");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        onLocationChange(lat, lng);
        setCenter({ lat, lng });
        setError("");

        if (mapRef.current) {
          mapRef.current.setZoom(17);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError("Không thể lấy vị trí hiện tại");
      }
    );
  }, [onLocationChange]);

  const handleClearSearch = () => {
    setSearchValue("");
  };

  const onLoadMap = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onLoadMarker = useCallback((marker: google.maps.Marker) => {
    markerRef.current = marker;
  }, []);

  const onLoadAutocomplete = useCallback(
    (autocomplete: google.maps.places.Autocomplete) => {
      autocompleteRef.current = autocomplete;
    },
    []
  );

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-rose-500/50 bg-rose-500/10 p-4 text-sm text-rose-400">
        <span>Thiếu Google Maps API key trong cấu hình</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-rose-500/50 bg-rose-500/10 p-4 text-sm text-rose-400">
        <span>Không thể tải Google Maps</span>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9e9ea2]" />
          {isLoaded && (
            <Autocomplete
              onLoad={onLoadAutocomplete}
              onPlaceChanged={handlePlaceChanged}
              options={{
                componentRestrictions: { country: "vn" },
                fields: ["geometry", "name", "formatted_address"],
              }}
            >
              <Input
                type="text"
                placeholder="Tìm kiếm địa điểm (vd: CGV Vincom, 123 Phố Huế...)"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="bg-[#27272a] pl-10 pr-10 text-[#f5f5f5] border border-[#3a3a3d] placeholder:text-[#9e9ea2] focus-visible:border-[#ff7a45] focus-visible:ring-[#ff7a45]/30"
              />
            </Autocomplete>
          )}
          {!isLoaded && (
            <Input
              type="text"
              placeholder="Đang tải..."
              disabled
              className="bg-[#27272a] pl-10 pr-10 text-[#f5f5f5] border border-[#3a3a3d]"
            />
          )}
          {searchValue && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9e9ea2] hover:text-[#f5f5f5]"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleGetCurrentLocation}
          disabled={!isLoaded}
          className="border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] hover:bg-[#1c1c1f] shrink-0"
        >
          <MapPin className="size-4 mr-2" />
          Vị trí hiện tại
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-xs text-rose-400">
          {error}
        </div>
      )}

      <div className="relative overflow-hidden rounded-lg border border-[#3a3a3d]">
        {!isLoaded && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#151518]/80">
            <div className="flex flex-col items-center gap-3">
              <div className="size-8 animate-spin rounded-full border-4 border-[#3a3a3d] border-t-[#ff7a45]" />
              <span className="text-sm text-[#9e9ea2]">Đang tải bản đồ...</span>
            </div>
          </div>
        )}
        {isLoaded && (
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "400px" }}
            center={center}
            zoom={15}
            onLoad={onLoadMap}
            onClick={handleMapClick}
            options={{
              mapTypeControl: true,
              streetViewControl: false,
              fullscreenControl: true,
              zoomControl: true,
            }}
          >
            <Marker
              position={center}
              draggable={true}
              onLoad={onLoadMarker}
              onDragEnd={handleMarkerDragEnd}
              title="Vị trí rạp chiếu"
            />
          </GoogleMap>
        )}
        {!isLoaded && <div className="h-[400px] w-full bg-[#1c1c1f]" />}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-[#27272a] bg-[#1c1c1f] px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-[#9e9ea2]">Vĩ độ</p>
          <p className="mt-1 font-mono text-sm font-semibold text-[#f5f5f5]">
            {currentLat.toFixed(6)}
          </p>
        </div>
        <div className="rounded-lg border border-[#27272a] bg-[#1c1c1f] px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-[#9e9ea2]">Kinh độ</p>
          <p className="mt-1 font-mono text-sm font-semibold text-[#f5f5f5]">
            {currentLng.toFixed(6)}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-[#27272a] bg-[#1c1c1f] px-4 py-3 text-xs text-[#9e9ea2]">
        <ul className="space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-[#ff7a45]">•</span>
            <span>Nhấp vào bản đồ để đánh dấu vị trí rạp</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-[#ff7a45]">•</span>
            <span>Kéo thả marker (điểm đánh dấu) để tinh chỉnh vị trí chính xác</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-[#ff7a45]">•</span>
            <span>Sử dụng thanh tìm kiếm để tìm địa điểm nhanh chóng</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-[#ff7a45]">•</span>
            <span>Tọa độ sẽ tự động cập nhật vào biểu mẫu</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default LocationPicker;