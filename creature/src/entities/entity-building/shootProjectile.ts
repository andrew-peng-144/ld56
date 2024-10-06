import { Ticker } from "pixi.js"
import { Critter } from "../CritterFactory"
import { Settings } from "../../Settings"
import { Projectile, ProjectileFactory } from "../ProjectileFactory"

export function shootProjectile(critter: Critter, time: Ticker, projectiles: EntityStore<Projectile>, projectileFactory: ProjectileFactory) {
    // only shoot if theres a target in range
    // shoot porjectiles
    critter.timeSpentSinceFiring += time.deltaMS / 1000
    if (critter.timeSpentSinceFiring > critter.fireDelay) {
        critter.timeSpentSinceFiring -= critter.fireDelay
        if (projectiles.size() < 450) {
            let newProj = projectileFactory.create({
                x: critter.body.position.x,
                y: critter.body.position.y,
                startingDirection: critter.graphics.angle * Math.PI / 180,
                critterOwner: critter,
                lifetime: critter.projectileLifetime,
                speed: critter.projectileSpeed,
                team: critter.team
            })
            newProj.body.collisionFilter.category = Settings.collisionCategories.PROJECTILE
            newProj.body.collisionFilter.mask = Settings.collisionCategories.CRITTER
            let entityID = projectiles.add(newProj)
            newProj.entityID = entityID
            newProj.body.label = entityID
        } else {
            //alert('projectile limit reached')
        }

    }
}