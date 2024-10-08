import { Viewport } from "pixi-viewport";
import { IScreen } from "./IScreen";
import { Sprite, Assets, Application, Ticker, Text, FederatedPointerEvent, Graphics } from "pixi.js";
import { EntityStore } from "../entities/EntityStore";
import { Random } from "random-js";
import { Settings } from "../Settings";
import { Critter, CritterFactory } from "../entities/CritterFactory";
import { Projectile, ProjectileFactory } from "../entities/ProjectileFactory";
import { round } from "mathjs";
import { makeSelectionSquare } from "../entities/entity-building/makeSelectionSquare";
import { shootProjectile } from "../entities/entity-building/shootProjectile";
import { testScreenCollisionHandler } from "./helper/TestScreenCollision";
import { makePointer } from "../entities/entity-building/makePointer";
import { makeBoundsCircle } from "../entities/entity-building/makeBounds";
import { makeLevelLayout } from "../entities/entity-building/spawnInitialEntities.ts.ts";
import { spawnCritters, spawnViruses } from "../entities/entity-building/spawnEntities";
import Matter from "matter-js";
import { makeTestCritters } from "../entities/entity-building/makeTestCritters1.ts";

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
    gameOverText: Text
    waveNotificationText: Text
    victoryText: Text
    numCrittersText: Text
    timerText: Text

    mouseEventX: number = 0
    mouseEventY: number = 0


    //debugBody1: Matter.Body

    markedCritter1: string = "error"
    mouseXMatter: number = 0;
    mouseYMatter: number = 0;
    mouseXVirtual: number = 0;
    mouseYVirtual: number = 0
    mouseXViewport: number = 0
    mouseYViewport: number = 0

    virusCount: number = 0


    selectionSquares: Set<{ c: Critter, g: Graphics }>
    selectionCircle: Matter.Body

    //playerClickedOnAttackable: Matter.Body | null = null

    //waveHelper: WaveHelper

    pointerGraphic: Graphics
    readonly pointerGraphicLifeTimeMs: number = 800
    pointerGraphicMsCounter: number = 0


    numVirusesDefeated: number = 0
    numCrittersMax: number = 0
    numCrittersLost: number = 0
    score: number = 0

    /**
     * total elapsed ms since game began
     */
    gameTime: number = 0

    /**
     * track interval of spawner
     */
    spawnerMs: number = 0
    /**
     * number of times its spawned something
     */
    numSpawns: number = 0



    constructor(app: Application, viewport: Viewport, engine: Matter.Engine) {


        this.engine = engine
        this.app = app
        this.viewport = viewport
        this.rng = new Random()
        this.critters = new EntityStore('Critters')
        this.projectiles = new EntityStore('Projectiles')
        this.critterFactory = new CritterFactory(engine, viewport)
        this.projectileFactory = new ProjectileFactory(engine, viewport)




        // add a red box
        // const sprite = viewport.addChild(new Sprite(Texture.WHITE))
        // sprite.tint = 0xff0000
        // sprite.width = sprite.height = 50
        // sprite.position.set(0, 0)

        // draw test sprite
        //this.bunny = bunny
        // const texture = Assets.get('TEST444')
        // const bunny = Sprite.from(texture);
        // bunny.anchor.set(0.5);
        // bunny.x = 333// app.screen.width / 2;
        // bunny.y = app.screen.height / 2;

        //viewport.addChild(bunny);

        // test body
        // this.debugBody1 = Matter.Bodies.rectangle(
        //     150, 250, 50, 50
        // )
        //Matter.World.addBody(engine.world, this.debugBody1)



        //this.waveHelper = new WaveHelper(this.projectiles, this.projectileFactory, engine, this.critters, this.rng)




        // Add selected critters' position and graphic
        this.selectionSquares = new Set()
        this.selectionCircle = Matter.Bodies.circle(0, 0, Settings.selectionCircleRadius)
        this.selectionCircle.isSensor = true
        Matter.World.addBody(this.engine.world, this.selectionCircle);

        // Add click pointer graphic
        this.pointerGraphic = makePointer()
        this.pointerGraphic.visible = false
        viewport.addChild(this.pointerGraphic)


        // Add texts
        this.debugText = new Text({ x: 10, y: 450, style: { fill: 'black', fontSize: '23px' } })
        //this.debugText.width /= 2
        //this.debugText.height /= 2
        app.stage.addChild(this.debugText)
        this.debugText.visible = Settings.debug_render
        this.pausedText = new Text({ x: 350, y: 100, style: { fill: 'black', fontSize: '63px' } })
        this.pausedText.visible = false
        app.stage.addChild(this.pausedText)

        this.gameOverText = new Text({ x: 350, y: 100, style: { fill: 'black', fontSize: '63px' } })
        this.gameOverText.visible = false
        app.stage.addChild(this.gameOverText)

        this.victoryText = new Text({ x: 350, y: 100, style: { fill: 'black', fontSize: '63px' } })
        this.victoryText.visible = false
        app.stage.addChild(this.victoryText)

        this.waveNotificationText = new Text({ x: 350, y: 100, style: { fill: 'black', fontSize: '63px' } })
        this.waveNotificationText.visible = false
        app.stage.addChild(this.waveNotificationText)

        this.numCrittersText = new Text({ x: Settings.V_WIDTH * 0.9, y: 100, style: { fill: 'black', fontSize: `${Settings.V_WIDTH / 32}px` } })
        app.stage.addChild(this.numCrittersText)
        this.timerText = new Text({ x: Settings.V_WIDTH * 0.1, y: 100, style: { fill: 'black', fontSize: `${Settings.V_WIDTH / 32}px` } })
        app.stage.addChild(this.timerText)


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
        // forward double click event to pixi
        this.app.canvas.addEventListener('dblclick', (ev) => {
            this.pointerDown({ button: 0, shiftKey: true })
        })



        // register collison event
        Matter.Events.on(engine, 'collisionStart', (event) => {
            testScreenCollisionHandler(event, this.critters, this.projectiles)
        })

        ///////// ******
        // create the level

        // add bounds
        makeBoundsCircle(app, engine, viewport)

        // add test critters
        //this.markedCritter1 = makeTestCritters(this.critterFactory, this.rng, this.critters)
        // spawn starting critter
        makeLevelLayout(this.engine, this.viewport, this.critters, this.critterFactory, this.projectiles, this.projectileFactory, this.rng)
        this.virusCount = 6
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
        // pause text
        this.pausedText.text = `PAUSED (Esc)
Left click - Select unit
Right click - Attack/Move Selected Units
Double click - Select group
Shift click - Select group
Middle/Right click - Pan
Scroll - Zoom
            Time: ${Math.floor(this.gameTime / 1000)}
            Critters lost: ${this.numCrittersLost}
            Critters remaining: ${this.critters.size()}
            Viruses defeated: ${this.numVirusesDefeated}
            KING: ${this.critters.search(critter => critter.name === Settings.CritterNames.YELLOW).length > 0 ? "ALIVE!" : "DEAD..."}
                        `
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
                // LEFT click
                // reset selection
                this.selectionSquares.forEach(square => {
                    this.viewport.removeChild(square.g)
                    square.g.destroy()
                })
                this.selectionSquares.clear()


                // query for selected bodies
                let resultsPoint = Matter.Query.point(this.engine.world.bodies, { x: this.mouseXMatter, y: this.mouseYMatter })
                if (event.shiftKey) {
                    // shift click - select all around of same type as clicked

                    Matter.Body.setPosition(this.selectionCircle, { x: this.mouseXMatter, y: this.mouseYMatter })
                    let resultsCircle = Matter.Query.region(this.engine.world.bodies, this.selectionCircle.bounds)


                    // let clickedCircle: Matter.Body
                    // if (resultsPoint.length >= 1) {
                    //     clickedCircle = resultsPoint[0]
                    //     //this.playerClickedOnAttackable = clickedCircle
                    // }

                    resultsCircle.forEach(body => {
                        if (body && body.collisionFilter.category === Settings.collisionCategories.CRITTER
                        ) {
                            //console.log("CLICKED CRITTER " + body.label);
                            if (this.critters.has(body.label)) {
                                let clickedCircle = resultsPoint.find(body => this.critters.has(body.label))// clicked circle needs to be a critter
                                if (clickedCircle && this.critters.has(clickedCircle.label)) {
                                    let critter = this.critters.get(body.label)

                                    if (critter.name === this.critters.get(clickedCircle.label).name
                                        && critter.team === Settings.teams.PLAYER) {
                                        console.log("NAME MATCHED");

                                        let squareGraphics = makeSelectionSquare(critter)
                                        this.viewport.addChild(squareGraphics)
                                        this.selectionSquares.add({ c: critter, g: squareGraphics })
                                    }
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
                // RIGHT click
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
                                    let clickedCircle = resultsPoint[0]
                                    square.c.currentTargetAttack = { x: this.mouseXMatter, y: this.mouseYMatter }
                                    console.log('now targeting VIRUS! ' + clickedBody.label);
                                }
                            })
                            if (!found) {
                                square.c.currentTargetAttack = { x: Infinity, y: Infinity }
                            }

                        } else {
                            square.c.currentTargetAttack = { x: Infinity, y: Infinity }
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


        // GLOBAL SPAWNER *******************

        // spawn new critters/viruses on interval
        this.spawnerMs += time.deltaMS
        if (this.spawnerMs >= Settings.SPAWN_DELAY) {
            this.spawnerMs -= Settings.SPAWN_DELAY
            this.numSpawns++
            let virusStrength = 0
            let virusSpawnRadiusMultMin = 0
            let virusSpawnRadiusMultMax = 1
            let critterCount = 0
            let critterSpawnRadiusMultMin = 0
            let critterSpawnRadiusMultMax = 1

            if (this.numSpawns <= 3) {
                virusStrength = 1
                virusSpawnRadiusMultMin = 0.07
                virusSpawnRadiusMultMax = 0.3
                critterCount = 3
                critterSpawnRadiusMultMin = 0.05
                critterSpawnRadiusMultMax = 0.15
            } else if (this.numSpawns <= 6) {
                virusStrength = 2
                virusSpawnRadiusMultMin = 0.1
                virusSpawnRadiusMultMax = 0.45
                critterCount = 5
                critterSpawnRadiusMultMin = 0.1
                critterSpawnRadiusMultMax = 0.3
            }
            else if (this.numSpawns <= 9) {
                virusStrength = 3
                virusSpawnRadiusMultMin = 0.1
                virusSpawnRadiusMultMax = 0.6
                critterCount = 10
                critterSpawnRadiusMultMin = 0.1
                critterSpawnRadiusMultMax = 0.6
            }
            else if (this.numSpawns <= 12) {
                virusStrength = 4
                virusSpawnRadiusMultMin = 0.1
                virusSpawnRadiusMultMax = 0.8
                critterCount = 14
                critterSpawnRadiusMultMin = 0.1
                critterSpawnRadiusMultMax = 0.8
            }
            else {
                virusStrength = 5
                virusSpawnRadiusMultMin = 0.1
                virusSpawnRadiusMultMax = 0.8
                critterCount = 20
                critterSpawnRadiusMultMin = 0.1
                critterSpawnRadiusMultMax = 0.8
            }
            if (this.virusCount < Settings.VIRUS_LIMIT && this.virusCount > 0) {
                spawnViruses(virusStrength,
                    virusSpawnRadiusMultMin,
                    virusSpawnRadiusMultMax,
                    this.engine, this.viewport, this.critters, this.projectiles, this.projectileFactory, this.rng
                )
            } else {
                console.log('virus limit reached');
            }
            if (this.critters.size() < Settings.CRITTER_LIMIT && this.critters.size() > 0) {
                spawnCritters(critterCount,
                    critterSpawnRadiusMultMin,
                    critterSpawnRadiusMultMax,
                    this.rng.pick([Settings.CritterNames.GREEN, Settings.CritterNames.RED]),
                    this.engine, this.viewport, this.critters, this.critterFactory, this.projectiles, this.projectileFactory, this.rng
                )
            } else {
                console.log('critter limit reached');
            }

        }
        // check if wave complete
        //this.waveHelper.update(time)

        //////////
        // Update TEXTS
        // game over
        if (this.critters.size() === 0) {
            // actually, just replace the pause text and force a pause.
            this.gameOverText.text = `GAME OVER!
            Time: ${Math.floor(this.gameTime / 1000)}
            Critters lost: ${this.numCrittersLost}
            Critters remaining: ${this.critters.size()}
            Viruses defeated: ${this.numVirusesDefeated}
            `
            this.gameOverText.visible = true
            this.gameTime -= time.deltaMS
        }
        // victory
        if (this.virusCount <= 0) {
            this.victoryText.text = `VICTORY!
            Time: ${Math.floor(this.gameTime / 1000)}
            Critters lost: ${this.numCrittersLost}
            Critters remaining: ${this.critters.size()}
            Viruses defeated: ${this.numVirusesDefeated}
            KING: ${this.critters.search(critter => critter.name === Settings.CritterNames.YELLOW).length > 0 ? "ALIVE!" : "DEAD..."}
            `
            this.victoryText.visible = true
            this.gameTime -= time.deltaMS

        }
        // num critters
        this.numCrittersText.text = `${this.critters.size()}`
        // timer
        this.timerText.text = `${this.gameTime}`



        // step physics engine
        Matter.Engine.update(this.engine, time.deltaMS)


        // pan/scale debug renderer
        const screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        //const scale = Math.min(screenWidth / Settings.V_WIDTH, screenHeight / Settings.V_HEIGHT);
        const scale = 1
        if (Settings.debug_render) {
            this.engine.render.bounds.min.x = -this.viewport.x / 2 / this.viewport.scale.x
            this.engine.render.bounds.max.x = -this.viewport.x / 2 / this.viewport.scale.x + Settings.V_WIDTH / 2 / this.viewport.scale.x
            this.engine.render.bounds.min.y = -this.viewport.y / 2 / this.viewport.scale.y
            this.engine.render.bounds.max.y = -this.viewport.y / 2 / this.viewport.scale.y + Settings.V_HEIGHT / 2 / this.viewport.scale.y
        }

        this.mouseXVirtual = (this.mouseEventX - this.app.canvas.getBoundingClientRect().left) / scale
        this.mouseYVirtual = (this.mouseEventY - this.app.canvas.getBoundingClientRect().top) / scale

        this.mouseXViewport = this.mouseXVirtual - this.viewport.x //rel. to viewport - no zoom factored in
        this.mouseYViewport = this.mouseYVirtual - this.viewport.y

        this.mouseXMatter = this.mouseXViewport / 2 / this.viewport.scale.x
        this.mouseYMatter = this.mouseYViewport / 2 / this.viewport.scale.y




        // set test sprite position
        // this.bunny.position.set(this.debugBody1.position.x * 2, this.debugBody1.position.y * 2)
        // this.bunny.rotation += 0.1 * time.deltaTime;



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
                this.numCrittersLost++
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
        this.virusCount = 0
        let destroyedSomething = false
        this.projectiles.forEach((projectile: Projectile, id: string) => {
            if (projectile.isVirus) {
                this.virusCount++
            }
            if (projectile.customUpdate) {
                projectile.customUpdate(time, projectile)
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
                if (projectile.isVirus) {
                    this.numVirusesDefeated++
                }
                this.projectileFactory.destroy(projectile)
                this.projectiles.remove(id)
                destroyedSomething = true
            }
        })
        // if (this.virusCount === 0 && destroyedSomething) {
        //     this.waveHelper.nextWave()
        // }



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

scale(${this.viewport.scale.x}, ${this.viewport.scale.y})
mousePosition(${this.mouseEventX}, ${this.mouseEventY})
mousePosVirtual(${this.mouseXVirtual}, ${this.mouseYVirtual})
mousePosViewport(${this.mouseXViewport}, ${this.mouseYViewport})
mousePosMatter(${this.mouseXMatter}, ${this.mouseYMatter})
selectionSquareCount(${this.selectionSquares.size})
projectileCount(${this.projectiles.size()})
crittersCount(${this.critters.size()})
virusCount(${this.virusCount})
gameTime(${this.gameTime})
`
        // debugrendererX(${this.engine.render.bounds.min.x}, ${this.engine.render.bounds.max.x})
        // markedCritter1Body(${this.critters.get(this.markedCritter1).body.position.x},${this.critters.get(this.markedCritter1).body.position.y})
        // markedCritter1Sprite(${this.critters.get(this.markedCritter1).graphics.position.x},${this.critters.get(this.markedCritter1).graphics.position.y})
        // wave(${this.waveHelper.getWaveNumber()})
        // debugBody1(${this.debugBody1.position.x},${this.debugBody1.position.y})


        this.gameTime += time.deltaMS
    }

}