# Analisi del Repository hand-particle

## 📋 Panoramica Generale

**hand-particle** è un'applicazione web interattiva che combina il riconoscimento gestuale della mano tramite MediaPipe con un sofisticato sistema di particelle 3D basato su Three.js. L'applicazione permette agli utenti di controllare visivamente particelle attraverso i movimenti delle mani, con numerose opzioni di personalizzazione.

**Stack Tecnologico:**
- **Frontend**: React 18.3.1 + TypeScript 5.5.3
- **Build Tool**: Vite 5.4.2
- **3D Graphics**: Three.js 0.181.2 + Post-processing 6.38.0
- **Hand Tracking**: MediaPipe Hands 0.4
- **UI Styling**: Tailwind CSS 3.4.1
- **Color Picker**: react-colorful 5.6.1
- **Icons**: lucide-react 0.344.0

## 🏗️ Struttura del Progetto

```
src/
├── components/
│   ├── App.tsx                    # Componente principale
│   ├── ThreeScene.tsx             # Scena 3D e rendering
│   ├── EnhancedControlPanel.tsx   # UI di controllo
│   ├── HandIndicator.tsx          # Indicatore stato mani
│   ├── PerformanceMonitor.tsx     # Monitor FPS
│   ├── HandFeedbackRings.tsx      # Feedback visivo mani
│   └── ParticleSystem.tsx         # Sistema particelle (non recuperato)
├── hooks/
│   └── useHandTracking.ts         # Hook per riconoscimento mani
└── utils/
    ├── particleTemplates.ts       # 7 template di forme particelle
    ├── colorPresets.ts            # Preset colori
    └── gestureDetection.ts        # Rilevamento gesti
```

## 🔍 Componenti Principali

### 1. **App.tsx** - Componente Root
Gestisce lo stato globale e coordina tutti i componenti:

**State Management:**
- `selectedTemplate`: Forma delle particelle (sphere, torus, helix, dna, galaxy, star, saturn)
- `particleColor`: Colore in formato hex
- `bloomEnabled/bloomIntensity`: Effetto bloom post-processing
- `particleSize/particleOpacity`: Proprietà visuali particelle
- `particleDensity`: Numero di particelle (5k-25k)
- `pulsateIntensity`: Intensità pulsazione particelle
- `autoRotateSpeed`: Rotazione automatica oggetto
- `backgroundColor`: Colore sfondo scena
- `leftHandEnabled/rightHandEnabled`: Toggle per controllare singole mani
- `showHandDots`: Visualizzazione punti di riferimento mani

**Flusso Dati:**
Raccoglie dati da `useHandTracking` e li passa filtrati al componente `ThreeScene`, oltre a passare tutti gli stati al pannello di controllo.

### 2. **useHandTracking.ts** - Hook per Tracciamento Mani
Gestisce l'integrazione con MediaPipe per il riconoscimento gestuale.

**Funzionalità Principali:**

- **Inizializzazione MediaPipe**: Carica la libreria da CDN jsdelivr.net
- **Rilevamento Landmark**: Estrae 21 punti di riferimento per ogni mano
- **Calcolo Openness**: Determina quanto è aperta la mano (0-1)
  - Calcola distanza tra punte dita e centro palmo
  - Compara con distanza tra base dita e centro palmo
  
- **Posizionamento 3D**: Converte coordinati 2D video in spazio 3D
  ```
  x: (wrist.x - 0.5) * 2
  y: -(wrist.y - 0.5) * 2
  z: wrist.z * -2
  ```

- **Rotazione Polso**: Calcola rotazione su 3 assi usando:
  - Vettore tra indice e mignolo (asse Z)
  - Vettore dito medio verso avanti (assi X e Y)

- **Rilevamento Pizzico**: Usa funzione `detectPinch()` per gesti speciali

**Interfaccia HandState:**
```typescript
{
  isOpen: boolean;
  openness: number;          // 0-1
  position: { x, y, z };
  rotation: { x, y, z };
  isDetected: boolean;
  isPinching: boolean;
  landmarks?: any[];
}
```

### 3. **ThreeScene.tsx** - Rendering 3D
Gestisce la scena Three.js con effetti post-processing e interazione manuale.

**Configurazione Scene:**
- Camera: Prospettiva, FOV=75°, posizionata a z=5
- Renderer: Con anti-aliasing, supporto pixel ratio device
- Luci: Ambient (0.5) + Directional (0.5)
- Post-processing: EffectComposer con Bloom effect

