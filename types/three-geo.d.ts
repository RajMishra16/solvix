declare module 'three-geo' {
    import * as THREE from 'three';

    interface ThreeGeoOptions {
        tokenMapbox: string;
        unitsSide?: number;
        isNode?: boolean;
    }

    interface Projection {
        proj: (latlng: [number, number]) => [number, number];
        projInv: (x: number, y: number) => [number, number];
        bbox: [number, number, number, number]; // [w, s, e, n]
        unitsPerMeter: number;
    }

    class ThreeGeo {
        constructor(opts: ThreeGeoOptions);

        getTerrainRgb(
            origin: [number, number],
            radius: number,
            zoom: number
        ): Promise<THREE.Group>;

        getTerrainVector(
            origin: [number, number],
            radius: number,
            zoom: number
        ): Promise<THREE.Group>;

        getProjection(
            origin: [number, number],
            radius: number,
            unitsSide?: number
        ): Projection;
    }

    export default ThreeGeo;
}
