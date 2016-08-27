class util {

    public static randomInt(range: number): number {
        return Math.floor(Math.random() * range);
    }

    public static randomColor(doUpdate: boolean): Uint8Array {
        return new Uint8Array([Math.random(), Math.random(), Math.random(), 1]);
    }
}