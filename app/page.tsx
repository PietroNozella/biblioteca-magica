"use client";

import type { CSSProperties, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

type Screen = "intro" | "rules" | "game" | "complete";
type FeedbackTone = "easter" | "error" | "neutral" | "success";

type Phase = {
  id: number;
  title: string;
  author: string;
  artifact: string;
  catalogCode: string;
  room: string;
  narrative: string;
  riddle: string;
  clue: string;
  answers: string[];
  hints: string[];
  errorMessage: string;
  successMessage: string;
  theme: {
    background: string;
    accent: string;
    accentSoft: string;
    shelf: string;
  };
};

type SavedProgress = {
  finished?: boolean;
  phaseIndex?: number;
  unlockedClues?: string[];
};

const STORAGE_KEY = "biblioteca-secreta-ludmila";
const OPENING_DELAY_MS = 1600;

const phases: Phase[] = [
  {
    id: 1,
    title: "Dom Casmurro",
    author: "Machado de Assis",
    artifact: "retrato em verniz escuro",
    catalogCode: "MCH-I",
    room: "Sala dos Olhos de Ressaca",
    narrative:
      "A primeira sala cheira a papel guardado e missa antiga. Um retrato observa de lado, como se soubesse mais do que aceita dizer. Sobre a escrivaninha, memorias tentam parecer prova, mas tremem sempre que passam pelos olhos dela.",
    riddle:
      "Nao procures o culpado. Procura a voz que envelheceu dentro da propria suspeita: menino prometido ao altar, homem fechado na casa que fez para repetir a casa perdida.",
    clue: "NA",
    answers: ["bentinho", "dom casmurro"],
    hints: [
      "O olhar que move esta sala nao e resposta; e ferida lembrada muitas vezes.",
      "A chave aceita o apelido do narrador ou o nome que ele carregava antes do ciume virar arquitetura.",
    ],
    errorMessage:
      "A estante nao se move. Talvez voce tenha seguido o olhar errado; volte a memoria que acusa enquanto finge apenas lembrar.",
    successMessage:
      "A duvida range como madeira antiga. A palavra-pista cai de dentro do retrato:",
    theme: {
      background: "#24130f",
      accent: "#d8a35d",
      accentSoft: "rgba(216, 163, 93, 0.2)",
      shelf: "#563322",
    },
  },
  {
    id: 2,
    title: "Memorias Postumas de Bras Cubas",
    author: "Machado de Assis",
    artifact: "tinteiro funerario",
    catalogCode: "MCH-II",
    room: "Gabinete do Defunto Autor",
    narrative:
      "Neste gabinete, a pena escreve sem pulso. Ha flores murchas no canto, um epitafio dobrado como marcador e uma gargalhada fina atravessando o marmore. Quem narra daqui ja nao deve satisfacoes aos vivos.",
    riddle:
      "A dedicatoria nao consola: oferece o corpo ao primeiro leitor subterraneo. Entre a campa e o capitulo, a vaidade ainda respira, mas so por ironia.",
    clue: "SUA",
    answers: ["bras cubas"],
    hints: [
      "Quem fala aqui comeca depois do fim, como se a morte fosse apenas uma vantagem literaria.",
      "A chave tem duas palavras e pertence ao defunto autor das memorias.",
    ],
    errorMessage:
      "O tinteiro permanece frio. A resposta nao esta no luto, mas no morto que transformou o proprio enterro em prologo.",
    successMessage:
      "A tampa do caixao se abre com elegancia maldosa. A palavra-pista aparece:",
    theme: {
      background: "#18211d",
      accent: "#b9c58b",
      accentSoft: "rgba(185, 197, 139, 0.18)",
      shelf: "#344238",
    },
  },
  {
    id: 3,
    title: "Crime e Castigo",
    author: "Fiodor Dostoievski",
    artifact: "vela de febre curta",
    catalogCode: "DST-III",
    room: "Quarto de Sao Petersburgo",
    narrative:
      "O quarto e estreito, umido, febril. O ar pesa como pensamento mal dormido. No corredor, passos sobem e descem; dentro, uma teoria tenta justificar o sangue, mas a consciencia nao aceita silogismos.",
    riddle:
      "Ele quis medir a alma com uma ideia. Depois do golpe, descobriu que a culpa nao fica no lugar do crime: acompanha, arde, delira e exige nome.",
    clue: "WISHLIST",
    answers: ["raskolnikov"],
    hints: [
      "A chave e o nome daquele que acredita estar acima da lei ate ouvir a propria febre.",
      "Pense no estudante de Petersburgo que encontra castigo antes mesmo da sentenca.",
    ],
    errorMessage:
      "A febre aumenta, mas a porta nao cede. A resposta precisa carregar crime e consciencia no mesmo corpo.",
    successMessage:
      "A vela vacila; por um instante, a culpa fica legivel. A palavra-pista surge:",
    theme: {
      background: "#151d2b",
      accent: "#9eb7dc",
      accentSoft: "rgba(158, 183, 220, 0.2)",
      shelf: "#293850",
    },
  },
  {
    id: 4,
    title: "Anna Karenina",
    author: "Liev Tolstoi",
    artifact: "luva junto aos trilhos",
    catalogCode: "TLS-IV",
    room: "Estacao Sob a Neve",
    narrative:
      "A neve suaviza tudo, menos o ruido dos trilhos. Sob casacos, bailes e cumprimentos, a sociedade vigia com olhos impecaveis. Uma paixao atravessa a plataforma como chama que nao aprendeu a obedecer ao inverno.",
    riddle:
      "O trem ainda nao chegou, mas seu destino ja risca o chao. Quem passa por esta sala leva no nome a beleza, a queda e a coragem terrivel de desejar contra todos.",
    clue: "MORA",
    answers: ["anna", "anna karienina", "anna karenina"],
    hints: [
      "A chave pode ser apenas o primeiro nome da mulher diante dos trilhos.",
      "Se preferir, diga o nome inteiro que Tolstoi colocou sob a neve.",
    ],
    errorMessage:
      "O trem passa sem parar. A chave esta na mulher que a sociedade observa antes de compreender.",
    successMessage:
      "A neve se abre em silencio ao lado dos trilhos. A palavra-pista fica sobre o banco da estacao:",
    theme: {
      background: "#20242a",
      accent: "#d9e3ea",
      accentSoft: "rgba(217, 227, 234, 0.18)",
      shelf: "#3c4650",
    },
  },
  {
    id: 5,
    title: "A Paixao Segundo G.H.",
    author: "Clarice Lispector",
    artifact: "gaveta de quarto branco",
    catalogCode: "CLR-V",
    room: "Quarto Branco",
    narrative:
      "O quarto branco parece vazio, mas nada ali e simples. O silencio tem bordas afiadas. Uma mulher entra para arrumar o mundo e encontra, no minimo e no intoleravel, uma epifania que desmonta rosto, classe, nome e pronome.",
    riddle:
      "Nao ha retrato completo na porta, so duas letras. Elas bastam para quem atravessa a experiencia de perder a forma e tocar o nucleo vivo, impessoal, quase sem linguagem.",
    clue: "UM",
    answers: ["gh", "a paixao segundo gh"],
    hints: [
      "A chave e minima, como a identidade que o quarto comeca a desfazer.",
      "Tambem abre a porta o titulo clariceano sem acentos.",
    ],
    errorMessage:
      "O branco permanece intacto. A resposta precisa ser pequena o bastante para caber numa identidade reduzida a iniciais.",
    successMessage:
      "O silencio cede, nao como explicacao, mas como revelacao. A palavra-pista aparece:",
    theme: {
      background: "#2a2620",
      accent: "#f1dfb6",
      accentSoft: "rgba(241, 223, 182, 0.18)",
      shelf: "#5b5140",
    },
  },
  {
    id: 6,
    title: "Grande Sertao: Veredas",
    author: "Guimaraes Rosa",
    artifact: "marcador de couro cru",
    catalogCode: "GRS-VI",
    room: "Vereda do Pacto",
    narrative:
      "A biblioteca se abre em vereda: terra vermelha, buriti, poeira e fala em redemoinho. Aqui a lingua nao descreve o mundo; ela o refaz. Entre amor, guerra e pacto, a travessia pergunta se o diabo existe ou se nasce do medo de escolher.",
    riddle:
      "A chave e de quem conta para entender, e entende cada vez menos. Jagunco e filosofo, amante e sobrevivente, ele atravessa o sertao como quem atravessa a propria linguagem.",
    clue: "NOVO",
    answers: ["riobaldo", "grande sertao veredas"],
    hints: [
      "Procure a voz que fala com o senhor e carrega Diadorim como segredo.",
      "O nome do narrador abre a porta; o titulo sem acentos tambem.",
    ],
    errorMessage:
      "A vereda se bifurca. A resposta ainda nao tem a voz do sertao: fala, pacto, duvida e travessia.",
    successMessage:
      "A palavra atravessa a poeira e encontra passagem. A pista fica presa a um marcador de couro:",
    theme: {
      background: "#291c12",
      accent: "#e1a65a",
      accentSoft: "rgba(225, 166, 90, 0.2)",
      shelf: "#694123",
    },
  },
  {
    id: 7,
    title: "A Ultima Estante",
    author: "Biblioteca Secreta",
    artifact: "lista dobrada em sete",
    catalogCode: "BST-VII",
    room: "Sala da Wishlist",
    narrative:
      "A ultima sala e mais clara, mas nao menos secreta. As palavras-pista repousam sobre a mesa como lombadas em ordem. Nenhum autor exige resposta agora; a biblioteca so pede que Ludmila leia o que as salas escreveram juntas.",
    riddle:
      "Na sua wishlist mora um novo que? A chave final nao esta escondida em outro romance, mas no objeto que todos estes corredores celebraram.",
    clue: "LIVRO",
    answers: ["livro", "wishlist"],
    hints: [
      "Leia as pistas em sequencia: elas ja quase dizem a resposta.",
      "A biblioteca inteira foi construida para conduzir a este presente.",
    ],
    errorMessage:
      "A frase ainda nao fecha. Junte as palavras-pista como quem alinha lombadas na estante.",
    successMessage:
      "A ultima fechadura entende a frase inteira. A palavra final e revelada:",
    theme: {
      background: "#1d1729",
      accent: "#d6b3ff",
      accentSoft: "rgba(214, 179, 255, 0.2)",
      shelf: "#41305f",
    },
  },
];

function normalizeAnswer(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");
}

function matchesAnswer(input: string, answers: string[]) {
  const normalizedInput = normalizeAnswer(input);
  const compactInput = normalizedInput.replace(/\s+/g, "");

  return answers.some((candidate) => {
    const normalizedCandidate = normalizeAnswer(candidate);
    const compactCandidate = normalizedCandidate.replace(/\s+/g, "");

    return (
      normalizedCandidate === normalizedInput || compactCandidate === compactInput
    );
  });
}

function loadProgress() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as SavedProgress;
    return {
      finished: Boolean(parsed.finished),
      phaseIndex: Math.min(Math.max(parsed.phaseIndex ?? 0, 0), phases.length - 1),
      unlockedClues: Array.isArray(parsed.unlockedClues)
        ? parsed.unlockedClues.filter(Boolean)
        : [],
    };
  } catch {
    return null;
  }
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [unlockedClues, setUnlockedClues] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackTone, setFeedbackTone] = useState<FeedbackTone>("neutral");
  const [hintCount, setHintCount] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [isOpening, setIsOpening] = useState(true);

  const phase = phases[phaseIndex];
  const completedCount = unlockedClues.length;
  const progress = Math.round((completedCount / phases.length) * 100);
  const finalSentence = useMemo(() => unlockedClues.join(" "), [unlockedClues]);

  useEffect(() => {
    const progressState = loadProgress();

    if (progressState) {
      setPhaseIndex(progressState.phaseIndex);
      setUnlockedClues(progressState.unlockedClues);
      setScreen(progressState.finished ? "complete" : "intro");
    }

    setHydrated(true);

    const timer = window.setTimeout(() => {
      setIsOpening(false);
    }, OPENING_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        finished: screen === "complete",
        phaseIndex,
        unlockedClues,
      }),
    );
  }, [hydrated, phaseIndex, screen, unlockedClues]);

  function startGame() {
    setAnswer("");
    setFeedback("");
    setFeedbackTone("neutral");
    setHintCount(0);
    setWrongAttempts(0);
    setScreen(completedCount > 0 || phaseIndex > 0 ? "game" : "rules");
  }

  function unlockCurrentPhase(message: string) {
    const nextClues = unlockedClues.includes(phase.clue)
      ? unlockedClues
      : [...unlockedClues, phase.clue];

    setUnlockedClues(nextClues);
    setFeedback(`${message} ${phase.clue}.`);
    setFeedbackTone("success");
    setAnswer("");
    setHintCount(0);
    setWrongAttempts(0);

    window.setTimeout(() => {
      if (phaseIndex === phases.length - 1) {
        setScreen("complete");
        return;
      }

      setPhaseIndex((current) => Math.min(current + 1, phases.length - 1));
      setFeedback("");
      setFeedbackTone("neutral");
    }, 900);
  }

  function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalized = normalizeAnswer(answer);
    if (!normalized) {
      setFeedback("A biblioteca espera ao menos uma palavra para responder.");
      setFeedbackTone("neutral");
      return;
    }

    if (normalized === "machado") {
      setFeedback("A biblioteca sorri de canto.");
      setFeedbackTone("easter");
      return;
    }

    const isCorrect = matchesAnswer(answer, phase.answers);

    if (!isCorrect) {
      setWrongAttempts((current) => current + 1);
      setFeedback(phase.errorMessage);
      setFeedbackTone("error");
      return;
    }

    unlockCurrentPhase(phase.successMessage);
  }

  function revealHint() {
    setHintCount((current) => Math.min(current + 1, phase.hints.length));
    setFeedback("");
    setFeedbackTone("neutral");
  }

  function requestPassage() {
    unlockCurrentPhase(
      "A biblioteca cede sem alarde. A palavra-pista vem escrita na margem:",
    );
  }

  function resetProgress() {
    window.localStorage.removeItem(STORAGE_KEY);
    setScreen("intro");
    setPhaseIndex(0);
    setUnlockedClues([]);
    setAnswer("");
    setFeedback("");
    setFeedbackTone("neutral");
    setHintCount(0);
    setWrongAttempts(0);
    setIsOpening(false);
  }

  if (isOpening) {
    return <OpeningScreen />;
  }

  return (
    <main
      className="room-vignette min-h-screen overflow-hidden px-5 py-6 text-stone-100 transition-colors duration-500 sm:px-8"
      style={
        {
          "--room-bg": phase.theme.background,
        } as CSSProperties
      }
    >
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-stone-300">
              Enigma de aniversario
            </p>
            <h1 className="font-literary mt-1 text-2xl text-stone-50 sm:text-3xl">
              A Biblioteca Secreta de Ludmila
            </h1>
          </div>

          <button
            type="button"
            onClick={resetProgress}
            className="self-start rounded-full border border-white/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-stone-300 transition hover:border-white/25 hover:bg-white/10 hover:text-stone-100 focus:outline-none focus:ring-2 focus:ring-white/35"
          >
            Resetar progresso
          </button>
        </header>

        <section className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[1.05fr_0.95fr]">
          <LibraryVisual phase={phase} />

          <div
            key={screen === "game" ? `game-${phase.id}` : screen}
            className="page-turn-panel"
          >
            {screen === "intro" && (
              <IntroPanel
                hasProgress={completedCount > 0 || phaseIndex > 0}
                onRules={() => setScreen("rules")}
                onStart={startGame}
              />
            )}

            {screen === "rules" && (
              <RulesPanel
                onBack={() => setScreen("intro")}
                onStart={() => setScreen("game")}
              />
            )}

            {screen === "game" && (
              <GamePanel
              answer={answer}
              feedback={feedback}
              feedbackTone={feedbackTone}
              hintCount={hintCount}
                phase={phase}
                phaseIndex={phaseIndex}
                progress={progress}
                unlockedClues={unlockedClues}
                wrongAttempts={wrongAttempts}
                onAnswerChange={setAnswer}
                onHint={revealHint}
                onRequestPassage={requestPassage}
                onSubmit={submitAnswer}
              />
            )}

            {screen === "complete" && (
              <CompletePanel
                finalSentence={finalSentence || phases.map((item) => item.clue).join(" ")}
                onReset={resetProgress}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function OpeningScreen() {
  return (
    <main className="library-opening min-h-screen px-6 py-10 text-stone-100">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="opening-card max-w-3xl text-center">
          <div className="folio-surface">
            <p className="folio-kicker text-center">
              Biblioteca em silencio
            </p>
            <div className="mx-auto mt-5 h-px w-24 bg-[rgba(228,208,177,0.35)]" />
            <h1 className="folio-title mt-8 text-4xl leading-tight sm:text-6xl">
              A biblioteca esta abrindo suas portas...
            </h1>
            <p className="folio-body mx-auto mt-6 max-w-2xl text-base sm:text-lg">
              Entre papel antigo, margens anotadas e estantes reservadas, uma sala
              secreta se prepara para Ludmila.
            </p>
            <div className="opening-line mx-auto mt-10 h-px w-40 bg-stone-200/35" />
          </div>
        </div>
      </div>
    </main>
  );
}

function LibraryVisual({ phase }: { phase: Phase }) {
  const spines = [
    "h-40 w-8",
    "h-52 w-10",
    "h-44 w-7",
    "h-56 w-9",
    "h-48 w-8",
    "h-36 w-6",
    "h-60 w-10",
    "h-42 w-7",
  ];

  return (
    <div className="library-visual relative min-h-[340px] p-6 sm:min-h-[520px]">
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background: `radial-gradient(circle at 45% 20%, ${phase.theme.accentSoft}, transparent 24rem)`,
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,247,228,0.02),transparent_24%,rgba(0,0,0,0.18)_100%)]" />
      <div className="absolute left-6 right-6 top-12 h-px bg-white/10" />
      <div className="absolute bottom-20 left-6 right-6 h-3 rounded-full bg-black/30" />
      <div
        className="absolute bottom-24 left-8 right-8 h-4 rounded-sm"
        style={{ backgroundColor: phase.theme.shelf }}
      />

      <div className="absolute bottom-28 left-10 flex items-end gap-2">
        {spines.map((size, index) => (
          <div
            key={`${phase.id}-${size}-${index}`}
            className={`book-spine ${size} rounded-t-sm`}
            style={{
              backgroundColor:
                index % 3 === 0
                  ? phase.theme.accent
                  : index % 3 === 1
                    ? phase.theme.shelf
                    : "#efe2c8",
              opacity: index % 3 === 2 ? 0.72 : 0.9,
              transform: `rotate(${index % 2 === 0 ? -2 : 2}deg)`,
            }}
          />
        ))}
      </div>

      <div className="paper-texture absolute right-6 top-24 w-44 max-w-[48%] rounded-[6px] border border-[rgba(40,27,17,0.14)] bg-[linear-gradient(180deg,#f5eddf_0%,#eadfcd_100%)] p-5 text-stone-900 shadow-2xl sm:right-8 sm:w-56">
        <p className="font-literary text-lg leading-tight text-[var(--ink-900)]">
          {phase.room}
        </p>
        <p className="mt-3 text-[11px] uppercase tracking-[0.28em] text-[var(--ink-700)]">
          Sala {phase.id}
        </p>
        <div className="mt-4 h-px w-14 bg-[rgba(89,67,45,0.22)]" />
      </div>

      <div
        className="absolute left-10 top-24 h-24 w-24 rounded-full blur-2xl"
        style={{ backgroundColor: phase.theme.accentSoft }}
      />

      <div className="absolute bottom-8 left-8 right-8 flex flex-wrap items-center justify-between gap-2 text-[11px] uppercase tracking-[0.28em] text-stone-300">
        <span>{phase.author}</span>
        <span>{phase.catalogCode}</span>
      </div>
    </div>
  );
}

