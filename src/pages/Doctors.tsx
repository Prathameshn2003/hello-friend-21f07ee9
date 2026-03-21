import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import {
  Loader2, Search, MapPin, Phone, Stethoscope, Navigation,
  BadgeCheck, AlertCircle, ExternalLink, LocateFixed
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SupabaseDoctor {
  id: string;
  name: string;
  specialization: string;
  qualification: string | null;
  hospital: string | null;
  location: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  description: string | null;
  image_url: string | null;
  experience: string | null;
  latitude: number | null;
  longitude: number | null;
  is_verified: boolean | null;
  distance?: number;
}

interface OSMDoctor {
  name: string;
  specialization: string;
  address: string;
  lat: number;
  lon: number;
  distance?: number;
}

const CACHE_KEY = "naaricare_doctor_cache";
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

const getInitials = (name: string) =>
  name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const openGoogleMapsDirections = (doctor: SupabaseDoctor | OSMDoctor) => {
  const address = 'city' in doctor
    ? [doctor.address, doctor.city].filter(Boolean).join(", ")
    : doctor.address;
  if (!address) {
    toast({ title: "Location not available", description: "This doctor's address is not available.", variant: "destructive" });
    return;
  }
  const encodedAddress = encodeURIComponent(address);
  toast({ title: "Opening directions", description: "Opening Google Maps…" });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const url = `https://www.google.com/maps/dir/?api=1&origin=${pos.coords.latitude},${pos.coords.longitude}&destination=${encodedAddress}&travelmode=driving`;
        openMapUrl(url);
      },
      () => {
        openMapUrl(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`);
      },
      { timeout: 5000 }
    );
  } else {
    openMapUrl(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`);
  }
};

const openMapUrl = (url: string) => {
  const newWindow = window.open(url, "_blank");
  if (!newWindow) window.location.href = url;
};

const hasValidAddress = (doctor: SupabaseDoctor | OSMDoctor) =>
  'city' in doctor ? !!(doctor.address || doctor.city) : !!doctor.address;

// Try to get cached results
const getCachedResults = (): { doctors: OSMDoctor[]; timestamp: number } | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed;
  } catch { return null; }
};

const setCachedResults = (doctors: OSMDoctor[]) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ doctors, timestamp: Date.now() }));
  } catch { /* ignore */ }
};

// Layer 2: Overpass API search
const searchOSMDoctors = async (lat: number, lon: number, radiusKm: number): Promise<OSMDoctor[]> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const radiusM = radiusKm * 1000;
    const query = `[out:json][timeout:8];(node["amenity"="doctors"](around:${radiusM},${lat},${lon});node["amenity"="clinic"](around:${radiusM},${lat},${lon});node["amenity"="hospital"](around:${radiusM},${lat},${lon});node["healthcare"="doctor"](around:${radiusM},${lat},${lon}););out body;`;

    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: `data=${encodeURIComponent(query)}`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: controller.signal,
    });

    clearTimeout(timeout);
    if (!res.ok) return [];

    const data = await res.json();
    const doctors: OSMDoctor[] = (data.elements || [])
      .filter((el: any) => el.tags?.name)
      .map((el: any) => ({
        name: el.tags.name,
        specialization: el.tags["healthcare:speciality"] || el.tags.amenity || "General",
        address: [el.tags["addr:street"], el.tags["addr:city"]].filter(Boolean).join(", ") || "Address not listed",
        lat: el.lat,
        lon: el.lon,
        distance: haversineDistance(lat, lon, el.lat, el.lon),
      }))
      .sort((a: OSMDoctor, b: OSMDoctor) => (a.distance || 0) - (b.distance || 0))
      .slice(0, 20);

    if (doctors.length > 0) setCachedResults(doctors);
    return doctors;
  } catch {
    clearTimeout(timeout);
    return [];
  }
};

type DoctorSource = "osm" | "admin" | "cached";