**Interazione con Mani:**
1. Se entrambe le mani rilevate:
   - Distanza tra mani → scala particelle (70% peso)
   - Apertura mano destra → scala particelle (30% peso)
   - `scale = max(0.1, min(8, distanceScale*0.7 + opennessScale*0.3))`

2. Se solo mano destra rilevata:
   - Apertura mano → scala particelle direttamente
   - `scale = rightHand.openness * 6`

3. Rotazione particelle seguono rotazione mano destra

4. **Gesto Pizzico (Left Hand)**: Cambia colore a quello successivo nella lista

**Effetti Implementati:**
- Bloom post-processing (UnrealBloomPass)
- Pulsazione particelle
- Rotazione automatica
- Controllo colore e opacità in tempo reale

### 4. **EnhancedControlPanel.tsx** - UI di Controllo
Pannello collassabile con sezioni organizzate.

**Sezioni:**
1. **Templates**: Selector visuale 7 forme diverse
2. **Colors**: Preset colori + color picker custom
3. **Particle Settings**: Density, Size, Opacity, Pulsate
4. **Effects**: Bloom toggle/intensity, Auto-rotate
5. **Hand Tracking**: Toggle singole mani, visualizzazione dots
6. **Background**: Color picker per sfondo

**UI Details:**
- Design glassmorphism con backdrop blur
- Slider con valori formattati (k, %, decimali)
- Toggle switches custom
- Icon feedback visivo (lucide-react)
- Responsive su viewport piccoli

## 🎨 Template di Particelle

Il file `particleTemplates.ts` contiene 7 template procedurali:

### 1. **Sphere** 
Distribuzione uniforme su sfera usando coordinate sferiche:
```
phi = arccos(2*random - 1)
theta = random * 2π
x = r*sin(phi)*cos(theta)
```

### 2. **Torus**
Distribuzione su toro (donut shape):
```
u = random * 2π
v = random * 2π
x = (R + r*cos(v))*cos(u)
```

### 3. **Helix**
Elica 3D con rumore:
```
t = i/count (0-1)
angle = t * 2π * coils
y = (t - 0.5) * height
+ random noise
```

### 4. **DNA**
Doppia elica con barre trasversali:
- 60% particelle: Due strand elicoidali
- 40% particelle: Barre trasversali che connettono i strand

### 5. **Galaxy**
Bracci spirali con distribuzione power-law:
```
t = random^0.7 (concentra verso centro)
angle = (arm/arms)*2π + t*4π
radius = t * 3
```

### 6. **Star**
Stella a 5 punte con raggi:
- Alterna tra raggio esterno e interno
- Particelle distribuite lungo i raggi

### 7. **Saturn**
Pianeta Saturno con anelli:
- 60% particelle: Sfera centrale
- 40% particelle: Anello intorno alla sfera

## 🔄 Flusso di Dati

```
MediaPipe Video → useHandTracking Hook
                         ↓
                   HandTrackingData
                    /            \
                   ↓              ↓
            ThreeScene      EnhancedControlPanel
            (Rendering)     (UI Controls)
                   ↓              ↓
            ParticleSystem ← State Updates
            (Position, Scale,
             Rotation, Color)
```

## 🎯 Funzionalità Principali

### Controllo Particelle
- **Scala**: Controllata da distanza tra mani e/o apertura mano
- **Rotazione**: Segue rotazione polso mano destra
- **Colore**: Selezionabile da preset o custom color picker
- **Densità**: Modificabile dinamicamente (5k-25k particelle)
- **Effetti**: Pulsazione, bloom, opacità, rotazione automatica

### Gesti
- **Pizzico con mano sinistra**: Cicla attraverso colori preset
- **Apertura/chiusura mani**: Controlla scala
- **Rotazione polso**: Controlla orientamento particelle

### Performance
- Monitor FPS incorporato
- Toggle mani per ridurre carico computazionale
- Ottimizzazione di densità particelle

## ⚙️ Considerazioni Tecniche

### Punti di Forza
1. **Architettura modulare**: Separazione netta tra logica, UI e 3D
2. **Responsive**: Si adatta ai resize window
3. **Performance conscious**: FPS monitor, toggle mani
4. **UX polished**: Pannello collassabile, transizioni smooth
5. **Estensibile**: Facile aggiungere template e colori

