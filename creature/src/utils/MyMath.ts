export class MyMath {
    /**
     * Linear interpolation between two values.
     * @param x - Starting value.
     * @param y - Ending value.
     * @param t - Interpolation factor (0 to 1).
     * @returns The interpolated value.
     */
    static lerp(x: number, y: number, t: number): number {
        return ((1 - t) * x) + (t * y);
    }

    /** Clamp a number to minimum and maximum values */
    static clamp(v: number, min = 0, max = 1) {
        if (min > max) [min, max] = [max, min];
        return v < min ? min : v > max ? max : v;
    }

    static toRadians(deg: number) {
        return deg * Math.PI / 180
    }

}