function IntroPanel({
  hasProgress,
  onRules,
  onStart,
}: {
  hasProgress: boolean;
  onRules: () => void;
  onStart: () => void;
}) {
  return (
    <div className="folio-panel max-w-2xl">
      <div className="folio-surface">
        <p className="folio-kicker">Entrada reservada</p>
        <div className="folio-rule mt-4 max-w-28" />
        <h2 className="folio-title mt-6 text-5xl leading-[0.92] sm:text-7xl">
          Sete salas. Uma frase. Um presente.
        </h2>
        <p className="folio-body mt-7 max-w-xl text-base sm:text-lg">
          Ludmila foi convidada a atravessar uma biblioteca feita de autores que
          ela ama. Cada sala guarda um enigma literario e uma palavra-pista.
        </p>
        <p className="folio-meta mt-7">Convite privado para uma leitora de estantes fundas</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onStart}
            className="editorial-button focus:outline-none focus:ring-2 focus:ring-[rgba(226,204,165,0.26)]"
          >
            {hasProgress ? "Continuar enigma" : "Entrar na biblioteca"}
          </button>
          <button
            type="button"
            onClick={onRules}
            className="editorial-button-secondary focus:outline-none focus:ring-2 focus:ring-[rgba(226,204,165,0.2)]"
          >
            Ver regras
          </button>
        </div>
      </div>
    </div>
  );
}

