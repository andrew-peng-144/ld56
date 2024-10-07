// stationary enemy that attacks your critters (picks nearby one at random, or AOE)
// has a cue of a circle that expands,
// spawns friendly critter when defeated (of same/random type?)

import Matter, { Body } from "matter-js"
import { Graphics, Ticker } from "pixi.js"
import { EntityStore } from "../EntityStore"
import { Projectile, ProjectileFactory, ProjectileSettings } from "../ProjectileFactory"
import { Settings } from "../../Settings"
import { Critter } from "../CritterFactory"
import { Random } from "random-js"
import { bohrMagnetonDependencies } from "mathjs"
import { WaveHelper } from "../../screens/helper/WaveHelper"
import { Text } from "pixi.js"
import { Viewport } from "pixi-viewport"


function makeVirusHelper() {

}

interface VirusSettings {
    centerX: number,
    centerY: number,
    color: number,
    projectileSpeed: number,
    projectileLifetime: number
    intervalMs: number,
    hp?: number,
    scale?: number,
}

/**
 * 
 * @param centerX matter units
 * @param centerY 
 * @param engine 
 * @param critters 
 * @param projectiles 
 * @param projectileFactory 
 * @param rng 
 * @param waves 
 * @returns 
 */
export function makeVirus1(settings: VirusSettings,
    engine: Matter.Engine, viewport: Viewport, critters: EntityStore<Critter>, projectiles: EntityStore<Projectile>, projectileFactory: ProjectileFactory, rng: Random): ProjectileSettings {
    /**
    * diameter of circle, matter units
    */
    let virus_size = 64 * (settings.scale || 1)
    let vision_radius = virus_size * 3

    const virusBody = Matter.Bodies.circle(
        settings.centerX,
        settings.centerY,
        virus_size / 2
    )
    virusBody.isSensor = false
    //virusBody.frictionAir = 0
    virusBody.isStatic = true
    virusBody.label = `VIRUS`
    Matter.Body.setInertia(virusBody, Infinity)
    virusBody.collisionFilter.category = Settings.collisionCategories.PROJECTILE
    virusBody.collisionFilter.mask = Settings.collisionCategories.PROJECTILE | Settings.collisionCategories.CRITTER | Settings.collisionCategories.WALL

    let msCounterShoot = 0;
    let msCounterAnim = 0
    let currInteval = rng.integer(settings.intervalMs - settings.intervalMs * 0.3, settings.intervalMs + settings.intervalMs * 0.3)
    let virusVision = Matter.Bodies.circle(
        virusBody.position.x,
        virusBody.position.y,
        vision_radius
    )
    virusVision.isSensor = true
    virusVision.isStatic = true //lags after 100+ objects without this, for some reason.
    Matter.World.addBody(engine.world, virusVision);


    const hpCountText = new Text({ x: 0, y: 0, style: { fill: settings.color, fontSize: `${70 * (settings.scale || 1)}px` } })
    hpCountText.text = "0"
    hpCountText.anchor.set(0.5)
    hpCountText.position.set(virusBody.position.x * 2, virusBody.position.y * 2)
    hpCountText.visible = true
    //maybe only show damage number if it does not have full health?
    viewport.addChild(hpCountText)

    const targetingBeam = new Graphics()
    targetingBeam.rect(0, 0, 50, 50)
    targetingBeam.fill('gray')
    targetingBeam.visible = false
    viewport.addChild(targetingBeam)


    let critterToSpawn = null


    let g = new Graphics() //animated in customUpdate below
    //g.visible = false
    let g2 = new Graphics() //lag?
    //g.addChild(g2)

    // VIRUS ITSELF IS PROJECTILE (not the projectile it shoots)
    return {
        lifetime: Infinity,
        speed: 0,
        startingDirection: 0,
        team: Settings.teams.ENEMY,
        x: settings.centerX,
        y: settings.centerY,
        customUpdate: customUpdate,
        body: virusBody,
        graphics: g,
        isVirus: true,

        onDelete: () => {
            Matter.World.remove(engine.world, virusVision)
            // remove auxillary graphics of the entity
            viewport.removeChild(hpCountText)
            hpCountText.destroy()
            viewport.removeChild(targetingBeam)
            targetingBeam.destroy()
        },
        totalHealth: settings.hp

    }

    function customUpdate(time: Ticker, proj: Projectile) {

        msCounterShoot += time.deltaMS
        msCounterAnim += time.deltaMS

        //shoot player critters sporadically
        if (msCounterShoot >= currInteval) {
            msCounterShoot -= currInteval
            //debugger
            currInteval = 2000 + rng.realZeroToOneExclusive() * 10000


            Matter.Body.setPosition(virusVision, virusBody.position)
            let boundsToCheck = Matter.Bounds.create(virusVision.vertices)
            let query = Matter.Query.region(engine.world.bodies, boundsToCheck)

            // if in (square AABB, should be circle)
            // choose random player critter
            let playerBodies = query.filter(body => {
                if (critters.has(body.label)) {
                    return critters.get(body.label).team === Settings.teams.PLAYER
                }
            })
            if (playerBodies.length > 0) {
                // ****************
                // VIRUS SHOOT PROJECTILE
                let chosenBody = rng.pick(playerBodies)
                //shoot at chosen critter
                let chosenCritter = critters.get(chosenBody.label)
                let vecToChosen = { x: chosenCritter.body.position.x - virusBody.position.x, y: chosenCritter.body.position.y - virusBody.position.y }
                let dir = Matter.Vector.normalise(vecToChosen)

                // virus projectile body
                const newProjRadius = 30 * (settings.scale || 1)
                const newProjBody = Matter.Bodies.circle(
                    settings.centerX,
                    settings.centerY,
                    newProjRadius
                )
                newProjBody.isSensor = true
                newProjBody.label = `VIRUS`
                newProjBody.collisionFilter.category = Settings.collisionCategories.PROJECTILE
                newProjBody.collisionFilter.mask = Settings.collisionCategories.PROJECTILE | Settings.collisionCategories.CRITTER | Settings.collisionCategories.WALL
                // virus projectile graphics
                const newProjGraphics = new Graphics()
                newProjGraphics.circle(0, 0, newProjRadius * 2)
                newProjGraphics.fill(settings.color)
                newProjGraphics.stroke({ width: newProjRadius / 32, color: 0xEEEEEE })

                let projCounterMs = 0
                let newProj = projectileFactory.create({
                    x: virusBody.position.x,
                    y: virusBody.position.y,
                    startingDirection: Matter.Vector.angle(vecToChosen, { x: 0, y: 0 }) - Math.PI / 2,
                    lifetime: settings.projectileLifetime,
                    speed: settings.projectileSpeed,
                    team: Settings.teams.ENEMY,
                    body: newProjBody,
                    graphics: newProjGraphics,
                    // customUpdate: (time, proj) => {
                    //     projCounterMs += time.deltaMS
                    //     projCustomUpdate(projCounterMs, newProjGraphics, newProjRadius)
                    // }
                })

                let entityID = projectiles.add(newProj)
                newProj.entityID = entityID
                newProj.body.label = entityID
            } else {
                //console.log('VIRUS ALERT: no player found');
            }

        }



        // graphics animate
        g.clear()
        g.rotation = 1.2 * msCounterAnim / 1000
        g.roundRect(-virus_size, -virus_size, virus_size * 2, virus_size * 2, 50 * (settings.scale || 1))
        g.stroke({ width: (Math.sin(2 * msCounterAnim / 1000) * 10 + 15) * (settings.scale || 1), color: settings.color })

        g.rotation = -0.5 * msCounterAnim / 1000
        g.circle(0, 20, 20)
        g.stroke({ width: 7 * (settings.scale || 1), color: settings.color })

        hpCountText.text = proj.health

    }

    function projCustomUpdate(projCounterMs: number, newProjGraphics: Graphics, newProjRadius: number) {
        // graphics animate
        newProjGraphics.rotation = 12 * projCounterMs / 1000
        newProjGraphics.ellipse(0, 0, newProjRadius * 2, newProjRadius + Math.sin(projCounterMs / 1000) * newProjRadius / 4)
        newProjGraphics.fill(settings.color)
    }

}


function makeVirusProjectile1(centerX: number, centerY: number,
    engine: Matter.Engine, critters: EntityStore<Critter>, projectiles: EntityStore<Projectile>, projectileFactory: ProjectileFactory, rng: Random, waves: WaveHelper): ProjectileSettings {

}