### Possibili Miglioramenti
1. **ParticleSystem.ts**: Necessario vedere l'implementazione del sistema particelle
2. **Gesture Detection**: Attualmente solo pizzico, potrebbe supportare più gesti
3. **Persistenza**: Nessuno stato salvato (no localStorage)
4. **Mobile**: Necessario testare su dispositivi mobili
5. **Accessibilità**: Potrebbe beneficiare di ARIA labels
6. **WebWorkers**: Post-processing pesante potrebbe usare worker thread

### Ottimizzazioni Possibili
1. **Instancing**: Usare InstancedBufferGeometry per migliore performance
2. **LOD (Level of Detail)**: Ridurre dettagli a distanza
3. **Caching geometrie**: Riusare geometrie uguali tra template
4. **Debouncing**: Input da slider potrebbe essere debounced

## 🖐️ Gestione dei Gesti - Approfondimento

### Architettura Gestuale

Il sistema di riconoscimento gesti è modulare e basato su **MediaPipe Landmarks** (21 punti di riferimento per mano):

```
Landmark indices per mano:
0   = Wrist (polso)
1-4 = Thumb (pollice)
5-8 = Index (indice)
9-12 = Middle (medio)
13-16 = Ring (anulare)
17-20 = Pinky (mignolo)
```

### 1. Pizzico (Pinch) - Implementato e Attivo

**Trigger Condition:**
```typescript
distance(thumbTip, indexTip) < 0.05
```

Misura la distanza Euclidea 3D tra:
- Landmark 4 (punta pollice)
- Landmark 8 (punta indice)

**Soglia**: 0.05 unità nello spazio 3D normalizzato di MediaPipe

