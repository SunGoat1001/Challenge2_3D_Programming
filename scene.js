import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const FALLBACK_LAYOUT = {
    width: 6,
    depth: 4,
    height: 3,
    camera: { position: [6, 3, 6], target: [0.3, 1, 0], minDistance: 3, maxDistance: 12 }
};

function createRenderer(container) {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    return renderer;
}

function createCamera(container, layout) {
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 50);
    if (layout?.camera?.position) {
        camera.position.fromArray(layout.camera.position);
    } else {
        camera.position.set(6, 3, 6);
    }
    return camera;
}

function createControls(camera, renderer, layout) {
    const controls = new OrbitControls(camera, renderer.domElement);
    const targetLimit = { width: layout?.width ?? FALLBACK_LAYOUT.width, height: layout?.height ?? FALLBACK_LAYOUT.height };
    controls.enableDamping = true;
    if (layout?.camera?.target) controls.target.fromArray(layout.camera.target);
    else controls.target.set(FALLBACK_LAYOUT.width * 0.05, 1, 0);
    controls.minDistance = layout?.camera?.minDistance ?? 3;
    controls.maxDistance = layout?.camera?.maxDistance ?? 12;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minPolarAngle = 0.15;
    controls.enablePan = true;
    controls.addEventListener("change", () => {
        const { x, y, z } = controls.target;
        controls.target.set(
            THREE.MathUtils.clamp(x, -targetLimit.width / 2, targetLimit.width / 2),
            THREE.MathUtils.clamp(y, 0.1, targetLimit.height),
            THREE.MathUtils.clamp(z, -targetLimit.width / 2, targetLimit.width / 2)
        );
    });
    controls.userData = controls.userData || {};
    controls.userData.targetLimit = targetLimit;
    return controls;
}

function createRoom(scene, layout) {
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xb59c81, roughness: 0.8 });
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.9 });
    const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });

    const floorGeo = new THREE.PlaneGeometry(layout.width, layout.depth);
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const wallGeo = new THREE.PlaneGeometry(layout.width, layout.height);
    const sideGeo = new THREE.PlaneGeometry(layout.depth, layout.height);

    const backWall = new THREE.Mesh(wallGeo, wallMat);
    backWall.position.set(0, layout.height / 2, -layout.depth / 2);
    scene.add(backWall);

    const frontWall = new THREE.Mesh(wallGeo, wallMat);
    frontWall.position.set(0, layout.height / 2, layout.depth / 2);
    frontWall.rotation.y = Math.PI;
    scene.add(frontWall);

    const leftWall = new THREE.Mesh(sideGeo, wallMat);
    leftWall.position.set(-layout.width / 2, layout.height / 2, 0);
    leftWall.rotation.y = Math.PI / 2;
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(sideGeo, wallMat);
    rightWall.position.set(layout.width / 2, layout.height / 2, 0);
    rightWall.rotation.y = -Math.PI / 2;
    scene.add(rightWall);

    const ceilingGeo = new THREE.PlaneGeometry(layout.width, layout.depth);
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.position.y = layout.height;
    ceiling.rotation.x = Math.PI / 2;
    scene.add(ceiling);

    const meshes = [floor, backWall, frontWall, leftWall, rightWall, ceiling];
    return { floor, meshes };
}

function addLights(scene) {
    const ambient = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
    keyLight.position.set(4, 5, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.left = -6;
    keyLight.shadow.camera.right = 6;
    keyLight.shadow.camera.top = 6;
    keyLight.shadow.camera.bottom = -6;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 15;
    scene.add(keyLight);

    const fill = new THREE.PointLight(0xffffff, 0.25, 20);
    fill.position.set(-3, 2.5, -3);
    scene.add(fill);
}

export function initScene(container, layout = FALLBACK_LAYOUT) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    const renderer = createRenderer(container);
    const camera = createCamera(container, layout);
    const controls = createControls(camera, renderer, layout);

    addLights(scene);
    let room = createRoom(scene, layout);
    const roomSize = { width: layout.width, depth: layout.depth, height: layout.height };

    window.addEventListener("resize", () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });

    function setLayout(nextLayout) {
        room.meshes.forEach((mesh) => {
            scene.remove(mesh);
            mesh.geometry?.dispose?.();
            mesh.material?.dispose?.();
        });
        room = createRoom(scene, nextLayout);
        roomSize.width = nextLayout.width;
        roomSize.depth = nextLayout.depth;
        roomSize.height = nextLayout.height;
        if (nextLayout.camera?.position) camera.position.fromArray(nextLayout.camera.position);
        if (nextLayout.camera?.target) controls.target.fromArray(nextLayout.camera.target);
        controls.minDistance = nextLayout.camera?.minDistance ?? controls.minDistance;
        controls.maxDistance = nextLayout.camera?.maxDistance ?? controls.maxDistance;
        if (controls.userData.targetLimit) {
            controls.userData.targetLimit.width = nextLayout.width;
            controls.userData.targetLimit.height = nextLayout.height;
        }
    }

    return { scene, camera, renderer, controls, room, roomSize, setLayout };
}