function RulesPanel({
  onBack,
  onStart,
}: {
  onBack: () => void;
  onStart: () => void;
}) {
  return (
    <div className="folio-panel max-w-2xl">
      <div className="folio-surface">
        <p className="folio-kicker">Regras da biblioteca</p>
        <div className="folio-rule mt-4 max-w-32" />
        <h2 className="folio-title mt-6 text-4xl sm:text-5xl">
          Leia antes de abrir a primeira porta
        </h2>
        <ul className="folio-body mt-7 space-y-4 text-base">
          <li>Cada fase e uma sala literaria com uma resposta escondida.</li>
          <li>Respostas aceitam acentos, sem acentos, maiusculas, minusculas e pontuacao.</li>
          <li>Ao acertar, uma palavra-pista sera desbloqueada.</li>
          <li>As sete pistas formam a frase que revela o presente.</li>
          <li>O progresso fica salvo neste navegador e a biblioteca pode ajudar se voce travar.</li>
        </ul>
        <div className="mt-9 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onStart}
            className="editorial-button focus:outline-none focus:ring-2 focus:ring-[rgba(226,204,165,0.26)]"
          >
            Comecar
          </button>
          <button
            type="button"
            onClick={onBack}
            className="editorial-button-secondary focus:outline-none focus:ring-2 focus:ring-[rgba(226,204,165,0.2)]"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}

function GamePanel({
  answer,
  feedback,
  feedbackTone,
  hintCount,
  phase,
  phaseIndex,
  progress,
  unlockedClues,
  wrongAttempts,
  onAnswerChange,
  onHint,
  onRequestPassage,
  onSubmit,
}: {
  answer: string;
  feedback: string;
  feedbackTone: FeedbackTone;
  hintCount: number;
  phase: Phase;
  phaseIndex: number;
  progress: number;
  unlockedClues: string[];
  wrongAttempts: number;
  onAnswerChange: (value: string) => void;
  onHint: () => void;
  onRequestPassage: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const canRequestPassage = hintCount >= phase.hints.length || wrongAttempts >= 3;
  const feedbackClass =
    feedbackTone === "success"
      ? "feedback-note feedback-note-success"
      : feedbackTone === "error"
        ? "feedback-note feedback-note-error"
        : feedbackTone === "easter"
          ? "feedback-note feedback-note-easter"
          : "feedback-note";

  return (
    <div className="folio-panel max-w-3xl">
      <div className="folio-surface">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="folio-kicker">Sala {phaseIndex + 1} de 7</p>
            <h2 className="folio-title mt-4 text-4xl sm:text-5xl">{phase.room}</h2>
            <p className="room-legend mt-4 max-w-2xl">
              {phase.title} - {phase.author} - {phase.artifact}
            </p>
          </div>
          <span className="editorial-chip px-3 py-2">{phase.catalogCode}</span>
        </div>

        <div className="narrative-progress mt-7" aria-label={`Progresso ${progress}%`}>
          <div className="flex items-center justify-between gap-3">
            <span className="folio-meta">Percurso entre estantes</span>
            <span className="folio-meta">{progress}%</span>
          </div>
          <div className="progress-orbit mt-4">
            {phases.map((item, index) => {
              const dotState =
                index < phaseIndex
                  ? "progress-dot progress-dot-complete"
                  : index === phaseIndex
                    ? "progress-dot progress-dot-current"
                    : "progress-dot";

              return (
                <div key={item.id} className="progress-step">
                  <span className={dotState} />
                  {index < phases.length - 1 && <span className="progress-link" />}
                </div>
              );
            })}
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgba(255,248,235,0.08)]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              backgroundColor: phase.theme.accent,
              width: `${progress}%`,
            }}
          />
          </div>
        </div>

        <p className="folio-body mt-9 text-base sm:text-lg">{phase.narrative}</p>

        <div className="clue-note mt-8">
          <p className="folio-meta mb-3">Enigma da sala</p>
          <p className="font-literary text-2xl leading-snug text-[var(--ivory-100)] sm:text-[2rem]">
            {phase.riddle}
          </p>
        </div>

        <form className="catalog-card mt-8 space-y-5" onSubmit={onSubmit}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <label className="folio-meta block" htmlFor="answer">
              Ficha de catalogo
            </label>
            <span className="room-legend">Anote o nome que abre a passagem.</span>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="catalog-input-shell flex-1">
              <input
                id="answer"
                autoComplete="off"
                spellCheck={false}
                value={answer}
                onChange={(event) => onAnswerChange(event.target.value)}
                className="folio-input catalog-input flex-1 px-4 outline-none transition"
                placeholder="Digite a chave da sala"
              />
            </div>
            <button
              type="submit"
              className="editorial-button door-button min-h-[3.5rem] focus:outline-none focus:ring-2 focus:ring-[rgba(226,204,165,0.26)]"
            >
              Abrir a porta
            </button>
          </div>
        </form>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onHint}
            disabled={hintCount >= phase.hints.length}
            className="editorial-button-secondary px-4 py-3 text-[0.78rem] focus:outline-none focus:ring-2 focus:ring-[rgba(226,204,165,0.2)] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {hintCount >= phase.hints.length ? "Dicas reveladas" : "Revelar dica"}
          </button>
          {canRequestPassage && (
            <button
              type="button"
              onClick={onRequestPassage}
              className="editorial-button-ghost focus:outline-none focus:ring-2 focus:ring-[rgba(226,204,165,0.2)]"
            >
              Pedir passagem
            </button>
          )}
          {feedback && (
            <p className={`${feedbackClass} max-w-2xl text-sm`} role="status">
              {feedback}
            </p>
          )}
          {feedbackTone === "success" && (
            <div className="seal-mark" aria-hidden="true">
              <span className="seal-mark-inner">Sala aberta</span>
            </div>
          )}
        </div>

        {hintCount > 0 && (
          <div className="hint-stack mt-5 space-y-3">
            {phase.hints.slice(0, hintCount).map((hint, index) => (
              <p
                key={hint}
                className="hint-note hint-reveal text-sm"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                {hint}
              </p>
            ))}
            {canRequestPassage && (
              <p className="hint-note hint-reveal text-sm">
                Se a sala continuar fechada, a biblioteca pode abrir a passagem sem
                interromper a historia.
              </p>
            )}
          </div>
        )}

        <div className="mt-8 border-t border-[rgba(231,216,191,0.09)] pt-5">
          <p className="folio-meta">Palavras-pista desbloqueadas</p>
          <div className="mt-3 flex min-h-9 flex-wrap gap-2">
            {unlockedClues.length === 0 ? (
              <span className="text-sm text-[rgba(221,201,171,0.5)]">Nenhuma ainda.</span>
            ) : (
              unlockedClues.map((clue) => (
                <span
                  key={clue}
                  className="clue-pill px-3 py-1 text-sm font-semibold"
                >
                  {clue}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompletePanel({
  finalSentence,
  onReset,
}: {
  finalSentence: string;
  onReset: () => void;
}) {
  return (
    <div className="folio-panel max-w-3xl">
      <div className="folio-surface">
        <p className="folio-kicker">Biblioteca aberta</p>
        <div className="folio-rule mt-4 max-w-32" />
        <h2 className="folio-title mt-6 text-5xl leading-tight sm:text-6xl">
          {finalSentence}
        </h2>
        <p className="folio-body mt-7 text-base sm:text-lg">
          Ludmila, as salas nao queriam testar memoria: queriam montar uma
          dedicatoria. Machado deixou a duvida, Bras Cubas sorriu da morte,
          Dostoievski acendeu a consciencia, Tolstoi cobriu os trilhos de neve,
          Clarice desfez o nome e Rosa abriu a travessia.
        </p>
        <p className="folio-body mt-4 text-base sm:text-lg">
          A frase encontrada revela o presente: ha um livro novo esperando por voce,
          escolhido da sua wishlist.
        </p>
        <div className="clue-note mt-8">
          <p className="folio-meta mb-3">Dedicatoria final</p>
          <p className="font-literary text-2xl text-[var(--gold-300)]">
            Presente revelado: um livro da wishlist, para continuar a biblioteca.
          </p>
        </div>
        <div className="certificate-card mt-8">
          <div className="certificate-card-inner">
            <p className="certificate-kicker">Travessia Literaria</p>
            <h3 className="font-literary text-3xl text-[var(--ink-900)] sm:text-4xl">
              Certificado de passagem secreta
            </h3>
            <p className="certificate-body mt-4">
              Concede-se a Ludmila o titulo de leitora que atravessou sete salas,
              reuniu as palavras perdidas nas margens e encontrou, ao fim da
              estante, um livro novo a sua espera.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="editorial-button mt-9 focus:outline-none focus:ring-2 focus:ring-[rgba(226,204,165,0.26)]"
        >
          Jogar novamente
        </button>
      </div>
    </div>
  );
}

