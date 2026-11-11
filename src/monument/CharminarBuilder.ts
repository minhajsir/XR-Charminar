import * as THREE from 'three';

export interface CharminarMaterials {
  stone: THREE.MeshStandardMaterial;
  trim: THREE.MeshStandardMaterial;
  dome: THREE.MeshStandardMaterial;
  gold: THREE.MeshStandardMaterial;
  darkStucco: THREE.MeshStandardMaterial;
  water: THREE.MeshStandardMaterial;
  clockFace: THREE.MeshStandardMaterial;
  clockBorder: THREE.MeshStandardMaterial;
}

/**
 * Creates a procedural high-quality texture to give the stone an authentic,
 * weathered Deccan granite and limestone stucco appearance.
 */
function createStoneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#dfd2bc';
    ctx.fillRect(0, 0, 512, 512);

    // Add subtle noise / flecks of granite and limestone mortar
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const gray = Math.floor(180 + Math.random() * 60);
      const alpha = 0.05 + Math.random() * 0.12;
      ctx.fillStyle = `rgba(${gray - 20}, ${gray - 10}, ${gray}, ${alpha})`;
      ctx.fillRect(x, y, 2 + Math.random() * 3, 2 + Math.random() * 3);
    }

    // Add subtle architectural horizontal course lines
    ctx.strokeStyle = 'rgba(120, 100, 80, 0.08)';
    ctx.lineWidth = 1.5;
    for (let y = 16; y < 512; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 4);
  return texture;
}

export class CharminarBuilder {
  private materials: CharminarMaterials;
  private stoneTexture: THREE.CanvasTexture;

