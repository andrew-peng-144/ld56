import { Viewport } from "pixi-viewport";
import { IScreen } from "./IScreen";
import { Sprite, Texture, Assets, Application, Ticker, Text, FederatedPointerEvent } from "pixi.js";
import Matter, { Vector } from "matter-js";
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

    mouseEventX: number = 0
    mouseEventY: number = 0

    debugBody1: Matter.Body

    markedCritter1: string

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

        this.debugBody1 = Matter.Bodies.rectangle(
            150, 250, 50, 50
          )
          Matter.World.addBody(engine.world, this.debugBody1)

        this.critters = new EntityStore('Critters')

        // level 1

        // add critters
        let critterFactory = new CritterFactory(engine, viewport)
        for (let i = 0; i < 100; i++) {
            this.markedCritter1 = this.critters.add(critterFactory.create({
                x: i * 5,
                y: this.rng.integer(0, 500)
            }))
        }

        //debug text
        this.debugText = new Text({x: 10, y: 450, style:{fill:'black',fontSize:'13px'}  })
        app.stage.addChild(this.debugText)

        // mouse position
        this.viewport.on('pointermove', (event) => {this.mouseEventX = event.x, this.mouseEventY = event.y})


    }
    onEnter(prev: IScreen): void {
        throw new Error("Method not implemented.");
    }
    onExit(next: IScreen): void {
        throw new Error("Method not implemented.");
    }

    onUpdate(time: Ticker): void {
        this.bunny.rotation += 0.1 * time.deltaTime;


        // loop thru each critter and set position of sprite
        this.critters.forEach( (critter: Critter) => {
            critter.graphics.position.set(critter.body.position.x * 2, critter.body.position.y * 2 ) // WHY is there a factor of 2 between matter coords and virtual coords?
            //critter.graphics.rotation = critter.body.angle
        })
        this.bunny.position.set(this.debugBody1.position.x * 2, this.debugBody1.position.y * 2)

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

        let mouseXVirtual = (this.mouseEventX - this.app.canvas.getBoundingClientRect().left) / scale
        let mouseYVirtual = (this.mouseEventY - this.app.canvas.getBoundingClientRect().top) / scale

        let mouseXViewport = mouseXVirtual - this.viewport.x //rel. to viewport - no zoom factored in
        let mouseYViewport = mouseYVirtual - this.viewport.y

        let mouseXMatter = mouseXViewport / 2 / this.viewport.scale.x
        let mouseYMatter = mouseYViewport / 2 / this.viewport.scale.y


        // critters move to mouse

        this.critters.forEach( (critter: Critter) => {
            let dir = Matter.Vector.normalise({x: mouseXMatter - critter.body.position.x, y: mouseYMatter - critter.body.position.y})
            Matter.Body.setVelocity(critter.body,  Matter.Vector.mult(dir, critter.speed) )
            //Matter.Body.setVelocity(critter.body, {x:.1, y:.1})
            critter.graphics.rotation = Matter.Vector.angle({x:0, y:0},dir)
        })





        this.debugText.text =
`viewport(${this.viewport.x}, ${this.viewport.y}) 
viewportboundsX(${this.viewport.getBounds().x}, ${this.viewport.getBounds().maxX})
debugrendererX(${this.engine.render.bounds.min.x}, ${this.engine.render.bounds.max.x})
scale(${this.viewport.scale.x}, ${this.viewport.scale.y})
mousePosition(${this.mouseEventX}, ${this.mouseEventY})
mousePosVirtual(${mouseXVirtual}, ${mouseYVirtual})
mousePosViewport(${mouseXViewport}, ${mouseYViewport})
mousePosMatter(${mouseXMatter}, ${mouseYMatter})
debugBody1(${this.debugBody1.position.x},${this.debugBody1.position.y})
markedCritter1Body(${this.critters.get(this.markedCritter1).body.position.x},${this.critters.get(this.markedCritter1).body.position.y})
markedCritter1Sprite(${this.critters.get(this.markedCritter1).graphics.position.x},${this.critters.get(this.markedCritter1).graphics.position.y})

`


    }

}