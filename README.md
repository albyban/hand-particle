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

---

**Nota**: Non è stato possibile accedere al file `ParticleSystem.tsx` per analizzare i dettagli dell'implementazione del sistema particelle e dei suoi update mechanism in tempo reale.
