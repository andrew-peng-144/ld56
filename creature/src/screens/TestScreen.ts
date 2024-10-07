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
import { shootProjectile } from "../entities/entity-building/shootProjectile";
import { makeTestCritters } from "../entities/entity-building/makeTestCritters1";
import { testScreenCollisionHandler } from "./helper/TestScreenCollision";
import { WaveHelper } from "./helper/WaveHelper";
import { makePointer } from "../entities/entity-building/makePointer";
import { makeBoundsCircle } from "../entities/entity-building/makeBounds";

export class TestScreen implements IScreen {

    // should be moved to a SceneContainer

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
    mouseXVirtual: number = 0;
    mouseYVirtual: number = 0
    mouseXViewport: number = 0
    mouseYViewport: number = 0


    selectionSquares: Set<{ c: Critter, g: Graphics }>
    selectionCircle: Matter.Body

    //playerClickedOnAttackable: Matter.Body | null = null

    waveHelper: WaveHelper

    pointerGraphic: Graphics
    readonly pointerGraphicLifeTimeMs: number = 800
    pointerGraphicMsCounter: number = 0


    constructor(app: Application, viewport: Viewport, engine: Matter.Engine) {


        // add bounds
        makeBoundsCircle(app, engine, viewport)


        // add a red box
        // const sprite = viewport.addChild(new Sprite(Texture.WHITE))
        // sprite.tint = 0xff0000
        // sprite.width = sprite.height = 50
        // sprite.position.set(0, 0)

        // draw test sprite
        const texture = Assets.get('TEST444')
        const bunny = Sprite.from(texture);
        bunny.anchor.set(0.5);
        bunny.x = 333// app.screen.width / 2;
        bunny.y = app.screen.height / 2;
        //viewport.addChild(bunny);

        // test body
        this.debugBody1 = Matter.Bodies.rectangle(
            150, 250, 50, 50
        )
        Matter.World.addBody(engine.world, this.debugBody1)



        this.bunny = bunny
        this.engine = engine
        this.app = app
        this.viewport = viewport
        this.rng = new Random()
        this.critters = new EntityStore('Critters')
        this.projectiles = new EntityStore('Projectiles')
        this.critterFactory = new CritterFactory(engine, viewport)
        this.projectileFactory = new ProjectileFactory(engine, viewport)
        this.waveHelper = new WaveHelper(this.projectiles, this.projectileFactory, engine, this.critters, this.rng)

        // add test critters
        this.markedCritter1 = makeTestCritters(this.critterFactory, this.rng, this.critters)


        // Add selected critters position and graphic
        this.selectionSquares = new Set()
        this.selectionCircle = Matter.Bodies.circle(0, 0, Settings.selectionCircleRadius)
        this.selectionCircle.isSensor = true
        Matter.World.addBody(this.engine.world, this.selectionCircle);

        // Add click pointer graphic
        this.pointerGraphic = makePointer()
        this.pointerGraphic.visible = false
        viewport.addChild(this.pointerGraphic)


        // Add debug text
        this.debugText = new Text({ x: 10, y: 450, style: { fill: 'black', fontSize: '23px' } })
        //this.debugText.width /= 2
        //this.debugText.height /= 2
        app.stage.addChild(this.debugText)
        this.pausedText = new Text({ x: 350, y: 100, style: { fill: 'black', fontSize: '63px' } })
        this.pausedText.text = `PAUSED (Esc)
Left click - Select unit
Shift+Left click - Select group
Middle/Right click - Pan
Scroll - Zoom

        `
        this.pausedText.visible = false
        app.stage.addChild(this.pausedText)



        // add mouse events
        this.viewport.on('pointermove', (event) => { this.mouseEventX = event.x, this.mouseEventY = event.y })
        this.viewport.on('pointerdown', (event) => { this.pointerDown(event) })
        this.viewport.on('pointerup', (event) => {
            switch (event.button) {
                case 0:
                    break;
                case 1:
                    break;
                case 2:
                    break;
                default:
                    console.log(`Unknown button code up: ${event.button}`);
            }
        })



        // register collison event
        Matter.Events.on(engine, 'collisionStart', (event) => {
            testScreenCollisionHandler(event, this.critters, this.projectiles)
        })



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


    private pointerDown(event: FederatedPointerEvent) {
        switch (event.button) {
            case 0:

                // reset selection
                this.selectionSquares.forEach(square => {
                    this.viewport.removeChild(square.g)
                    square.g.destroy()
                })
                this.selectionSquares.clear()


                // query for selected bodies
                let resultsPoint = Matter.Query.point(this.engine.world.bodies, { x: this.mouseXMatter, y: this.mouseYMatter })
                let clickedCircle: Matter.Body
                if (resultsPoint.length >= 1) {
                    clickedCircle = resultsPoint[0]
                    //this.playerClickedOnAttackable = clickedCircle
                }
                if (event.shiftKey) {
                    // shift click - select all around of same type as clicked
                    Matter.Body.setPosition(this.selectionCircle, { x: this.mouseXMatter, y: this.mouseYMatter })
                    let resultsCircle = Matter.Query.region(this.engine.world.bodies, this.selectionCircle.bounds)

                    resultsCircle.forEach(body => {
                        if (body && body.collisionFilter.category === Settings.collisionCategories.CRITTER
                        ) {
                            //console.log("CLICKED CRITTER " + body.label);
                            if (this.critters.has(body.label) && this.critters.has(clickedCircle.label)) {
                                let critter = this.critters.get(body.label)

                                if (critter.name === this.critters.get(clickedCircle.label).name
                                    && critter.team === Settings.teams.PLAYER) {
                                    let squareGraphics = makeSelectionSquare(critter)
                                    this.viewport.addChild(squareGraphics)
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
                                if (critter.team === Settings.teams.PLAYER) {
                                    //this.selectedCritters.add(critter)

                                    let squareGraphics = makeSelectionSquare(critter)
                                    //squareGraphics.pivot.set(sgWidth / 2, sgHeight / 2)
                                    this.viewport.addChild(squareGraphics)
                                    this.selectionSquares.add({ c: critter, g: squareGraphics })
                                }

                            }
                        }
                    })
                }


                break;
            case 1:
                break;
            case 2:

                this.pointerGraphicMsCounter = 0
                if (this.selectionSquares.size > 0) {
                    this.pointerGraphic.visible = true
                    this.pointerGraphic.position.set(this.mouseXViewport / this.viewport.scale.x, this.mouseYViewport / this.viewport.scale.y)
                    this.selectionSquares.forEach(square => {
                        square.c.currentTarget = { x: this.mouseXMatter, y: this.mouseYMatter }
                        square.c.shouldMove = true

                        // check if clicked on virus (lol)
                        let resultsPoint = Matter.Query.point(this.engine.world.bodies, { x: this.mouseXMatter, y: this.mouseYMatter })

                        if (resultsPoint.length >= 1) {
                            let found = false;
                            resultsPoint.forEach(clickedBody => {
                                if (clickedBody.label
                                    && this.projectiles.has(clickedBody.label)
                                    && this.projectiles.get(clickedBody.label).isVirus) {
                                    found = true
                                    console.log("AAA");
                                    let clickedCircle = resultsPoint[0]
                                    square.c.currentTargetAttack = { x: this.mouseXMatter, y: this.mouseYMatter }
                                }
                            })
                            if (!found) {
                                square.c.currentTargetAttack = { x: -100, y: -100 }
                            }

                        } else {
                            square.c.currentTargetAttack = { x: -100, y: -100 }
                        }

                        // if (this.playerClickedOnAttackable !== null) {
                        //     square.c.shouldAttack = true
                        //     this.playerClickedOnAttackable = null
                        // }
                    })
                }

                break;
            default:
                console.log(`Unknown button code: ${event.button}`);
        }
    }


    onUpdate(time: Ticker): void {


        // check if wave complete
        //this.waveHelper.update(time)


        // step physics engine
        Matter.Engine.update(this.engine, time.deltaMS)


        // pan/scale debug renderer
        const screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        //const scale = Math.min(screenWidth / Settings.V_WIDTH, screenHeight / Settings.V_HEIGHT);
        const scale = 1
        this.engine.render.bounds.min.x = -this.viewport.x / 2 / this.viewport.scale.x
        this.engine.render.bounds.max.x = -this.viewport.x / 2 / this.viewport.scale.x + Settings.V_WIDTH / 2 / this.viewport.scale.x
        this.engine.render.bounds.min.y = -this.viewport.y / 2 / this.viewport.scale.y
        this.engine.render.bounds.max.y = -this.viewport.y / 2 / this.viewport.scale.y + Settings.V_HEIGHT / 2 / this.viewport.scale.y

        this.mouseXVirtual = (this.mouseEventX - this.app.canvas.getBoundingClientRect().left) / scale
        this.mouseYVirtual = (this.mouseEventY - this.app.canvas.getBoundingClientRect().top) / scale

        this.mouseXViewport = this.mouseXVirtual - this.viewport.x //rel. to viewport - no zoom factored in
        this.mouseYViewport = this.mouseYVirtual - this.viewport.y

        this.mouseXMatter = this.mouseXViewport / 2 / this.viewport.scale.x
        this.mouseYMatter = this.mouseYViewport / 2 / this.viewport.scale.y




        // set test sprite position
        this.bunny.position.set(this.debugBody1.position.x * 2, this.debugBody1.position.y * 2)
        this.bunny.rotation += 0.1 * time.deltaTime;



        // loop thru each critter
        this.critters.forEach((critter: Critter, id: string) => {
            // lock body to sprite
            critter.graphics.position.set(critter.body.position.x * 2, critter.body.position.y * 2) // WHY is there a factor of 2 between matter coords and virtual coords?
            //critter.graphics.rotation = critter.body.angle


            let vecToTargetAttack = { x: critter.currentTargetAttack.x - critter.body.position.x, y: critter.currentTargetAttack.y - critter.body.position.y }
            let dirAttack = Matter.Vector.normalise(vecToTargetAttack)
            let vecToTargetMove = { x: critter.currentTarget.x - critter.body.position.x, y: critter.currentTarget.y - critter.body.position.y }
            let dirMove = Matter.Vector.normalise(vecToTargetMove)
            if (critter.shouldAttack) {
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
                else if (critter.shouldMove && Matter.Vector.magnitude(vecToTargetAttack) <= critter.sightRange) {
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
                Matter.Body.setVelocity(critter.body, { x: 0, y: 0 })
            }


            // update selection box graphic
            this.selectionSquares.forEach(square => {
                square.g.position.set(square.c.body.bounds.min.x * 2, square.c.body.bounds.min.y * 2)
            })



            // destroy any that were marked
            if (critter.toDestroy) {
                this.critterFactory.destroy(critter)
                this.critters.remove(id)
                this.selectionSquares.forEach(square => {
                    if (square.c === critter) {
                        // so that destroyed critters that were selected have the square destroyed too
                        this.viewport.removeChild(square.g)
                        square.g.destroy()
                        this.selectionSquares.delete(square)
                    }
                })
            }

        })


        // loop thru each projectile
        this.projectiles.forEach((projectile: Projectile, id: string) => {
            if (projectile.customUpdate) {
                projectile.customUpdate(time)
            }
            if (projectile.sprite) {
                // TODO
            }
            else if (projectile.graphics) {
                projectile.graphics.position.set(projectile.body.position.x * 2, projectile.body.position.y * 2)
            }

            // projectile lifetime
            projectile.timeAlive += time.deltaMS / 1000
            if (projectile.timeAlive >= projectile.lifetime) {
                projectile.timeAlive -= projectile.lifetime
                projectile.toDestroy = true
            }

            // destroy any that were marked
            if (projectile.toDestroy) {
                if (projectile.onDelete) {
                    projectile.onDelete()
                }
                this.projectileFactory.destroy(projectile)
                this.projectiles.remove(id)
            }
        })



        // update pointer graphic lifetime // (need to make helper module for interval timing events like these)
        if (this.pointerGraphic.visible) {
            this.pointerGraphicMsCounter += time.deltaMS
            if (this.pointerGraphicMsCounter >= this.pointerGraphicLifeTimeMs) {
                this.pointerGraphicMsCounter -= this.pointerGraphicLifeTimeMs
                this.pointerGraphic.visible = false
            }
        } else {
            this.pointerGraphicMsCounter = 0
        }



        // update debug text
        this.debugText.text =
            `
pixiDelta(${round(time.deltaTime, 3)},${round(time.deltaMS, 3)})
viewport(${this.viewport.x}, ${this.viewport.y}) 
viewportboundsX(${this.viewport.getBounds().x}, ${this.viewport.getBounds().maxX})
debugrendererX(${this.engine.render.bounds.min.x}, ${this.engine.render.bounds.max.x})
scale(${this.viewport.scale.x}, ${this.viewport.scale.y})
mousePosition(${this.mouseEventX}, ${this.mouseEventY})
mousePosVirtual(${this.mouseXVirtual}, ${this.mouseYVirtual})
mousePosViewport(${this.mouseXViewport}, ${this.mouseYViewport})
mousePosMatter(${this.mouseXMatter}, ${this.mouseYMatter})
debugBody1(${this.debugBody1.position.x},${this.debugBody1.position.y})
selectionSquareCount(${this.selectionSquares.size})
projectileCount(${this.projectiles.size()})
crittersCount(${this.critters.size()})
wave(${this.waveHelper.getWaveNumber()})
`
        // markedCritter1Body(${this.critters.get(this.markedCritter1).body.position.x},${this.critters.get(this.markedCritter1).body.position.y})
        // markedCritter1Sprite(${this.critters.get(this.markedCritter1).graphics.position.x},${this.critters.get(this.markedCritter1).graphics.position.y})

    }

}