const Doctors = () => {
  const [searchParams] = useSearchParams();
  const fromAssessment = searchParams.get("source") === "assessment";

  const [adminDoctors, setAdminDoctors] = useState<SupabaseDoctor[]>([]);
  const [osmDoctors, setOsmDoctors] = useState<OSMDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [radiusKm, setRadiusKm] = useState("10");
  const [source, setSource] = useState<DoctorSource>("admin");
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const hasAutoTriggered = useRef(false);

  // Layer 3: Always fetch admin doctors
  const fetchAdminDoctors = useCallback(async () => {
    const { data, error } = await supabase
      .from("doctors")
      .select("*")
      .eq("is_active", true)
      .order("name");
    if (!error && data) setAdminDoctors(data as SupabaseDoctor[]);
  }, []);

  // Main location detection + search flow
  const detectAndSearch = useCallback(async () => {
    setDetectingLocation(true);
    setLoading(true);

    // Try cached first
    const cached = getCachedResults();
    if (cached && cached.doctors.length > 0) {
      setOsmDoctors(cached.doctors);
      setSource("cached");
      setBannerMessage(null);
      setLoading(false);
      setDetectingLocation(false);
      return;
    }

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error("unsupported"));
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
      });

      const { latitude, longitude } = pos.coords;
      setUserLocation({ lat: latitude, lon: longitude });

      // Layer 2: Try OSM
      const radius = parseInt(radiusKm) || 10;
      const osmResults = await searchOSMDoctors(latitude, longitude, radius);

      if (osmResults.length > 0) {
        setOsmDoctors(osmResults);
        setSource("osm");
        setBannerMessage(null);
      } else {
        // Fallback to admin doctors
        setSource("admin");
        setBannerMessage("No nearby doctors found. Showing verified specialists instead.");
      }
    } catch {
      // Location denied or error – fallback to admin
      setSource("admin");
      setBannerMessage("Nearby doctors unavailable. Showing verified specialists instead.");
    } finally {
      setLoading(false);
      setDetectingLocation(false);
    }
  }, [radiusKm]);

  // Initial load
  useEffect(() => {
    fetchAdminDoctors();
  }, [fetchAdminDoctors]);

  useEffect(() => {
    if (fromAssessment && !hasAutoTriggered.current) {
      hasAutoTriggered.current = true;
      detectAndSearch();
    } else if (!fromAssessment) {
      setLoading(false);
    }
  }, [fromAssessment, detectAndSearch]);

  // Sort admin doctors by distance if location available
  const sortedAdminDoctors = useMemo(() => {
    if (!userLocation) return adminDoctors;
    return [...adminDoctors].map(d => ({
      ...d,
      distance: d.latitude && d.longitude ? haversineDistance(userLocation.lat, userLocation.lon, d.latitude, d.longitude) : undefined,
    })).sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
  }, [adminDoctors, userLocation]);

  const cities = [...new Set(adminDoctors.map(d => d.city).filter(Boolean))] as string[];

  const filteredAdminDoctors = sortedAdminDoctors.filter(d => {
    const matchesSearch = !searchQuery ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.city?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = cityFilter === "all" || d.city === cityFilter;
    return matchesSearch && matchesCity;
  });

  const filteredOsmDoctors = osmDoctors.filter(d =>
    !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showOsm = source === "osm" || source === "cached";

  // Google Maps search fallback button
  const openGoogleMapsSearch = () => {
    const loc = userLocation ? `${userLocation.lat},${userLocation.lon}` : "";
    const url = loc
      ? `https://www.google.com/maps/search/doctors+near+${loc}`
      : `https://www.google.com/maps/search/gynecologist+near+me`;
    openMapUrl(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-teal/20 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-teal" />
              </div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Find Doctors</h1>
            </div>
            <p className="text-muted-foreground">Connect with qualified gynecologists and women's health specialists</p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by name, specialization, or city..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            
            <Button variant="outline" onClick={detectAndSearch} disabled={detectingLocation} className="gap-2">
              {detectingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
              Detect Location
            </Button>

            <Select value={radiusKm} onValueChange={setRadiusKm}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 km</SelectItem>
                <SelectItem value="10">10 km</SelectItem>
                <SelectItem value="20">20 km</SelectItem>
                <SelectItem value="50">50 km</SelectItem>
              </SelectContent>
            </Select>

            {!showOsm && cities.length > 0 && (
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Google Maps fallback button */}
          <div className="mb-4">
            <Button variant="outline" size="sm" onClick={openGoogleMapsSearch} className="gap-2 text-sm hover:bg-primary/10 hover:text-primary">
              <ExternalLink className="w-3.5 h-3.5" />
              Search on Google Maps
            </Button>
          </div>

          {/* Fallback Banner */}
          {bannerMessage && (
            <Alert className="mb-6 border-primary/30 bg-primary/5">
              <AlertCircle className="h-4 w-4 text-primary" />
              <AlertDescription className="text-muted-foreground">{bannerMessage}</AlertDescription>
            </Alert>
          )}

          {/* Loading */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-card rounded-2xl p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-28" />
                    <Skeleton className="h-9 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : showOsm && filteredOsmDoctors.length > 0 ? (
            /* OSM Results */
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-4">
                Nearby Doctors {source === "cached" && <span className="text-xs text-muted-foreground font-normal">(cached)</span>}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOsmDoctors.map((doctor, i) => (
                  <div key={i} className="glass-card rounded-2xl p-6 hover:shadow-glow transition-all duration-300 group">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 ring-2 ring-primary/20">
                        <span className="text-primary font-bold text-lg">{getInitials(doctor.name)}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-heading font-semibold text-foreground truncate">{doctor.name}</h3>
                        <p className="text-sm text-accent font-medium capitalize">{doctor.specialization}</p>
                        {doctor.distance != null && (
                          <span className="inline-flex items-center gap-1 text-xs text-teal bg-teal/10 px-2 py-0.5 rounded-full mt-1">
                            <MapPin className="w-3 h-3" /> {doctor.distance.toFixed(1)} km
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{doctor.address}</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full gap-1.5 hover:bg-primary/10 hover:text-primary hover:border-primary/30" onClick={() => openGoogleMapsDirections(doctor)}>
                      <Navigation className="w-3.5 h-3.5" /> 📍 Get Directions
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Admin Doctors (Layer 3) */
            filteredAdminDoctors.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center">
                <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {adminDoctors.length === 0 ? "No doctors available at the moment." : "No doctors match your search."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAdminDoctors.map((doctor) => (
                  <div key={doctor.id} className="glass-card rounded-2xl p-6 hover:shadow-glow transition-all duration-300 group">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 ring-2 ring-primary/20">
                        {doctor.image_url ? (
                          <img src={doctor.image_url} alt={doctor.name} className="w-16 h-16 rounded-full object-cover" />
                        ) : (
                          <span className="text-primary font-bold text-lg">{getInitials(doctor.name)}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-heading font-semibold text-foreground truncate">{doctor.name}</h3>
                          {doctor.is_verified && <BadgeCheck className="w-4 h-4 text-teal flex-shrink-0" />}
                        </div>
                        {doctor.qualification && <p className="text-xs text-muted-foreground">{doctor.qualification}</p>}
                        <p className="text-sm text-accent font-medium">{doctor.specialization}</p>
                        {doctor.distance != null && (
                          <span className="inline-flex items-center gap-1 text-xs text-teal bg-teal/10 px-2 py-0.5 rounded-full mt-1">
                            <MapPin className="w-3 h-3" /> {doctor.distance.toFixed(1)} km
                          </span>
                        )}
                      </div>
                    </div>

                    {doctor.hospital && <p className="text-sm text-muted-foreground mb-1">🏥 {doctor.hospital}</p>}
                    {doctor.experience && <p className="text-xs text-muted-foreground mb-1">🩺 {doctor.experience} experience</p>}
                    {doctor.description && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{doctor.description}</p>}

                    <div className="space-y-1.5 text-sm mb-4">
                      {(doctor.address || doctor.city) && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{doctor.address || ""}{doctor.city ? `${doctor.address ? ", " : ""}${doctor.city}` : ""}</span>
                        </div>
                      )}
                      {doctor.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                          <a href={`tel:${doctor.phone}`} className="hover:text-foreground transition-colors">{doctor.phone}</a>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {hasValidAddress(doctor) ? (
                        <Button variant="outline" size="sm" className="flex-1 gap-1.5 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all" onClick={() => openGoogleMapsDirections(doctor)}>
                          <Navigation className="w-3.5 h-3.5" /> 📍 Get Directions
                        </Button>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-1 gap-1.5 opacity-50 cursor-not-allowed" disabled>
                              <Navigation className="w-3.5 h-3.5" /> 📍 Get Directions
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Location not available</p></TooltipContent>
                        </Tooltip>
                      )}
                      {doctor.phone && (
                        <Button variant="outline" size="sm" className="flex-1 gap-1.5 hover:bg-teal/10 hover:text-teal hover:border-teal/30 transition-all" onClick={() => window.open(`tel:${doctor.phone}`)}>
                          <Phone className="w-3.5 h-3.5" /> Call
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Doctors;
