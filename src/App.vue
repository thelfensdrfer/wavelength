<script lang="ts" setup>
import {computed, onUnmounted, ref} from "vue";

type Wave = {
    left: string;
    right: string;
    category: string;
}

const seed = 12345;
const currentRound = ref(-1);
const currentState = ref<'start' | 'randomizing' | 'revealed-hint' | 'selecting' | 'revealed-solution'>('start');
const randomPointCenter = ref<number | null>(null);
const arrowAngle = ref(0);
const selectedValue = ref<number | null>(null);
const hoverValue = ref<number | null>(null);
let randomizeRaf: number | null = null;
const randomizeDuration = 5000; // ms
const arrowLength = 350;
const pointsMin = 1;
const pointsMax = 25;
const sliceRadius = 400;

const arrowAngleRad = computed(() => arrowAngle.value * Math.PI / 180);
const arrowX = computed(() => 500 + Math.cos(arrowAngleRad.value) * arrowLength);
const arrowY = computed(() => 500 + Math.sin(arrowAngleRad.value) * arrowLength);

const waves: Wave[] = [
    {category: 'Allgemein', left: "Strahlend (hell leuchtend)", right: "Schattenhaft (in Dunkel gehüllt)"},
    {
        category: 'Allgemein',
        left: "Spritzig (voll Geschmack und Energie)",
        right: "Geschmacklos (eintönig wie abgestandenes Wasser)"
    },
    {category: 'Allgemein', left: "Schaumig (leicht und sprudelnd)", right: "Zähflüssig (dick und träge)"},
    {category: 'Allgemein', left: "Körnig (rau und robust)", right: "Blitzsauber (makellos und glänzend)"},
    {
        category: 'Allgemein',
        left: "Spontan (unvorhersehbar und spaßig)",
        right: "Akribisch (ganz genau und sorgfältig)"
    },
    {category: 'Allgemein', left: "Verspielt (fantasievoll)", right: "Stoisch (unerschütterlich ernst)"},
    {category: 'Allgemein', left: "Elektrisierend (vor Energie summend)", right: "Lethargisch (schneckentempo)"},
    {category: 'Allgemein', left: "Hypnotisch (faszinierend und geschmeidig)", right: "Schockierend (stoßend und rau)"},
    {category: 'Allgemein', left: "Sprudelnd (lebhaft und beschwingt)", right: "Stagnierend (stillstehend und leblos)"},
    {category: 'Allgemein', left: "Skurril (liebenswert eigenartig)", right: "Alltäglich (langweilig normal)"},

    {category: 'Pop Culture', left: "Harry Potter (Held)", right: "Voldemort (Schurke)"},
    {category: 'Pop Culture', left: "Superman (Held)", right: "Lex Luthor (Schurke)"},
    {category: 'Pop Culture', left: "Gryffindor (Hogwarts-Haus)", right: "Slytherin (Hogwarts-Haus)"},
    {category: 'Pop Culture', left: "Batman (Held)", right: "Joker (Schurke)"},
    {category: 'Pop Culture', left: "Sherlock Holmes (Detektiv)", right: "Moriarty (kriminelles Genie)"},
    {category: 'Pop Culture', left: "Mario (Held)", right: "Bowser (Bösewicht)"},

    {
        category: 'Brettspiele',
        left: "Knifflige Strategie (geistig anstrengend)",
        right: "Party-Chaos (wild und unvorhersehbar)"
    },
    {
        category: 'Brettspiele',
        left: "Kooperative Teamarbeit (zusammenarbeiten)",
        right: "Kompetitiver Wahnsinn (jeder für sich)"
    },
    {category: 'Brettspiele', left: "Schnellspiel (kurz und intensiv)", right: "Epischer Marathon (lange Partie)"},
    {category: 'Brettspiele', left: "Würfeln (dem Glück überlassen)", right: "Karten-Draft (perfekte Hand planen)"},
    {
        category: 'Brettspiele',
        left: "Abstraktes Rätselspiel (reine Strategie)",
        right: "Storygetriebenes Epos (fesselnde Erzählung)"
    },
    {
        category: 'Brettspiele',
        left: "Stilles Deduktionsspiel (leise Rätsel lösen)",
        right: "Laute Bluff-Session (frech vortäuschen)"
    },
    {
        category: 'Brettspiele',
        left: "Minimalistische Eleganz (schlicht und einfach)",
        right: "Übertriebene Deluxe-Version (mit allem Drum und Dran)"
    },
    {
        category: 'Brettspiele',
        left: "Old-School-Klassiker (zeitlose Tradition)",
        right: "Hochmoderne Innovation (frisch und neu)"
    },
    {
        category: 'Brettspiele',
        left: "Kachelplatzierung (baue deine Welt)",
        right: "Gebietskontrolle (herrsche über die Karte)"
    },
    {
        category: 'Brettspiele',
        left: "Solo-Herausforderung (allein gegen das Spiel)",
        right: "Soziales Duell (alle gegeneinander)"
    },
];

