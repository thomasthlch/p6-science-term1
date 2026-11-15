import {
  AmbientLight,
  Color,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  SphereGeometry,
  CylinderGeometry,
  ConeGeometry,
  BoxGeometry,
  WebGLRenderer,
  Raycaster,
  Vector2,
  Vector3,
  type Object3D,
} from 'three';
import { SPECIES, type AnimalKind } from './animals';
import type { PetCare } from './pasture';

export interface YardHandlers {
  onSelect: (speciesId: string) => void;
  onPose: (speciesId: string, x: number, z: number, rot: number) => void;
}

interface Walker {
  speciesId: string;
  group: Group;
  target: Vector3 | null;
  friend: boolean;
}

const COLORS: Record<string, number> = {
  chick: 0xffd45a,
  rabbit: 0xfff6fb,
  duck: 0xfffaf2,
  guinea: 0xe7b07a,
  sheep: 0xf7fbff,
  hamster: 0xf0b56a,
  cat: 0xf7b89a,
  dog: 0xe0a15c,
  fox: 0xf28a3c,
  panda: 0xf4f7f6,
  penguin: 0x2c3a4a,
  otter: 0xa87552,
  owl: 0xc9a27a,
  hedgehog: 0xf0c07a,
  deer: 0xe7b98a,
  flamingo: 0xffb6cc,
  sloth: 0xc8b39a,
  bear: 0xf7fbff,
  peacock: 0x148f86,
  koi: 0xf28b3c,
  horse: 0xf4e2c4,
  bee: 0xf6c445,
};

export class PastureView {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera: PerspectiveCamera;
  private raycaster = new Raycaster();
  private pointer = new Vector2();
  private ground: Mesh;
  private walkers: Walker[] = [];
  private selected: string | null = null;
  private frame = 0;
  private running = true;
  private dragging = false;
  private resizeObserver: ResizeObserver;
  private onPointerDown: (event: PointerEvent) => void;
  private onPointerMove: (event: PointerEvent) => void;
  private onPointerUp: () => void;

