importScripts('./libs/seedrandom.js')
importScripts('./libs/domparser_bundle.js')
var DOMParser = xmldom.DOMParser
importScripts('./three/build/three.js')
importScripts('./libs/CSGMesh.js')
importScripts('./three/examples/js/loaders/SVGLoader.js')

var loader = new THREE.SVGLoader()

var construction, quality, base

async function createModel() {
    //Build the first set of meshes
    var firstGroups = []
    for (var i in construction.first) {
        //Get the number of profiles to make
        var profiles = construction.first[i].profiles
        //Make each profile and add it to the array
        for (var j = 1; j <= profiles; j++) {
            let obj = await createExtrusion(construction.first[i].letter + profiles + "-" + j,
                construction.lastWidth, construction.first[i].pos, false, quality)
            firstGroups.push(obj)
        }
    }

    //Build the second set of meshes
    var lastGroups = []
    for (var i in construction.last) {
        //Get the number of profiles to make
        var profiles = construction.last[i].profiles
        //Make each profile and add it to the array
        for (var j = 1; j <= profiles; j++) {
            let obj = await createExtrusion(construction.last[i].letter + profiles + "-" + j,
                construction.firstWidth, construction.last[i].pos, true, quality)
            lastGroups.push(obj)
        }
    }

    //Material for final shapes
    let material = new THREE.MeshStandardMaterial({
        color: 0x2150CE,
        side: THREE.FrontSide,
        roughness: 0.9,
        emissive: 0x0f0f0f
    })

    //Seed so that you can get the same result each time
    Math.seedrandom(construction.first + construction.last)

    //Perform intersects
    while(firstGroups.length > 0) {
        //Get the source and the mask
        let src = firstGroups.shift()
        let mask = lastGroups.splice(Math.floor(Math.random() * lastGroups.length), 1)[0]
        //Save where they are
        src.updateMatrixWorld()
        mask.updateMatrixWorld()
        
        //Convert to BSP
        let a = CSG.fromMesh(src)
        let b = CSG.fromMesh(mask)
        
        //Perform operation and convert to meshes
        let result = a.intersect(b)
        let toAdd = CSG.toMesh(result, mask.matrix, material)

        //Change out meshes
        postMessage({type: "Del", name: src.name})
        postMessage({type: "Del", name: mask.name})
        postMessage({type: "Add", geometry: toAdd.toJSON()})
    }

    material = new THREE.MeshStandardMaterial({
        color: 0x11207E,
        side: THREE.FrontSide,
        roughness: 0.9,
        emissive: 0x0f0f0f
    })

    if (base) {
        const baseGeometry = new THREE.BoxGeometry(construction.firstWidth + 12, 7, construction.lastWidth + 12)
        const base = new THREE.Mesh(baseGeometry, material)
        postMessage({type: "Add", geometry: base.toJSON()})
        base.translateY(-3.5)
    }

    postMessage({type: "Done"})
}

async function createExtrusion(name, depth, pos, doSide, highQuality=false) {
    return new Promise((res, rej) => {
        name = "./letters/" + name + ".svg"
        loader.load(name, async (data) => {
            //Get data in and out prepared
            const paths = data.paths
            //Extrusion settings
            const extrudeSettings = {
                curveSegments: highQuality ? 30 : 7,
                bevelEnabled: false,
                steps: 2,
                depth: depth
            }

            //Get this path and make it shapes
            const path = paths[0]
            const shapes = path.toShapes((name == "R1-1" ? false : true));

            //Material settings
            const material = new THREE.MeshPhongMaterial({
                color: (doSide ? 0x500000 : 0x005000),
                side: THREE.FrontSide,
                //wireframe: true,
                transparent: true,
                opacity: .7,
                emissive: 0x0f0f0f
            })

            //Make each shape a mesh
            const shape = shapes[0]
            const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
            geometry.computeBoundingBox()
            const mesh = new THREE.Mesh(geometry, material)
            mesh.name = name + pos

            if (doSide) {
                mesh.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), Math.PI / 2)
                mesh.translateX(pos - (construction.lastWidth ? construction.lastWidth : 0) / 2)
                mesh.translateZ(-depth / 2)
                postMessage({type: "Add", geometry: mesh.toJSON(), after: {
                    r: Math.PI / 2,
                    x: pos - (construction.lastWidth ? construction.lastWidth : 0) / 2,
                    y: 0,
                    z: -depth / 2
                }})
            } else {
                mesh.translateX(pos - (construction.firstWidth ? construction.firstWidth : 0) / 2)
                mesh.translateZ(-depth / 2)
                postMessage({type: "Add", geometry: mesh.toJSON(), after: {
                    x: pos - (construction.firstWidth ? construction.firstWidth : 0) / 2,
                    y: 0,
                    z: -depth / 2
                }})
            }
            
            res(mesh)
        })
    })
}

onmessage = function(m) {
    construction = m.data[0]
    base = m.data[1]
    quality = m.data[2]
    createModel()
}