function startRandomizeAnimation() {
    const startTime = performance.now();
    const startDeg = (arrowAngle.value + 360) % 360;
    const endDeg = randomPointCenterDegree.value ?? (180 + Math.random() * 180);
    const spins = 4;

    function loop(now: number) {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / randomizeDuration);

        // ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);

        // spin down while easing to the final degree
        const angle = startDeg + (spins * 360) * (1 - eased) + (endDeg - startDeg) * eased;
        arrowAngle.value = angle % 360;

        if (progress < 1) {
            randomizeRaf = requestAnimationFrame(loop);
        } else {
            arrowAngle.value = endDeg % 360;
            currentState.value = 'revealed-hint';
            randomizeRaf = null;
        }
    }

    if (randomizeRaf) {
        cancelAnimationFrame(randomizeRaf);
    }

    randomizeRaf = requestAnimationFrame(loop);
}

onUnmounted(() => {
    if (randomizeRaf) {
        cancelAnimationFrame(randomizeRaf);
        randomizeRaf = null;
    }
});

function random(seed: number) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function shuffle(array: any[], seed: number) {
    let m = array.length;
    let t: any;
    let i: number;

    while (m) {
        i = Math.floor(random(seed) * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
        ++seed
    }

    return array;
}

const randomWaves = computed(() => {
    return shuffle(waves.slice(), seed);
});

const currentCategory = computed(() => {
    if (currentRound.value < 0) {
        return "";
    }

    return randomWaves.value[currentRound.value].category;
});

const wordLeft = computed(() => {
    if (currentRound.value < 0) {
        return "";
    }

    return randomWaves.value[currentRound.value].left;
});

const wordRight = computed(() => {
    if (currentRound.value < 0) {
        return "";
    }

    return randomWaves.value[currentRound.value].right;
});

const selectedNumber = computed(() => {
    if (selectedValue.value === null) {
        return null;
    }

    // The selected value is between 0.5 (100% left) and 1 (100% right), map it to a number between 1 and 25 (number of circles)
    const minValue = 0.5;
    const maxValue = 1;

    return Math.round(1 + (selectedValue.value - minValue) * (pointsMax - maxValue) / (pointsMin - minValue))
});

const hoverNumber = computed(() => {
    if (hoverValue.value === null) {
        return null;
    }

    const minValue = 0.5;
    const maxValue = 1;

    return Math.round(1 + (hoverValue.value - minValue) * (pointsMax - maxValue) / (pointsMin - minValue))
});

const reveal = () => {
    currentState.value = 'revealed-solution';
};

const arrowMove = (event: MouseEvent) => {
    if (currentState.value !== 'selecting') {
        return;
    }

    if (selectedValue.value !== null) {
        return;
    }

    const svg = event.currentTarget as SVGSVGElement;
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const cursorPosition = pt.matrixTransform(svg.getScreenCTM().inverse());

    const dx = cursorPosition.x - 500;
    const dy = cursorPosition.y - 500;
    const angleRad = Math.atan2(dy, dx);
    arrowAngle.value = angleRad * 180 / Math.PI;

    const angle = (arrowAngle.value + 360) % 360;
    hoverValue.value = angle / 360;
}

const arrowSelect = () => {
    if (currentState.value !== 'selecting') {
        return;
    }

    if (selectedValue.value) {
        selectedValue.value = null;
        return;
    }

    const angle = (arrowAngle.value + 360) % 360;
    selectedValue.value = angle / 360;
};

const skip = () => {
    initNextRound();
};

const clickDial = () => {
    if (currentState.value === 'randomizing') {
        currentState.value = 'revealed-hint';
        return;
    }

    if (currentState.value === 'revealed-hint') {
        currentState.value = 'selecting';
        return;
    }

    if (currentState.value === 'selecting') {
        arrowSelect();
        return;
    }
}

const initNextRound = () => {
    if (currentRound.value + 1 >= randomWaves.value.length) {
        alert("Keine weiteren Begriffe mehr übrig!");
        return;
    }

    currentRound.value += 1;
    currentState.value = 'randomizing';
    selectedValue.value = null;
    hoverValue.value = null;
    arrowAngle.value = 0;
};

/**
 * Select a random integer between pointsMin and pointsMax.
 */
const randomizePoints = () => {
    randomPointCenter.value = Math.floor(Math.random() * (pointsMax - pointsMin + 1)) + pointsMin;

    // Reset game states
    initNextRound();
    startRandomizeAnimation();
}

const randomPointCenterDegree = computed(() => {
    if (randomPointCenter.value === null) {
        return null;
    }

    return 180 + ((randomPointCenter.value - 1) / (pointsMax - 1)) * 180;
});

const sliceWidthDeg = computed(() => {
    return 180 / (pointsMax - 1);
});

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
    const rad = (angleDeg) * Math.PI / 180;
    return {
        x: cx + Math.cos(rad) * radius,
        y: cy + Math.sin(rad) * radius
    };
}

