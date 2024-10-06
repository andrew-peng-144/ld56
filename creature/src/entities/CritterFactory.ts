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
    create(settings: CritterSettings): Critter {
        let critter = new Critter(settings)

        Matter.World.addBody(this.engine.world, critter.body);
        this.stage.addChild(critter.graphics);
        

        return critter
    }
    destroy(critter: Critter) {
        if (critter instanceof Critter) {
            Matter.World.remove(this.engine.world, critter.body)
            this.stage.removeChild(critter.graphics)
            critter.graphics.destroy()
        } else {
            throw 'canot destroy, invaldi critter'
        }
    }
}




export class Critter {
    body: Matter.Body
    graphics: Graphics

    movementSpeed: number
    /**
     * in seconds
     */
    fireDelay: number
    power: number
    /**
     * in seconds
     */
    timeSpentSinceFiring: number = 0

    health: number
    
    currentTarget: Matter.Vector

    /**
     * matter units
     */
    sightRange: number

    readonly projectileLifetime: number
    projectileSpeed: number

    constructor(settings: CritterSettings) {
        this.movementSpeed = 1.1
        this.fireDelay = 0.4
        this.power = 4
        this.health = 50
        this.projectileLifetime = 0.8
        this.projectileSpeed = 4.1

        const triangleWidth = 20
        const triangleHeight = 15
        const radius = 8
        const body = Matter.Bodies.circle(
            settings.x,
            settings.y,
            radius
        )
        body.label = 'CRIT'
        //Matter.World.addBody(this.engine.world, body)

        const triangleShape = new Geometry({
            attributes: {
                aPosition: [-100, -50, 100, -50, 0, 100],
            },
        });
        let graphics = new Graphics() //new Graphics(settings.graphicsContext)

        graphics.moveTo(triangleWidth / 2, 0)
        graphics.lineTo(triangleWidth, triangleHeight)
        graphics.lineTo(0, triangleHeight)
        graphics.lineTo(triangleWidth / 2, 0)
        graphics.fill(0xff3300);
        graphics.stroke({ width: 4, color: 0xffd900 });
        //this.container.addChild(graphics)
        //graphics.position.set(settings.x - triangleWidth / 2, settings.y - triangleHeight / 2) //not needed, as handled in update?
        graphics.pivot.set(triangleWidth / 2, triangleHeight / 2)

        this.body = body
        this.graphics = graphics
        this.currentTarget = {x: 0, y: 0}

        this.sightRange = this.projectileSpeed * this.projectileLifetime * 60 //is it always 60?
    }

}

interface CritterSettings {

    /**
     * CENTER x
     */
    x: number,
    y: number
}