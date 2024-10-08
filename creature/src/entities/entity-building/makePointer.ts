import { Graphics } from "pixi.js";

// marks destination clicked
export function makePointer() : Graphics{
    let g = new Graphics()

    g.circle(0,0,50)
    g.stroke({ width: 15, color: 0xFF0000 });
    return g


    /*
    https://pixijs.com/8.x/examples/graphics/fill-gradient
        graphic2
            .clear()
            .roundRect(0, 0, 150, 150, 50)
            .stroke({ width: Math.sin(tick) * 100, fill: gradientFill });
    */
}