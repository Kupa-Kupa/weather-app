import { useRef, useEffect } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';

function GlobeMap() {
  interface Coordinates {
    lat: number;
    lng: number;
  }

  const globeEl = useRef(undefined);

  function getMapCoordinates(e: Coordinates) {
    console.log(e);
  }

  useEffect(() => {
    if (globeEl.current) {
      (globeEl.current as GlobeMethods).pointOfView({
        lat: -20,
        lng: 140,
        altitude: 3,
      });
    }
  }, [globeEl]);

  return (
    <>
      <Globe
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="/earth-blue-marble.jpg"
        showGraticules={true}
        showAtmosphere={false}
        onGlobeClick={getMapCoordinates}
        ref={globeEl}
      />
    </>
  );
}

export default GlobeMap;
