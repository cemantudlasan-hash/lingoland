'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Puzzle, Coins, Sparkles, Maximize, Minimize, RotateCcw, Volume2, ArrowRight, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PuzzleObject {
  id: string;
  name: string;
  emoji: string;
  letters: string[];
  animationType: 'car-drive' | 'rocket-launch';
  description: string;
  color: string;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const PUZZLES: PuzzleObject[] = [
  { id: 'car', name: 'Car', emoji: '🚗', letters: ['C', 'A', 'R'], animationType: 'car-drive', description: 'A road vehicle with four wheels.', color: 'from-red-500 to-rose-700' },
  { id: 'rocket', name: 'Rocket', emoji: '🚀', letters: ['R', 'O', 'C', 'K', 'E', 'T'], animationType: 'rocket-launch', description: 'A powerful spacecraft.', color: 'from-cyan-500 to-blue-700' },
  { id: 'apple', name: 'Apple', emoji: '🍎', letters: ['A', 'P', 'P', 'L', 'E'], animationType: 'car-drive', description: 'A sweet, crunchy fruit.', color: 'from-red-400 to-red-600' },
  { id: 'tree', name: 'Tree', emoji: '🌳', letters: ['T', 'R', 'E', 'E'], animationType: 'rocket-launch', description: 'A tall plant with a wooden trunk.', color: 'from-green-500 to-emerald-700' },
  { id: 'house', name: 'House', emoji: '🏠', letters: ['H', 'O', 'U', 'S', 'E'], animationType: 'car-drive', description: 'A building for human habitation.', color: 'from-amber-500 to-orange-700' },
  { id: 'boat', name: 'Boat', emoji: '⛵', letters: ['B', 'O', 'A', 'T'], animationType: 'car-drive', description: 'A small vessel for travelling on water.', color: 'from-blue-400 to-blue-600' },
  { id: 'pizza', name: 'Pizza', emoji: '🍕', letters: ['P', 'I', 'Z', 'Z', 'A'], animationType: 'rocket-launch', description: 'A savory dish of Italian origin.', color: 'from-yellow-400 to-orange-500' },
  { id: 'ghost', name: 'Ghost', emoji: '👻', letters: ['G', 'H', 'O', 'S', 'T'], animationType: 'rocket-launch', description: 'An apparition of a dead person.', color: 'from-slate-200 to-slate-400' },
  { id: 'alien', name: 'Alien', emoji: '👽', letters: ['A', 'L', 'I', 'E', 'N'], animationType: 'car-drive', description: 'A being from another planet.', color: 'from-lime-400 to-green-600' },
  { id: 'clock', name: 'Clock', emoji: '⏰', letters: ['C', 'L', 'O', 'C', 'K'], animationType: 'rocket-launch', description: 'Measures time.', color: 'from-rose-400 to-pink-600' },
  { id: 'sword', name: 'Sword', emoji: '🗡️', letters: ['S', 'W', 'O', 'R', 'D'], animationType: 'car-drive', description: 'A weapon with a long metal blade.', color: 'from-zinc-400 to-zinc-600' },
  { id: 'crown', name: 'Crown', emoji: '👑', letters: ['C', 'R', 'O', 'W', 'N'], animationType: 'rocket-launch', description: 'A circular ornamental headdress worn by a monarch.', color: 'from-yellow-300 to-amber-500' },
  { id: 'heart', name: 'Heart', emoji: '❤️', letters: ['H', 'E', 'A', 'R', 'T'], animationType: 'car-drive', description: 'A hollow muscular organ that pumps blood.', color: 'from-red-500 to-pink-600' },
  { id: 'star', name: 'Star', emoji: '⭐', letters: ['S', 'T', 'A', 'R'], animationType: 'rocket-launch', description: 'A luminous point in the night sky.', color: 'from-yellow-200 to-yellow-400' },
  { id: 'moon', name: 'Moon', emoji: '🌙', letters: ['M', 'O', 'O', 'N'], animationType: 'car-drive', description: 'The natural satellite of the earth.', color: 'from-blue-200 to-indigo-300' },
  { id: 'plane', name: 'Plane', emoji: '✈️', letters: ['P', 'L', 'A', 'N', 'E'], animationType: 'rocket-launch', description: 'A powered flying vehicle.', color: 'from-sky-400 to-blue-600' },
  { id: 'train', name: 'Train', emoji: '🚂', letters: ['T', 'R', 'A', 'I', 'N'], animationType: 'car-drive', description: 'A series of connected railway carriages.', color: 'from-stone-600 to-stone-800' },
  { id: 'phone', name: 'Phone', emoji: '📱', letters: ['P', 'H', 'O', 'N', 'E'], animationType: 'car-drive', description: 'A device for communication.', color: 'from-slate-700 to-black' },
  { id: 'chair', name: 'Chair', emoji: '🪑', letters: ['C', 'H', 'A', 'I', 'R'], animationType: 'car-drive', description: 'A separate seat for one person.', color: 'from-amber-700 to-amber-900' },
  { id: 'table', name: 'Table', emoji: '🪚', letters: ['T', 'A', 'B', 'L', 'E'], animationType: 'car-drive', description: 'A piece of furniture with a flat top.', color: 'from-yellow-700 to-amber-800' },
  { id: 'shirt', name: 'Shirt', emoji: '👕', letters: ['S', 'H', 'I', 'R', 'T'], animationType: 'car-drive', description: 'A garment for the upper body.', color: 'from-blue-400 to-indigo-500' },
  { id: 'shoes', name: 'Shoes', emoji: '👞', letters: ['S', 'H', 'O', 'E', 'S'], animationType: 'car-drive', description: 'Coverings for the feet.', color: 'from-orange-900 to-stone-900' },
  { id: 'cloud', name: 'Cloud', emoji: '☁️', letters: ['C', 'L', 'O', 'U', 'D'], animationType: 'rocket-launch', description: 'A visible mass of condensed watery vapour.', color: 'from-slate-200 to-slate-400' },
  { id: 'earth', name: 'Earth', emoji: '🌍', letters: ['E', 'A', 'R', 'T', 'H'], animationType: 'car-drive', description: 'The planet on which we live.', color: 'from-emerald-400 to-blue-600' },
  { id: 'water', name: 'Water', emoji: '💧', letters: ['W', 'A', 'T', 'E', 'R'], animationType: 'car-drive', description: 'A transparent, tasteless liquid.', color: 'from-cyan-300 to-blue-500' },
  { id: 'fire', name: 'Fire', emoji: '🔥', letters: ['F', 'I', 'R', 'E'], animationType: 'rocket-launch', description: 'Combustion or burning.', color: 'from-orange-500 to-red-600' },
  { id: 'music', name: 'Music', emoji: '🎵', letters: ['M', 'U', 'S', 'I', 'C'], animationType: 'car-drive', description: 'Vocal or instrumental sounds.', color: 'from-purple-400 to-pink-500' },
  { id: 'book', name: 'Book', emoji: '📖', letters: ['B', 'O', 'O', 'K'], animationType: 'car-drive', description: 'Pages bound together.', color: 'from-blue-300 to-indigo-500' },
  { id: 'pen', name: 'Pen', emoji: '🖊️', letters: ['P', 'E', 'N'], animationType: 'car-drive', description: 'An instrument for writing or drawing.', color: 'from-blue-700 to-blue-900' },
  { id: 'dog', name: 'Dog', emoji: '🐶', letters: ['D', 'O', 'G'], animationType: 'car-drive', description: 'A domesticated carnivorous mammal.', color: 'from-yellow-600 to-amber-700' },
  { id: 'cat', name: 'Cat', emoji: '🐱', letters: ['C', 'A', 'T'], animationType: 'car-drive', description: 'A small domesticated carnivorous mammal.', color: 'from-orange-300 to-orange-500' },
  { id: 'bird', name: 'Bird', emoji: '🐦', letters: ['B', 'I', 'R', 'D'], animationType: 'rocket-launch', description: 'A feathered, winged, bipedal animal.', color: 'from-sky-300 to-blue-500' },
  { id: 'fish', name: 'Fish', emoji: '🐟', letters: ['F', 'I', 'S', 'H'], animationType: 'car-drive', description: 'A limbless cold-blooded vertebrate.', color: 'from-cyan-400 to-blue-500' },
  { id: 'bear', name: 'Bear', emoji: '🐻', letters: ['B', 'E', 'A', 'R'], animationType: 'car-drive', description: 'A large, heavy mammal.', color: 'from-amber-800 to-brown-900' },
  { id: 'frog', name: 'Frog', emoji: '🐸', letters: ['F', 'R', 'O', 'G'], animationType: 'car-drive', description: 'A tailless amphibian.', color: 'from-lime-500 to-green-600' },
  { id: 'lion', name: 'Lion', emoji: '🦁', letters: ['L', 'I', 'O', 'N'], animationType: 'rocket-launch', description: 'A large wild cat known as the king of the jungle.', color: 'from-amber-500 to-amber-700' },
  { id: 'milk', name: 'Milk', emoji: '🥛', letters: ['M', 'I', 'L', 'K'], animationType: 'car-drive', description: 'A white liquid produced by cows.', color: 'from-slate-100 to-slate-350' },
  { id: 'duck', name: 'Duck', emoji: '🦆', letters: ['D', 'U', 'C', 'K'], animationType: 'car-drive', description: 'A waterbird with webbed feet.', color: 'from-yellow-400 to-yellow-600' },
  { id: 'cake', name: 'Cake', emoji: '🍰', letters: ['C', 'A', 'K', 'E'], animationType: 'rocket-launch', description: 'A sweet baked dessert.', color: 'from-pink-400 to-rose-500' },
  { id: 'bike', name: 'Bike', emoji: '🚲', letters: ['B', 'I', 'K', 'E'], animationType: 'car-drive', description: 'A two-wheeled vehicle powered by pedals.', color: 'from-emerald-500 to-teal-700' },
  { id: 'rose', name: 'Rose', emoji: '🌹', letters: ['R', 'O', 'S', 'E'], animationType: 'rocket-launch', description: 'A sweet-smelling red flower.', color: 'from-red-500 to-rose-600' },
  { id: 'ring', name: 'Ring', emoji: '💍', letters: ['R', 'I', 'N', 'G'], animationType: 'rocket-launch', description: 'A piece of jewelry worn on a finger.', color: 'from-cyan-400 to-indigo-500' },
  { id: 'grape', name: 'Grape', emoji: '🍇', letters: ['G', 'R', 'A', 'P', 'E'], animationType: 'car-drive', description: 'A small, sweet green or purple berry.', color: 'from-purple-500 to-indigo-700' },
  { id: 'pear', name: 'Pear', emoji: '🍐', letters: ['P', 'E', 'A', 'R'], animationType: 'rocket-launch', description: 'A sweet, bell-shaped fruit.', color: 'from-lime-400 to-green-600' },
  { id: 'melon', name: 'Melon', emoji: '🍈', letters: ['M', 'E', 'L', 'O', 'N'], animationType: 'car-drive', description: 'A large sweet fruit with many seeds.', color: 'from-green-400 to-emerald-600' },
  { id: 'lemon', name: 'Lemon', emoji: '🍋', letters: ['L', 'E', 'M', 'O', 'N'], animationType: 'rocket-launch', description: 'A sour yellow citrus fruit.', color: 'from-yellow-300 to-yellow-500' },
  { id: 'peach', name: 'Peach', emoji: '🍑', letters: ['P', 'E', 'A', 'C', 'H'], animationType: 'car-drive', description: 'A round juicy fruit with downy yellowish-pink skin.', color: 'from-orange-400 to-pink-500' },
  { id: 'banana', name: 'Banana', emoji: '🍌', letters: ['B', 'A', 'N', 'A', 'N', 'A'], animationType: 'car-drive', description: 'A long curved yellow fruit.', color: 'from-yellow-300 to-amber-400' },
  { id: 'carrot', name: 'Carrot', emoji: '🥕', letters: ['C', 'A', 'R', 'R', 'O', 'T'], animationType: 'rocket-launch', description: 'An orange root vegetable.', color: 'from-orange-400 to-red-500' },
  { id: 'onion', name: 'Onion', emoji: '🧅', letters: ['O', 'N', 'I', 'O', 'N'], animationType: 'car-drive', description: 'A vegetable with a strong taste and smell.', color: 'from-purple-300 to-pink-400' },
  { id: 'bread', name: 'Bread', emoji: '🍞', letters: ['B', 'R', 'E', 'A', 'D'], animationType: 'car-drive', description: 'Food made of flour, water, and yeast mixed together and baked.', color: 'from-amber-600 to-amber-800' },
  { id: 'cheese', name: 'Cheese', emoji: '🧀', letters: ['C', 'H', 'E', 'E', 'S', 'E'], animationType: 'rocket-launch', description: 'A yellow or white food made from milk.', color: 'from-yellow-400 to-amber-500' },
  { id: 'cookie', name: 'Cookie', emoji: '🍪', letters: ['C', 'O', 'O', 'K', 'I', 'E'], animationType: 'car-drive', description: 'A small sweet baked treat.', color: 'from-amber-700 to-yellow-800' },
  { id: 'donut', name: 'Donut', emoji: '🍩', letters: ['D', 'O', 'N', 'U', 'T'], animationType: 'rocket-launch', description: 'A small fried cake of sweetened dough, typically ring-shaped.', color: 'from-pink-400 to-purple-600' },
  { id: 'candy', name: 'Candy', emoji: '🍬', letters: ['C', 'A', 'N', 'D', 'Y'], animationType: 'car-drive', description: 'A sweet food made with sugar.', color: 'from-pink-300 to-rose-400' },
  { id: 'honey', name: 'Honey', emoji: '🍯', letters: ['H', 'O', 'N', 'E', 'Y'], animationType: 'rocket-launch', description: 'A sweet, sticky yellow fluid made by bees.', color: 'from-yellow-500 to-amber-600' },
  { id: 'crab', name: 'Crab', emoji: '🦀', letters: ['C', 'R', 'A', 'B'], animationType: 'car-drive', description: 'A sea creature with a broad flat shell and ten legs.', color: 'from-red-500 to-rose-600' },
  { id: 'snail', name: 'Snail', emoji: '🐌', letters: ['S', 'N', 'A', 'I', 'L'], animationType: 'car-drive', description: 'A small creature with a soft wet body and a round shell.', color: 'from-amber-500 to-stone-600' },
  { id: 'spider', name: 'Spider', emoji: '🕷️', letters: ['S', 'P', 'I', 'D', 'E', 'R'], animationType: 'rocket-launch', description: 'An eight-legged arachnid that spins webs.', color: 'from-slate-700 to-slate-900' },
  { id: 'turtle', name: 'Turtle', emoji: '🐢', letters: ['T', 'U', 'R', 'T', 'L', 'E'], animationType: 'car-drive', description: 'A slow-moving reptile with a protective shell.', color: 'from-emerald-500 to-green-700' },
  { id: 'snake', name: 'Snake', emoji: '🐍', letters: ['S', 'N', 'A', 'K', 'E'], animationType: 'car-drive', description: 'A long limbless reptile.', color: 'from-green-500 to-emerald-700' },
  { id: 'rabbit', name: 'Rabbit', emoji: '🐰', letters: ['R', 'A', 'B', 'B', 'I', 'T'], animationType: 'rocket-launch', description: 'A small furry mammal with long ears.', color: 'from-slate-300 to-slate-400' },
  { id: 'monkey', name: 'Monkey', emoji: '🐵', letters: ['M', 'O', 'N', 'K', 'E', 'Y'], animationType: 'rocket-launch', description: 'A clever primate with a long tail.', color: 'from-amber-800 to-amber-950' },
  { id: 'koala', name: 'Koala', emoji: '🐨', letters: ['K', 'O', 'A', 'L', 'A'], animationType: 'car-drive', description: 'A bear-like arboreal Australian marsupial.', color: 'from-slate-450 to-slate-600' },
  { id: 'panda', name: 'Panda', emoji: '🐼', letters: ['P', 'A', 'N', 'D', 'A'], animationType: 'car-drive', description: 'A large bearlike mammal with black and white markings.', color: 'from-slate-600 to-neutral-900' },
  { id: 'fox', name: 'Fox', emoji: '🦊', letters: ['F', 'O', 'X'], animationType: 'car-drive', description: 'A wild mammal with a pointed muzzle and bushy tail.', color: 'from-orange-500 to-red-650' },
  { id: 'wolf', name: 'Wolf', emoji: '🐺', letters: ['W', 'O', 'L', 'F'], animationType: 'rocket-launch', description: 'A wild carnivorous mammal of the dog family.', color: 'from-slate-500 to-slate-700' },
  { id: 'tiger', name: 'Tiger', emoji: '🐯', letters: ['T', 'I', 'G', 'E', 'R'], animationType: 'car-drive', description: 'A large solitary cat with a striped coat.', color: 'from-orange-500 to-yellow-600' },
  { id: 'zebra', name: 'Zebra', emoji: '🦓', letters: ['Z', 'E', 'B', 'R', 'A'], animationType: 'car-drive', description: 'An African wild horse with black-and-white stripes.', color: 'from-slate-800 to-stone-900' },
  { id: 'horse', name: 'Horse', emoji: '🐴', letters: ['H', 'O', 'R', 'S', 'E'], animationType: 'car-drive', description: 'A large plant-eating domesticated mammal with hooves.', color: 'from-amber-700 to-amber-900' },
  { id: 'sheep', name: 'Sheep', emoji: '🐑', letters: ['S', 'H', 'E', 'E', 'P'], animationType: 'car-drive', description: 'A domesticated ruminant mammal with a thick woolly coat.', color: 'from-neutral-200 to-neutral-400' },
  { id: 'camel', name: 'Camel', emoji: '🐫', letters: ['C', 'A', 'M', 'E', 'L'], animationType: 'car-drive', description: 'A large mammal with long slender legs and humps on its back.', color: 'from-amber-500 to-amber-700' },
  { id: 'whale', name: 'Whale', emoji: '🐋', letters: ['W', 'H', 'A', 'L', 'E'], animationType: 'car-drive', description: 'A very large marine mammal.', color: 'from-blue-500 to-indigo-600' },
  { id: 'shark', name: 'Shark', emoji: '🦈', letters: ['S', 'H', 'A', 'R', 'K'], animationType: 'car-drive', description: 'A large predatory sea fish.', color: 'from-slate-400 to-blue-600' },
  { id: 'octopus', name: 'Octopus', emoji: '🐙', letters: ['O', 'C', 'T', 'O', 'P', 'U', 'S'], animationType: 'rocket-launch', description: 'A sea creature with a soft body and eight long arms.', color: 'from-purple-400 to-pink-500' },
  { id: 'sun', name: 'Sun', emoji: '☀️', letters: ['S', 'U', 'N'], animationType: 'rocket-launch', description: 'The star around which the earth orbits.', color: 'from-yellow-400 to-orange-500' },
  { id: 'rain', name: 'Rain', emoji: '🌧️', letters: ['R', 'A', 'I', 'N'], animationType: 'car-drive', description: 'Water falling in drops from the atmosphere.', color: 'from-blue-300 to-cyan-500' },
  { id: 'snow', name: 'Snow', emoji: '❄️', letters: ['S', 'N', 'O', 'W'], animationType: 'rocket-launch', description: 'Water vapor frozen into ice crystals.', color: 'from-sky-200 to-blue-300' },
  { id: 'wind', name: 'Wind', emoji: '💨', letters: ['W', 'I', 'N', 'D'], animationType: 'car-drive', description: 'The perceptible natural movement of the air.', color: 'from-teal-200 to-slate-400' },
  { id: 'leaf', name: 'Leaf', emoji: '🍃', letters: ['L', 'E', 'A', 'F'], animationType: 'rocket-launch', description: 'A flattened structure of a higher plant, typically green.', color: 'from-green-400 to-emerald-500' },
  { id: 'flower', name: 'Flower', emoji: '🌸', letters: ['F', 'L', 'O', 'W', 'E', 'R'], animationType: 'rocket-launch', description: 'The seed-bearing part of a plant.', color: 'from-pink-300 to-pink-500' },
  { id: 'beach', name: 'Beach', emoji: '🏖️', letters: ['B', 'E', 'A', 'C', 'H'], animationType: 'car-drive', description: 'A pebbly or sandy shore by the ocean.', color: 'from-yellow-300 to-blue-400' },
  { id: 'desert', name: 'Desert', emoji: '🏜️', letters: ['D', 'E', 'S', 'E', 'R', 'T'], animationType: 'car-drive', description: 'A dry, sandy area of land with little water.', color: 'from-yellow-500 to-amber-600' },
  { id: 'river', name: 'River', emoji: '🏞️', letters: ['R', 'I', 'V', 'E', 'R'], animationType: 'car-drive', description: 'A large natural stream of water flowing in a channel.', color: 'from-cyan-400 to-blue-600' },
  { id: 'drum', name: 'Drum', emoji: '🥁', letters: ['D', 'R', 'U', 'M'], animationType: 'rocket-launch', description: 'A percussion instrument sounded by being struck.', color: 'from-red-600 to-amber-600' },
  { id: 'guitar', name: 'Guitar', emoji: '🎸', letters: ['G', 'U', 'I', 'T', 'A', 'R'], animationType: 'rocket-launch', description: 'A stringed musical instrument with six or twelve strings.', color: 'from-rose-500 to-purple-600' },
  { id: 'violin', name: 'Violin', emoji: '🎻', letters: ['V', 'I', 'O', 'L', 'I', 'N'], animationType: 'car-drive', description: 'A stringed musical instrument played with a bow.', color: 'from-amber-700 to-amber-800' },
  { id: 'trumpet', name: 'Trumpet', emoji: '🎺', letters: ['T', 'R', 'U', 'M', 'P', 'E', 'T'], animationType: 'rocket-launch', description: 'A brass musical instrument.', color: 'from-yellow-400 to-amber-500' },
  { id: 'hat', name: 'Hat', emoji: '🎩', letters: ['H', 'A', 'T'], animationType: 'rocket-launch', description: 'A shaped covering for the head.', color: 'from-slate-800 to-black' },
  { id: 'coat', name: 'Coat', emoji: '🧥', letters: ['C', 'O', 'A', 'T'], animationType: 'car-drive', description: 'An outer garment worn outdoors.', color: 'from-amber-700 to-stone-700' },
  { id: 'watch', name: 'Watch', emoji: '⌚', letters: ['W', 'A', 'T', 'C', 'H'], animationType: 'rocket-launch', description: 'A small timepiece worn on a wrist.', color: 'from-indigo-500 to-slate-800' },
  { id: 'wallet', name: 'Wallet', emoji: '👛', letters: ['W', 'A', 'L', 'L', 'E', 'T'], animationType: 'car-drive', description: 'A pocket-sized flat case for holding money.', color: 'from-pink-400 to-rose-600' },
  { id: 'key', name: 'Key', emoji: '🔑', letters: ['K', 'E', 'Y'], animationType: 'rocket-launch', description: 'A small piece of shaped metal used to open a lock.', color: 'from-yellow-300 to-amber-400' },
  { id: 'lamp', name: 'Lamp', emoji: '💡', letters: ['L', 'A', 'M', 'P'], animationType: 'rocket-launch', description: 'A device for giving light.', color: 'from-yellow-300 to-orange-400' },
  { id: 'door', name: 'Door', emoji: '🚪', letters: ['D', 'O', 'O', 'R'], animationType: 'car-drive', description: 'A hinged barrier used to close an entrance.', color: 'from-amber-800 to-stone-800' },
  { id: 'window', name: 'Window', emoji: '🪟', letters: ['W', 'I', 'N', 'D', 'O', 'W'], animationType: 'rocket-launch', description: 'An opening in a wall to let in light and air.', color: 'from-sky-400 to-blue-500' },
  { id: 'brush', name: 'Brush', emoji: '🧹', letters: ['B', 'R', 'U', 'S', 'H'], animationType: 'car-drive', description: 'An implement with bristles for cleaning.', color: 'from-amber-650 to-stone-600' },
  { id: 'soap', name: 'Soap', emoji: '🧼', letters: ['S', 'O', 'A', 'P'], animationType: 'car-drive', description: 'A substance used with water for washing.', color: 'from-teal-300 to-emerald-400' },
  { id: 'pencil', name: 'Pencil', emoji: '✏️', letters: ['P', 'E', 'N', 'C', 'I', 'L'], animationType: 'car-drive', description: 'An instrument for writing or drawing.', color: 'from-yellow-400 to-amber-500' },
  { id: 'crayon', name: 'Crayon', emoji: '🖍️', letters: ['C', 'R', 'A', 'Y', 'O', 'N'], animationType: 'rocket-launch', description: 'A pencil or stick of colored wax.', color: 'from-rose-500 to-pink-600' },
  { id: 'hammer', name: 'Hammer', emoji: '🔨', letters: ['H', 'A', 'M', 'M', 'E', 'R'], animationType: 'car-drive', description: 'A tool with a heavy metal head.', color: 'from-slate-500 to-stone-700' },
  { id: 'magnet', name: 'Magnet', emoji: '🧲', letters: ['M', 'A', 'G', 'N', 'E', 'T'], animationType: 'rocket-launch', description: 'A piece of iron that attracts other metal objects.', color: 'from-red-500 to-slate-500' },
  { id: 'mirror', name: 'Mirror', emoji: '🪞', letters: ['M', 'I', 'R', 'R', 'O', 'R'], animationType: 'rocket-launch', description: 'A surface that reflects a clear image.', color: 'from-teal-200 to-cyan-400' }
];

