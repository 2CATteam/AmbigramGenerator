import * as THREE from './three/build/three.module.js'
import { SVGLoader } from './three/examples/jsm/loaders/SVGLoader.js'
import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js'

var camera, controls, scene, renderer

function main() {
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

    //Create geometry
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshBasicMaterial({color: 0x00FFFF})
    const cube = new THREE.Mesh(geometry, material)
    //scene.add(cube)

    //Show axes
    const axesHelper = new THREE.AxesHelper(4)
    scene.add(axesHelper)

    const loader = new SVGLoader();

    //Load letters
    loader.load("./letters/A2-1.svg", (data) => {
        //Get data in and out prepared
        const paths = data.paths
        const group = new THREE.Group()
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
            const material = new THREE.MeshBasicMaterial({
                color: 0xFFFFFF,
                side: THREE.DoubleSide
            })

            //Make each shape a mesh
			for ( let j = 0; j < shapes.length; j ++ ) {
                const shape = shapes[j]
                //const geometry = new THREE.ShapeBufferGeometry(shape)
                const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
                geometry.computeBoundingBox()
                console.log(geometry.boundingBox)
				const mesh = new THREE.Mesh(geometry, material)
                group.add( mesh )
			}
        }

        //Add to the group
        scene.add(group)
        renderer.render(scene, camera)
    })

    //Done
    renderer.render(scene, camera)
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