export interface AcademyLesson {
  id: string;
  level: "beginner" | "intermediate" | "advanced" | "mastery";
  title: string;
  category: string;
  theory: string;
  fen: string;
  turn: "w" | "b";
  moves: string[];
  opponentMoves: string[];
  hints: string[];
  prompts: string[];
  arrows?: string[][][];
}

export const ACADEMY_LESSONS: AcademyLesson[] = [
  // ══════════════════════════════════════════
  // LEVEL 1: ABSOLUTE BEGINNER (0–600 Elo)
  // Source concepts: Bobby Fischer Teaches Chess,
  // Chess Fundamentals by José Raúl Capablanca
  // ══════════════════════════════════════════

  // --- 1.1 Piece Movement ---
  {
    id: "b01",
    level: "beginner",
    title: "The Rook: Files & Ranks",
    category: "Piece Movement",
    theory:
      "The Rook is a major piece worth 5 points. It moves any number of squares along a rank (horizontal row) or file (vertical column), but cannot jump over other pieces. Rooks are strongest on open files (files with no pawns) and on the 7th rank, where they can attack undefended pawns and trap the enemy King. Two Rooks working together on the same file or rank are called 'doubled Rooks' and are extremely powerful.",
    fen: "8/8/8/8/8/8/8/R6K w - - 0 1",
    turn: "w",
    moves: ["a1a8"],
    opponentMoves: [],
    hints: ["Slide the Rook straight up the a-file to a8, claiming full vertical control of the file."],
    prompts: ["Move the Rook to a8 to control the entire a-file."],
    arrows: [[["a1", "a8", "green"]]],
  },
  {
    id: "b02",
    level: "beginner",
    title: "The Bishop: Diagonal Power",
    category: "Piece Movement",
    theory:
      "The Bishop is a minor piece worth 3 points. It moves diagonally any number of squares, but is forever locked to squares of one color. You start with a light-squared and a dark-squared Bishop. The 'Bishop pair' (both Bishops together) is very powerful because they cover all 64 squares. A Bishop blocked behind its own pawns is called a 'bad Bishop' — always keep your Bishop's diagonals open!",
    fen: "8/8/8/8/8/8/8/2B4K w - - 0 1",
    turn: "w",
    moves: ["c1h6"],
    opponentMoves: [],
    hints: ["Slide your Bishop diagonally from c1 to h6 to demonstrate its full diagonal range."],
    prompts: ["Move the Bishop to h6."],
    arrows: [[["c1", "h6", "green"]]],
  },
  {
    id: "b03",
    level: "beginner",
    title: "The Knight: L-Shaped Jumps",
    category: "Piece Movement",
    theory:
      "The Knight is a minor piece worth 3 points. It moves in an 'L' shape: two squares in one direction and one square perpendicular (or vice versa). The Knight is the ONLY piece that can jump over other pieces. Knights are strongest in the center of the board (where they control up to 8 squares) and weakest on the rim ('a Knight on the rim is dim'). Knights thrive in closed, blocked positions where Bishops struggle.",
    fen: "8/8/8/8/8/8/8/1N5K w - - 0 1",
    turn: "w",
    moves: ["b1c3", "c3e4"],
    opponentMoves: [],
    hints: [
      "Jump the Knight to c3 — two squares up, one square right.",
      "Now jump to e4 to centralize the Knight where it controls 8 squares.",
    ],
    prompts: ["Jump the Knight to c3.", "Centralize on e4."],
    arrows: [[["b1", "c3", "green"]], [["c3", "e4", "green"]]],
  },
  {
    id: "b04",
    level: "beginner",
    title: "The Queen: Ultimate Power",
    category: "Piece Movement",
    theory:
      "The Queen is the most powerful piece, worth 9 points. She combines the Rook's straight-line movement with the Bishop's diagonal movement. Despite her power, avoid developing the Queen too early — she becomes a target for lesser pieces that develop with tempo by attacking her. In the endgame, the Queen excels at delivering checkmate by coordinating with the King.",
    fen: "8/8/8/3k4/8/8/8/3QK3 w - - 0 1",
    turn: "w",
    moves: ["d1d4"],
    opponentMoves: [],
    hints: ["Advance the Queen to d4 to centralize and restrict the Black King."],
    prompts: ["Move the Queen to d4 to dominate the center."],
    arrows: [[["d1", "d4", "green"]]],
  },
  {
    id: "b05",
    level: "beginner",
    title: "The King: Your Most Precious Piece",
    category: "Piece Movement",
    theory:
      "The King moves one square in any direction. He is the most important piece — if checkmated, you lose! In the opening and middlegame, keep your King safe (usually by castling). But in the endgame, the King transforms into a fighting piece that must actively help pawns promote. The King is worth roughly 4 points as a fighting piece in the endgame.",
    fen: "8/8/8/8/4K3/8/8/7k w - - 0 1",
    turn: "w",
    moves: ["e4d5"],
    opponentMoves: [],
    hints: ["Step the King forward to d5 to claim the center in the endgame."],
    prompts: ["Advance the King to d5 — in the endgame, the King fights!"],
    arrows: [[["e4", "d5", "green"]]],
  },
  {
    id: "b06",
    level: "beginner",
    title: "Pawn Power: The Soul of Chess",
    category: "Piece Movement",
    theory:
      "Philidor called pawns 'the soul of chess.' Pawns move forward one square (or two from their starting rank) and capture diagonally. They cannot move backward. Despite being worth only 1 point, pawns create the skeleton of your position — they define which squares your pieces can use. Connected pawns (side by side) protect each other; isolated pawns (no friendly pawns on adjacent files) are weak targets.",
    fen: "8/8/8/8/8/8/4P3/4K2k w - - 0 1",
    turn: "w",
    moves: ["e2e4"],
    opponentMoves: [],
    hints: ["Advance the pawn two squares to e4 to claim central space."],
    prompts: ["Push the pawn to e4 — control the center from move one!"],
    arrows: [[["e2", "e4", "green"]]],
  },

  // --- 1.2 Special Rules ---
  {
    id: "b07",
    level: "beginner",
    title: "Castling: The King's Shield",
    category: "Special Rules",
    theory:
      "Castling is the only move where you move two pieces at once: the King moves two squares toward a Rook, and that Rook jumps over the King. Kingside castling (short, O-O) tucks the King into the corner behind pawns; queenside castling (long, O-O-O) is similar but on the other side. Rules: neither piece has moved, no pieces between them, King not in check, and King doesn't pass through or land on an attacked square. Castle early to protect your King!",
    fen: "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1",
    turn: "w",
    moves: ["e1g1"],
    opponentMoves: [],
    hints: ["Move the King two squares right to g1 to castle kingside."],
    prompts: ["Castle kingside to secure your King behind pawns."],
    arrows: [[["e1", "g1", "green"]]],
  },
  {
    id: "b08",
    level: "beginner",
    title: "En Passant: The Ghost Capture",
    category: "Special Rules",
    theory:
      "En passant ('in passing') is chess's most unusual rule. When an enemy pawn advances two squares from its starting position and lands beside your pawn on the 5th rank, you may capture it as if it had only moved one square. You MUST capture on the very next move or lose the right forever. This rule exists to prevent pawns from 'sneaking past' each other.",
    fen: "8/8/8/3pP3/8/8/8/4K2k w - d6 0 1",
    turn: "w",
    moves: ["e5d6"],
    opponentMoves: [],
    hints: ["Capture the d5 pawn en passant by moving your e5 pawn diagonally to d6."],
    prompts: ["Execute the en passant capture on d6."],
    arrows: [[["e5", "d6", "green"]]],
  },
  {
    id: "b09",
    level: "beginner",
    title: "Pawn Promotion: Creating a Queen",
    category: "Special Rules",
    theory:
      "When a pawn reaches the last rank (8th for White, 1st for Black), it MUST promote to a Queen, Rook, Bishop, or Knight. Promoting to a Queen is almost always correct. Occasionally you promote to a Knight ('underpromotion') to deliver an immediate check or avoid stalemate. Pawn promotion is the reward for nursing a pawn all the way across the board.",
    fen: "8/4P3/8/8/8/8/8/4K2k w - - 0 1",
    turn: "w",
    moves: ["e7e8"],
    opponentMoves: [],
    hints: ["Push the e7 pawn to e8 to promote it into a Queen."],
    prompts: ["Promote the pawn!"],
    arrows: [[["e7", "e8", "green"]]],
  },

  // --- 1.3 Basic Checkmates ---
  {
    id: "b10",
    level: "beginner",
    title: "Queen + King Checkmate",
    category: "Basic Checkmates",
    theory:
      "The most fundamental checkmate every beginner must master. The technique: use your Queen to restrict the enemy King to the edge of the board, then bring your own King close to support the Queen for checkmate. Be careful not to stalemate! Always leave the enemy King one escape square until you're ready to deliver mate.",
    fen: "8/8/8/8/8/1k6/8/KQ6 w - - 0 1",
    turn: "w",
    moves: ["b1b2"],
    opponentMoves: [],
    hints: ["Move the Queen to b2 to deliver checkmate — the King has no escape squares."],
    prompts: ["Deliver checkmate with the Queen on b2."],
    arrows: [[["b1", "b2", "green"]]],
  },
  {
    id: "b11",
    level: "beginner",
    title: "Rook + King Checkmate",
    category: "Basic Checkmates",
    theory:
      "The Rook + King mate requires more finesse than the Queen mate. The technique: use your Rook to cut off ranks (or files), pushing the enemy King toward the edge. Then bring your own King to oppose the enemy King (take the opposition). The Rook delivers mate on the edge rank while your King prevents escape. This is the 'box method' — shrink the enemy King's box one rank at a time.",
    fen: "6k1/8/8/8/8/8/1R6/2R4K w - - 0 1",
    turn: "w",
    moves: ["b2b7", "c1c8"],
    opponentMoves: ["g8f8"],
    hints: [
      "Cut off the 7th rank with Rook to b7 — the King is now trapped on the 8th rank.",
      "Deliver checkmate with the other Rook on c8.",
    ],
    prompts: ["Cut off the 7th rank.", "Checkmate on the back rank!"],
    arrows: [[["b2", "b7", "green"]], [["c1", "c8", "red"]]],
  },

  // ══════════════════════════════════════════
  // LEVEL 2: TACTICAL WEAPONRY (600–1200 Elo)
  // Source concepts: Winning Chess Tactics
  // by Yasser Seirawan, My System by Nimzowitsch
  // ══════════════════════════════════════════

  // --- 2.1 Core Tactics ---
  {
    id: "t01",
    level: "intermediate",
    title: "The Knight Fork",
    category: "Tactics: Fork",
    theory:
      "A fork is a double attack: one piece attacks two or more enemy pieces simultaneously. The opponent can only save one, so you capture the other. Knights are the deadliest forkers because of their jumping ability — they can attack pieces that can't attack back. The most devastating fork is a 'royal fork' (Knight attacks King + Queen). Always scan for Knight forks by checking if a Knight can land on a square that simultaneously checks the King and attacks another valuable piece.",
    fen: "r3k3/8/8/4N3/8/8/8/4K3 w - - 0 1",
    turn: "w",
    moves: ["e5c6"],
    opponentMoves: [],
    hints: ["Jump the Knight to c6, forking the King on e8 and the Rook on a8."],
    prompts: ["Fork the King and Rook with Nc6!"],
    arrows: [[["e5", "c6", "green"], ["c6", "e8", "red"], ["c6", "a8", "red"]]],
  },
  {
    id: "t02",
    level: "intermediate",
    title: "The Absolute Pin",
    category: "Tactics: Pin",
    theory:
      "A pin occurs when a piece is attacked but cannot move because doing so would expose a more valuable piece behind it. An 'absolute pin' targets the King — the pinned piece CANNOT legally move. A 'relative pin' targets a Queen or Rook — the pinned piece CAN move but shouldn't. The strategy against a pinned piece: pile up attackers on it! Since it can't move, every additional attacker increases the pressure until you win material.",
    fen: "rnb1kbnr/pppp1ppp/4p3/8/4P3/8/PPPPBPPP/RNBQK1NR w KQkq - 0 1",
    turn: "w",
    moves: ["e2b5"],
    opponentMoves: [],
    hints: ["Move the Bishop to b5 to pin the Knight on c6 to the King on e8."],
    prompts: ["Pin the Knight to the King with Bb5."],
    arrows: [[["e2", "b5", "green"], ["b5", "e8", "red"]]],
  },
  {
    id: "t03",
    level: "intermediate",
    title: "The Skewer",
    category: "Tactics: Skewer",
    theory:
      "A skewer is a 'reverse pin.' You attack a valuable piece (King or Queen) along a line, and when it moves away, you capture the less valuable piece standing behind it. While a pin traps the less valuable piece in front, a skewer drives away the more valuable piece to reveal a target behind. Rooks, Bishops, and Queens can execute skewers along ranks, files, and diagonals.",
    fen: "3k4/8/8/8/8/8/2R5/q3K3 w - - 0 1",
    turn: "w",
    moves: ["c2c8", "c8a8"],
    opponentMoves: ["d8e7"],
    hints: [
      "Check the King with Rc8+ — when the King moves, the Queen on a1 is exposed.",
      "Capture the Queen on a8.",
    ],
    prompts: ["Skewer the King with Rc8+.", "Capture the Queen!"],
    arrows: [[["c2", "c8", "green"]], [["c8", "a8", "green"]]],
  },
  {
    id: "t04",
    level: "intermediate",
    title: "Discovered Attack",
    category: "Tactics: Discovered Attack",
    theory:
      "A discovered attack occurs when you move one piece out of the way, revealing an attack from another piece behind it. A 'discovered check' is especially powerful — the moving piece can capture, threaten, or go anywhere while the uncovered piece checks the King. A 'double check' (both the moving piece AND the uncovered piece give check) is the most powerful tactic in chess — the ONLY defense is to move the King.",
    fen: "r1bqkbnr/pppp1ppp/2n5/4N3/4P3/8/PPPP1PPP/RNBQKB1R w KQkq - 0 1",
    turn: "w",
    moves: ["e5f7"],
    opponentMoves: [],
    hints: ["Capture on f7 with the Knight to attack the Queen and Rook while threatening the King."],
    prompts: ["Play Nxf7 to devastate Black's position."],
    arrows: [[["e5", "f7", "green"]]],
  },

  // --- 2.2 Advanced Tactics ---
  {
    id: "t05",
    level: "intermediate",
    title: "The Greek Gift Sacrifice (Bxh7+)",
    category: "Tactics: Sacrifice",
    theory:
      "The Greek Gift is the most famous attacking sacrifice in chess. You sacrifice your Bishop by capturing the h7 pawn (Bxh7+), ripping open the enemy King's pawn shelter. After the King captures, your Knight jumps to g5+ with check, and the Queen follows to h5, creating an unstoppable mating attack. Prerequisites: a Bishop on the b1-h7 diagonal, a Knight ready to go to g5, and the Queen able to reach h5. This pattern has won thousands of games at every level.",
    fen: "r1bq1rk1/pppn1ppp/4pn2/3p2B1/3P4/2N2N2/PPPB1PPP/R2Q1RK1 w - - 0 1",
    turn: "w",
    moves: ["d2h6"],
    opponentMoves: [],
    hints: ["Begin the Greek Gift by moving the Bishop to h6 to attack the castled King's shelter."],
    prompts: ["Start the Greek Gift attack with Bh6!"],
    arrows: [[["d2", "h6", "green"]]],
  },
  {
    id: "t06",
    level: "intermediate",
    title: "Back Rank Mate",
    category: "Tactics: Checkmate Pattern",
    theory:
      "The back rank mate is the most common checkmate pattern in practical play. It occurs when a King is trapped on the back rank by its own pawns (usually on f7/g7/h7 or f2/g2/h2) and an enemy Rook or Queen delivers check on the 8th (or 1st) rank. Prevention: create 'luft' (breathing room) by advancing one of the pawns (usually h3 or h6) to give your King an escape square. Always check if your opponent's back rank is weak before launching an attack!",
    fen: "6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
    turn: "w",
    moves: ["e1e8"],
    opponentMoves: [],
    hints: ["Slide the Rook to e8 — the King is trapped behind its own pawns. Checkmate!"],
    prompts: ["Deliver back rank mate with Re8#!"],
    arrows: [[["e1", "e8", "red"]]],
  },
  {
    id: "t07",
    level: "intermediate",
    title: "Smothered Mate",
    category: "Tactics: Checkmate Pattern",
    theory:
      "The smothered mate is one of the most beautiful patterns in chess. A Knight delivers checkmate to a King that is completely surrounded ('smothered') by its own pieces, leaving no escape squares. The classic setup: the King is on g8, with a Rook on f8 and pawns on f7/g7/h7. A Knight on f7 delivers check, and there's nowhere to run. Often preceded by a Queen sacrifice on g8+ to force the Rook to block the King's escape.",
    fen: "r1b3kr/ppp2Npp/8/8/8/8/PPP3PP/6K1 w - - 0 1",
    turn: "w",
    moves: ["f7h6"],
    opponentMoves: [],
    hints: ["Jump the Knight to h6 to deliver check — the King is smothered by its own pieces."],
    prompts: ["Deliver the smothered check with Nh6+!"],
    arrows: [[["f7", "h6", "green"]]],
  },
  {
    id: "t08",
    level: "intermediate",
    title: "Deflection & Overloading",
    category: "Tactics: Deflection",
    theory:
      "Deflection forces a defending piece away from its critical duty. 'Overloading' is when one piece is doing two jobs at once — defend it from one angle and it must abandon the other. Example: a Queen defending both a back-rank mate threat AND a hanging piece. If you attack one, she must abandon the other. Always ask: 'Is any enemy piece doing double duty?' If so, exploit it!",
    fen: "3r2k1/5ppp/8/8/8/8/2R2PPP/2q3K1 w - - 0 1",
    turn: "w",
    moves: ["c2c8"],
    opponentMoves: [],
    hints: ["Play Rc8! The Rook on d8 is overloaded — it defends the Queen AND the back rank."],
    prompts: ["Exploit the overloaded Rook with Rc8!"],
    arrows: [[["c2", "c8", "red"]]],
  },
  {
    id: "t09",
    level: "intermediate",
    title: "Zwischenzug: The In-Between Move",
    category: "Tactics: Zwischenzug",
    theory:
      "Zwischenzug (German for 'in-between move') is an unexpected intermediate move inserted into a sequence. Instead of making the 'obvious' recapture, you play a check, threat, or capture elsewhere FIRST, then complete the original sequence. This disrupts your opponent's calculation because they assumed a different move order. Always ask before recapturing: 'Is there something even better I can do first?'",
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4N3/4P3/8/PPPP1PPP/RNBQKB1R w KQkq - 0 1",
    turn: "w",
    moves: ["e5f7"],
    opponentMoves: [],
    hints: ["Instead of retreating the attacked Knight, play the zwischenzug Nxf7! attacking the Queen and Rook."],
    prompts: ["Play the in-between move Nxf7!"],
    arrows: [[["e5", "f7", "green"]]],
  },

  // ══════════════════════════════════════════
  // LEVEL 3: STRATEGY & ENDGAMES (1200–1600 Elo)
  // Source concepts: My System by Nimzowitsch,
  // Silman's Complete Endgame Course,
  // Dvoretsky's Endgame Manual
  // ══════════════════════════════════════════

  // --- 3.1 Strategic Concepts ---
  {
    id: "s01",
    level: "advanced",
    title: "Pawn Structure: Isolated Pawns",
    category: "Strategy: Pawn Structure",
    theory:
      "An isolated pawn (or 'isolani') has no friendly pawns on adjacent files to protect it. It must be defended by pieces, which ties them down. The classic isolani is a d-pawn (d4 or d5). Strategy AGAINST the isolani: blockade it with a Knight on the square in front, exchange pieces to reach an endgame where the isolani becomes a fatal weakness. Strategy WITH the isolani: use the open files next to it and the active piece play it generates for a middlegame attack before the endgame arrives.",
    fen: "8/pp3ppp/8/3p4/8/4N3/PPP2PPP/4K3 w - - 0 1",
    turn: "w",
    moves: ["e3d5"],
    opponentMoves: [],
    hints: ["Blockade the isolated d5 pawn by placing your Knight directly on d5."],
    prompts: ["Blockade the isolani with Nd5!"],
    arrows: [[["e3", "d5", "green"]]],
  },
  {
    id: "s02",
    level: "advanced",
    title: "Prophylaxis: Stop Their Plan First",
    category: "Strategy: Nimzowitsch",
    theory:
      "Prophylaxis (from Nimzowitsch's 'My System') is the art of asking 'What does my opponent WANT to do?' and preventing it BEFORE executing your own plan. A prophylactic move might look passive but is incredibly strong because it denies the opponent all counterplay. Grandmasters think prophylactically on every move. Example: playing h3 to prevent a Bishop from going to g4, or a4 to stop b5 expansion.",
    fen: "8/1p6/8/8/8/P7/1P6/K6k w - - 0 1",
    turn: "w",
    moves: ["a3a4"],
    opponentMoves: [],
    hints: ["Play a4 to prevent Black's b5 pawn break, securing your queenside structure."],
    prompts: ["Stop Black's plan with the prophylactic a4!"],
    arrows: [[["a3", "a4", "green"]]],
  },
  {
    id: "s03",
    level: "advanced",
    title: "The Blockade: Freezing Passed Pawns",
    category: "Strategy: Nimzowitsch",
    theory:
      "Nimzowitsch's blockade principle: place a piece (ideally a Knight) directly in front of an enemy passed pawn. The pawn is frozen, and the blockading piece gains a secure outpost that cannot be attacked by enemy pawns. A Knight is the ideal blockader because it doesn't need open lines to be effective. A Bishop or Rook are poor blockaders because their power comes from long-range lines that are wasted sitting in front of a pawn.",
    fen: "8/8/8/3p4/8/8/8/3NK2k w - - 0 1",
    turn: "w",
    moves: ["d1d4"],
    opponentMoves: [],
    hints: ["Place the Knight on d4 to blockade the passed d5 pawn."],
    prompts: ["Blockade with Nd4 — freeze the pawn forever."],
    arrows: [[["d1", "d4", "green"]]],
  },

  // --- 3.2 Essential Endgames ---
  {
    id: "s04",
    level: "advanced",
    title: "King + Pawn vs King: The Opposition",
    category: "Endgame: King & Pawn",
    theory:
      "Opposition is the most critical concept in King + Pawn endgames. Two Kings 'have the opposition' when they face each other with one square between them. The side NOT to move holds the opposition (an advantage) because the other side must step aside. The attacking King uses the opposition to outflank the defender and escort the pawn to promotion. Without understanding opposition, you'll draw won games and lose drawn ones.",
    fen: "8/8/4k3/8/4K3/8/4P3/8 w - - 0 1",
    turn: "w",
    moves: ["e4e5"],
    opponentMoves: [],
    hints: ["Step forward to e5 to take the opposition — the enemy King must yield."],
    prompts: ["Seize the opposition with Ke5!"],
    arrows: [[["e4", "e5", "green"]]],
  },
  {
    id: "s05",
    level: "advanced",
    title: "The Rule of the Square",
    category: "Endgame: King & Pawn",
    theory:
      "The Rule of the Square is a quick visual trick to determine if a King can catch a passed pawn. Draw an imaginary square from the pawn to the promotion square — if the defending King can step inside this square (on their move), they catch the pawn. If the King is outside the square, the pawn promotes. This saves you from calculating dozens of moves — just visualize the square!",
    fen: "8/8/8/8/1P6/8/8/K5k1 w - - 0 1",
    turn: "w",
    moves: ["b4b5"],
    opponentMoves: [],
    hints: ["Push the pawn to b5 — the Black King cannot enter the 'square' b5-b8-f8-f5 in time."],
    prompts: ["Push b5 — the King can't catch the pawn!"],
    arrows: [[["b4", "b5", "green"]]],
  },
  {
    id: "s06",
    level: "advanced",
    title: "The Lucena Position: Building the Bridge",
    category: "Endgame: Rook Endgame",
    theory:
      "The Lucena Position is the single most important position in all of chess endgame theory. It arises when your pawn is on the 7th rank, your King is in front of it, and you have a Rook. The winning technique is called 'building a bridge': move your Rook to the 4th rank, step the King out from in front of the pawn, and when the enemy Rook checks you from the side, use your Rook to block the check on the 4th rank. This 500-year-old technique is essential knowledge.",
    fen: "1K6/1P6/8/8/5r2/8/8/1R5k w - - 0 1",
    turn: "w",
    moves: ["b1b4"],
    opponentMoves: [],
    hints: ["Move the Rook to b4 — this is 'building the bridge' to shield the King from checks."],
    prompts: ["Build the bridge with Rb4!"],
    arrows: [[["b1", "b4", "green"]]],
  },
  {
    id: "s07",
    level: "advanced",
    title: "The Philidor Position: The Drawing Wall",
    category: "Endgame: Rook Endgame",
    theory:
      "The Philidor Position is the most important defensive technique in Rook endgames. When defending against a Rook and Pawn, place your Rook on the 6th rank (creating a 'wall' that prevents the attacking King from advancing). When the attacker pushes the pawn to the 6th rank, immediately slide your Rook to the 1st rank to deliver infinite checks from behind. The attacking King has no shelter from rear checks — it's a fortress draw.",
    fen: "8/3k4/R7/3PK3/8/8/8/6r1 b - - 0 1",
    turn: "b",
    moves: ["g1g5"],
    opponentMoves: [],
    hints: ["Move the Rook to g5 to start checking the White King from behind."],
    prompts: ["Begin the Philidor defense — Rg5+ to check from behind!"],
    arrows: [[["g1", "g5", "green"]]],
  },

  // --- 3.3 Checkmate Patterns ---
  {
    id: "s08",
    level: "advanced",
    title: "Anastasia's Mate",
    category: "Checkmate Patterns",
    theory:
      "Anastasia's Mate combines a Knight and Rook. The Knight controls the King's escape squares on the edge of the board while the Rook delivers checkmate along an open file. The pattern typically occurs on the h-file: the Knight sits on e7 (guarding g8 and g6), and the Rook checkmates on h1 or h8. Named after the novel 'Anastasia und das Schachspiel' (1803).",
    fen: "5rk1/4Nppp/8/8/8/8/8/R6K w - - 0 1",
    turn: "w",
    moves: ["a1a8"],
    opponentMoves: [],
    hints: ["The Knight on e7 controls g8 and g6. Deliver mate with Ra8!"],
    prompts: ["Deliver Anastasia's mate with Ra8!"],
    arrows: [[["a1", "a8", "red"], ["e7", "g8", "orange"], ["e7", "g6", "orange"]]],
  },
  {
    id: "s09",
    level: "advanced",
    title: "Arabian Mate",
    category: "Checkmate Patterns",
    theory:
      "Arabian Mate is an ancient checkmate pattern (from Arabic shatranj manuscripts) using a Rook and Knight. The Rook delivers check on the edge of the board while the Knight guards the King's escape squares AND protects the Rook. Typically: King on h8, Rook checks on h1 or h2, Knight on f7 guards h8 and protects the Rook. This pattern appears frequently in knight endgames.",
    fen: "7k/5N1p/8/8/8/8/8/R6K w - - 0 1",
    turn: "w",
    moves: ["a1a8"],
    opponentMoves: [],
    hints: ["Deliver mate with Ra8# — the Knight on f7 guards h8 and protects the Rook."],
    prompts: ["Arabian Mate! Ra8#."],
    arrows: [[["a1", "a8", "red"]]],
  },

  // ══════════════════════════════════════════
  // LEVEL 4: OPENING MASTERY (1600+ Elo)
  // Source concepts: Modern Chess Openings (MCO),
  // Fundamental Chess Openings by van der Sterren
  // ══════════════════════════════════════════
  {
    id: "o01",
    level: "mastery",
    title: "The Italian Game (Giuoco Piano)",
    category: "Openings: e4",
    theory:
      "The Italian Game (1.e4 e5 2.Nf3 Nc6 3.Bc4) is one of the oldest openings, dating to the 16th century. White develops the Bishop to c4, targeting Black's vulnerable f7 square (the weakest point in the starting position, defended only by the King). The name 'Giuoco Piano' means 'quiet game' — White builds a solid center and aims for a gradual attack. The Evan's Gambit (4.b4) is a sharp variation that sacrifices a pawn for rapid development.",
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
    turn: "b",
    moves: ["f8c5"],
    opponentMoves: [],
    hints: ["Develop the Bishop to c5 to fight for the center and mirror White's attack on f2."],
    prompts: ["Play Bc5 — the symmetrical Italian Game."],
    arrows: [[["f8", "c5", "green"]]],
  },
  {
    id: "o02",
    level: "mastery",
    title: "The Ruy Lopez: Morphy Defense",
    category: "Openings: e4",
    theory:
      "The Ruy Lopez (1.e4 e5 2.Nf3 Nc6 3.Bb5) is the king of chess openings. Named after Spanish priest Ruy López de Segura (1561), White pins the c6 Knight that defends e5. The Morphy Defense (3...a6) challenges the Bishop. The Ruy Lopez leads to rich middlegame positions with imbalances on both sides of the board. It has been the weapon of choice for World Champions from Lasker to Caruana.",
    fen: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
    turn: "b",
    moves: ["a7a6"],
    opponentMoves: [],
    hints: ["Play a6 to challenge the Bishop — the Morphy Defense, Black's most popular reply."],
    prompts: ["Challenge the Bishop with a6!"],
    arrows: [[["a7", "a6", "green"]]],
  },
  {
    id: "o03",
    level: "mastery",
    title: "The Sicilian Najdorf",
    category: "Openings: e4",
    theory:
      "The Sicilian Najdorf (1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6) is the most theoretically dense opening in chess. Used by Fischer, Kasparov, and Carlsen. Black's 5...a6 prevents Nb5 and prepares b5/e5 counterplay. The asymmetric pawn structure guarantees a fight. White gets a lead in development and central space; Black gets the half-open c-file and dynamic counterplay. Every serious player must understand the Najdorf.",
    fen: "rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6",
    turn: "w",
    moves: ["c1e3"],
    opponentMoves: [],
    hints: ["Develop the Bishop to e3 — the English Attack, White's most dangerous setup."],
    prompts: ["Play Be3 — enter the English Attack!"],
    arrows: [[["c1", "e3", "green"]]],
  },
  {
    id: "o04",
    level: "mastery",
    title: "The Queen's Gambit Declined",
    category: "Openings: d4",
    theory:
      "The Queen's Gambit (1.d4 d5 2.c4) is not a true gambit — White can always recapture. The QGD (2...e6) is Black's most solid reply, building a wall in the center. The downside: the c8-Bishop is temporarily locked behind the e6 pawn — a problem Black must solve. The Orthodox Defense, Tartakower Variation, and Lasker Defense are key systems. The QGD has been the cornerstone of World Championship matches for over 100 years.",
    fen: "rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
    turn: "w",
    moves: ["b1c3"],
    opponentMoves: [],
    hints: ["Develop the Knight to c3 to increase pressure on d5."],
    prompts: ["Play Nc3 to reinforce the center attack on d5."],
    arrows: [[["b1", "c3", "green"]]],
  },
  {
    id: "o05",
    level: "mastery",
    title: "The London System",
    category: "Openings: d4",
    theory:
      "The London System (1.d4 + 2.Bf4) is a solid, easy-to-learn opening system for White. The setup is almost automatic regardless of Black's response: pawns on d4/e3/c3, Bishop on f4, Knights on f3/d2, and Queen on c2 or e2. The London avoids sharp theoretical battles and leads to comfortable middlegame positions. It was popularized by Magnus Carlsen and Kamsky and is an excellent practical weapon.",
    fen: "rnbqkbnr/ppp1pppp/8/3p4/3P1B2/8/PPP1PPPP/RN1QKBNR b KQkq - 1 2",
    turn: "b",
    moves: ["g8f6"],
    opponentMoves: [],
    hints: ["Develop the Knight to f6 — the most natural response against the London System."],
    prompts: ["Play Nf6 to challenge White's center."],
    arrows: [[["g8", "f6", "green"]]],
  },
  {
    id: "o06",
    level: "mastery",
    title: "The Nimzo-Indian Defense",
    category: "Openings: d4",
    theory:
      "The Nimzo-Indian (1.d4 Nf6 2.c4 e6 3.Nc3 Bb4) is a hypermodern masterpiece. Instead of fighting for the center with pawns, Black pins White's c3-Knight, indirectly controlling the e4 square. If White plays e4, Black will have doubled c-pawns to attack. The Nimzo-Indian is perhaps the most respected defense in chess, used by every World Champion since Botvinnik.",
    fen: "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4",
    turn: "w",
    moves: ["d1c2"],
    opponentMoves: [],
    hints: ["Play Qc2 — the Classical Variation. White prevents doubled c-pawns and prepares e4."],
    prompts: ["Play Qc2 to enter the Classical Nimzo."],
    arrows: [[["d1", "c2", "green"]]],
  },
  {
    id: "o07",
    level: "mastery",
    title: "The King's Indian Defense",
    category: "Openings: d4",
    theory:
      "The King's Indian (1.d4 Nf6 2.c4 g6 3.Nc3 Bg7) is the ultimate fighting defense. Black allows White to build a massive pawn center (d4+e4+c4) and then dynamically attacks it with ...e5 or ...c5. The KID leads to sharp, unbalanced games with opposite-side attacks — White storms the queenside while Black attacks the King. Kasparov's immortal King's Indian games are required study for any serious player.",
    fen: "rnbqk2r/ppppppbp/5np1/8/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 1 4",
    turn: "w",
    moves: ["e2e4"],
    opponentMoves: [],
    hints: ["Seize the full center with e4 — the Four Pawns Attack is White's most aggressive response."],
    prompts: ["Play e4 to build the full center."],
    arrows: [[["e2", "e4", "green"]]],
  },
  {
    id: "o08",
    level: "mastery",
    title: "The Caro-Kann Defense",
    category: "Openings: e4",
    theory:
      "The Caro-Kann (1.e4 c6) is Black's most solid response to e4. By preparing ...d5, Black achieves a symmetric pawn structure without the 'bad Bishop' problem of the French Defense (the c8-Bishop stays outside the pawn chain). Used by Karpov, Anand, and countless world-class players. The Advance Variation (3.e5), Classical (3.Nc3 dxe4 4.Nxe4), and Tartakower/Fantasy Variations offer White distinct plans.",
    fen: "rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    turn: "w",
    moves: ["d2d4"],
    opponentMoves: [],
    hints: ["Play d4 to claim the center — the mainline response to the Caro-Kann."],
    prompts: ["Establish a strong center with d4."],
    arrows: [[["d2", "d4", "green"]]],
  },
  {
    id: "o09",
    level: "mastery",
    title: "The French Defense",
    category: "Openings: e4",
    theory:
      "The French Defense (1.e4 e6) creates a solid pawn chain (e6-d5) that is extremely difficult to break through. Black's plan: counterattack White's center with ...c5 and sometimes ...f6. The downside: Black's light-squared Bishop (c8) is trapped behind the pawn chain — solving this 'French Bishop problem' is Black's strategic challenge. The Winawer (3...Bb4), Classical (3...Nf6), and Tarrasch (3.Nd2) are the main variations.",
    fen: "rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    turn: "w",
    moves: ["d2d4"],
    opponentMoves: [],
    hints: ["Play d4 to form the classical pawn center, inviting Black to counterattack."],
    prompts: ["Play d4 — build the center and invite the fight."],
    arrows: [[["d2", "d4", "green"]]],
  },
  {
    id: "o10",
    level: "mastery",
    title: "The Slav Defense",
    category: "Openings: d4",
    theory:
      "The Slav Defense (1.d4 d5 2.c4 c6) is one of Black's most solid and respected options against the Queen's Gambit. By supporting d5 with ...c6 instead of ...e6, Black keeps the diagonal open for the light-squared Bishop (unlike the QGD). The Semi-Slav (adding ...e6) creates one of the sharpest theoretical battlegrounds in modern chess, with the Meran and Botvinnik Variations offering enormous complexity.",
    fen: "rnbqkbnr/pp2pppp/2p5/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
    turn: "w",
    moves: ["b1c3"],
    opponentMoves: [],
    hints: ["Develop the Knight to c3 to pressure d5 and prepare e4."],
    prompts: ["Play Nc3 to increase pressure on d5."],
    arrows: [[["b1", "c3", "green"]]],
  },
];