  constructor(
    private host: HTMLElement,
    pets: PetCare[],
    private handlers: YardHandlers,
  ) {
    const touch = navigator.maxTouchPoints > 0;
    this.renderer = new WebGLRenderer({ antialias: !touch, alpha: false, powerPreference: 'low-power' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, touch ? 1.25 : 1.5));
    this.renderer.setClearColor(new Color('#d7ecff'));
    this.camera = new PerspectiveCamera(42, 1, 0.1, 40);
    this.camera.position.set(0, 6.4, 8.4);
    this.camera.lookAt(0, 0.2, 0);
    this.scene.add(new AmbientLight(0xffffff, 0.85));
    const sun = new DirectionalLight(0xfff4d8, 1.1);
    sun.position.set(4, 8, 3);
    this.scene.add(sun);
    this.ground = new Mesh(
      new PlaneGeometry(12, 12),
      new MeshStandardMaterial({ color: 0x8ed39a, roughness: 1 }),
    );
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.y = 0;
    this.scene.add(this.ground);
    this.addFence();
    for (const pet of pets) this.addWalker(pet);
    host.replaceChildren(this.renderer.domElement);
    this.renderer.domElement.className = 'pasture-canvas';
    this.onPointerDown = (event) => this.pointerDown(event);
    this.onPointerMove = (event) => this.pointerMove(event);
    this.onPointerUp = () => {
      this.dragging = false;
    };
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
    this.renderer.domElement.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);
    this.resize();
    this.animate();
  }

  setFriend(speciesId: string, friend: boolean): void {
    const walker = this.walkers.find((item) => item.speciesId === speciesId);
    if (!walker) return;
    walker.friend = friend;
    this.syncFriend(walker);
  }

  celebrate(speciesId: string): void {
    const walker = this.walkers.find((item) => item.speciesId === speciesId);
    if (!walker) return;
    walker.group.userData.hop = 1.2;
  }

  comeCloser(speciesId: string): void {
    const walker = this.walkers.find((item) => item.speciesId === speciesId);
    if (!walker) return;
    walker.target = new Vector3(walker.group.position.x * 0.45, 0, 2.1);
  }

  dispose(): void {
    this.running = false;
    cancelAnimationFrame(this.frame);
    this.resizeObserver.disconnect();
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.renderer.domElement.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    this.scene.traverse((object) => {
      const mesh = object as Mesh;
      mesh.geometry?.dispose();
      const material = mesh.material;
      if (Array.isArray(material)) material.forEach((item) => item.dispose());
      else material?.dispose();
    });
    this.renderer.dispose();
    this.host.replaceChildren();
  }

  private addFence(): void {
    const post = new BoxGeometry(0.15, 0.7, 0.15);
    const material = new MeshStandardMaterial({ color: 0xf4efe6, roughness: 0.8 });
    for (const [x, z] of [[-4.6, -3.2], [4.6, -3.2], [-4.6, 3.4], [4.6, 3.4]] as const) {
      const mesh = new Mesh(post, material);
      mesh.position.set(x, 0.35, z);
      this.scene.add(mesh);
    }
  }

  private addWalker(pet: PetCare): void {
    const species = SPECIES.find((item) => item.id === pet.speciesId);
    const group = buildAnimal(species?.kind ?? 'chick', COLORS[pet.speciesId] ?? 0xf6d7ae);
    group.position.set(pet.x, 0, pet.z);
    group.rotation.y = pet.rot;
    group.userData.speciesId = pet.speciesId;
    this.scene.add(group);
    const walker: Walker = { speciesId: pet.speciesId, group, target: null, friend: pet.friend };
    this.walkers.push(walker);
    this.syncFriend(walker);
  }

  private syncFriend(walker: Walker): void {
    walker.group.scale.setScalar(walker.friend ? 1.12 : 1);
    const heart = walker.group.getObjectByName('heart');
    if (heart) heart.visible = walker.friend;
  }

  private resize(): void {
    const width = Math.max(1, this.host.clientWidth);
    const height = Math.max(1, this.host.clientHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  private pointerDown(event: PointerEvent): void {
    this.dragging = true;
    const hit = this.hit(event);
    const animal = hit.find((item) => item.object.parent && findSpecies(item.object));
    if (animal) {
      const speciesId = findSpecies(animal.object);
      if (!speciesId) return;
      this.selected = speciesId;
      this.handlers.onSelect(speciesId);
      this.placeTarget(event, speciesId);
      return;
    }
    if (this.selected) this.placeTarget(event, this.selected);
  }

  private pointerMove(event: PointerEvent): void {
    if (!this.dragging || !this.selected) return;
    this.placeTarget(event, this.selected);
  }

  private placeTarget(event: PointerEvent, speciesId: string): void {
    const point = this.groundPoint(event);
    if (!point) return;
    const walker = this.walkers.find((item) => item.speciesId === speciesId);
    if (!walker) return;
    walker.target = new Vector3(clamp(point.x, -4.2, 4.2), 0, clamp(point.z, -3, 3.2));
  }

  private hit(event: PointerEvent) {
    this.setPointer(event);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    return this.raycaster.intersectObjects(this.walkers.map((item) => item.group), true);
  }

  private groundPoint(event: PointerEvent): Vector3 | null {
    this.setPointer(event);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObject(this.ground, false)[0];
    return hit?.point ?? null;
  }

  private setPointer(event: PointerEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private animate = (): void => {
    if (!this.running) return;
    this.frame = requestAnimationFrame(this.animate);
    const time = performance.now() / 1000;
    for (const walker of this.walkers) {
      const bob = Math.sin(time * 3 + walker.group.position.x) * 0.04;
      let moving = false;
      if (walker.target) {
        const flat = walker.target.clone().setY(0);
        const current = walker.group.position.clone().setY(0);
        const delta = flat.sub(current);
        const distance = delta.length();
        if (distance < 0.08) {
          walker.target = null;
          this.handlers.onPose(walker.speciesId, walker.group.position.x, walker.group.position.z, walker.group.rotation.y);
        } else {
          moving = true;
          delta.normalize();
          walker.group.position.x += delta.x * 0.035;
          walker.group.position.z += delta.z * 0.035;
          const desired = Math.atan2(delta.x, delta.z);
          walker.group.rotation.y += (desired - walker.group.rotation.y) * 0.2;
        }
      }
      walker.group.position.y = moving ? Math.abs(Math.sin(time * 10)) * 0.08 : bob;
      const hop = Number(walker.group.userData.hop ?? 0);
      if (hop > 0) {
        walker.group.position.y += Math.sin(hop * 8) * 0.25;
        walker.group.userData.hop = hop - 0.04;
      }
      const heart = walker.group.getObjectByName('heart');
      if (heart) heart.position.y = 1.35 + Math.sin(time * 3) * 0.06;
    }
    this.renderer.render(this.scene, this.camera);
  };
}

function findSpecies(object: Object3D): string | null {
  let current: Object3D | null = object;
  while (current) {
    if (typeof current.userData.speciesId === 'string') return current.userData.speciesId;
    current = current.parent;
  }
  return null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function buildAnimal(kind: AnimalKind, color: number): Group {
  const group = new Group();
  const bodyMat = new MeshStandardMaterial({ color, roughness: 0.65 });
  const dark = new MeshStandardMaterial({ color: 0x2c211c, roughness: 0.4 });
  const body = new Mesh(new SphereGeometry(0.42, 18, 14), bodyMat);
  body.position.y = 0.48;
  body.scale.set(1, 0.86, 1.15);
  group.add(body);
  const head = new Mesh(new SphereGeometry(0.26, 16, 12), bodyMat);
  head.position.set(0, 0.86, 0.28);
  group.add(head);
  const eyeL = new Mesh(new SphereGeometry(0.045, 8, 8), dark);
  const eyeR = eyeL.clone();
  eyeL.position.set(-0.09, 0.9, 0.48);
  eyeR.position.set(0.09, 0.9, 0.48);
  group.add(eyeL, eyeR);
  addEars(group, kind, bodyMat);
  const heart = new Mesh(new SphereGeometry(0.08, 8, 8), new MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.4 }));
  heart.name = 'heart';
  heart.position.set(0, 1.35, 0);
  heart.visible = false;
  group.add(heart);
  return group;
}

function addEars(group: Group, kind: AnimalKind, material: MeshStandardMaterial): void {
  if (kind === 'rabbit') {
    const ear = new Mesh(new CylinderGeometry(0.05, 0.07, 0.42, 8), material);
    ear.position.set(-0.1, 1.2, 0.22);
    const other = ear.clone();
    other.position.x = 0.1;
    group.add(ear, other);
    return;
  }
  if (kind === 'chick' || kind === 'duck' || kind === 'penguin' || kind === 'flamingo' || kind === 'owl') {
    const beak = new Mesh(new ConeGeometry(0.07, 0.16, 8), new MeshStandardMaterial({ color: 0xf0a03a }));
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, 0.82, 0.52);
    group.add(beak);
    return;
  }
  if (kind === 'fox' || kind === 'cat') {
    const ear = new Mesh(new ConeGeometry(0.08, 0.2, 8), material);
    ear.position.set(-0.12, 1.08, 0.2);
    const other = ear.clone();
    other.position.x = 0.12;
    group.add(ear, other);
  }
}
