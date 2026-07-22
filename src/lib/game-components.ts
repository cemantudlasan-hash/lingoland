import dynamic from "next/dynamic";

export const gameComponentMap = {
  "arithmetic-ace": dynamic(() => import("@/components/games/arithmetic-ace").then((mod) => mod.ArithmeticAce)),
  "fraction-fusion": dynamic(() => import("@/components/games/fraction-fusion").then((mod) => mod.FractionFusion)),
  "math-mission-situations": dynamic(() =>
    import("@/components/games/math-mission-situations").then((mod) => mod.MathMissionSituations)
  ),
  "time-traveler": dynamic(() => import("@/components/games/time-traveler").then((mod) => mod.TimeTraveler)),
  "probability-pilot": dynamic(() => import("@/components/games/probability-pilot").then((mod) => mod.ProbabilityPilot)),
  "element-escapade": dynamic(() => import("@/components/games/element-escapade").then((mod) => mod.ElementEscapade)),
  "solar-system-scout": dynamic(() =>
    import("@/components/games/solar-system-scout").then((mod) => mod.SolarSystemScout)
  ),
  "states-of-matter": dynamic(() => import("@/components/games/states-of-matter").then((mod) => mod.StatesOfMatter)),
  "anatomy-academy": dynamic(() => import("@/components/games/anatomy-academy").then((mod) => mod.AnatomyAcademy)),
  "atmospheric-ace": dynamic(() => import("@/components/games/atmospheric-ace").then((mod) => mod.AtmosphericAce)),
  "lexi-sphere": dynamic(() => import("@/components/games/lexi-sphere").then((mod) => mod.LexiSphere)),
  "cellular-explorer-3d": dynamic(
    () => import("@/components/games/cellular-explorer-3d").then((mod) => mod.CellularExplorer3D),
    { ssr: false }
  ),
  "geometry-galaxy-3d": dynamic(
    () => import("@/components/games/geometry-galaxy-3d").then((mod) => mod.GeometryGalaxy3D),
    { ssr: false }
  ),
  "dialogue-dojo": dynamic(() => import("@/components/games/dialogue-dojo").then((mod) => mod.DialogueDojo)),
  "riddle-realm": dynamic(() => import("@/components/games/riddle-realm").then((mod) => mod.RiddleRealm)),
  "grammar-guru": dynamic(() => import("@/components/games/grammar-guru").then((mod) => mod.GrammarGuru)),
  "vocab-voyage": dynamic(() => import("@/components/games/vocab-voyage").then((mod) => mod.VocabVoyage)),
  "vocab-snake": dynamic(() => import("@/components/games/vocab-snake").then((mod) => mod.VocabSnake)),
  "sentence-scramble": dynamic(() => import("@/components/games/sentence-scramble").then((mod) => mod.SentenceScramble)),
  "idiom-illumination": dynamic(() =>
    import("@/components/games/idiom-illumination").then((mod) => mod.IdiomIllumination)
  ),
  "pronunciation-pro": dynamic(() => import("@/components/games/pronunciation-pro").then((mod) => mod.PronunciationPro)),
  "listening-labyrinth": dynamic(() =>
    import("@/components/games/listening-labyrinth").then((mod) => mod.ListeningLabyrinth)
  ),
  "pictionary-party": dynamic(() => import("@/components/games/pictionary-party").then((mod) => mod.PictionaryParty)),
  "charades-challenge": dynamic(() =>
    import("@/components/games/charades-challenge").then((mod) => mod.CharadesChallenge)
  ),
  "running-dictation": dynamic(() => import("@/components/games/running-dictation").then((mod) => mod.RunningDictation)),
  "auction-action": dynamic(() => import("@/components/games/auction-action").then((mod) => mod.AuctionAction)),
  "story-chain": dynamic(() => import("@/components/games/story-chain").then((mod) => mod.StoryChain)),
  "taboo-tussle": dynamic(() => import("@/components/games/taboo-tussle").then((mod) => mod.TabooTussle)),
  "twenty-questions": dynamic(() => import("@/components/games/twenty-questions").then((mod) => mod.TwentyQuestions)),
  "synonym-sleuth": dynamic(() => import("@/components/games/synonym-sleuth").then((mod) => mod.SynonymSleuth)),
  "reading-comprehension": dynamic(() =>
    import("@/components/games/reading-comprehension").then((mod) => mod.ReadingComprehension)
  ),
  "wheel-of-fortune": dynamic(() => import("@/components/games/wheel-of-fortune").then((mod) => mod.WheelOfFortune)),
  "world-tour-wheel": dynamic(() => import("@/components/games/world-tour-wheel").then((mod) => mod.WorldTourWheel)),
  "hangman-challenge": dynamic(() => import("@/components/games/hangman-challenge").then((mod) => mod.HangmanChallenge)),
  "bingo-boost": dynamic(() => import("@/components/games/bingo-boost").then((mod) => mod.BingoBoost)),
  "arena-showdown-math": dynamic(() => import("@/components/games/arena-showdown").then((mod) => mod.ArenaShowdown)),
  "arena-showdown-science": dynamic(() => import("@/components/games/arena-showdown").then((mod) => mod.ArenaShowdown)),
  "arena-showdown-english": dynamic(() => import("@/components/games/arena-showdown").then((mod) => mod.ArenaShowdown)),
  "top-5-quiz": dynamic(() => import("@/components/games/top-5-quiz").then((mod) => mod.Top5Quiz)),
  "mystery-box": dynamic(() => import("@/components/games/mystery-box").then((mod) => mod.MysteryBox)),
  "crossword-connect": dynamic(() => import("@/components/games/crossword-connect").then((mod) => mod.CrosswordConnect)),
  "phonics-flash": dynamic(() => import("@/components/games/phonics-flash").then((mod) => mod.PhonicsFlash)),
  "article-architect": dynamic(() => import("@/components/games/article-architect").then((mod) => mod.ArticleArchitect)),
  "jeopardy-classroom": dynamic(() => import("@/components/games/jeopardy-classroom").then((mod) => mod.JeopardyClassroom)),
  "choose-your-gift": dynamic(() => import("@/components/games/choose-your-gift").then((mod) => mod.ChooseYourGift)),
  "vocabulary-match-up": dynamic(() =>
    import("@/components/games/vocabulary-match-up").then((mod) => mod.VocabularyMatchUp)
  ),
  "spelling-bee": dynamic(() => import("@/components/games/spelling-bee").then((mod) => mod.SpellingBee)),
  "spin-the-wheel": dynamic(() => import("@/components/games/spin-the-wheel").then((mod) => mod.SpinTheWheel)),
  "odd-one-out": dynamic(() => import("@/components/games/odd-one-out").then((mod) => mod.OddOneOut)),
  "emoji-enigma": dynamic(() => import("@/components/games/emoji-enigma").then((mod) => mod.EmojiEnigma)),
  "context-detective": dynamic(() => import("@/components/games/context-detective").then((mod) => mod.ContextDetective)),
  "word-morph": dynamic(() => import("@/components/games/word-morph").then((mod) => mod.WordMorph)),
  "algebraic-abyss": dynamic(() => import("@/components/games/algebraic-abyss").then((mod) => mod.AlgebraicAbyss)),
  "evolution-expedition": dynamic(() =>
    import("@/components/games/evolution-expedition").then((mod) => mod.EvolutionExpedition)
  ),
  "syntax-skyline": dynamic(() => import("@/components/games/syntax-skyline").then((mod) => mod.SyntaxSkyline)),
  "math-matrix": dynamic(() => import("@/components/games/math-matrix").then((mod) => mod.MathMatrix)),
  "vocab-vortex": dynamic(() => import("@/components/games/vocab-vortex").then((mod) => mod.VocabVortex)),
  "quantum-quest": dynamic(() => import("@/components/games/quantum-quest").then((mod) => mod.QuantumQuest)),
  "grammar-gladiator": dynamic(() => import("@/components/games/grammar-gladiator").then((mod) => mod.GrammarGladiator)),
  "synonym-sniper": dynamic(() => import("@/components/games/synonym-sniper").then((mod) => mod.SynonymSniper)),
  "idiom-inferno": dynamic(() => import("@/components/games/idiom-inferno").then((mod) => mod.IdiomInferno)),
  "molecule-maker": dynamic(() => import("@/components/games/molecule-maker").then((mod) => mod.MoleculeMaker)),
  "bio-hazard": dynamic(() => import("@/components/games/bio-hazard").then((mod) => mod.BioHazard)),
  "newtons-nightmare": dynamic(() => import("@/components/games/newtons-nightmare").then((mod) => mod.NewtonsNightmare)),
  "fraction-fortress": dynamic(() => import("@/components/games/fraction-fortress").then((mod) => mod.FractionFortress)),
  "data-detective": dynamic(() => import("@/components/games/data-detective").then((mod) => mod.DataDetective)),
  "geometry-genius": dynamic(() => import("@/components/games/geometry-genius").then((mod) => mod.GeometryGenius)),
  "neon-numbers-labyrinth": dynamic(() =>
    import("@/components/games/neon-numbers-labyrinth").then((mod) => mod.NeonNumbersLabyrinth)
  ),
  "galactic-cell-defender": dynamic(() =>
    import("@/components/games/galactic-cell-defender").then((mod) => mod.GalacticCellDefender)
  ),
  "mystic-synonym-spire": dynamic(() =>
    import("@/components/games/mystic-synonym-spire").then((mod) => mod.MysticSynonymSpire)
  ),
  "coordinate-cosmos": dynamic(() => import("@/components/games/coordinate-cosmos").then((mod) => mod.CoordinateCosmos)),
  "gene-genius": dynamic(() => import("@/components/games/gene-genius").then((mod) => mod.GeneGenius)),
  "literary-device-legend": dynamic(() =>
    import("@/components/games/literary-device-legend").then((mod) => mod.LiteraryDeviceLegend)
  ),
  "daily-verse": dynamic(() => import("@/components/games/daily-verse").then((mod) => mod.DailyVerse)),
  "cosmic-word-voyager": dynamic(() =>
    import("@/components/games/cosmic-word-voyager").then((mod) => mod.CosmicWordVoyager)
  ),
  "spellcaster-defense": dynamic(() =>
    import("@/components/games/spellcaster-defense").then((mod) => mod.SpellcasterDefense)
  ),
  "exploration-quest-3d": dynamic(
    () => import("@/components/games/exploration-quest-3d").then((mod) => mod.ExplorationQuest3D),
    { ssr: false }
  ),
  "living-puzzles-3d": dynamic(
    () => import("@/components/games/living-puzzles-3d").then((mod) => mod.LivingPuzzles3D),
    { ssr: false }
  ),
  "character-conversations-3d": dynamic(
    () => import("@/components/games/character-conversations-3d").then((mod) => mod.CharacterConversations3D),
    { ssr: false }
  ),
  "ai-storyteller-adventure": dynamic(() =>
    import("@/components/games/ai-storyteller-adventure").then((mod) => mod.AiStorytellerAdventure)
  ),
  "vocab-flipper-3d": dynamic(
    () => import("@/components/games/vocab-flipper-3d").then((mod) => mod.VocabFlipper3D),
    { ssr: false }
  ),
  "math-vault-3d": dynamic(() => import("@/components/games/math-vault-3d").then((mod) => mod.MathVault3D), {
    ssr: false,
  }),
  "math-dash-3d": dynamic(() => import("@/components/games/math-dash-3d").then((mod) => mod.MathDash3D), {
    ssr: false,
  }),
  "game-placeholder": dynamic(() => import("@/components/game-placeholder").then((mod) => mod.GamePlaceholder)),
  "three-corridor-speed": dynamic(() => import("@/components/games/three-corridor-speed"), { ssr: false }),
  "action-detector-3d": dynamic(
    () => import("@/components/games/action-detector-3d").then((mod) => mod.ActionDetector3D),
    { ssr: false }
  ),
  "equation-alchemist": dynamic(() =>
    import("@/components/games/equation-alchemist").then((mod) => mod.EquationAlchemist)
  ),
  "circuit-crafter": dynamic(() => import("@/components/games/circuit-crafter").then((mod) => mod.CircuitCrafter)),
  "etymology-expedition": dynamic(() =>
    import("@/components/games/etymology-expedition").then((mod) => mod.EtymologyExpedition)
  ),
  "draw-the-word": dynamic(() => import("@/components/games/draw-the-word").then((mod) => mod.DrawTheWord), { ssr: false }),
  "draw-the-math": dynamic(() => import("@/components/games/draw-the-math").then((mod) => mod.DrawTheMath), { ssr: false }),
  "math-tug-of-war": dynamic(() => import("@/components/games/math-tug-of-war").then((mod) => mod.MathTugOfWar), { ssr: false }),
  "english-tug-of-war": dynamic(() => import("@/components/games/english-tug-of-war").then((mod) => mod.EnglishTugOfWar), { ssr: false }),
};
