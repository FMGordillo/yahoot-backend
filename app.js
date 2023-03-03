const express = require("express");
const socketIO = require("socket.io");
const http = require("http");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new socketIO.Server(server, {
  cors: {
    // TODO: Apply the current logic when needed
    origin: "*",
  },
});

const port = process.env.PORT || 3001;

// const isPlaying = false;
let players = [];
let currentQuestion = null;
let currentQuestionIndex = 0;
const questions = [
  {
    text: "What genre does this anime first best?",
    imgSrc:
      "https://assets.reedpopcdn.com/Cardcaptor-Sakura.jpg/BROK/thumbnail/1600x900/quality/100/Cardcaptor-Sakura.jpg",
    choices: ["Suspense", "Action", "Romance", "Thriller"],
    answer: "Romance",
  },
  {
    text: "What anime is this?",
    imgSrc: "https://i.blogs.es/9c0032/fullmetal-alchemist/1366_2000.jpg",
    choices: ["Fullmetal Alchemist", "Doradora", "Naruto", "Nier Automata"],
    answer: "Fullmetal Alchemist",
  },
  {
    text: "What is the briefing of this serie?",
    imgSrc:
      "https://laverdadnoticias.com/__export/1604887728775/sites/laverdad/img/2020/11/08/shingeki_no_kyojin_nuevo_titan.jpg_793492074.jpg",
    choices: [
      "The end of the world",
      "The impact of war in children",
      "A thief gang hitting a big store",
      "The end of humanity",
    ],
    answer: "The end of humanity",
  },
];
const EVENTS = {
  answer: "answer",
  gameOver: "game-over",
  join: "join",
  nextQuestion: "next-question",
  players: "players",
  question: "question",
  reset: "reset",
};

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on(EVENTS.join, (name) => {
    console.log(`${name} joined the room`);

    const player = {
      id: socket.id,
      name,
      score: 0,
    };
    players.push(player);
    io.emit(EVENTS.players, players);
  });

  socket.on(EVENTS.answer, (answer) => {
    console.log(`Answer received: ${answer}`);
    if (!currentQuestion) return;
    const isCorrect = answer === currentQuestion.answer;
    if (isCorrect) {
      players = players.map((player) => {
        if (player.id === socket.id) {
          player.score += 100;
        }
        return player;
      });
      io.emit(EVENTS.players, players);
    }
    io.emit(EVENTS.answer, isCorrect);
    console.log(
      "CURRENT SCORE:",
      players.map((player) => `> ${player.name}: ${player.score}`)
    );
  });

  socket.on(EVENTS.nextQuestion, () => {
    if (currentQuestion === questions.length) {
      io.emit(EVENTS.gameOver);
    }
    currentQuestion = questions[currentQuestionIndex];
    io.emit(EVENTS.question, currentQuestion);
    currentQuestionIndex++;
  });

  socket.on(EVENTS.reset, () => {
    players = players.map((player) => ({ ...player, score: 0 }));
    currentQuestionIndex = 0;
    // Updates UI
    io.emit(EVENTS.reset);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    const index = players.findIndex((p) => p.id === socket.id);
    if (index !== -1) {
      players.splice(index, 1);
      io.emit(EVENTS.players, players);
    }
  });
});

function startGame() {
  console.log("Starting game...");

  // Replace with your own set of questions and answers
}

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  startGame();
});
