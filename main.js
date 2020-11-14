import * as THREE from './three/build/three.module.js'
import { SVGLoader } from './three/examples/jsm/loaders/SVGLoader.js'
import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js'
import { letterData } from "./letterData.js"

var camera, controls, scene, renderer, loader

var construction = {}

async function main() {
    const canvas = document.querySelector('#c')
    const style = getComputedStyle(document.querySelector('body'))
    canvas.width = parseInt(style.getPropertyValue('width'))
    canvas.height = parseInt(style.getPropertyValue('height'))
    renderer = new THREE.WebGLRenderer({canvas})

    //Set up camera
    var size = new THREE.Vector2()
    renderer.getSize(size)
    const aspectRatio = size.y / size.x
    const width = 30
    camera = new THREE.OrthographicCamera(width / -2, width / 2, width / 2 * aspectRatio, width / -2 * aspectRatio, 0.01, 1000);
    camera.position.z = 40

    //Initiate orbit controls
    controls = new OrbitControls(camera, renderer.domElement)

    controls.addEventListener('change', render)

    //Create scene
    scene = new THREE.Scene()

    const ambient = new THREE.AmbientLight(0x101010)
    scene.add(ambient)
    const light1 = new THREE.PointLight(0xffaaaa, 2, 0, 2)
    light1.position.set(30, 80, 50)
    scene.add(light1)
    const light2 = new THREE.PointLight(0xffaaaa, 1, 0, 2)
    light2.position.set(-70, 80, 50)
    scene.add(light2)

    //Show axes
    const axesHelper = new THREE.AxesHelper(4)
    scene.add(axesHelper)

    loader = new SVGLoader();

    //Load letters
    var str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    for (var i = 0; i < str.length; i++) {
        await createLetter(str[i])
    }

    console.log(JSON.stringify(letterData, null, "\t"))

    //Done
    renderer.render(scene, camera)
}

function doGenerate(first, last) {
    construction.first = "Daniel"
    construction.last = "Royer"
}

async function sleep(millis) {
    return new Promise((res, rej) => {
        setTimeout(res, millis)
    })
}

async function createLetter(letter) {
    const group = new THREE.Group()
    for (var i = 1; i <= Math.max(1, letterData[letter].max); i++) {
        group.add(await createExtrusion(letter + Math.max(1, letterData[letter].max) + "-" + i))
        //await sleep(1000)
        var select = scene.getObjectByName(letter + Math.max(1, letterData[letter].max) + "-" + i)
        scene.remove(select)
    }
    //console.log(letter)
    //console.log(group)
    const box = (new THREE.Box3()).setFromObject(group)
    //console.log(box)
    //console.log(box.max.x - box.min.x)
    letterData[letter].width = box.max.x - box.min.x
    //console.log(letterData)
}

async function createExtrusion(name) {
    return new Promise((res, rej) => {
        name = "./letters/" + name + ".svg"
        loader.load(name, (data) => {
            //Get data in and out prepared
            const paths = data.paths
            var group = new THREE.Group()
            group.name = name
            //Extrusion settings
            const extrudeSettings = {
                curveSegments: 30,
                bevelEnabled: false,
                steps: 6,
                depth: 3
            }

            //Loop through each path in the SVG (Should only be one)
            for (var i = 0; i < paths.length; i++) {
                //Get this path and make it shapes
                const path = paths[i]
                const shapes = path.toShapes(true);

                //Material settings
                const material = new THREE.MeshStandardMaterial({
                    color: 0x2150CE,
                    side: THREE.DoubleSide,
                    roughness: 0.9,
                    emissive: 0x0f0f0f
                })

                //Make each shape a mesh
                for ( let j = 0; j < shapes.length; j ++ ) {
                    const shape = shapes[j]
                    //const geometry = new THREE.ShapeBufferGeometry(shape)
                    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
                    geometry.computeBoundingBox()
                    const mesh = new THREE.Mesh(geometry, material)
                    group.add( mesh )
                }
            }

            //Add to the group
            scene.add(group)
            renderer.render(scene, camera)
            res(group)
        })
    })
}

function animate() {
    requestAnimationFrame(animate)
    controls.update()
    render()
}

function render() {
    renderer.render(scene, camera)
}

main()