export function LivingPuzzles3D({ onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [currentPuzzleIdx, setCurrentPuzzleIdx] = React.useState(0);
  const [assembledLetters, setAssembledLetters] = React.useState<string[]>([]);
  const [gameState, setGameState] = React.useState<'idle' | 'playing' | 'animating' | 'completed'>('idle');
  const [speakActive, setSpeakActive] = React.useState(false);
  

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  
  const [activePuzzles, setActivePuzzles] = React.useState<PuzzleObject[]>([]);
  
  React.useEffect(() => {
    setActivePuzzles(shuffleArray(PUZZLES).slice(0, 5));
  }, []);
  
  const activePuzzle = activePuzzles[currentPuzzleIdx] || PUZZLES[0];


  const handleStart = () => {
    setGameState('playing');
    setAssembledLetters([]);
    
  };

  const handleLetterClick = (letter: string) => {
    if (gameState !== 'playing') return;

    const nextIndex = assembledLetters.length;
    const expectedLetter = activePuzzle.letters[nextIndex];

    if (letter === expectedLetter) {
      const updated = [...assembledLetters, letter];
      setAssembledLetters(updated);
      

      // Play phonetic sound
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(letter.toLowerCase());
        utterance.rate = 1.1;
        window.speechSynthesis.speak(utterance);
      }

      if (updated.length === activePuzzle.letters.length) {
        setGameState('animating');
        
        // Play word sound after a small delay
        setTimeout(() => {
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            setSpeakActive(true);
            const utterance = new SpeechSynthesisUtterance(activePuzzle.name);
            utterance.rate = 0.9;
            utterance.onend = () => setSpeakActive(false);
            window.speechSynthesis.speak(utterance);
          }
        }, 600);

        // Transition to completed state after animation finishes
        setTimeout(() => {
          setGameState('completed');
          // Trigger coins drop
          window.dispatchEvent(new CustomEvent('lingoland_game_completed_hijack', {
            detail: { state: 'finished' }
          }));
        }, 3200);
      }
    } else {
      // Mistake penalty
      
    }
  };

  const handleNextPuzzle = () => {
    if (currentPuzzleIdx < activePuzzles.length - 1) {
      setCurrentPuzzleIdx(prev => prev + 1);
      setAssembledLetters([]);
      setGameState('playing');
    } else {
      setGameState('completed');
    }
  };

  const handleRestart = () => {
    setActivePuzzles(shuffleArray(PUZZLES).slice(0, 5));
    setCurrentPuzzleIdx(0);
    setAssembledLetters([]);
    setGameState('playing');
    
  };

  // Get scrambled letters for selection
  const selectionLetters = React.useMemo(() => {
    if (!activePuzzle) return [];
    return shuffleArray(activePuzzle.letters);
  }, [activePuzzle, currentPuzzleIdx]);

  return (
    <div className={cn(
      "w-full transition-all duration-500 flex flex-col items-center bg-slate-950 text-white relative overflow-hidden",
      isFullscreen 
        ? "min-h-screen rounded-none border-none p-8 max-w-none justify-center" 
        : "max-w-4xl mx-auto rounded-3xl p-6 border border-slate-800 shadow-2xl min-h-[600px]"
    )}>
      {/* Background visual effects */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="w-full flex items-center justify-between border-b border-slate-900 pb-4 mb-6 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl">
            <Puzzle className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent">Animated "Living" Puzzles</h2>
            <p className="text-xs text-slate-400">Assemble spelling blocks to bring objects to life with 3D animations!</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onToggleFullscreen && (
            <button onClick={onToggleFullscreen} className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 border border-slate-800/50 transition-colors">
              {isFullscreen ? <Minimize className="h-4.5 w-4.5" /> : <Maximize className="h-4.5 w-4.5" />}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'idle' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-center text-center max-w-md my-auto space-y-6 z-10"
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 blur opacity-40 animate-pulse" />
              <div className="relative p-6 bg-slate-900 border border-slate-800 rounded-full">
                <Puzzle className="h-16 w-16 text-cyan-400" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tight">Living Puzzles 3D</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Connect the correct spelling blocks in sequence to build items. As soon as you solve the puzzle, see the 3D structures come to life!
              </p>
            </div>
            <button
              onClick={handleStart}
              className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black uppercase text-sm tracking-widest rounded-2xl transition-all shadow-[0_4px_25px_rgba(6,182,212,0.25)] hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Play className="h-4 w-4 fill-current" />
              Start Puzzle
            </button>
          </motion.div>
        )}

        {(gameState === 'playing' || gameState === 'animating') && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-6 z-10"
          >
            {/* Left HUD Information Box */}
            <div className="md:col-span-1 flex flex-col gap-4">
              <div className="bg-slate-950/60 border border-slate-900 rounded-3xl p-6 flex flex-col justify-between h-full shadow-lg">
                <div className="space-y-6">
                  <div>
                    <span className="text-xs sm:text-sm uppercase font-black tracking-widest text-cyan-400">Object Guide</span>
                    <h3 className="text-2xl sm:text-3xl font-black text-white mt-2">
                      {gameState === 'playing' ? '???' : activePuzzle.name}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-350 italic mt-3 leading-relaxed">"{activePuzzle.description}"</p>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4 text-xs sm:text-sm text-slate-400 leading-relaxed font-bold">
                  {gameState === 'playing' 
                    ? "Click the letter blocks in the correct spelling sequence to assemble the 3D outline!"
                    : "Spelling complete! Building is coming to life..."}
                </div>
              </div>
            </div>

            {/* Central 3D Puzzle Workbench */}
            <div className="md:col-span-2 bg-slate-950/60 border border-slate-900 rounded-3xl p-6 flex flex-col items-center justify-between min-h-[480px] relative overflow-hidden">
              {/* Progress indicator */}
              <div className="text-[10px] uppercase font-black tracking-widest text-slate-500 bg-slate-950 border border-slate-900 px-3 py-1 rounded-full z-20">
                Puzzle {currentPuzzleIdx + 1} of {activePuzzles.length}
              </div>

              {/* The 3D workbench viewport */}
              <div className="w-[450px] h-[280px] flex items-center justify-center [perspective:800px] relative">
                
                {/* 3D Object animation viewport container */}
                <div 
                  className={`relative [transform-style:preserve-3d] transition-all duration-300 w-full h-full flex items-center justify-center`}
                  style={{ transform: 'rotateX(20deg) rotateY(-15deg)' }}
                >
                  
                  {/* Grid base workbench floor */}
                  <div 
                    className="absolute w-[360px] h-[280px] bg-slate-900/30 border border-slate-800/40 [transform:rotateX(90deg)_translateZ(-90px)]"
                    style={{
                      backgroundImage: 'linear-gradient(rgba(6,182,212,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.04) 1px, transparent 1px)',
                      backgroundSize: '15px 15px',
                    }}
                  />

                  {/* MOCK ASSEMBLY / ANIMATED OBJECT */}
                  <motion.div
                    animate={gameState === 'animating' ? (
                      activePuzzle.animationType === 'car-drive' 
                        ? { 
                            x: [0, -10, 300], 
                            y: [0, -5, 0], 
                            rotateZ: [0, 5, -2],
                            scale: [1, 1.05, 0.2],
                            transition: { duration: 2.8, ease: 'easeInOut' }
                          } 
                        : { 
                            y: [0, 15, -400], 
                            rotateY: [0, 180, 720],
                            scale: [1, 0.9, 0.1],
                            transition: { duration: 2.8, ease: 'easeIn' }
                          }
                    ) : {}}
                    className={`relative [transform-style:preserve-3d] w-48 h-32 rounded-2xl flex flex-col items-center justify-center`}
                  >
                    {/* Outline Wireframe placeholder */}
                    {gameState === 'playing' && (
                      <div className="absolute inset-0 border border-dashed border-cyan-500/25 rounded-2xl bg-cyan-500/5 flex items-center justify-center select-none pointer-events-none">
                        <span className="text-5xl font-extrabold opacity-15">❓</span>
                      </div>
                    )}

                    {/* Fully Assembled Living block */}
                    {gameState === 'animating' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center [transform-style:preserve-3d]">
                        {/* 3D Object Solid block wrapper */}
                        <div className={`p-6 bg-gradient-to-r ${activePuzzle.color} border border-cyan-400/40 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/10`}>
                          <span className="text-6xl animate-bounce">{activePuzzle.emoji}</span>
                        </div>

                        {/* Thruster/Drive particles representation */}
                        {activePuzzle.animationType === 'rocket-launch' && (
                          <div className="absolute top-[120px] w-6 h-16 bg-gradient-to-b from-orange-500 via-amber-400 to-transparent rounded-full animate-pulse filter blur-[1px]" />
                        )}
                        {activePuzzle.animationType === 'car-drive' && (
                          <div className="absolute right-[160px] w-16 h-3 bg-gradient-to-l from-white/40 to-transparent rounded-full animate-pulse filter blur-[1px]" />
                        )}
                      </div>
                    )}

                    {/* Sequential built letter blocks */}
                    <div className="absolute -bottom-10 flex gap-2 [transform-style:preserve-3d] z-10">
                      {activePuzzle.letters.map((letObj, idx) => {
                        const isFilled = idx < assembledLetters.length;

                        return (
                          <div 
                            key={idx}
                            className={`w-12 h-12 flex items-center justify-center rounded-lg border font-black text-2xl transition-all duration-300 [transform-style:preserve-3d] [transform:translateZ(15px)] ${
                              isFilled 
                                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/10 scale-105' 
                                : 'border-slate-800 bg-slate-900/60 text-slate-600'
                            }`}
                          >
                            {isFilled ? letObj : '_'}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Scrambled Letter Blocks Selection Panel */}
              <div className="w-full mt-6">
                {gameState === 'playing' ? (
                  <div className="flex flex-wrap gap-4 items-center justify-center">
                    {selectionLetters.map((letObj, index) => {
                      const expectedNextIndex = assembledLetters.length;
                      const isCompleted = assembledLetters.includes(letObj) && assembledLetters.indexOf(letObj) < expectedNextIndex;

                      return (
                        <button
                          key={index}
                          onClick={() => handleLetterClick(letObj)}
                          className="w-16 h-16 bg-slate-900 hover:bg-slate-850 border-2 border-slate-800 hover:border-cyan-400 text-cyan-200 hover:text-white font-black rounded-2xl text-2xl transition-all hover:scale-105 active:scale-95 shadow-md flex items-center justify-center relative overflow-hidden"
                        >
                          <span className="relative z-10">{letObj}</span>
                          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-16 text-cyan-400 font-extrabold uppercase text-sm tracking-wider animate-pulse flex gap-2">
                    <Sparkles className="h-5 w-5 text-cyan-400" />
                    Living animation playing...
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'completed' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-center text-center max-w-md my-auto space-y-6 z-10"
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 blur opacity-40 animate-pulse" />
              <div className="relative p-6 bg-slate-900 border border-slate-800 rounded-full">
                <CheckCircleIcon className="h-16 w-16 text-emerald-400" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tight">All Puzzles Solved!</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Fantastic spelling skill! You correctly connected all word puzzles, watched them come to life in full 3D, and unlocked maximum coins!
              </p>
            </div>

            

            <div className="flex gap-4">
              <button
                onClick={handleRestart}
                className="px-8 py-3.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
              >
                <RotateCcw className="h-4 w-4" />
                Play Again
              </button>
              {currentPuzzleIdx < activePuzzles.length - 1 && (
                <button
                  onClick={handleNextPuzzle}
                  className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-md hover:scale-105 active:scale-95 flex items-center gap-1.5"
                >
                  Next Puzzle
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple internal inline icon to prevent missing import issues
function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
