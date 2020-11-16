import * as THREE from './three/build/three.module.js'
import { STLExporter } from './three/examples/jsm/exporters/STLExporter.js'
import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js'
import { letterData } from "./letterData.js"

var camera, controls, scene, renderer

var construction = {}

const loader = new THREE.ObjectLoader()

var worker

//Loads on page ready
async function main() {
    //Set up renderer
    const canvas = document.querySelector('#c')
    const style = getComputedStyle(document.querySelector('body'))
    canvas.width = parseInt(style.getPropertyValue('width'))
    canvas.height = parseInt(style.getPropertyValue('height'))
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        logarithmicDepthBuffer: true
    })
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
    //const axesHelper = new THREE.AxesHelper(4)
    //scene.add(axesHelper)

    render()

    //await createExtrusion("L1-1", 5, 0, false)
    //render()

    //Initial generation
    doGenerate()
}
//Nice
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
    camera.zoom = 1
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
    camera.position.x = 0
    camera.position.y = 0
    camera.position.z = Math.max(construction.firstWidth, construction.lastWidth) * 1.5 + construction.lastWidth / 2
    camera.left = construction.firstWidth * -0.6
    camera.right = construction.firstWidth * 0.6
    camera.top = (camera.right - camera.left) * aspectRatio / 2 + 10
    camera.bottom = (camera.right - camera.left) * aspectRatio / -2 + 10
    camera.zoom = 1
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
    camera.zoom = 1
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
            pos += 20
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
    $("#generate").text("Stop generating")

    //Delete all children
    for (var i = scene.children.length - 1; i >= 0; i--) {
        if (scene.children[i] instanceof THREE.Mesh) {
            scene.remove(scene.children[i])
        }
    }

    //Get word values, set them, and reposition camera
    var first = $("#first").val()
    if (!first) first = "Default"
    setWord("first", first)
    var last = $("#last").val()
    if (!last) last = "Example"
    setWord("last", last)
    setCameraIso()
    render()

    //If the first is too complex, simplify it
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
    //If the second is too complex, simplify it.
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

    //Print profile number
    console.log(`Sum of first profiles: ${sumScore("first")}`)
    console.log(`Sum of last profiles: ${sumScore("last")}`)

    //Duplicate if there is no solution
    if (sumScore("first") < sumScore("last")) {
        var i = 0
        while (sumScore("first") < sumScore("last")) {
            var toAdd = {}
            toAdd = Object.assign(toAdd, construction.first[i])
            construction.first.push(toAdd)
            i++
        }
        i = construction.first.length
        while (sumScore("first") > sumScore("last")) {
            i--
            construction.first[i].profiles--
        }
    }

    if (sumScore("first") > sumScore("last")) {
        var i = 0
        while (sumScore("first") > sumScore("last")) {
            var toAdd = {}
            toAdd = Object.assign(toAdd, construction.last[i])
            construction.last.push(toAdd)
            i++
        }
        i = construction.last.length
        while (sumScore("first") < sumScore("last")) {
            i--
            construction.last[i].profiles--
        }
    }

    //Call worker
    if (worker) {
        worker.terminate()
    }
    worker = new Worker('./worker.js')
    worker.onmessage = (msg) => {
        //Add returned geometry
        if (msg.data.type == "Add") {
            var adding = loader.parse(msg.data.geometry)
            scene.add(adding)
            if (msg.data.after) {
                if (msg.data.after.r) {
                    adding.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), msg.data.after.r)
                }
                if (msg.data.after.x) {
                    adding.translateX(msg.data.after.x)
                }
                if (msg.data.after.y) {
                    adding.translateY(msg.data.after.y)
                }
                if (msg.data.after.z) {
                    adding.translateZ(msg.data.after.z)
                }
            }
        //Remove specified geometry
        } else if (msg.data.type == "Del") {
            var toRemove = scene.getObjectByName(msg.data.name)
            scene.remove(toRemove)
        //Allow for finished
        } else if (msg.data.type == "Done") {
            worker.terminate()
            worker = undefined
            $("#generate").text("Generate!")
        }
    }

    worker.postMessage([construction, $("#base:checked").length > 0, $("#quality:checked").length > 0])
}

function download() {
    var exporter = new STLExporter()
    var toSave = exporter.parse(scene)
    var blob = new Blob([toSave], {type: 'text/plain'})
    saveAs(blob, `${construction.firstWord}${construction.lastWord}.stl`)
}

//Animation loop
function animate() {
    requestAnimationFrame(animate)
    controls.update()
    render()
}

//Handles changing canvas size
function onWindowResize(){
    console.log("Resizing!")
    const canvas = document.querySelector('#c')
    canvas.height = window.innerHeight
    canvas.width = window.innerWidth
    const aspectRatio = canvas.height / canvas.width;
    camera.top = (camera.right - camera.left) * aspectRatio / 2
    camera.bottom = (camera.right - camera.left) * aspectRatio / -2
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight, false);
    render()
}

function resizeCanvasToDisplaySize() {
    const canvas = document.querySelector('#c')
  
    // adjust displayBuffer size to match
    if (window.innerWidth !== canvas.width || window.innerHeight !== canvas.height) {
        console.log("Loop resizing")
        onWindowResize()
    }
}

//Render scene
function render() {
    resizeCanvasToDisplaySize()
    renderer.render(scene, camera)
}

//Sleep function
async function sleep(millis) {
    return new Promise((res, rej) => {
        setTimeout(res, millis)
    })
}

//On ready
$(document).ready(() => {
    //Allow resizing to work
    $(window).resize(onWindowResize);
    //window.addEventListener('resize', onWindowResize, false);

    //Enable download button
    $("#download").click(() => {
        download()
    })

    //Enable generate button
    $("#generate").click(() => {
        //If running, kill
        if (worker) {
            worker.terminate()
            worker = undefined
            $("#generate").text("Generate!")
        } else {
            //Else, generate
            doGenerate()
        }
    })

    //Enable camera buttons
    $("#isoCam").click(() => {
        setCameraIso()
    })
    $("#lastCam").click(() => {
        setCameraLast()
    })
    $("#firstCam").click(() => {
        setCameraFirst()
    })

    //Enable rotation
    $("#rotate").change(() => {
        console.log("Changed")
        if($("#rotate:checked").length > 0) {
            console.log("Rotating")
            controls.autoRotate = true
            controls.autoRotateSpeed = -4
        } else {
            console.log("Not rotating")
            controls.autoRotate = false
        }
    })
})

main()
animate()
