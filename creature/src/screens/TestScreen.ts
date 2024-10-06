import { Viewport } from "pixi-viewport";
import { IScreen } from "./IScreen";
import { Sprite, Texture, Assets, Application, Ticker, Text, FederatedPointerEvent } from "pixi.js";
import Matter from "matter-js";
import { EntityStore } from "../entities/EntityStore";
import { Random } from "random-js";
import { Settings } from "../Settings";
import { Critter, CritterFactory } from "../entities/CritterFactory";

export class TestScreen implements IScreen {

    bunny: Sprite
    engine: Matter.Engine
    app: Application
    viewport: Viewport

    critters: EntityStore<Critter>

    rng: Random

    debugText: Text

    mouseX: number = 0
    mouseY: number = 0

    constructor(app: Application, viewport: Viewport, engine: Matter.Engine) {


        // add a red box
        const sprite = viewport.addChild(new Sprite(Texture.WHITE))
        sprite.tint = 0xff0000
        sprite.width = sprite.height = 100
        sprite.position.set(100, 100)

        // draw test sprite
        const texture = Assets.get('TEST444')
        const bunny = Sprite.from(texture);
        bunny.anchor.set(0.5);
        bunny.x = 333// app.screen.width / 2;
        bunny.y = app.screen.height / 2;
        viewport.addChild(bunny);

        this.bunny = bunny

        this.engine = engine
        this.app = app,
        this.viewport = viewport

        this.rng = new Random()


        this.critters = new EntityStore('Critters')

        // level 1

        // add critters
        let critterFactory = new CritterFactory(engine, viewport)
        for (let i = 0; i < 100; i++) {
            this.critters.add(critterFactory.create({
                x: i * 5,
                y: this.rng.integer(0, 500)
            }))
        }

        //debug text
        this.debugText = new Text({x: 10, y: 550, style:{fill:'black'}  })
        app.stage.addChild(this.debugText)

        // mouse position
        this.viewport.on('pointermove', (event) => {this.mouseX = event.x, this.mouseY = event.y})


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
        this.critters.forEach( (critter: Critter) => {
            critter.graphics.position.set(critter.body.position.x, critter.body.position.y)
        })
        /*
            object.sprite.position = object.body.position;
            object.sprite.rotation = object.body.angle;
        */
        Matter.Engine.update(this.engine, time.deltaMS)


        

        // pan/scale debug renderer
        const screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        const scale = Math.min(screenWidth / Settings.V_WIDTH, screenHeight / Settings.V_HEIGHT);

        this.engine.render.bounds.min.x = -this.viewport.x/2 / this.viewport.scale.x
        this.engine.render.bounds.max.x = -this.viewport.x/2 / this.viewport.scale.x + Settings.V_WIDTH/2 / this.viewport.scale.x
        this.engine.render.bounds.min.y = -this.viewport.y/2 / this.viewport.scale.y
        this.engine.render.bounds.max.y = -this.viewport.y/2 / this.viewport.scale.y + Settings.V_HEIGHT/2 / this.viewport.scale.y

        //console.log(this.viewport.x + " " + this.engine.render.bounds.min.x + " " + this.viewport.getBounds().x + " " + this.viewport.getBounds().width + " " + this.viewport.scale.x);

        // this.engine.render.bounds.min.x = this.viewport.x * scale
        // this.engine.render.bounds.max.x = (this.viewport.x + this.engine.render.canvas.width) * scale

        // this.engine.render.bounds.min.y = this.viewport.y * scale
        // this.engine.render.bounds.max.y = (this.viewport.y + this.engine.render.canvas.height) * scale


        this.debugText.text =
`viewport(${this.viewport.x}, ${this.viewport.y}) 
viewportboundsX(${this.viewport.getBounds().x}, ${this.viewport.getBounds().maxX})
debugrendererX(${this.engine.render.bounds.min.x}, ${this.engine.render.bounds.max.x})
scale(${this.viewport.scale.x}, ${this.viewport.scale.y})
mousePosition(${this.mouseX}, ${this.mouseY})`


    }

}