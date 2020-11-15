import * as THREE from './three/build/three.module.js'
import CSG from './CSGMesh.js'
import { SVGLoader } from './three/examples/jsm/loaders/SVGLoader.js'
import { STLExporter } from './three/examples/jsm/exporters/STLExporter.js'
import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js'
import { letterData } from "./letterData.js"

var camera, controls, scene, renderer, loader

var construction = {}

//Loads on page ready
async function main() {
    //Set up renderer
    const canvas = document.querySelector('#c')
    const style = getComputedStyle(document.querySelector('body'))
    canvas.width = parseInt(style.getPropertyValue('width'))
    canvas.height = parseInt(style.getPropertyValue('height'))
    renderer = new THREE.WebGLRenderer({canvas})
    renderer.setClearColor(0x121212)

    //Set up camera
    var size = new THREE.Vector2()
    renderer.getSize(size)
    const aspectRatio = size.y / size.x
    const width = 300
    camera = new THREE.OrthographicCamera(width / -2 + 40, width / 2 + 40, width / 2 * aspectRatio, width / -2 * aspectRatio, 0.01, 10000);
    camera.position.x = 40
    camera.position.y = 40
    camera.position.z = 40

    //Initiate orbit controls
    controls = new OrbitControls(camera, renderer.domElement)

    controls.addEventListener('change', render)

    //Create scene
    scene = new THREE.Scene()
    //Add lighting
    const ambient = new THREE.AmbientLight(0x101010)
    scene.add(ambient)
    for (var i = 0; i < 10; i++) {
        var light1 = new THREE.PointLight(0xffffff, .08, 0, 2)
        light1.position.set(-300 + 100 * i, 300, 500)
        scene.add(light1)
        const light2 = new THREE.PointLight(0xffcccc, .12, 0, 2)
        light2.position.set(2000, 400, -300 - 100 * i)
        scene.add(light2)
    }

    //Show axes (For now)
    const axesHelper = new THREE.AxesHelper(4)
    scene.add(axesHelper)

    render()

    //Initialize loader
    loader = new SVGLoader()

    //await createExtrusion("L1-1", 5, 0, false)
    //render()

    //Initial generation
    doGenerate()

    //Done
}

function setCameraIso() {
    //Get aspect ratio
    var size = new THREE.Vector2()
    renderer.getSize(size)
    const aspectRatio = size.y / size.x
    //Set position
    camera.position.x = Math.max(construction.firstWidth, construction.lastWidth) * 1.5
    camera.position.y = Math.max(construction.firstWidth, construction.lastWidth) * 1.5
    camera.position.z = Math.max(construction.firstWidth, construction.lastWidth) * 1.5
    camera.left = Math.hypot(construction.firstWidth, construction.lastWidth) * -0.7
    camera.right = Math.hypot(construction.firstWidth, construction.lastWidth) * 0.7
    camera.top = (camera.right - camera.left) * aspectRatio / 2 + 10
    camera.bottom = (camera.right - camera.left) * aspectRatio / -2 + 10
    camera.updateProjectionMatrix()
    controls.update()
    render()
}

function setCameraFirst() {
    //Get aspect ratio
    var size = new THREE.Vector2()
    renderer.getSize(size)
    const aspectRatio = size.y / size.x
    //Set position
    camera.position.set(0, 0, 
        Math.max(construction.firstWidth, construction.lastWidth) * 1.5 + construction.lastWidth / 2)
    camera.left = construction.firstWidth * -0.6
    camera.right = construction.firstWidth * 0.6
    camera.top = (camera.right - camera.left) * aspectRatio / 2 + 10
    camera.bottom = (camera.right - camera.left) * aspectRatio / -2 + 10
    camera.updateProjectionMatrix()
    controls.update()
    render()
}

