/// <reference path="GlVector.ts" />

class GlCamera {

    public static lookAt(cameraPosition: number[], target: number[], up: number[]): Float32Array {
        let zAxis = GlVector.normalize(
            GlVector.subtract(new Float32Array(cameraPosition), new Float32Array(target)));
        let xAxis = GlVector.cross(new Float32Array(up), zAxis);
        let yAxis = GlVector.cross(zAxis, xAxis);

        return new Float32Array([
            xAxis[0], xAxis[1], xAxis[2], 0,
            yAxis[0], yAxis[1], yAxis[2], 0,
            zAxis[0], zAxis[1], zAxis[2], 0,
            cameraPosition[0], cameraPosition[1], cameraPosition[2], 1
        ]);
    }

}