import Matter from "matter-js"
import { Graphics, Container, Geometry } from "pixi.js"

export class CritterFactory {
    engine: Matter.Engine
    stage: Container
    constructor(engine: Matter.Engine, stage: Container) {
        this.engine = engine
        this.stage = stage
    }

    /**
     * creates AND adds to physics and graphics
     * @param settings 
     * @returns 
     */
    create(settings: CritterSettings) : Critter{
        let critter = new Critter(settings)

        Matter.World.addBody(this.engine.world, critter.body);
        this.stage.addChild(critter.graphics);


        return critter
    }
    destroy() {

    }
}

export class Critter {
    body: Matter.Body
    graphics: Graphics

    speed: number

    constructor(settings: CritterSettings) {
        this.speed = 1.1
        const width = 20
        const height = 15
        const body = Matter.Bodies.rectangle(
            settings.x,
            settings.y,
            width,
            height
        )
        //Matter.World.addBody(this.engine.world, body)

        const triangleShape = new Geometry({
            attributes: {
                aPosition: [-100, -50, 100, -50, 0, 100],
            },
        });
        let graphics = new Graphics() //new Graphics(settings.graphicsContext)

        graphics.moveTo(settings.x + width / 2, settings.y)
        graphics.lineTo(settings.x + width, settings.y + height)
        graphics.lineTo(settings.x, settings.y + height)
        graphics.lineTo(settings.x + width / 2, settings.y)
        graphics.fill(0xff3300);
        graphics.stroke({ width: 4, color: 0xffd900 });
        //this.container.addChild(graphics)

        this.body = body
        this.graphics = graphics
    }

}

interface CritterSettings {
    x: number,
    y: number
}