**Effetto nel Progetto:**
1. Cambia il colore delle particelle al successivo nella lista
2. Visivamente nel `HandFeedbackRings`:
   - Colore anello diventa verde brillante (#00ffaa)
   - Scale aumenta con pulsazione (1.2-1.4x)
   - Opacità aumenta di 0.4
3. Cicla infinitamente attraverso i 9 colori preset

**Flusso di Attivazione:**
```
useHandTracking Hook
  ↓
detectPinch(leftHand.landmarks) → isPinching: boolean
  ↓
ThreeScene.tsx monitora leftHand.isPinching
  ↓
detecta transizione false→true
  ↓
onColorChange(nextColor)
  ↓
ParticleSystem.setColor(newColor)
```

**State Management Pizzico:**
```typescript
// In ThreeScene.tsx
const lastPinchStateRef = useRef(false);

useEffect(() => {
  if (leftHand.isPinching && !lastPinchStateRef.current) {
    // Transizione: not pinching → pinching
    const nextIndex = (currentColorIndex + 1) % colorPresets.length;
    setCurrentColorIndex(nextIndex);
    onColorChange(colorPresets[nextIndex].color);
  }
  lastPinchStateRef.current = leftHand.isPinching;
}, [handData, currentColorIndex, onColorChange]);
```

**Perché questa implementazione è robusta:**
- Triggered su **edge detection** (transizione di stato), non su stato continuo
- Previene spam di cambi colore (solo al passaggio da non-pizzico a pizzico)
- Mantiene stato con `useRef` per confronto frame-to-frame

### 2. Thumbs Up (Implementato ma Non Utilizzato)

**Trigger Condition:**
```typescript
thumbTip.y < thumbIP.y                          // Pollice verso l'alto
&& indexTip.y > indexMCP.y                      // Indice verso il basso
&& middleTip.y > middleMCP.y                    // Medio verso il basso
&& ringTip.y > ringMCP.y                        // Anulare verso il basso
&& pinkyTip.y > pinkyMCP.y                      // Mignolo verso il basso
```

**Validazione:**
- Landmark 4 (thumbTip) più alto di Landmark 3 (thumbIP)
- Landmark 8 più basso di Landmark 5 (indexMCP)
- Landmark 12 più basso di Landmark 9 (middleMCP)
- Landmark 16 più basso di Landmark 13 (ringMCP)
- Landmark 20 più basso di Landmark 17 (pinkyMCP)

**Note:**
- Attualmente dichiarato in `gestureDetection.ts` ma non usato
- Potrebbe essere esteso per: reset colore, toggle effetti, etc.
- Richiede coordinazione: tutte le dita giù + pollice su

### 3. Peace Sign / V-Sign (Implementato ma Non Utilizzato)

**Trigger Condition:**
```typescript
indexTip.y < indexMCP.y                         // Indice su
&& middleTip.y < middleMCP.y                    // Medio su
&& ringTip.y > ringMCP.y                        // Anulare giù
&& pinkyTip.y > pinkyMCP.y                      // Mignolo giù
```

**Validazione:**
- Solo indice e medio alzati
- Anulare e mignolo abbassati

**Note:**
- Non integrato nell'UI attualmente
- Potrebbe controllare: toggle bloom, reset zoom, menu di selezione

### Architettura di Feedback Visivo

#### HandFeedbackRings - Anelli 3D (PRESENTE MA NON VISIBILE - BUG)

**⚠️ Nota Importante**: Questo componente è nel codice ma **non produce feedback visibile**. Ecco perché:

Il componente crea sfere 3D posizionate nello spazio della scena, ma a causa di un **errore di posizionamento Z**, le sfere finiscono fuori dal frustum della camera (dietro di essa).

**Sfera Sinistra (Left Hand Ring):**
```
Geometria:  SphereGeometry(0.03 radius, 16x16 segments)
Colore base: #4a9eff (azzurro chiaro)
Blending:   ADDITIVO (si somma con bloom)

Comportamento:
- Posizione: Segue wrist position della mano sinistra
- Opacità base: 0.3 + sin(time) * 0.15 (pulsazione morbida 0.15-0.45)

Se isPinching:
  - Colore → #00ffaa (verde brillante)
  - Scale → 1.2 + sin(time*3) * 0.2 (pulsazione rapida 1.0-1.4x)
  - Opacità → +0.4 aggiuntiva (totale 0.55-0.85)

Altrimenti:
  - Colore = #4a9eff
  - Scale = 1.0x (normale)
  - Opacità = 0.15-0.45
```

**Sfera Destra (Right Hand Ring):**
```
Geometria:  SphereGeometry(0.03 radius, 16x16 segments)
Colore base: #4a9eff (azzurro chiaro)
Blending:   ADDITIVO

Comportamento:
- Posizione: Segue wrist position della mano destra
- Opacità base: 0.3 + sin(time) * 0.15 (pulsazione morbida)

Sempre presente quando rilevata:
  - Scale: 0.4 + openness * 0.5
    → 0.4x (mano chiusa) a 0.9x (mano aperta)
  - Colore: Lerp tra #4a9eff e #ff4a9e
    → Azzurro (mano chiusa) a Rosa (mano aperta)
    
Questo crea una "mappa visiva" di apertura/chiusura della mano
```

**Asse Z Offset:**
```
leftRing.position.z = leftHand.position.z - 2
rightRing.position.z = rightHand.position.z - 2

Sposta gli anelli 2 unità dietro la posizione tracciata
Questo crea parallasse e evita che blocchino la visione
```

#### HandIndicator - Status Bar HTML

Componente React che mostra:

```
┌─────────────────────────────┐
│  Hand Detection             │
├─────────────────────────────┤
│ 🖐️ Left Hand     45%         │
│ [═══════════════       ]    │
│                             │
│ 🖐️ Right Hand    72%        │
│ [█████████████████     ]   │
├─────────────────────────────┤
│ Move hands closer/further   │
│ to scale particles...       │
└─────────────────────────────┘
```

**Update dinamico:**
- **Colore icona**: Verde (#10b981) se rilevata, grigio se no
- **Percentuale**: `round(hand.openness * 100)`
- **Barra progresso**: Verde se rilevata, grigio se no
- **Update frequenza**: Ogni render (60fps)

### Flusso Dati Complet per Gesti

```
┌─────────────────────────────────────────────────────────┐
│                    VIDEO STREAM                         │
│              (Browser webcam)                           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
        ┌────────────────────────────┐
        │   MediaPipe Hands Model    │
        │  (Caricato da CDN)         │
        └────────┬───────────────────┘
                 │
                 ↓
    ┌─────────────────────────────────┐
    │ 21 Landmarks per Mano (x,y,z)   │
    └────────┬────────────────────────┘
             │
             ↓
    ┌─────────────────────────────────────┐
    │ useHandTracking Hook                │
    │ Calcola:                            │
    │ - openness (distance-based)         │
    │ - position (wrist 3D)               │
    │ - rotation (vectors tra landmark)   │
    │ - isPinching (detectPinch)          │
    └────────┬────────────────────────────┘
             │
      ┌──────┴──────┬─────────────────┐
      ↓             ↓                 ↓
   ThreeScene  HandIndicator   HandFeedbackRings
   - Scale        (React UI)      (3D Spheres)
   - Rotate         HTML           Visual Cues
   - Color        Text +
                 Progress Bars
```

### Possibilità di Estensione

**Gesti Dichiarati ma Non Usati:**

1. **Thumbs Up**: Potrebbe
   - Resettare colore a default
   - Toggle ALL effetti (bloom, pulsate)
   - Salvare preset corrente
   - Pausa/Resume animazione

2. **Peace Sign**: Potrebbe
   - Aprire menu di selezione template
   - Flip tra mano sinistra/destra di controllo
   - Toggle FPS monitor
   - Resettare view camera

**Nuovi Gesti Possibili:**
- **OK Sign**: Cerchio pollice+indice → Toggle Fullscreen
- **Wave**: Movimento lineare rapido mano → Snapshot
- **Fist**: Tutte dita chiuse → Modalità sleep (rallenta rendering)
- **Spread Hand**: Dita divaricate → Zoom camera

### Latenza e Responsività

**Fattori che influenzano lag:**

1. **MediaPipe Processing**: ~30-50ms per frame
2. **Gesture Detection**: Istantanea (distanza 3D)
3. **React Re-render**: Dipende da complessità
4. **Three.js Update**: Parallelo a React
5. **GPU Sync**: Attesa needsUpdate flag

**Miglioramenti Possibili:**
- Implementare debounce per gesti persistenti
- Aggiungere smoothing con moving average
- Usare Web Workers per gesture detection
- Implementare confidence thresholds da MediaPipe

### Sicurezza e Privacy

**Considerazioni:**
- Video non è mai mandato a server esterno
- MediaPipe gira completamente nel browser
- Solo landmarks (21 punti) sono processati, mai pixels
- Nessun storage di dati gesturali

---

**Summary Gesti**:
- ✅ Pizzico: Completamente funzionale, integrato
- ⏳ Thumbs Up: Dichiarato, non usato
- ⏳ Peace Sign: Dichiarato, non usato
- 🎨 Feedback: Anelli 3D dinamici + Status bar HTML
- 🚀 Estendibile: Architettura permette facile aggiunta di nuovi gesti

## 📦 Dipendenze Critiche

- **MediaPipe**: Caricato da CDN, fallback graceful se non disponibile
- **Three.js**: Versione 0.181.2, include esempi JSM
- **React**: Per state management e component lifecycle
- **PostProcessing**: Per effetti bloom (6.38.0)

## 🚀 Deployment

- Build tool Vite (molto veloce)
- Dev server con HMR
- TypeScript strict checking
- ESLint per code quality
- Tailwind CSS per styling

## 🎯 ParticleSystem.ts - Il Cuore del Sistema

Questa è la classe core che gestisce il rendering e l'animazione delle particelle.

### Struttura Dati Interna

```typescript
// Posizioni e geometria
private basePositions: Float32Array          // Template originale
private currentPositions: Float32Array       // Posizioni trasformate in tempo reale

// Scala e rotazione (smooth interpolation)
private targetScale: number = 1
private currentScale: number = 1
private targetRotation: THREE.Euler
private currentRotation: THREE.Euler

// Animazione procedurale
private randomOffsets: Float32Array          // Offset random per noise
private randomSpeeds: Float32Array           // Velocità random per noise
private glowPhases: Float32Array             // Fase del glow per particella
private glowSpeeds: Float32Array             // Velocità del glow per particella

// Proprietà visive
private pulsateIntensity: number             // 0-1, intensità pulsazione
private autoRotateSpeed: number              // Velocità rotazione automatica
private colors: Float32Array                 // Colore per particella (RGB)
```

### Inizializzazione

Nel costruttore:

1. **Generazione Rumore Procedurale**: Per ogni particella crea
   - 3 offset random (per x, y, z) nel range [0, 2π]
   - 3 speed random (per x, y, z) nel range [0.5, 2.0]
   - Questi variano il movimento di ogni particella indipendentemente

2. **Glow Animazione**: Per ogni particella
   - Phase casuale in [0, 2π]
   - Speed casuale in [0.8, 2.6]
   - Crea effetto di "brillare" ondulante unico per ogni particella

3. **Texture Particella**: Canvas gradient radiale
   - Centro: bianco opaco (1.0)
   - Centro-bordo: bianco semi-trasparente (0.5)
   - Bordo: trasparente (0)
   - Crea effetto "glow" soft per ogni particella

4. **Materiale Three.js**
   ```
   - PointsMaterial con blending ADDITIVO (particelle si sommano)
   - Transparent + depthWrite:false (compositing corretto)
   - Vertex colors abilitati (per il glow animato)
   - Size attenuation (più piccole in lontananza)
   - Usa texture per forma soft
   ```

### Loop Update (Eseguito ogni frame)

```
1. Smooth Scale Interpolation
   currentScale += (targetScale - currentScale) * 0.1
   → Transizioni fluide della scala

2. Rotazione Smooth
   Se autoRotate attivo:
       currentRotation.y += autoRotateSpeed * 0.01
   Altrimenti:
       currentRotation += (targetRotation - currentRotation) * 0.1
   → Interpolazione suave o rotazione fissa

3. Pulsazione Dimensione
   size = targetSize + (baseSize * 0.5) * sin(time * 0.003) * pulsateIntensity
   → Effetto "respiro" controllato

4. Per Ogni Particella (loop critico per performance):
   
   a) Generazione Rumore:
      randomX = sin(time * speed[i] + offset[i]) * 0.02
      randomY = sin(time * speed[i+1] + offset[i+1]) * 0.02
      randomZ = sin(time * speed[i+2] + offset[i+2]) * 0.02
      → Movimento organico ondulante

   b) Scaling e Rumore:
      pos = (basePos + random) * currentScale
      → Particelle si muovono mentre vengono scalate

   c) Rotazione:
      pos = rotationMatrix.apply(pos)
      → Ruota tutte le particelle insieme

   d) Glow Animazione:
      glow = (sin(time * glowSpeed + glowPhase) + 1) * 0.5
      intensity = 0.2 + glow * 0.8
      → Ogni particella varia da 0.2 a 1.0 indipendentemente

5. Update GPU Attributes
   positionAttribute.needsUpdate = true
   colorAttribute.needsUpdate = true
   → Comunica al GPU che i dati sono cambiati
```

### Performance Insights

**Punti Critici:**
1. Loop ogni frame con `particleCount` iterazioni (fino a 25,000)
2. Operazioni trigonometriche costose: `sin()` per ogni particella
3. Matrix transform per ogni particella
4. GPU upload ogni frame

**Ottimizzazioni Implementate:**
- Uso di Float32Array (typed array) invece di Array
- Riuso buffer geometry (evita allocazione)
- Vertex colors instead of multiple materials
- Additive blending (meno overdraw)
- depthWrite:false (meno work GPU)

**Possibili Bottleneck:**
- Calcolo Math.sin() 3x per particella per rumore
- Calcolo Math.sin() 1x per particella per glow
- Totale: ~4 sin() per particella per frame
- A 60fps e 25k particelle = 6 milioni di sin() al secondo

### Meccanica del Movimento

1. **Base Movement**: Particelle mantengono forma ma vibrano leggermente
2. **Scale**: Tutta la forma cresce/shrink mantenendo forma
3. **Rotation**: Intero oggetto ruota come blocco
4. **Glow**: Indipendente da forma - ogni particella ha suo "brightness"

**Esempio flusso:**
```
Template sfera
    ↓ (ogni frame)
Ogni particella si sposta di ±0.02 casualmente
    ↓
Scala di 1.5x (utente apre mano)
    ↓
Ruota di 45° (utente ruota polso)
    ↓
Brightness oscilla da 0.2 a 1.0
    ↓
Render come Points (veloce)
```

### Qualità Visiva

**Effetti Realizzati:**
- Bloom post-processing (dall'esterno) + Vertex colors (dall'interno) = effetto luminoso doppio
- Texture soft + additive blending = particelle "brillano" insieme
- Glow animato indipendente = movimento vitale anche con scala/rotazione zero
- Rumore procedurale = movimento organico (non meccanico)

**Texture Radiale:**
Questo è il "segreto" dell'effetto visivo piacevole:
```
Canvas 32x32:
  radialGradient(16,16,0 a 16,16,16)
  0% = bianco opaco
  50% = bianco 50%
  100% = trasparente
```
Quando molte particelle si sovrappongono con blending additivo, creano un "bagliore" soft.

---

**Nota Finale**: L'implementazione è ottimizzata per visual appeal piuttosto che massima performance. Il numero limitato di particelle (max 25k) è una scelta consapevole per mantenere fluidità a 60fps su hardware vario.
