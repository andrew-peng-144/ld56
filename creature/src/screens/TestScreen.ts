import { Viewport } from "pixi-viewport";
import { IScreen } from "./IScreen";
import { Sprite, Texture, Assets, Application, Ticker } from "pixi.js";
import Matter from "matter-js";

export class TestScreen implements IScreen {

    bunny: Sprite
    engine: Matter.Engine
    constructor(app: Application, viewport: Viewport, engine: Matter.Engine) {
        // add a red box

        const sprite = viewport.addChild(new Sprite(Texture.WHITE))
        sprite.tint = 0xff0000
        sprite.width = sprite.height = 100
        sprite.position.set(100, 100)

        // Load the bunny texture
        const texture = Assets.get('TEST444')

        // Create a bunny Sprite
        const bunny = Sprite.from(texture);

        // Center the sprite's anchor point
        bunny.anchor.set(0.5);

        // Move the sprite to the center of the screen
        bunny.x = 333// app.screen.width / 2;
        bunny.y = app.screen.height / 2;

        viewport.addChild(bunny);
        this.bunny = bunny

        this.engine = engine
    }
    onEnter(prev: IScreen): void {
        throw new Error("Method not implemented.");
    }
    onExit(next: IScreen): void {
        throw new Error("Method not implemented.");
    }

    onUpdate(time: Ticker): void {
        this.bunny.rotation += 0.1 * time.deltaTime;


        // loop thru each critter and set position
        /*
            object.sprite.position = object.body.position;
            object.sprite.rotation = object.body.angle;
        */
        Matter.Engine.update(this.engine, time.deltaMS)
    }

}