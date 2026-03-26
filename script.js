const gravity = 9.81;

const massInput = document.getElementById("mass");
const heightInput = document.getElementById("height");
const velocityInput = document.getElementById("velocity");
const frictionInput = document.getElementById("friction");
const simulateBtn = document.getElementById("simulate-btn");
const resetBtn = document.getElementById("reset-btn");
const questionBtn = document.getElementById("question-btn");

const massValue = document.getElementById("mass-value");
const heightValue = document.getElementById("height-value");
const velocityValue = document.getElementById("velocity-value");
const frictionValue = document.getElementById("friction-value");

const potentialEnergyLabel = document.getElementById("potential-energy");
const kineticEnergyLabel = document.getElementById("kinetic-energy");
const totalEnergyLabel = document.getElementById("total-energy");
const explanationBox = document.getElementById("explanation-box");
const sceneStatus = document.getElementById("scene-status");
const cart = document.getElementById("cart");

const scoreLabel = document.getElementById("score");
const streakLabel = document.getElementById("streak-label");
const questionText = document.getElementById("question-text");
const answersBox = document.getElementById("answers");
const feedbackLabel = document.getElementById("feedback");

let score = 0;
let streak = 0;
let activeQuestion = null;

function formatEnergy(value) {
  return `${Math.round(value)} J`;
}

function computeState() {
  const mass = Number(massInput.value);
  const height = Number(heightInput.value);
  const velocity = Number(velocityInput.value);
  const friction = Number(frictionInput.value) / 100;

  const potential = mass * gravity * height;
  const kinetic = 0.5 * mass * velocity * velocity;
  const total = potential + kinetic;
  const effectiveMechanical = total * (1 - friction);
  const finalVelocity = Math.sqrt(Math.max((2 * effectiveMechanical) / mass, 0));

  return {
    mass,
    height,
    velocity,
    friction,
    potential,
    kinetic,
    total,
    effectiveMechanical,
    finalVelocity
  };
}

function updateControlLabels() {
  massValue.textContent = massInput.value;
  heightValue.textContent = heightInput.value;
  velocityValue.textContent = velocityInput.value;
  frictionValue.textContent = frictionInput.value;
}

function renderEnergy(state) {
  potentialEnergyLabel.textContent = formatEnergy(state.potential);
  kineticEnergyLabel.textContent = formatEnergy(state.kinetic);
  totalEnergyLabel.textContent = formatEnergy(state.total);
}

function updateStaticView() {
  updateControlLabels();
  const state = computeState();
  renderEnergy(state);
  explanationBox.textContent =
    state.friction === 0
      ? "Senza attrito, l'energia meccanica si conserva: cambia forma, ma il totale resta uguale."
      : `Con un attrito del ${Math.round(state.friction * 100)}%, una parte dell'energia meccanica si trasforma in calore.`;
}

function runSimulation() {
  const state = computeState();
  renderEnergy(state);

  cart.classList.remove("running");
  void cart.offsetWidth;
  cart.classList.add("running");

  sceneStatus.textContent =
    `Velocita finale stimata: ${state.finalVelocity.toFixed(1)} m/s.`;

  explanationBox.textContent =
    `All'inizio il carrello possiede ${Math.round(state.potential)} J di energia potenziale e ${Math.round(state.kinetic)} J di energia cinetica. Alla fine della discesa, l'energia disponibile per il moto e circa ${Math.round(state.effectiveMechanical)} J.`;
}

function resetScene() {
  massInput.value = "4";
  heightInput.value = "6";
  velocityInput.value = "0";
  frictionInput.value = "10";
  cart.classList.remove("running");
  sceneStatus.textContent = 'Imposta i valori e premi "Avvia simulazione".';
  feedbackLabel.textContent = "Qui comparira il feedback della tua risposta.";
  feedbackLabel.className = "feedback neutral";
  updateStaticView();
}

function setScore(nextScore, nextStreak) {
  score = nextScore;
  streak = nextStreak;
  scoreLabel.textContent = String(score);
  streakLabel.textContent = `Serie corretta: ${streak}`;
}

