import Matter from "matter-js"
import { Graphics, Container, Ticker, Sprite } from "pixi.js"
import { Critter } from "./CritterFactory"
import { Settings } from "../Settings"

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
            x: proj.speed * Math.cos(proj.startingDirection - Math.PI / 2),
            y: proj.speed * Math.sin(proj.startingDirection - Math.PI / 2)
        })
        if (proj.sprite) {
            this.stage.addChild(proj.sprite)
        } else if (proj.graphics) {
            this.stage.addChild(proj.graphics);
        }

        return proj
    }
    destroy(proj: Projectile) {
        if (proj instanceof Projectile) {
            Matter.World.remove(this.engine.world, proj.body)
            if (proj.graphics instanceof Graphics) {
                this.stage.removeChild(proj.graphics)
                proj.graphics.destroy()
            }

        } else {
            throw 'canot destroy, invaldi projectile'
        }
    }
}





export class Projectile {
    entityID: string = ""
    toDestroy: boolean = false

    body: Matter.Body
    graphics?: Graphics
    sprite?: Sprite


    speed: number
    /**
     * radians
     */
    startingDirection: number

    /**
     * in seconds
     */
    timeAlive: number = 0
    /**
     * in seconds
     */
    readonly lifetime: number

    critterOwner?: Critter

    element: string | null

    team: number

    health: number
    totalHealth: number

    isVirus: boolean

    damage: number = 0

    customUpdate?: (time: Ticker, proj: Projectile) => void

    onDelete?: () => void

    constructor(settings: ProjectileSettings) {
        this.startingDirection = settings.startingDirection
        this.critterOwner = settings.critterOwner
        this.element = settings.element || null

        this.team = settings.team
        this.customUpdate = settings.customUpdate;
        this.onDelete = settings.onDelete;

        this.health = settings.totalHealth || 1
        this.totalHealth = settings.totalHealth || 1

        this.isVirus = settings.isVirus || false

        this.lifetime = settings.lifetime
        this.speed = settings.speed
        this.damage = settings.damage || 1


        const rectWidth = 14
        const rectHeight = 46

        if (!settings.body) {
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
            body.collisionFilter.category = Settings.collisionCategories.PROJECTILE
            body.collisionFilter.mask = Settings.collisionCategories.PROJECTILE | Settings.collisionCategories.CRITTER | Settings.collisionCategories.WALL
            //body.label = `PROJ`


            Matter.Body.setInertia(body, Infinity)
            Matter.Body.setAngle(body, this.startingDirection)
            this.body = body

        } else {
            this.body = settings.body
        }

        if (settings.sprite) {
            this.sprite = settings.sprite
        } else if (settings.graphics) {
            this.graphics = settings.graphics
        } else {
            let graphics = new Graphics()
            graphics.pivot.set(rectWidth / 2, rectHeight / 2)
            graphics.rect(0, 0, rectWidth, rectHeight)
            graphics.fill(settings.color || 0xFF0000);
            //graphics.stroke({ width: 2, color: 0x1f2e2e });

            graphics.rotation = this.startingDirection
            this.graphics = graphics
        }

    }

}

export interface ProjectileSettings {

    /**
     * CENTER x
     */
    x: number,
    y: number,
    startingDirection: number,
    critterOwner?: Critter,
    element?: string,
    /**
     * in seconds
     */
    lifetime: number,
    speed: number

    damage?: number

    team: number

    body?: Matter.Body
    graphics?: Graphics
    sprite?: Sprite

    color?: number

    destructible?: boolean
    /**
     * only if destructible=true
     */
    totalHealth?: number

    customPath?: (x: number, y: number) => { x: number, y: number }


    stationary?: boolean

    /**
     * stationary part of map that critters attack for resources
     */
    isMiningNode?: boolean

    /**
     * additional update function called every frame
     */
    customUpdate?: (time: Ticker, proj: Projectile) => void

    onDelete?: () => void


    isVirus?: boolean

}