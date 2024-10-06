import Matter from "matter-js"
import { Graphics, Container, Geometry } from "pixi.js"
import { Critter } from "./CritterFactory"

export class ProjectileFactory {
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
    create(settings: ProjectileSettings): Projectile {

        let proj = new Projectile(settings)
        Matter.World.addBody(this.engine.world, proj.body);
        Matter.Body.setVelocity(proj.body, {
            x: proj.speed * Math.cos(proj.startingDirection - Math.PI/2),
            y: proj.speed * Math.sin(proj.startingDirection - Math.PI/2)
        })
        this.stage.addChild(proj.graphics);

        return proj
    }
    destroy(proj: Projectile) {
        if (proj instanceof Projectile) {
            Matter.World.remove(this.engine.world, proj.body)
            this.stage.removeChild(proj.graphics)
            proj.graphics.destroy()
        } else {
            throw 'canot destroy, invaldi projectile'
        }
    }
}





export class Projectile {
    entityID: string = ""

    body: Matter.Body
    graphics: Graphics

    speed: number
    /**
     * radians
     */
    startingDirection: number

    timeAlive: number = 0
    /**
     * in seconds
     */
    readonly lifetime: number

    critterOwner: Critter

    element: string | null

    team: number

    health: number
    totalHealth: number

    constructor(settings: ProjectileSettings) {
        this.startingDirection = settings.startingDirection
        this.critterOwner = settings.critterOwner
        this.element = settings.element || null

        this.team = settings.team

        this.health = settings.totalHealth || 1
        this.totalHealth = settings.totalHealth || 1

        this.lifetime = settings.lifetime
        this.speed = settings.speed
        const rectWidth = 7
        const rectHeight = 23
        const body = Matter.Bodies.rectangle(
            settings.x,// - rectWidth / 2,
            settings.y,// - rectHeight / 2,
            rectWidth / 2,
            rectHeight / 2
        )
        //Matter.Body.setPosition(body, {x:settings.x, y:settings.y})
        body.isSensor = true
        body.frictionAir = 0
        body.isStatic = settings.stationary || false
        //body.label = `PROJ`


        Matter.Body.setInertia(body, Infinity)
        Matter.Body.setAngle(body, this.startingDirection)


        let graphics = new Graphics()
        graphics.pivot.set(rectWidth / 2, rectHeight / 2)
        graphics.rect(0, 0, rectWidth, rectHeight)
        graphics.fill(0x669999);
        graphics.stroke({ width: 2, color: 0x1f2e2e });

        graphics.rotation = this.startingDirection


        this.body = body
        this.graphics = graphics
    }

}

interface ProjectileSettings {
    
    /**
     * CENTER x
     */
    x: number,
    y: number,
    startingDirection: number,
    critterOwner: Critter,
    element?: string,
    lifetime: number,
    speed: number

    team: number

    destructible?: boolean
    /**
     * only if destructible=true
     */
    totalHealth?: number

    customPath?: (x: number,y: number)=>{x: number, y: number}


    stationary?: boolean

}