function setCameraLast() {
    //Get aspect ratio
    var size = new THREE.Vector2()
    renderer.getSize(size)
    const aspectRatio = size.y / size.x
    //Set position
    camera.position.x = Math.max(construction.firstWidth, construction.lastWidth) * 1.5 + construction.lastWidth / 2
    camera.position.y = 0
    camera.position.z = 0
    camera.left = construction.lastWidth * -0.6
    camera.right = construction.lastWidth * 0.6
    camera.top = (camera.right - camera.left) * aspectRatio / 2 + 10
    camera.bottom = (camera.right - camera.left) * aspectRatio / -2 + 10
    camera.updateProjectionMatrix()
    controls.update()
    render()
}

//Initialize array for construction
function setWord(key, word) {
    construction[key + "Word"] = word
    //Initialize array
    construction[key] = []
    //Capitalize word
    word = word.toUpperCase()
    //Keep track of position the word should be placed
    var pos = 0
    //Loop through word
    for (var i in word) {
        //Handle space support
        if (word[i] == " ") {
            pos += 5
            continue
        }
        //Set initial values for each letter
        construction[key].push({
            letter: word[i],
            profiles: letterData[word[i]].max,
            width: letterData[word[i]].width,
            pos: pos
        })
        //Update position
        pos += letterData[word[i]].width + 3
    }
    construction[key + "Width"] = pos - 3
}

//Reduces the number of profiles being used
function simplify(key, override=false) {
    //Choose the largest nuber of profiles first
    var target = 3
    //Repeat until we cannot reduce further
    while (target > 1) {
        //Find next most complex target
        for (var i in construction[key]) {
            //Reduce by one by default, or down to one for 
            if (construction[key][i].profiles == target &&
                (construction[key][i].profiles == letterData[construction[key][i].letter].max || override)) {
                construction[key][i].profiles--
                return true
            }
        }
        target--
    }
    return false
}

//Sum the number of profiles being targetted for a key
function sumScore(key) {
    var toReturn = 0
    for (var i in construction[key]) {
        toReturn += construction[key][i].profiles
    }
    return toReturn
}

//Do the actual generating
async function doGenerate() {
    //console.log(scene)
    for (var i = scene.children.length - 1; i >= 0; i--) {
        if (scene.children[i] instanceof THREE.Mesh) {
            scene.remove(scene.children[i])
        }
    }
    var first = $("#first").val()
    if (!first) first = "Default"
    setWord("first", first)
    var last = $("#last").val()
    if (!last) last = "Example"
    setWord("last", last)
    setCameraIso()
    render()

    var override = false
    while (sumScore("first") > sumScore("last")) {
        if (!simplify("first", override)) {
            if (override) {
                break
            }
            if (confirm("The first word is too complex!\nThe generation may be able continue, but the result may look kinda lame, if it completes at all.")) {
                override = true
            } else {
                break
            }
        }
    }
    while (sumScore("first") < sumScore("last")) {
        if (!simplify("last", override)) {
            if (override) {
                break
            }
            if (confirm("The second word is too complex!\nThe generation may be able to continue, but the result may look kinda lame, if it completes at all.")) {
                override = true
            } else {
                break
            }
        }
    }
    console.log(`Sum of first profiles: ${sumScore("first")}`)
    console.log(`Sum of last profiles: ${sumScore("last")}`)
    if (sumScore("first") != sumScore("last")) {
        alert("The generation cannot continue. Please choose different words.")
        return
    }

    construction.firstGroups = []
    for (var i in construction.first) {
        var profiles = construction.first[i].profiles
        for (var j = 1; j <= profiles; j++) {
            let obj = await createExtrusion(construction.first[i].letter + profiles + "-" + j,
                construction.lastWidth, construction.first[i].pos, false, $("#quality:checked").length > 0)
            construction.firstGroups.push(obj)
        }
    }

    construction.lastGroups = []
    for (var i in construction.last) {
        var profiles = construction.last[i].profiles
        for (var j = 1; j <= profiles; j++) {
            let obj = await createExtrusion(construction.last[i].letter + profiles + "-" + j,
                construction.firstWidth, construction.last[i].pos, true, $("#quality:checked").length > 0)
            construction.lastGroups.push(obj)
        }
    }

    await sleep(1)

    var material = new THREE.MeshStandardMaterial({
        color: 0x2150CE,
        side: THREE.FrontSide,
        roughness: 0.9,
        emissive: 0x0f0f0f
    })

    Math.seedrandom(construction.first + construction.last)
    while(construction.firstGroups.length > 0) {
        var src = construction.firstGroups.shift()
        var mask = construction.lastGroups.splice(Math.floor(Math.random() * construction.lastGroups.length), 1)[0]
        src.updateMatrixWorld()
        mask.updateMatrixWorld()
        var a = CSG.fromMesh(src)
        var b = CSG.fromMesh(mask)
        var result = a.intersect(b)
        var toAdd = CSG.toMesh(result, mask.matrix)
        toAdd.material = material
        scene.remove(src)
        scene.remove(mask)
        scene.add(toAdd)
        render()
        await sleep(1)
    }

    material = new THREE.MeshStandardMaterial({
        color: 0x11207E,
        side: THREE.FrontSide,
        roughness: 0.9,
        emissive: 0x0f0f0f
    })

    if ($("#base:checked").length > 0) {
        const baseGeometry = new THREE.BoxGeometry(construction.firstWidth + 12, 7, construction.lastWidth + 12)
        const base = new THREE.Mesh(baseGeometry, material)
        scene.add(base)
        //base.translateX(construction.firstWidth / 2)
        base.translateY(-3.5)
        //base.translateZ(construction.lastWidth / 2)
        render()
    }
}

