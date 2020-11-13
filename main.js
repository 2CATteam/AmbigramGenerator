import * as THREE from './three/three.module.js'

function main() {
    const canvas = document.querySelector('#c')
    const renderer = new THREE.WebGLRenderer({canvas})

    //Set up camera
    var size = new THREE.Vector2()
    renderer.getSize(size)
    const aspectRatio = size.y / size.x
    const width = 8
    const camera = new THREE.OrthographicCamera(width / -2, width / 2, width / 2 * aspectRatio, width / -2 * aspectRatio, 1, 1000);
    camera.position.z = 5

    //Create scene
    const scene = new THREE.Scene()

    //Create geometry
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshBasicMaterial({color: 0x00FFFF})
    const cube = new THREE.Mesh(geometry, material)

    scene.add(cube)

    //Done
    renderer.render(scene, camera)
}

main()