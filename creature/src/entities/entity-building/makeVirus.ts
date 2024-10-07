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



function makeVirusHelper() {

}

interface VirusSettings {
    centerX: number,
    centerY: number,
    color: number,
    projectileSpeed: number,
    intervalMs: number,
    hp?: number,
    scale?: number
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
    engine: Matter.Engine, critters: EntityStore<Critter>, projectiles: EntityStore<Projectile>, projectileFactory: ProjectileFactory, rng: Random, waves: WaveHelper): ProjectileSettings {
    /**
    * diameter of circle, matter units
    */
    let virus_size = 64 * (settings.scale || 1)
    let vision_radius = 600
    const projectile_lifetime = 8

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
    Matter.World.addBody(engine.world, virusVision);


    let critterToSpawn = null


    let g = new Graphics() //animated in customUpdate below
    let g2 = new Graphics() //lag?
    //g.addChild(g2)

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
        },
        totalHealth: settings.hp

    }

    function customUpdate(time: Ticker) {

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
                newProjGraphics.ellipse(0, 0, newProjRadius * 2, newProjRadius)
                newProjGraphics.fill(settings.color)

                let newProj = projectileFactory.create({
                    x: virusBody.position.x,
                    y: virusBody.position.y,
                    startingDirection: Matter.Vector.angle(vecToChosen, { x: 0, y: 0 }) - Math.PI / 2,
                    lifetime: projectile_lifetime,
                    speed: settings.projectileSpeed,
                    team: Settings.teams.ENEMY,
                    body: newProjBody,
                    graphics: newProjGraphics
                })

                let entityID = projectiles.add(newProj)
                newProj.entityID = entityID
                newProj.body.label = entityID
            } else {
                console.log('VIRUS ALERT: no player found');
            }

        }



        // graphics animate
        g.clear()
        g.rotation = 1.2 * msCounterAnim / 1000
        g.roundRect(-virus_size, -virus_size, virus_size * 2, virus_size * 2, 50)
        g.stroke({ width: Math.sin(2 * msCounterAnim / 1000) * 10 + 15, color: settings.color })

        g.rotation = -0.5 * msCounterAnim / 1000
        g.circle(0, 20, 20)
        g.stroke({ width: 7, color: settings.color })


    }

}


function makeVirusProjectile1(centerX: number, centerY: number,
    engine: Matter.Engine, critters: EntityStore<Critter>, projectiles: EntityStore<Projectile>, projectileFactory: ProjectileFactory, rng: Random, waves: WaveHelper): ProjectileSettings {

}