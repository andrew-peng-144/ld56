import { Critter } from "../../entities/CritterFactory";
import { EntityStore } from "../../entities/EntityStore";
import { Projectile } from "../../entities/ProjectileFactory";
import { Settings } from "../../Settings";

export function testScreenCollisionHandler (event: Matter.IEventCollision<Matter.Engine>, critters: EntityStore<Critter>, projectiles: EntityStore<Projectile>) {
    event.pairs.forEach(pair => {

        // damage critter
        let categoryA = pair.bodyA.collisionFilter.category || 0
        let categoryB = pair.bodyB.collisionFilter.category || 0

        switch (categoryA | categoryB) {
            case Settings.collisionCategories.CRITTER | Settings.collisionCategories.PROJECTILE:
                //both need to be labelled with the nanoid
                let critterEntity: Critter | null = null;
                let projEntity: Projectile | null = null;
                if (critters.has(pair.bodyA.label)) {
                    critterEntity = critters.get(pair.bodyA.label)
                } else if (projectiles.has(pair.bodyA.label)) {
                    projEntity = projectiles.get(pair.bodyA.label)
                }
                if (critters.has(pair.bodyB.label)) {
                    critterEntity = critters.get(pair.bodyB.label)
                } else if (projectiles.has(pair.bodyB.label)) {
                    projEntity = projectiles.get(pair.bodyB.label)
                }

                if (critterEntity && projEntity) {
                    if (critterEntity.team !== projEntity.team) {
                        //console.log(`${pair.bodyA.label} collided with ${pair.bodyB.label} DIFF TEAMS`);

                        if (projEntity.team === Settings.teams.ENEMY && critterEntity.team === Settings.teams.PLAYER
                            && !projEntity.isVirus //virus itself cant kill player, only its projectiles
                        ) {
                            //kill player critter
                            critterEntity.toDestroy = true

                        } 
                    }
                }
                break
            case Settings.collisionCategories.PROJECTILE | Settings.collisionCategories.PROJECTILE:
                let projA = projectiles.has(pair.bodyA.label) ? projectiles.get(pair.bodyA.label) : null
                let projB = projectiles.has(pair.bodyB.label) ? projectiles.get(pair.bodyB.label) : null
                if (projA && projB) {
                    if (projA.team !== projB.team) {
                        //console.log(`PROJ-PROJ ${pair.bodyA.label} collided with ${pair.bodyB.label} DIFF TEAMS`);
                        let playerProj = projA.team === Settings.teams.PLAYER ? projA : projB
                        let enemyProj = projA === playerProj ? projB : projA

                        if (enemyProj.team === Settings.teams.ENEMY
                            && enemyProj.isVirus // attacking virus itself not its projectile (though virus itself is a projectile)
                        ) {
                            // damage virus
                            enemyProj.health -= playerProj.damage
                            console.log("DAMAGED "+enemyProj.entityID);
                            if (enemyProj.health < 0) {
                                enemyProj.toDestroy = true
                            }

                            // remove player proj
                            playerProj.toDestroy = true

                        } 
                    }
                }

                break
        }
    })
}