function buildQuestionPool() {
  const state = computeState();
  const roundedPotential = Math.round(state.potential);
  const roundedKinetic = Math.round(state.kinetic);
  const roundedFinalVelocity = Number(state.finalVelocity.toFixed(1));

  return [
    {
      prompt: `Se raddoppi l'altezza iniziale, cosa succede all'energia potenziale gravitazionale?`,
      answers: [
        "Raddoppia",
        "Si dimezza",
        "Resta uguale"
      ],
      correctIndex: 0,
      explanation: "Ep = mgh, quindi se raddoppia h e il resto non cambia, raddoppia anche l'energia potenziale."
    },
    {
      prompt: `Con i valori attuali, quanta energia potenziale possiede il carrello all'inizio?`,
      answers: [
        `${roundedPotential} J`,
        `${Math.round(roundedPotential / 2)} J`,
        `${Math.round(roundedPotential + 50)} J`
      ],
      correctIndex: 0,
      explanation: "L'energia potenziale si calcola con Ep = mgh."
    },
    {
      prompt: `Con i valori attuali, quanta energia cinetica iniziale ha il carrello?`,
      answers: [
        `${roundedKinetic} J`,
        `${Math.round(roundedKinetic + 40)} J`,
        `${Math.max(Math.round(roundedKinetic - 20), 0)} J`
      ],
      correctIndex: 0,
      explanation: "L'energia cinetica dipende da massa e velocita: Ec = 1/2 mv^2."
    },
    {
      prompt: `Perche con attrito l'energia meccanica diminuisce?`,
      answers: [
        "Perche una parte si trasforma in calore",
        "Perche la massa sparisce",
        "Perche la gravita smette di agire"
      ],
      correctIndex: 0,
      explanation: "L'attrito dissipa energia trasformandola soprattutto in calore."
    },
    {
      prompt: `Con i valori attuali, quale velocita finale stimata raggiunge il carrello?`,
      answers: [
        `${roundedFinalVelocity.toFixed(1)} m/s`,
        `${(roundedFinalVelocity / 2).toFixed(1)} m/s`,
        `${(roundedFinalVelocity + 3.4).toFixed(1)} m/s`
      ],
      correctIndex: 0,
      explanation: "La velocita finale aumenta quando piu energia meccanica resta disponibile per il moto."
    }
  ];
}

function renderQuestion(question) {
  questionText.textContent = question.prompt;
  answersBox.innerHTML = "";

  question.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-btn";
    button.textContent = answer;
    button.addEventListener("click", () => handleAnswer(index));
    answersBox.appendChild(button);
  });
}

function nextQuestion() {
  const questions = buildQuestionPool();
  activeQuestion = questions[Math.floor(Math.random() * questions.length)];
  renderQuestion(activeQuestion);
  feedbackLabel.textContent = "Scegli una risposta e controlliamo insieme il ragionamento.";
  feedbackLabel.className = "feedback neutral";
}

function handleAnswer(selectedIndex) {
  if (!activeQuestion) {
    return;
  }

  const buttons = [...answersBox.querySelectorAll("button")];
  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === activeQuestion.correctIndex) {
      button.classList.add("correct");
    } else if (index === selectedIndex) {
      button.classList.add("wrong");
    }
  });

  if (selectedIndex === activeQuestion.correctIndex) {
    setScore(score + 10, streak + 1);
    feedbackLabel.textContent = `Risposta corretta. ${activeQuestion.explanation}`;
    feedbackLabel.className = "feedback good";
  } else {
    setScore(Math.max(score - 4, 0), 0);
    feedbackLabel.textContent = `Non proprio. ${activeQuestion.explanation}`;
    feedbackLabel.className = "feedback bad";
  }
}

[massInput, heightInput, velocityInput, frictionInput].forEach((input) => {
  input.addEventListener("input", updateStaticView);
});

simulateBtn.addEventListener("click", runSimulation);
resetBtn.addEventListener("click", resetScene);
questionBtn.addEventListener("click", nextQuestion);

updateStaticView();