  constructor() {
    this.stoneTexture = createStoneTexture();

    this.materials = {
      stone: new THREE.MeshStandardMaterial({
        color: 0xdfd3be,
        map: this.stoneTexture,
        roughness: 0.78,
        metalness: 0.08,
      }),
      trim: new THREE.MeshStandardMaterial({
        color: 0xd0c0a8,
        roughness: 0.72,
        metalness: 0.12,
      }),
      dome: new THREE.MeshStandardMaterial({
        color: 0xe5d8be,
        roughness: 0.55,
        metalness: 0.18,
      }),
      gold: new THREE.MeshStandardMaterial({
        color: 0xe6b840,
        roughness: 0.35,
        metalness: 0.75,
      }),
      darkStucco: new THREE.MeshStandardMaterial({
        color: 0x7c7062,
        roughness: 0.85,
        metalness: 0.05,
      }),
      water: new THREE.MeshStandardMaterial({
        color: 0x36859e,
        roughness: 0.15,
        metalness: 0.2,
        transparent: true,
        opacity: 0.82,
      }),
      clockFace: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.4,
      }),
      clockBorder: new THREE.MeshStandardMaterial({
        color: 0x3c3022,
        roughness: 0.5,
        metalness: 0.6,
      }),
    };
  }

  /**
   * Builds the complete Charminar 3D monument hierarchy.
   * Model dimensions: Base width ~0.38m, Minaret total height ~0.50m (approx 1:100 architectural scale)
   */
  public buildMonument(): THREE.Group {
    const root = new THREE.Group();
    root.name = 'CharminarMonument';

    // 1. Plinth / Base Platform with stepped podium
    this.buildPlinth(root);

    // 2. Central structure with Four Grand Arches and interior courtyard
    this.buildMainBodyAndArches(root);

    // 3. Central Fountain & Ablution Basin (Vazu hauz)
    this.buildCentralFountain(root);

    // 4. Upper Floor Galleries, Double Storey, and Western Mosque
    this.buildUpperGalleriesAndRoof(root);

    // 5. The Four Monumental Corner Minarets with multi-tiered balconies & domes
    this.buildCornerMinarets(root);

    // 6. Historic Four Clocks (added 1889)
    this.buildClocks(root);

    // 7. Ground ambient shadow receiver
    this.buildGroundShadow(root);

    return root;
  }

  private buildPlinth(parent: THREE.Group): void {
    const baseWidth = 0.42;
    const baseHeight = 0.02;

    // Stepped plinth
    const lowerStep = new THREE.Mesh(
      new THREE.BoxGeometry(baseWidth + 0.04, 0.008, baseWidth + 0.04),
      this.materials.trim
    );
    lowerStep.position.y = 0.004;
    lowerStep.receiveShadow = true;
    parent.add(lowerStep);

    const mainPlinth = new THREE.Mesh(
      new THREE.BoxGeometry(baseWidth, baseHeight, baseWidth),
      this.materials.stone
    );
    mainPlinth.position.y = 0.01 + baseHeight / 2;
    mainPlinth.receiveShadow = true;
    parent.add(mainPlinth);

    // Outer decorative molded curb
    const curb = new THREE.Mesh(
      new THREE.BoxGeometry(baseWidth + 0.01, 0.006, baseWidth + 0.01),
      this.materials.trim
    );
    curb.position.y = 0.028;
    parent.add(curb);
  }

  private buildMainBodyAndArches(parent: THREE.Group): void {
    const bodyWidth = 0.36;
    const archWidth = 0.16;
    const pierWidth = (bodyWidth - archWidth) / 2; // ~0.10
    const pierHeight = 0.18; // Ground level to arch spring point
    const halfBody = bodyWidth / 2;

    const cornerPierGeom = new THREE.BoxGeometry(pierWidth, pierHeight, pierWidth);

    // Four massive corner piers supporting the main arches
    const pierPositions = [
      [halfBody - pierWidth / 2, halfBody - pierWidth / 2],
      [-halfBody + pierWidth / 2, halfBody - pierWidth / 2],
      [-halfBody + pierWidth / 2, -halfBody + pierWidth / 2],
      [halfBody - pierWidth / 2, -halfBody + pierWidth / 2],
    ];

    pierPositions.forEach(([px, pz]) => {
      const pier = new THREE.Mesh(cornerPierGeom, this.materials.stone);
      pier.position.set(px, 0.028 + pierHeight / 2, pz);
      pier.castShadow = true;
      pier.receiveShadow = true;
      parent.add(pier);

      // Ornamental decorative base trim on pier
      const pierBase = new THREE.Mesh(
        new THREE.BoxGeometry(pierWidth + 0.006, 0.015, pierWidth + 0.006),
        this.materials.trim
      );
      pierBase.position.set(px, 0.028 + 0.0075, pz);
      parent.add(pierBase);

      // Pier capital moulding
      const pierCap = new THREE.Mesh(
        new THREE.BoxGeometry(pierWidth + 0.008, 0.008, pierWidth + 0.008),
        this.materials.trim
      );
      pierCap.position.set(px, 0.028 + pierHeight, pz);
      parent.add(pierCap);
    });

    // Four Grand Arches linking the piers on each cardinal face
    const cardinalRotations = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
    cardinalRotations.forEach((rot) => {
      const archFacade = this.createArchFacade(archWidth, pierHeight);
      archFacade.rotation.y = rot;
      parent.add(archFacade);
    });

    // Vaulted interior ceiling above the central crossing
    const vaultDome = new THREE.Mesh(
      new THREE.SphereGeometry(archWidth * 0.52, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      this.materials.trim
    );
    vaultDome.position.set(0, 0.028 + pierHeight + 0.01, 0);
    vaultDome.scale.y = 0.5;
    parent.add(vaultDome);
  }

  /**
   * Creates an authentic Islamic pointed arch (ogee / pointed arch) facade segment
   */
  private createArchFacade(archWidth: number, pierHeight: number): THREE.Group {
    const group = new THREE.Group();
    const halfWidth = archWidth / 2;
    const archApexY = 0.028 + pierHeight + 0.04;
    const archDepth = 0.035;

    // Create pointed arch curve using Shape
    const archShape = new THREE.Shape();
    archShape.moveTo(-halfWidth, 0);
    archShape.lineTo(-halfWidth, pierHeight * 0.7);
    // Pointed Islamic arch cusp
    archShape.quadraticCurveTo(-halfWidth * 0.4, pierHeight * 0.95, 0, pierHeight + 0.04);
    archShape.quadraticCurveTo(halfWidth * 0.4, pierHeight * 0.95, halfWidth, pierHeight * 0.7);
    archShape.lineTo(halfWidth, 0);
    archShape.lineTo(halfWidth + 0.03, 0);
    archShape.lineTo(halfWidth + 0.03, pierHeight + 0.05);
    archShape.lineTo(-halfWidth - 0.03, pierHeight + 0.05);
    archShape.lineTo(-halfWidth - 0.03, 0);
    archShape.closePath();

    const extrudeSettings = {
      depth: archDepth,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.003,
      bevelThickness: 0.003,
    };

    const archGeom = new THREE.ExtrudeGeometry(archShape, extrudeSettings);
    const archMesh = new THREE.Mesh(archGeom, this.materials.stone);
    archMesh.position.set(0, 0.028, 0.18 - archDepth);
    archMesh.castShadow = true;
    archMesh.receiveShadow = true;
    group.add(archMesh);

    // Decorative inner arch moulding
    const innerTrim = new THREE.Mesh(
      new THREE.TorusGeometry(halfWidth * 0.88, 0.005, 8, 24, Math.PI),
      this.materials.trim
    );
    innerTrim.rotation.z = Math.PI;
    innerTrim.position.set(0, 0.028 + pierHeight * 0.65, 0.178);
    group.add(innerTrim);

    // Decorative stucco medallion above the arch apex
    const medallion = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.004, 16),
      this.materials.gold
    );
    medallion.rotation.x = Math.PI / 2;
    medallion.position.set(0, archApexY + 0.015, 0.18);
    group.add(medallion);

    return group;
  }

  private buildCentralFountain(parent: THREE.Group): void {
    const fountainGroup = new THREE.Group();
    fountainGroup.position.set(0, 0.028, 0);

    // Octagonal stone basin
    const basinRadius = 0.045;
    const basin = new THREE.Mesh(
      new THREE.CylinderGeometry(basinRadius, basinRadius + 0.005, 0.012, 8),
      this.materials.trim
    );
    basin.position.y = 0.006;
    fountainGroup.add(basin);

    // Shimmering water surface
    const water = new THREE.Mesh(
      new THREE.CylinderGeometry(basinRadius - 0.004, basinRadius - 0.004, 0.002, 8),
      this.materials.water
    );
    water.position.y = 0.01;
    fountainGroup.add(water);

    // Center fountain nozzle / lotus pedestal
    const fountainPedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.012, 0.015, 8),
      this.materials.gold
    );
    fountainPedestal.position.y = 0.012;
    fountainGroup.add(fountainPedestal);

    parent.add(fountainGroup);
  }

  private buildUpperGalleriesAndRoof(parent: THREE.Group): void {
    const galleryGroup = new THREE.Group();
    const galleryY = 0.028 + 0.18 + 0.04; // ~0.248m
    galleryGroup.position.set(0, galleryY, 0);

    const galleryWidth = 0.355;
    const galleryHeight = 0.065;

    // Floor 1 gallery box
    const galleryBox = new THREE.Mesh(
      new THREE.BoxGeometry(galleryWidth, galleryHeight, galleryWidth),
      this.materials.stone
    );
    galleryBox.position.y = galleryHeight / 2;
    galleryBox.castShadow = true;
    galleryBox.receiveShadow = true;
    galleryGroup.add(galleryBox);

    // Continuous architectural cantilevered cornice (Chhajja) below gallery
    const lowerCornice = new THREE.Mesh(
      new THREE.BoxGeometry(galleryWidth + 0.02, 0.008, galleryWidth + 0.02),
      this.materials.trim
    );
    lowerCornice.position.y = 0.004;
    galleryGroup.add(lowerCornice);

    // Arched windows / jali rows on each side of the upper gallery
    [0, Math.PI / 2, Math.PI, -Math.PI / 2].forEach((rot) => {
      const windowRow = this.createGalleryWindowRow();
      windowRow.rotation.y = rot;
      windowRow.position.y = galleryHeight * 0.45;
      galleryGroup.add(windowRow);
    });

    // Upper Balustrade & Roof Terrace Parapet (Jali Screen and Merlons)
    const roofLevelY = galleryHeight;
    const parapet = new THREE.Mesh(
      new THREE.BoxGeometry(galleryWidth + 0.012, 0.014, galleryWidth + 0.012),
      this.materials.trim
    );
    parapet.position.y = roofLevelY + 0.007;
    galleryGroup.add(parapet);

    // Historic Mosque Structure on the Western Roof Wing
    const mosqueGroup = new THREE.Group();
    mosqueGroup.position.set(-galleryWidth * 0.22, roofLevelY + 0.005, 0);

    const mosqueWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.025, galleryWidth * 0.65),
      this.materials.stone
    );
    mosqueWall.position.y = 0.0125;
    mosqueGroup.add(mosqueWall);

    // Miniature domes on western mosque parapet
    for (let z = -0.08; z <= 0.08; z += 0.04) {
      const miniDome = new THREE.Mesh(
        new THREE.SphereGeometry(0.007, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
        this.materials.dome
      );
      miniDome.position.set(0, 0.025, z);
      mosqueGroup.add(miniDome);
    }

    galleryGroup.add(mosqueGroup);

    // Crenellated Islamic battlements along the roof perimeter
    const merlonGeom = new THREE.ConeGeometry(0.005, 0.008, 4);
    const merlonSpacing = 0.022;
    for (let x = -galleryWidth / 2 + 0.02; x <= galleryWidth / 2 - 0.02; x += merlonSpacing) {
      // North & South edges
      const mN = new THREE.Mesh(merlonGeom, this.materials.trim);
      mN.position.set(x, roofLevelY + 0.018, galleryWidth / 2);
      galleryGroup.add(mN);

      const mS = new THREE.Mesh(merlonGeom, this.materials.trim);
      mS.position.set(x, roofLevelY + 0.018, -galleryWidth / 2);
      galleryGroup.add(mS);
    }

    parent.add(galleryGroup);
  }

  private createGalleryWindowRow(): THREE.Group {
    const row = new THREE.Group();
    const count = 5;
    const windowWidth = 0.022;
    const windowHeight = 0.035;
    const spacing = 0.042;
    const startX = -((count - 1) * spacing) / 2;

    for (let i = 0; i < count; i++) {
      const winMesh = new THREE.Mesh(
        new THREE.BoxGeometry(windowWidth, windowHeight, 0.004),
        this.materials.darkStucco
      );
      winMesh.position.set(startX + i * spacing, 0, 0.178);

      // Little arched header
      const winArch = new THREE.Mesh(
        new THREE.CylinderGeometry(windowWidth / 2, windowWidth / 2, 0.004, 12, 1, false, 0, Math.PI),
        this.materials.darkStucco
      );
      winArch.rotation.z = Math.PI / 2;
      winArch.rotation.x = Math.PI / 2;
      winArch.position.set(startX + i * spacing, windowHeight / 2, 0.178);

      row.add(winMesh, winArch);
    }

    return row;
  }

  private buildCornerMinarets(parent: THREE.Group): void {
    const minaretCorners = [
      { x: 0.18, z: 0.18, label: 'North-East Minaret' },
      { x: -0.18, z: 0.18, label: 'North-West Minaret' },
      { x: -0.18, z: -0.18, label: 'South-West Minaret' },
      { x: 0.18, z: -0.18, label: 'South-East Minaret' },
    ];

    minaretCorners.forEach((corner) => {
      const minaret = this.createSingleMinaret();
      minaret.name = corner.label;
      minaret.position.set(corner.x, 0.028, corner.z);
      parent.add(minaret);
    });
  }

  /**
   * Builds one of the four iconic 4-tiered minarets.
   * Total height from ground plinth is ~0.49m
   */
  private createSingleMinaret(): THREE.Group {
    const minaret = new THREE.Group();

    // 1. Minaret Octagonal Base Buttress (interlocking with corner piers)
    const baseRadius = 0.038;
    const baseHeight = 0.22;
    const baseButtress = new THREE.Mesh(
      new THREE.CylinderGeometry(baseRadius * 0.9, baseRadius, baseHeight, 8),
      this.materials.stone
    );
    baseButtress.position.y = baseHeight / 2;
    baseButtress.castShadow = true;
    baseButtress.receiveShadow = true;
    minaret.add(baseButtress);

    // Decorative transition moulding to circular shaft
    const transitionRing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, baseRadius * 0.92, 0.015, 16),
      this.materials.trim
    );
    transitionRing.position.y = baseHeight + 0.0075;
    minaret.add(transitionRing);

    let currentY = baseHeight + 0.015;

    // 2. Four Vertical Storeys with multi-tier Cantilevered Balconies
    const numTiers = 4;
    const tierHeights = [0.065, 0.06, 0.055, 0.045];
    const tierRadii = [0.030, 0.026, 0.022, 0.018];

    for (let t = 0; t < numTiers; t++) {
      const r = tierRadii[t];
      const h = tierHeights[t];

      // Balcony at tier base
      const balcony = this.createMinaretBalcony(r);
      balcony.position.y = currentY;
      minaret.add(balcony);

      // Cylindrical fluted shaft section
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(r * 0.92, r, h, 20),
        this.materials.stone
      );
      shaft.position.y = currentY + h / 2;
      shaft.castShadow = true;
      shaft.receiveShadow = true;
      minaret.add(shaft);

      // Fine stucco horizontal bands on shaft
      const band = new THREE.Mesh(
        new THREE.TorusGeometry(r * 0.97, 0.002, 6, 20),
        this.materials.trim
      );
      band.rotation.x = Math.PI / 2;
      band.position.y = currentY + h * 0.5;
      minaret.add(band);

      currentY += h;
    }

    // 3. Minaret Crown: Lotus Petal Collar & Bulbous Onion Dome
    const collarRadius = tierRadii[tierRadii.length - 1];

    // Lotus petal flared capital
    const capital = new THREE.Mesh(
      new THREE.CylinderGeometry(collarRadius * 1.35, collarRadius * 0.9, 0.014, 16),
      this.materials.trim
    );
    capital.position.y = currentY + 0.007;
    minaret.add(capital);
    currentY += 0.014;

    // Bulbous ribbed onion dome
    const domeGeom = new THREE.SphereGeometry(collarRadius * 1.25, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.85);
    const dome = new THREE.Mesh(domeGeom, this.materials.dome);
    dome.position.y = currentY + collarRadius * 0.7;
    dome.scale.set(1, 1.3, 1);
    dome.castShadow = true;
    minaret.add(dome);
    currentY += collarRadius * 1.8;

    // Gilded Brass Finial / Spire
    const finialGroup = new THREE.Group();
    finialGroup.position.y = currentY;

    // Base orb
    const finialOrb = new THREE.Mesh(
      new THREE.SphereGeometry(0.006, 12, 12),
      this.materials.gold
    );
    finialOrb.position.y = 0.004;
    finialGroup.add(finialOrb);

    // Spire cone
    const finialSpire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.001, 0.003, 0.022, 8),
      this.materials.gold
    );
    finialSpire.position.y = 0.016;
    finialGroup.add(finialSpire);

    minaret.add(finialGroup);

    return minaret;
  }

  private createMinaretBalcony(shaftRadius: number): THREE.Group {
    const balconyGroup = new THREE.Group();
    const balconyRadius = shaftRadius + 0.014;

    // Bracketed corbel support
    const corbel = new THREE.Mesh(
      new THREE.CylinderGeometry(balconyRadius, shaftRadius * 0.85, 0.008, 16),
      this.materials.trim
    );
    corbel.position.y = 0.004;
    balconyGroup.add(corbel);

    // Floor disc
    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(balconyRadius + 0.002, balconyRadius, 0.004, 18),
      this.materials.trim
    );
    floor.position.y = 0.009;
    balconyGroup.add(floor);

    // Ornate jali pierced balustrade railing
    const railing = new THREE.Mesh(
      new THREE.CylinderGeometry(balconyRadius + 0.002, balconyRadius + 0.002, 0.012, 18, 1, true),
      this.materials.trim
    );
    railing.position.y = 0.016;
    balconyGroup.add(railing);

    return balconyGroup;
  }

  private buildClocks(parent: THREE.Group): void {
    const clockRadius = 0.018;
    const clockY = 0.028 + 0.18 + 0.072; // ~0.28m

    [0, Math.PI / 2, Math.PI, -Math.PI / 2].forEach((rot) => {
      const clockGroup = new THREE.Group();
      clockGroup.rotation.y = rot;

      // Clock ornamental pediment crest
      const crest = new THREE.Mesh(
        new THREE.ConeGeometry(0.025, 0.015, 3),
        this.materials.trim
      );
      crest.rotation.z = Math.PI;
      crest.position.set(0, clockY + 0.022, 0.181);
      clockGroup.add(crest);

      // Gold rim
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(clockRadius, 0.003, 8, 24),
        this.materials.gold
      );
      rim.position.set(0, clockY, 0.181);
      clockGroup.add(rim);

      // White clock face
      const face = new THREE.Mesh(
        new THREE.CircleGeometry(clockRadius, 24),
        this.materials.clockFace
      );
      face.position.set(0, clockY, 0.1815);
      clockGroup.add(face);

      // Clock hands (pointing to 10:10 historic aesthetic)
      const hourHand = new THREE.Mesh(
        new THREE.BoxGeometry(0.0015, 0.009, 0.001),
        this.materials.clockBorder
      );
      hourHand.rotation.z = -Math.PI / 4;
      hourHand.position.set(-0.003, clockY + 0.003, 0.182);
      clockGroup.add(hourHand);

      const minuteHand = new THREE.Mesh(
        new THREE.BoxGeometry(0.0012, 0.013, 0.001),
        this.materials.clockBorder
      );
      minuteHand.rotation.z = Math.PI / 6;
      minuteHand.position.set(0.003, clockY + 0.005, 0.182);
      clockGroup.add(minuteHand);

      parent.add(clockGroup);
    });
  }

  private buildGroundShadow(parent: THREE.Group): void {
    // Soft radial gradient for ambient contact shadow beneath the monument
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const ctx = shadowCanvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(128, 128, 40, 128, 128, 128);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);
    }

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.65, 0.65),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
      })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.001;
    shadowPlane.name = 'ContactShadow';
    parent.add(shadowPlane);
  }

  /**
   * Sets wireframe mode across all monument materials for blueprint X-Ray view.
   */
  public setWireframe(enabled: boolean): void {
    Object.values(this.materials).forEach((mat) => {
      mat.wireframe = enabled;
    });
  }

  /**
   * Updates materials for Night Festival Illumination vs Golden Hour.
   */
  public setLightingPreset(isNight: boolean): void {
    if (isNight) {
      this.materials.stone.color.setHex(0xe8d098);
      this.materials.trim.color.setHex(0xd4af6a);
      this.materials.dome.color.setHex(0xf5df95);
      this.materials.gold.color.setHex(0xffcb42);
      this.materials.gold.emissive.setHex(0x3a2805);
      this.materials.stone.emissive.setHex(0x221808);
    } else {
      this.materials.stone.color.setHex(0xdfd3be);
      this.materials.trim.color.setHex(0xd0c0a8);
      this.materials.dome.color.setHex(0xe5d8be);
      this.materials.gold.color.setHex(0xe6b840);
      this.materials.gold.emissive.setHex(0x000000);
      this.materials.stone.emissive.setHex(0x000000);
    }
  }

  public dispose(): void {
    this.stoneTexture.dispose();
    Object.values(this.materials).forEach((mat) => mat.dispose());
  }
}
