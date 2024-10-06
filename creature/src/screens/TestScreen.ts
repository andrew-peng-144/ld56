import { Viewport } from "pixi-viewport";
import { IScreen } from "./IScreen";
import { Sprite, Texture, Assets, Application, Ticker, Text, FederatedPointerEvent } from "pixi.js";
import Matter, { Vector } from "matter-js";
import { EntityStore } from "../entities/EntityStore";
import { Random } from "random-js";
import { Settings } from "../Settings";
import { Critter, CritterFactory } from "../entities/CritterFactory";
import { Projectile, ProjectileFactory } from "../entities/ProjectileFactory";
import { round } from "mathjs";

export class TestScreen implements IScreen {

    bunny: Sprite
    engine: Matter.Engine
    app: Application
    viewport: Viewport

    critters: EntityStore<Critter>
    critterFactory: CritterFactory
    projectiles: EntityStore<Projectile>
    projectileFactory: ProjectileFactory

    rng: Random

    debugText: Text

    mouseEventX: number = 0
    mouseEventY: number = 0

    debugBody1: Matter.Body

    markedCritter1: string


    readonly collisionCategories = {
        default: 0x0001,
        critter: 0x0002,
        projectile: 0x0004,
        3: 0x0008,
        4: 0x0010,
        5: 0x0020,
        6: 0x0040,
        7: 0x0080,
        8: 0x0100
    }


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
        this.app = app
        this.viewport = viewport
        this.rng = new Random()

        this.debugBody1 = Matter.Bodies.rectangle(
            150, 250, 50, 50
        )
        Matter.World.addBody(engine.world, this.debugBody1)

        this.critters = new EntityStore('Critters')
        this.projectiles = new EntityStore('Projectiles')



        // add critters
        this.critterFactory = new CritterFactory(engine, viewport)
        for (let i = 0; i < 10; i++) {
            let newCritter = this.critterFactory.create({
                x: i * 5,
                y: this.rng.integer(0, 500)
            })
            newCritter.body.collisionFilter.category = this.collisionCategories.critter
            newCritter.body.collisionFilter.mask = this.collisionCategories.projectile | this.collisionCategories.critter
            this.markedCritter1 = this.critters.add(newCritter)
        }

        this.projectileFactory = new ProjectileFactory(engine, viewport)



        //debug text
        this.debugText = new Text({ x: 10, y: 450, style: { fill: 'black', fontSize: '13px' } })
        app.stage.addChild(this.debugText)


        // mouse position
        this.viewport.on('pointermove', (event) => { this.mouseEventX = event.x, this.mouseEventY = event.y })


