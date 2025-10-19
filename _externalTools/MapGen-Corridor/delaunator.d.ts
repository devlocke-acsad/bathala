declare module 'delaunator' {
    export default class Delaunator<T> {
        static from<T>(points: T[], getX?: (point: T) => number, getY?: (point: T) => number): Delaunator<T>;
        
        triangles: Uint32Array;
        halfedges: Int32Array;
        hull: Uint32Array;
        coords: Float64Array;
        
        constructor(coords: ArrayLike<number>);
    }
}