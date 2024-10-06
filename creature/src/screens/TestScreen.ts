import { Viewport } from "pixi-viewport";
import { IScreen } from "./IScreen";
import { Sprite, Texture, Assets, Application, Ticker, Text, FederatedPointerEvent, Graphics, ObservablePoint } from "pixi.js";
import Matter, { Vector } from "matter-js";
import { EntityStore } from "../entities/EntityStore";
import { Random } from "random-js";
import { Settings } from "../Settings";
import { Critter, CritterFactory } from "../entities/CritterFactory";
import { Projectile, ProjectileFactory } from "../entities/ProjectileFactory";
import { round, square } from "mathjs";
import { ceratron } from "../entities/entity-building/critters/ceratron";
import { makeSelectionSquare } from "../entities/entity-building/makeSelectionSquare";
import { makeBounds } from "../entities/entity-building/makeBounds";
import { shootProjectile } from "../entities/entity-building/shootProjectile";

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
    pausedText: Text

    mouseEventX: number = 0
    mouseEventY: number = 0


    debugBody1: Matter.Body

    markedCritter1: string = "error"
    mouseXMatter: number = 0;
    mouseYMatter: number = 0;


    selectionSquares: Set<{ c: Critter, g: Graphics }>
    selectionCircle: Matter.Body

    playerClickedOnAttackable: Matter.Body | null = null


    constructor(app: Application, viewport: Viewport, engine: Matter.Engine) {


        // add bounds
        makeBounds(app, engine, viewport)


        // add a red box
        const sprite = viewport.addChild(new Sprite(Texture.WHITE))
        sprite.tint = 0xff0000
        sprite.width = sprite.height = 50
        sprite.position.set(0, 0)

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
                y: this.rng.integer(0, 500),
                team: Settings.teams.PLAYER
            })
            newCritter.body.collisionFilter.category = Settings.collisionCategories.CRITTER
            newCritter.body.collisionFilter.mask = Settings.collisionCategories.PROJECTILE | Settings.collisionCategories.CRITTER | Settings.collisionCategories.WALL
            let entityID = this.critters.add(newCritter)
            newCritter.entityID = entityID
            if (i === 5) {
                this.markedCritter1 = entityID
            }
            newCritter.body.label = entityID
        }
        for (let i = 0; i < 10; i++) {
            let newCritter = this.critterFactory.create(
                ceratron(
                    i * 5 + 500,
                    this.rng.integer(0, 500),
                    Settings.teams.ENEMY
                )
            )
            newCritter.body.collisionFilter.category = Settings.collisionCategories.CRITTER
            newCritter.body.collisionFilter.mask = Settings.collisionCategories.PROJECTILE | Settings.collisionCategories.CRITTER | Settings.collisionCategories.WALL
            let entityID = this.critters.add(newCritter)
            newCritter.entityID = entityID
            newCritter.body.label = entityID
        }

        this.projectileFactory = new ProjectileFactory(engine, viewport)


        // Selected critters position and graphic
        this.selectionSquares = new Set()
        this.selectionCircle = Matter.Bodies.circle(0, 0, Settings.selectionCircleRadius)
        this.selectionCircle.isSensor = true
        Matter.World.addBody(this.engine.world, this.selectionCircle);


        //debug text
        this.debugText = new Text({ x: 10, y: 450, style: { fill: 'white', fontSize: '13px' } })
        //this.debugText.width /= 2
        //this.debugText.height /= 2
        app.stage.addChild(this.debugText)
        this.pausedText = new Text({ x: 450, y: 450, style: { fill: 'white', fontSize: '63px' } })
        this.pausedText.text = "PAUSED"
        this.pausedText.visible = false
        app.stage.addChild(this.pausedText)



        // mouse position
        this.viewport.on('pointermove', (event) => { this.mouseEventX = event.x, this.mouseEventY = event.y })
        this.viewport.on('pointerdown', (event) => {
            switch (event.button) {
                case 0:
                    console.log("Left button clicked.");

                    // reset selection
                    this.selectionSquares.forEach(square => {
                        viewport.removeChild(square.g)
                        square.g.destroy()
                    })
                    this.selectionSquares.clear()


                    // query for selected bodies
                    let resultsPoint = Matter.Query.point(engine.world.bodies, { x: this.mouseXMatter, y: this.mouseYMatter })
                    let clickedCircle: Matter.Body
                    if (resultsPoint.length >= 1) {
                        clickedCircle = resultsPoint[0]
                        this.playerClickedOnAttackable = clickedCircle
                    }
                    if (event.shiftKey) {
                        // shift click - select all around of same type as clicked
                        Matter.Body.setPosition(this.selectionCircle, { x: this.mouseXMatter, y: this.mouseYMatter })
                        let resultsCircle = Matter.Query.region(engine.world.bodies, this.selectionCircle.bounds)

                        resultsCircle.forEach(body => {
                            if (body.collisionFilter.category === Settings.collisionCategories.CRITTER


                            ) {
                                //console.log("CLICKED CRITTER " + body.label);
                                if (this.critters.has(body.label) && this.critters.has(clickedCircle.label)) {
                                    let critter = this.critters.get(body.label)

                                    if (critter.name === this.critters.get(clickedCircle.label).name) {
                                        let squareGraphics = makeSelectionSquare(critter)
                                        viewport.addChild(squareGraphics)
                                        this.selectionSquares.add({ c: critter, g: squareGraphics })
                                    }

                                }
                            }
                        })
                    } else {
                        // single click - select point
                        resultsPoint.forEach(body => {
                            if (body.collisionFilter.category === Settings.collisionCategories.CRITTER) {
                                console.log("CLICKED CRITTER " + body.label);
                                if (this.critters.has(body.label)) {
                                    let critter = this.critters.get(body.label)
                                    //this.selectedCritters.add(critter)

                                    let squareGraphics = makeSelectionSquare(critter)
                                    //squareGraphics.pivot.set(sgWidth / 2, sgHeight / 2)
                                    viewport.addChild(squareGraphics)
                                    this.selectionSquares.add({ c: critter, g: squareGraphics })
                                }
                            }
                        })
                    }


                    break;
                case 1:
                    console.log("Middle button clicked.");
                    break;
                case 2:
                    console.log("Right button clicked.");
                    
                    this.selectionSquares.forEach(square => {
                        square.c.currentTarget = { x: this.mouseXMatter, y: this.mouseYMatter }
                        square.c.currentTargetAttack = { x: this.mouseXMatter, y: this.mouseYMatter }
                        square.c.shouldMove = true
                        if (this.playerClickedOnAttackable !== null) {
                            square.c.shouldAttack = true
                            this.playerClickedOnAttackable = null
                        }
                    })
                    break;
                default:
                    console.log(`Unknown button code: ${event.button}`);
            }
        })
        this.viewport.on('pointerup', (event) => {
            switch (event.button) {
                case 0:
                    console.log("Left button up.");
                    break;
                case 1:
                    console.log("Middle button up.");
                    break;
                case 2:
                    console.log("Right button up.");
                    break;
                default:
                    console.log(`Unknown button code up: ${event.button}`);
            }
        })



        // register collison event
        Matter.Events.on(engine, 'collisionStart', (event) => {
            event.pairs.forEach(pair => {

                // damage critter
                let categoryA = pair.bodyA.collisionFilter.category || 0
                let categoryB = pair.bodyB.collisionFilter.category || 0

                switch (categoryA | categoryB) {
                    case Settings.collisionCategories.CRITTER | Settings.collisionCategories.PROJECTILE:
                        //both need to be labelled with the nanoid
                        let critterEntity: Critter | null = null;
                        let projEntity: Projectile | null = null;
                        if (this.critters.has(pair.bodyA.label)) {
                            critterEntity = this.critters.get(pair.bodyA.label)
                        } else if (this.projectiles.has(pair.bodyA.label)) {
                            projEntity = this.projectiles.get(pair.bodyA.label)
                        }
                        if (this.critters.has(pair.bodyB.label)) {
                            critterEntity = this.critters.get(pair.bodyB.label)
                        } else if (this.projectiles.has(pair.bodyB.label)) {
                            projEntity = this.projectiles.get(pair.bodyB.label)
                        }

                        if (critterEntity && projEntity) {
                            if (critterEntity.team !== projEntity.team) {
                                //console.log(`${pair.bodyA.label} collided with ${pair.bodyB.label} DIFF TEAMS`);

                            }
                        }

                        break
                }
                if (categoryA === Settings.collisionCategories.CRITTER && categoryB === Settings.collisionCategories.PROJECTILE
                    || categoryB === Settings.collisionCategories.CRITTER && categoryA === Settings.collisionCategories.PROJECTILE
                ) {
                    //console.log(`${pair.bodyA.label} collided with ${pair.bodyB.label}`);
                }
            })
        });


        // Create mouse constraint
        // const mouseConstraint = Matter.MouseConstraint.create(
        //     engine, {}
        // )
        // Matter.Events.on(mouseConstraint, "mousedown", () => {
        //     if (mouseConstraint.body) {
        //         console.log("CLICKED BODY " + mouseConstraint.body.label)
        //     }
        // });
        // Composite.add(engine.world, mouseConstraint)



    }
    onEnter(prev: IScreen): void {
        throw new Error("Method not implemented.");
    }
    onExit(next: IScreen): void {
        throw new Error("Method not implemented.");
    }

    paused: boolean = false
    pause() {
        this.app.stop()
        this.paused = true
        console.log("PAUSED TESTSCREEN");
        this.pausedText.visible = true
        this.app.render()
    }
    resume() {
        this.app.start()
        this.paused = false
        console.log("UNPAUSED TESTSCREEN");
        this.pausedText.visible = false
    }
    isPaused() {
        return this.paused
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

        this.mouseXMatter = mouseXViewport / 2 / this.viewport.scale.x
        this.mouseYMatter = mouseYViewport / 2 / this.viewport.scale.y




        // set test sprite position
        this.bunny.position.set(this.debugBody1.position.x * 2, this.debugBody1.position.y * 2)
        this.bunny.rotation += 0.1 * time.deltaTime;



        // loop thru each critter
        this.critters.forEach((critter: Critter) => {
            // lock body to sprite
            critter.graphics.position.set(critter.body.position.x * 2, critter.body.position.y * 2) // WHY is there a factor of 2 between matter coords and virtual coords?
            //critter.graphics.rotation = critter.body.angle


            // set target pos to mouse
            //critter.currentTarget = { x: this.mouseXMatter, y: this.mouseYMatter }

            let vecToTargetAttack = { x: critter.currentTargetAttack.x - critter.body.position.x, y: critter.currentTargetAttack.y - critter.body.position.y }
            let dirAttack = Matter.Vector.normalise(vecToTargetAttack)
            let vecToTargetMove = { x: critter.currentTarget.x - critter.body.position.x, y: critter.currentTarget.y - critter.body.position.y }
            let dirMove = Matter.Vector.normalise(vecToTargetMove)
            if (critter.shouldAttack) {

                // unused ^

                shootProjectile(critter, time, this.projectiles, this.projectileFactory)
            }

            if (critter.shouldMove) {
                // move critter to its target pos

                Matter.Body.setVelocity(critter.body, Matter.Vector.mult(dirMove, critter.movementSpeed))
                //Matter.Body.setVelocity(critter.body, {x:.1, y:.1})

                // rotate sprite to target pos to move
                critter.graphics.rotation = Matter.Vector.angle({ x: 0, y: 0 }, dirMove) + Math.PI / 2

                // have critters stop in front of their effective range
                // TODO  only have it stop if the current target is an enemy. if current target is just a position then no
                if (Matter.Vector.magnitude(vecToTargetMove) <= 1) {
                    //threashold to prevent micro-movement
                    critter.shouldMove = false
                    critter.shouldAttack = false

                }
                else if (Matter.Vector.magnitude(vecToTargetAttack) <= critter.sightRange) {
                    //in sight range

                    //let mag = Matter.Vector.magnitude(vecToTarget)
                    //Matter.Body.setVelocity(critter.body, { x: 0, y: 0 })
                    critter.shouldMove = false
                    critter.shouldAttack = true
                    
                } else {
                    critter.shouldMove = true
                    critter.shouldAttack = false
                }
            } else {
                Matter.Body.setVelocity(critter.body, {x: 0, y: 0})
            }


            // Selection box
            this.selectionSquares.forEach(square => {
                square.g.position.set(square.c.body.bounds.min.x * 2, square.c.body.bounds.min.y * 2)

            })


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
mousePosMatter(${this.mouseXMatter}, ${this.mouseYMatter})
debugBody1(${this.debugBody1.position.x},${this.debugBody1.position.y})
markedCritter1Body(${this.critters.get(this.markedCritter1).body.position.x},${this.critters.get(this.markedCritter1).body.position.y})
markedCritter1Sprite(${this.critters.get(this.markedCritter1).graphics.position.x},${this.critters.get(this.markedCritter1).graphics.position.y})
projectileCount(${this.projectiles.size()})
`


    }

}