        // register collison event
        Matter.Events.on(engine, 'collisionStart', (event) => {
            event.pairs.forEach(pair => {

                // damage critter
                let categoryA = pair.bodyA.collisionFilter.category
                let categoryB = pair.bodyB.collisionFilter.category
                if (categoryA === this.collisionCategories.critter && categoryB === this.collisionCategories.projectile
                    || categoryB === this.collisionCategories.critter && categoryA === this.collisionCategories.projectile
                ) {
                    console.log(`${pair.bodyA.label} collided with ${pair.bodyB.label}`);
                }
            })
        });


    }
    onEnter(prev: IScreen): void {
        throw new Error("Method not implemented.");
    }
    onExit(next: IScreen): void {
        throw new Error("Method not implemented.");
    }

    onUpdate(time: Ticker): void {


        /*
            object.sprite.position = object.body.position;
            object.sprite.rotation = object.body.angle;
        */
        Matter.Engine.update(this.engine, time.deltaMS)



        // pan/scale debug renderer
        const screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        const scale = Math.min(screenWidth / Settings.V_WIDTH, screenHeight / Settings.V_HEIGHT);

        this.engine.render.bounds.min.x = -this.viewport.x / 2 / this.viewport.scale.x
        this.engine.render.bounds.max.x = -this.viewport.x / 2 / this.viewport.scale.x + Settings.V_WIDTH / 2 / this.viewport.scale.x
        this.engine.render.bounds.min.y = -this.viewport.y / 2 / this.viewport.scale.y
        this.engine.render.bounds.max.y = -this.viewport.y / 2 / this.viewport.scale.y + Settings.V_HEIGHT / 2 / this.viewport.scale.y

        let mouseXVirtual = (this.mouseEventX - this.app.canvas.getBoundingClientRect().left) / scale
        let mouseYVirtual = (this.mouseEventY - this.app.canvas.getBoundingClientRect().top) / scale

        let mouseXViewport = mouseXVirtual - this.viewport.x //rel. to viewport - no zoom factored in
        let mouseYViewport = mouseYVirtual - this.viewport.y

        let mouseXMatter = mouseXViewport / 2 / this.viewport.scale.x
        let mouseYMatter = mouseYViewport / 2 / this.viewport.scale.y




        // set test sprite position
        this.bunny.position.set(this.debugBody1.position.x * 2, this.debugBody1.position.y * 2)
        this.bunny.rotation += 0.1 * time.deltaTime;



        // loop thru each critter
        this.critters.forEach((critter: Critter) => {
            // lock body to sprite
            critter.graphics.position.set(critter.body.position.x * 2, critter.body.position.y * 2) // WHY is there a factor of 2 between matter coords and virtual coords?
            //critter.graphics.rotation = critter.body.angle


            // set target pos to mouse
            critter.currentTarget = {x: mouseXMatter, y: mouseYMatter}

            // set rotation to target pos
            let vecToTarget = { x: critter.currentTarget.x - critter.body.position.x, y: critter.currentTarget.y - critter.body.position.y }
            let dir = Matter.Vector.normalise(vecToTarget)
            critter.graphics.rotation = Matter.Vector.angle({ x: 0, y: 0 }, dir) + Math.PI / 2
            
            // move critter to its target pos
            Matter.Body.setVelocity(critter.body, Matter.Vector.mult(dir, critter.movementSpeed))
            //Matter.Body.setVelocity(critter.body, {x:.1, y:.1})

            // have critters stop in front of their effective range
            if (Matter.Vector.magnitude(vecToTarget) <= critter.sightRange) {
                //debugger;
                let mag = Matter.Vector.magnitude(vecToTarget)
                Matter.Body.setVelocity(critter.body, {x:0,y:0})
            }
            


            // shoot porjectiles
            critter.timeSpentSinceFiring += time.deltaMS / 1000
            if (critter.timeSpentSinceFiring > critter.fireDelay) {
                critter.timeSpentSinceFiring -= critter.fireDelay
                if (this.projectiles.size() < 450) {
                    let newProj = this.projectileFactory.create({
                        x: critter.body.position.x,
                        y: critter.body.position.y,
                        startingDirection: critter.graphics.angle * Math.PI / 180,
                        critterOwner: critter,
                        lifetime: critter.projectileLifetime,
                        speed: critter.projectileSpeed
                    })
                    newProj.body.collisionFilter.category = this.collisionCategories.projectile
                    newProj.body.collisionFilter.mask = this.collisionCategories.critter
                    this.projectiles.add(newProj)
                } else {
                    //alert('projectile limit reached')
                }

            }
        })


        // loop thru each projectile
        this.projectiles.forEach((projectile: Projectile, id: string) => {
            projectile.graphics.position.set(projectile.body.position.x * 2, projectile.body.position.y * 2)

            projectile.timeAlive += time.deltaMS / 1000
            if (projectile.timeAlive >= projectile.lifetime) {
                projectile.timeAlive -= projectile.lifetime
                this.projectileFactory.destroy(projectile)
                this.projectiles.remove(id)
            }
        })





        this.debugText.text =
            `
pixiDelta(${round(time.deltaTime, 3)},${round(time.deltaMS, 3)})
viewport(${this.viewport.x}, ${this.viewport.y}) 
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
projectileCount(${this.projectiles.size()})
`


    }

}