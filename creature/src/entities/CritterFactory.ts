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
    entityID: string = ""

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

    totalHealth: number
    health: number

    currentTarget: Matter.Vector
    currentTargetAttack: Matter.Vector
    shouldAttack: boolean
    shouldMove: boolean

    /**
     * matter units
     */
    sightRange: number

    readonly projectileLifetime: number
    projectileSpeed: number

    team: number

    large: boolean = false

    ability: CritterAbility | null = null

    /**
     * differentiate when multi selecting
     */
    name: string

    constructor(settings: CritterSettings) {
        this.movementSpeed = settings.movementSpeed || 1.1
        this.fireDelay = settings.fireDelay || 0.4
        this.power = settings.power || 4
        this.totalHealth = settings.totalHealth || 50
        this.health = this.totalHealth
        this.projectileLifetime = settings.projectileLifetime || 0.5
        this.projectileSpeed = settings.projectileSpeed || 4.1

        this.name = settings.name || "default"

        this.currentTarget = { x: 0, y: 0 }
        this.currentTargetAttack = {x: 0, y: 0}
        this.shouldAttack = false
        this.shouldMove = false
        this.sightRange = this.projectileSpeed * this.projectileLifetime * 60 //is it always 60?
        this.team = settings.team


        // default body
        const triangleWidth = 20
        const triangleHeight = 15
        if (!settings.body) {

            const radius = 8
            const body = Matter.Bodies.circle(
                settings.x,
                settings.y,
                radius
            )
            this.body = body
            //body.label = 'CRIT'
            //Matter.World.addBody(this.engine.world, body)
        } else {
            this.body = settings.body
        }

        // default graphics
        if (!settings.graphics) {
            let graphics = new Graphics() //new Graphics(settings.graphicsContext)

            graphics.moveTo(triangleWidth / 2, 0)
            graphics.lineTo(triangleWidth, triangleHeight)
            graphics.lineTo(0, triangleHeight)
            graphics.lineTo(triangleWidth / 2, 0)
            graphics.fill(0xff00ff);
            graphics.stroke({ width: 4, color: 0x6b6b47 });
            //this.container.addChild(graphics)
            //graphics.position.set(settings.x - triangleWidth / 2, settings.y - triangleHeight / 2) //not needed, as handled in update?
            graphics.pivot.set(triangleWidth / 2, triangleHeight / 2)


            this.graphics = graphics
        } else {
            this.graphics = settings.graphics
        }


    }

}

export interface CritterSettings {
    movementSpeed?: number
    fireDelay?: number
    power?: number
    totalHealth?: number
    projectileLifetime?: number
    projectileSpeed?: number

    body?: Matter.Body
    graphics?: Graphics

    /**
     * CENTER x
     */
    x: number,
    y: number

    team: number

    name?: string
}


interface CritterAbility {
    name: string
    cost: number

    archetype: 'self' | 'projectile' | 'health'
    magnitude: number
    duration?: number
    custom?: string


}