function download() {
    var exporter = new STLExporter()
    var toSave = exporter.parse(scene)
    var blob = new Blob([toSave], {type: 'text/plain'})
    saveAs(blob, `${construction.firstWord}${construction.lastWord}.stl`)
}

async function createExtrusion(name, depth, pos, doSide, highQuality=false) {
    return new Promise((res, rej) => {
        name = "./letters/" + name + ".svg"
        loader.load(name, async (data) => {
            //Get data in and out prepared
            const paths = data.paths
            var group = new THREE.Group()
            group.name = name + pos + doSide
            //Extrusion settings
            const extrudeSettings = {
                curveSegments: highQuality ? 30 : 7,
                bevelEnabled: false,
                steps: 20,
                depth: depth
            }

            //Get this path and make it shapes
            const path = paths[0]
            const shapes = path.toShapes(true);

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

            //Add to the group
            scene.add(mesh)

            if (doSide) {
                mesh.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), Math.PI / 2)
                mesh.translateX(pos - (construction.lastWidth ? construction.lastWidth : 0) / 2)
                mesh.translateZ(-depth / 2)
            } else {
                mesh.translateX(pos - (construction.firstWidth ? construction.firstWidth : 0) / 2)
                mesh.translateZ(-depth / 2)
            }
            render()
            res(mesh)
        })
    })
}

function animate() {
    requestAnimationFrame(animate)
    controls.update()
    render()
}

function onWindowResize(){
    const canvas = document.querySelector('#c')
    const aspectRatio = canvas.height / canvas.width;
    camera.top = (camera.right - camera.left) * aspectRatio / 2
    camera.bottom = (camera.right - camera.left) * aspectRatio / -2
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    render()
}

function render() {
    renderer.render(scene, camera)
}

async function sleep(millis) {
    return new Promise((res, rej) => {
        setTimeout(res, millis)
    })
}

$(document).ready(() => {
    window.addEventListener('resize', onWindowResize, false);
    $("#download").click(() => {
        download()
    })
    $("#generate").click(() => {
        doGenerate()
    })
    $("#isoCam").click(() => {
        setCameraIso()
    })
    $("#lastCam").click(() => {
        setCameraLast()
    })
    $("#firstCam").click(() => {
        setCameraFirst()
    })
    $("#rotate").change(() => {
        console.log("Changed")
        if($("#rotate:checked").length > 0) {
            console.log("Rotating")
            controls.autoRotate = true
            controls.autoRotateSpeed = 4
        } else {
            console.log("Not rotating")
            controls.autoRotate = false
        }
    })
})

main()
animate()