import { Graphics } from "pixi.js";
import { Critter } from "../CritterFactory";

export function makeSelectionSquare(critter: Critter) : Graphics {
    let squareGraphics = new Graphics()
    let sgWidth = (critter.body.bounds.max.x - critter.body.bounds.min.x) * 2
    let sgHeight = (critter.body.bounds.max.y - critter.body.bounds.min.y) * 2
    squareGraphics.rect(0, 0, sgWidth, sgHeight);
    squareGraphics.stroke({ width: 2, color: 0x000000 });
    return squareGraphics
}