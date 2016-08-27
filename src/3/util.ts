class util {

    public static randomInt(range: number): number {
        return Math.floor(Math.random() * range);
    }

    public static randomColor(doUpdate: boolean): Uint8Array {
        return new Uint8Array([Math.random(), Math.random(), Math.random(), 1]);
    }


    public static radToDeg(r: number): number {
        return r * 180 / Math.PI;
    }

    public static degToRad(d:number): number {
        return d * Math.PI / 180;
    }
}