function arcPath(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
    // Clamp to semicircle bounds
    const s = Math.max(180, Math.min(360, startAngle));
    const e = Math.max(180, Math.min(360, endAngle));
    const start = polarToCartesian(cx, cy, radius, s);
    const end = polarToCartesian(cx, cy, radius, e);

    // determine if arc is larger than 180 degrees
    const largeArcFlag = (e - s) % 360 > 180 ? 1 : 0;
    // sweep = 1 to draw in increasing-angle (clockwise) direction
    const sweepFlag = 1;

    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y} Z`;
}

const hintSlices = computed(() => {
    if (randomPointCenter.value === null) {
        return [] as { start: number; end: number; color: string }[];
    }

    const centerDeg = randomPointCenterDegree.value as number;
    const delta = sliceWidthDeg.value;
    const offsets = [-2, -1, 0, 1, 2];

    // colors: outer, inner, center
    const colorMap: Record<number, string> = {
        0: "#ff4d4f",   // center (strong)
        1: "#ffa940",   // immediate neighbors (warm)
        2: "#ffd666"    // outer neighbors (light)
    };

    return offsets.map((off) => {
        const deg = centerDeg + off * delta;
        const start = deg - delta / 2;
        const end = deg + delta / 2;

        const absOff = Math.min(Math.abs(off), 2);
        const color = colorMap[absOff];

        return {start, end, color};
    }).filter(s => s.end > 180 && s.start < 360); // keep slices that intersect semicircle
});
</script>

<template>
    <main class="bg-red-700 text-white min-h-screen box-border w-screen p-8 antialiased">
        <div class="w-full max-w-7xl mx-auto mt-8">
            <h3 v-text="currentCategory" class="font-bold uppercase text-5xl text-center"></h3>

            <svg viewBox="0 0 1000 500" class="w-full h-auto cursor-pointer" xmlns="http://www.w3.org/2000/svg"
                 @mousemove="arrowMove" @click="clickDial">
                <!-- arrow definition -->
                <defs>
                    <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="10"
                        refX="8"
                        refY="5"
                        orient="auto"
                        markerUnits="strokeWidth">
                        <path d="M 0 0 L 10 5 L 0 10 Z" fill="#000"/>
                    </marker>
                </defs>

                <!-- shape + "cloud" border bumps (only on the rounded part) -->
                <g fill="#fff">
                    <!-- base half circle -->
                    <path d="M 100 500 A 400 400 0 0 1 900 500 L 900 500 L 100 500 Z"/>

                    <!-- scalloped border (small circles placed along the arc; endpoints omitted to keep bottom flat) -->
                    <circle cx="101" cy="500" r="28"/>
                    <circle cx="103.4" cy="447.8" r="28"/>
                    <circle cx="113.6" cy="396.5" r="28"/>
                    <circle cx="130.4" cy="346.9" r="28"/>
                    <circle cx="153.6" cy="300.0" r="28"/>
                    <circle cx="182.7" cy="256.5" r="28"/>
                    <circle cx="217.2" cy="217.2" r="28"/>
                    <circle cx="256.5" cy="182.7" r="28"/>
                    <circle cx="300.0" cy="153.6" r="28"/>
                    <circle cx="346.9" cy="130.4" r="28"/>
                    <circle cx="396.5" cy="113.6" r="28"/>
                    <circle cx="447.8" cy="103.4" r="28"/>
                    <circle cx="500.0" cy="100.0" r="28"/>
                    <circle cx="552.2" cy="103.4" r="28"/>
                    <circle cx="603.5" cy="113.6" r="28"/>
                    <circle cx="653.1" cy="130.4" r="28"/>
                    <circle cx="700.0" cy="153.6" r="28"/>
                    <circle cx="743.5" cy="182.7" r="28"/>
                    <circle cx="782.8" cy="217.2" r="28"/>
                    <circle cx="817.3" cy="256.5" r="28"/>
                    <circle cx="846.4" cy="300.0" r="28"/>
                    <circle cx="869.6" cy="346.9" r="28"/>
                    <circle cx="886.4" cy="396.5" r="28"/>
                    <circle cx="896.6" cy="447.8" r="28"/>
                    <circle cx="900.0" cy="500.0" r="28"/>
                </g>

                <g v-if="currentState === 'revealed-hint' || currentState === 'revealed-solution'">
                    <path
                        v-for="(s, i) in hintSlices"
                        :key="i"
                        :d="arcPath(500, 500, sliceRadius, s.start, s.end)"
                        :fill="s.color"
                        opacity="0.85"
                    />
                </g>

                <!-- arrow from bottom center to the selected position -->
                <line
                    v-if="currentState === 'selecting' || currentState === 'revealed-solution' || currentState === 'randomizing'"
                    x1="500"
                    y1="505"
                    :x2="arrowX"
                    :y2="arrowY"
                    stroke="#000"
                    stroke-width="10"
                    marker-end="url(#arrowhead)"
                />
            </svg>

            <div class="flex justify-between mt-4 text-3xl gap-12">
                <div class="flex gap-2 w-1/3" v-if="wordLeft">
                    <span>←</span>
                    <span>{{ wordLeft }}</span>
                </div>

                <div class="font-bold text-center transition">
                    <div v-text="selectedNumber || hoverNumber" class="text-5xl"
                         :class="{'text-gray-300': selectedNumber === null || currentState === 'revealed-solution'}"></div>
                    <div v-if="currentState === 'revealed-solution'">
                        <p class="text-3xl">Lösung: {{ randomPointCenter }}</p>
                        <p class="text-7xl">{{ Math.max(0, 3 - Math.abs(randomPointCenter - selectedNumber)) }}
                            Punkte</p>
                    </div>
                </div>

                <div class="flex justify-end gap-2 w-1/3" v-if="wordRight">
                    <span class="text-right">{{ wordRight }}</span>
                    <span>→</span>
                </div>
            </div>
        </div>

        <aside class="flex gap-8 justify-center mt-12">
            <button class="button-secondary" @click="skip"
                    v-if="currentState === 'start' || currentState === 'revealed-solution'">
                Begriffe überspringen
            </button>

            <button class="button-primary" @click="randomizePoints" v-if="currentState === 'start'">
                Starten (Spieler umdrehen)
            </button>

            <button class="button-primary" @click="randomizePoints" v-if="currentState === 'revealed-solution'">
                Nächste Runde (Spieler umdrehen)
            </button>

            <button class="button-primary" @click="reveal"
                    v-if="currentState === 'selecting' && selectedValue !== null">
                Aufdecken
            </button>
        </aside>
    </main>
</template>

<style scoped>
@reference "./assets/main.css";

button {
    @apply border-2 border-transparent font-bold py-2 px-4 rounded-full transition cursor-pointer;
}

.button-primary {
    @apply bg-white text-red-700 hover:bg-red-700 hover:text-white hover:border-white;
}

.button-secondary {
    @apply bg-transparent text-white border-white hover:bg-white hover:text-red-700;
}
</style>
