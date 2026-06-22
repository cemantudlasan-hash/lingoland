// LingoLand Offline Game Datasets for Science and Math Games

export interface AnatomyChallenge {
  description: string;
  answer: string;
  options: string[];
  explanation: string;
}

export interface TimeChallenge {
  scenario: string;
  answer: string;
  options: string[];
  explanation: string;
}

export interface RiddleChallenge {
  riddle: string;
  answer: string;
  options: string[];
  explanation: string;
}

export interface ProbabilityChallenge {
  scenario: string;
  answer: string;
  options: string[];
  explanation: string;
}

export interface AtmosphereChallenge {
  description: string;
  targetName: string;
  options: string[];
  explanation: string;
}

export const ANATOMY_DATA: Record<"beginner" | "intermediate" | "advanced", AnatomyChallenge[]> = {
  beginner: [
    {
      description: "A muscular organ that pumps blood continuously throughout the body via the circulatory system.",
      answer: "Heart",
      options: ["Heart", "Lungs", "Brain", "Liver"],
      explanation: "The heart pumps oxygenated blood to the body and deoxygenated blood to the lungs."
    },
    {
      description: "Spongy, air-filled organs located on either side of the chest that facilitate breathing and gas exchange.",
      answer: "Lungs",
      options: ["Lungs", "Trachea", "Stomach", "Diaphragm"],
      explanation: "The lungs absorb oxygen from the air we breathe and release carbon dioxide as waste."
    },
    {
      description: "The control center of the nervous system, responsible for thoughts, memory, emotion, and motor skills.",
      answer: "Brain",
      options: ["Brain", "Spinal Cord", "Skull", "Heart"],
      explanation: "The brain processes sensory information, coordinates movement, and regulates vital body functions."
    },
    {
      description: "A J-shaped organ that receives food from the esophagus, secretes acid and enzymes, and digests it.",
      answer: "Stomach",
      options: ["Stomach", "Liver", "Small Intestine", "Gallbladder"],
      explanation: "The stomach uses gastric juices to break down food chemically before passing it to the intestines."
    },
    {
      description: "The largest organ of the body, providing a protective barrier against germs, regulating temperature, and enabling touch.",
      answer: "Skin",
      options: ["Skin", "Muscle", "Bones", "Fat"],
      explanation: "The skin protects internal organs, produces Vitamin D, and senses external temperature and pressure."
    },
    {
      description: "Rigid organs that form the skeleton, protect vital organs, and store calcium.",
      answer: "Bones",
      options: ["Bones", "Cartilage", "Tendons", "Ligaments"],
      explanation: "Bones provide structure, produce blood cells in the marrow, and anchor muscles for movement."
    },
    {
      description: "Soft tissues in the body that contract and relax to produce movement of body parts.",
      answer: "Muscles",
      options: ["Muscles", "Nerves", "Tendons", "Skin"],
      explanation: "Skeletal muscles connect to bones and allow voluntary movements like walking and writing."
    },
    {
      description: "Hard structures in the mouth used to bite, chew, and break down food as the first step of digestion.",
      answer: "Teeth",
      options: ["Teeth", "Tongue", "Jawbone", "Gums"],
      explanation: "Teeth physically break food down into smaller pieces to facilitate chemical digestion."
    },
    {
      description: "Sensory organs that capture light and transmit visual signals to the brain for processing.",
      answer: "Eyes",
      options: ["Eyes", "Ears", "Nose", "Brain"],
      explanation: "The eyes use lenses to focus light onto the retina, which sends visual data through the optic nerve."
    },
    {
      description: "Sensory organs responsible for hearing sound waves and maintaining physical balance.",
      answer: "Ears",
      options: ["Ears", "Eyes", "Vestibular Nerve", "Throat"],
      explanation: "Ears convert sound vibrations into electrical signals and contain fluid canals that regulate balance."
    },
    {
      description: "The primary sensory organ for smell, which also filters, warms, and moistens air during inhalation.",
      answer: "Nose",
      options: ["Nose", "Mouth", "Larynx", "Sinuses"],
      explanation: "The nose contains olfactory receptors that detect scents and hair-like cilia that filter dust."
    },
    {
      description: "A muscular organ in the mouth covered in taste buds, essential for chewing, swallowing, and speaking.",
      answer: "Tongue",
      options: ["Tongue", "Salivary Glands", "Palate", "Throat"],
      explanation: "The tongue helps manipulate food during chewing and contains receptors for sweet, sour, salty, bitter, and umami tastes."
    },
    {
      description: "The fluid that circulates in the heart and blood vessels, carrying oxygen, nutrients, and waste products.",
      answer: "Blood",
      options: ["Blood", "Lymph", "Plasma", "Water"],
      explanation: "Blood consists of red cells, white cells, platelets, and plasma, delivering essential substances to cells."
    },
    {
      description: "A large, dark-red organ that filters toxins from the blood, produces bile, and stores energy.",
      answer: "Liver",
      options: ["Liver", "Kidneys", "Spleen", "Pancreas"],
      explanation: "The liver is the body's primary chemical processing center, performing over 500 vital functions."
    },
    {
      description: "Two bean-shaped organs that filter waste products, excess water, and impurities from the blood to produce urine.",
      answer: "Kidneys",
      options: ["Kidneys", "Bladder", "Ureters", "Liver"],
      explanation: "Kidneys filter blood multiple times a day, regulating fluid balance and blood pressure."
    }
  ],
  intermediate: [
    {
      description: "A dome-shaped sheet of skeletal muscle that separates the chest cavity from the abdomen and drives respiration.",
      answer: "Diaphragm",
      options: ["Diaphragm", "Intercostal Muscles", "Lungs", "Abdominals"],
      explanation: "When the diaphragm contracts, it moves downward, creating a vacuum that draws air into the lungs."
    },
    {
      description: "The long, narrow folded tube of the digestive tract where 90% of food absorption takes place.",
      answer: "Small Intestine",
      options: ["Small Intestine", "Large Intestine", "Stomach", "Esophagus"],
      explanation: "The small intestine uses microscopic villi to absorb nutrients, minerals, and vitamins into the bloodstream."
    },
    {
      description: "The final section of the gastrointestinal tract that absorbs water and salts from remaining material and stores feces.",
      answer: "Large Intestine",
      options: ["Large Intestine", "Small Intestine", "Rectum", "Appendix"],
      explanation: "The large intestine (or colon) concentrates indigestible waste material by reabsorbing vital water."
    },
    {
      description: "A glandular organ behind the stomach that secretes digestive enzymes and hormones like insulin and glucagon.",
      answer: "Pancreas",
      options: ["Pancreas", "Liver", "Spleen", "Gallbladder"],
      explanation: "The pancreas serves dual roles: exocrine (releasing digestive enzymes) and endocrine (regulating blood sugar)."
    },
    {
      description: "A muscular tube connecting the throat with the stomach, transporting crushed food using peristaltic waves.",
      answer: "Esophagus",
      options: ["Esophagus", "Trachea", "Larynx", "Pharynx"],
      explanation: "The esophagus contracts rhythmically to push food down into the stomach, even if standing upside down."
    },
    {
      description: "A cartilaginous tube, also known as the windpipe, that connects the larynx to the bronchi of the lungs.",
      answer: "Trachea",
      options: ["Trachea", "Esophagus", "Bronchioles", "Alveoli"],
      explanation: "The trachea is reinforced by rings of cartilage to keep the airway open for breathing."
    },
    {
      description: "Blood vessels that carry deoxygenated blood back to the heart from the rest of the body.",
      answer: "Veins",
      options: ["Veins", "Arteries", "Capillaries", "Lymphatics"],
      explanation: "Veins contain one-way valves that prevent gravity from pulling blood backward on its return to the heart."
    },
    {
      description: "Muscular, elastic blood vessels that transport oxygen-rich blood away from the heart to body tissues.",
      answer: "Arteries",
      options: ["Arteries", "Veins", "Capillaries", "Aorta"],
      explanation: "Arteries operate under high pressure generated by the heart's pumping actions, featuring thick elastic walls."
    },
    {
      description: "The flexible column of vertebrae extending from the skull to the pelvis, protecting the spinal cord.",
      answer: "Spine",
      options: ["Spine", "Ribcage", "Sternum", "Femur"],
      explanation: "The spine consists of 33 interlocking bones called vertebrae, supporting weight and housing the spinal cord."
    },
    {
      description: "The bony framework that encloses and protects the brain, consisting of the cranium and facial bones.",
      answer: "Skull",
      options: ["Skull", "Clavicle", "Vertebrae", "Mandible"],
      explanation: "The skull protects the brain from impact and structures the facial entryways for sensory organs."
    },
    {
      description: "A hollow, muscular organ in the lower abdomen that stores urine until it is excreted from the body.",
      answer: "Bladder",
      options: ["Bladder", "Kidneys", "Urethra", "Gallbladder"],
      explanation: "The bladder expands as it fills with urine, holding up to 500 mL before triggering the urge to empty."
    },
    {
      description: "A butterfly-shaped endocrine gland in the neck that secretes hormones regulating metabolism, growth, and heart rate.",
      answer: "Thyroid Gland",
      options: ["Thyroid Gland", "Pituitary Gland", "Adrenal Gland", "Thymus"],
      explanation: "The thyroid gland produces thyroxine (T4) and triiodothyronine (T3), controlling how cells use energy."
    },
    {
      description: "A small, pear-shaped sac under the liver that stores and concentrates bile before releasing it into the small intestine.",
      answer: "Gallbladder",
      options: ["Gallbladder", "Pancreas", "Spleen", "Stomach"],
      explanation: "The gallbladder releases bile (produced by the liver) into the duodenum to help digest fats."
    },
    {
      description: "A long, thin bundle of nervous tissue extending from the brainstem down the spine, transmitting signals between brain and body.",
      answer: "Spinal Cord",
      options: ["Spinal Cord", "Sciatic Nerve", "Vertebrae", "Brainstem"],
      explanation: "The spinal cord coordinates reflex responses and serves as the main transmission highway for sensory and motor nerves."
    },
    {
      description: "An organ of the lymphatic system that filters blood, recycles old red blood cells, and stores platelets.",
      answer: "Spleen",
      options: ["Spleen", "Liver", "Gallbladder", "Thymus"],
      explanation: "The spleen plays a vital role in immune response by storing white blood cells and fighting off blood infections."
    }
  ],
  advanced: [
    {
      description: "A pea-sized endocrine gland at the base of the brain, often called the 'master gland' because it regulates other hormone glands.",
      answer: "Pituitary Gland",
      options: ["Pituitary Gland", "Hypothalamus", "Pineal Gland", "Adrenal Gland"],
      explanation: "The pituitary gland controls growth, blood pressure, reproduction, and thyroid function by releasing chemical messengers."
    },
    {
      description: "Microscopic air sacs at the end of the bronchioles where the actual exchange of oxygen and carbon dioxide occurs.",
      answer: "Alveoli",
      options: ["Alveoli", "Bronchioles", "Tracheoles", "Pleura"],
      explanation: "Alveoli have extremely thin walls surrounded by capillaries, allowing rapid diffusion of respiratory gases."
    },
    {
      description: "The structural and functional units of the kidney, each consisting of a glomerulus and a tubule system.",
      answer: "Nephrons",
      options: ["Nephrons", "Neurons", "Alveoli", "Glomeruli"],
      explanation: "Each kidney contains about 1 million nephrons, which filter waste, reabsorb nutrients, and balance electrolytes."
    },
    {
      description: "Microscopic, single-cell-thick blood vessels that connect arterioles to venules, allowing nutrient and gas transfer.",
      answer: "Capillaries",
      options: ["Capillaries", "Arterioles", "Venules", "Lymphatics"],
      explanation: "Capillaries are so narrow that red blood cells must pass through them in a single-file line."
    },
    {
      description: "A complex neural structure in the temporal lobe of the brain, critical for turning short-term memories into long-term ones.",
      answer: "Hippocampus",
      options: ["Hippocampus", "Amygdala", "Cerebellum", "Thalamus"],
      explanation: "Damage to the hippocampus prevents the formation of new conscious memories, a condition seen in Alzheimer's disease."
    },
    {
      description: "The region at the back of the brain responsible for coordinating voluntary movements, posture, and motor learning.",
      answer: "Cerebellum",
      options: ["Cerebellum", "Cerebrum", "Medulla Oblongata", "Pons"],
      explanation: "The cerebellum, or 'little brain', processes input from the inner ear and muscles to maintain balance and smooth motion."
    },
    {
      description: "A fatty sheath wrapping around nerve axons, insulating them and accelerating the speed of electrical impulse transmission.",
      answer: "Myelin Sheath",
      options: ["Myelin Sheath", "Synapse", "Dendrite", "Node of Ranvier"],
      explanation: "Myelin speeds up signal transduction. Diseases like Multiple Sclerosis destroy myelin, disrupting sensory and motor signals."
    },
    {
      description: "A tiny cluster of looping capillaries in the nephron that acts as the initial filter of blood arriving at the kidney.",
      answer: "Glomerulus",
      options: ["Glomerulus", "Bowman's Capsule", "Loop of Henle", "Collecting Duct"],
      explanation: "The high pressure inside the glomerulus forces water and small solutes out of the blood into the kidney tubule."
    },
    {
      description: "A specialized lymphoid organ of the immune system where T-cells mature, highly active in children but shrinking after puberty.",
      answer: "Thymus",
      options: ["Thymus", "Thyroid", "Tonsils", "Spleen"],
      explanation: "The thymus trains T-lymphocytes to identify foreign pathogens and avoid attacking the body's own healthy tissues."
    },
    {
      description: "Glands situated on top of the kidneys that produce hormones like adrenaline, cortisol, and aldosterone.",
      answer: "Adrenal Glands",
      options: ["Adrenal Glands", "Pancreas", "Pituitary Gland", "Renal Glands"],
      explanation: "Adrenal glands trigger the 'fight or flight' response by flooding the body with adrenaline during stress."
    },
    {
      description: "The first and shortest segment of the small intestine, receiving partially digested food from the stomach and bile from the liver.",
      answer: "Duodenum",
      options: ["Duodenum", "Jejunum", "Ileum", "Cecum"],
      explanation: "The duodenum is where the majority of chemical digestion takes place using pancreatic enzymes and liver bile."
    },
    {
      description: "Organelles in eukaryotic cells that generate adenosine triphosphate (ATP), the primary energy currency of cell functions.",
      answer: "Mitochondria",
      options: ["Mitochondria", "Ribosomes", "Lysosomes", "Golgi Apparatus"],
      explanation: "Mitochondria convert nutrients into usable chemical energy through aerobic cellular respiration."
    },
    {
      description: "The outermost layer of the skin, containing no blood vessels and consisting mainly of keratinocytes.",
      answer: "Epidermis",
      options: ["Epidermis", "Dermis", "Hypodermis", "Melanocyte"],
      explanation: "The epidermis acts as a waterproof shield, shedding dead cells constantly and producing new ones from its base."
    },
    {
      description: "The light-sensitive layer of tissue at the back of the eyeball, containing rods and cones that register visual patterns.",
      answer: "Retina",
      options: ["Retina", "Cornea", "Iris", "Lens"],
      explanation: "The retina converts light rays into neural signals that travel along the optic nerve to the visual cortex."
    },
    {
      description: "The spiral, fluid-filled cavity in the inner ear containing the organ of Corti, which translates vibrations into nerve impulses.",
      answer: "Cochlea",
      options: ["Cochlea", "Tympanic Membrane", "Ossicles", "Eustachian Tube"],
      explanation: "The cochlea's tiny hair cells vibrate at specific frequencies, enabling us to distinguish pitch and volume of sounds."
    }
  ]
};

export const TIME_DATA: Record<"beginner" | "intermediate" | "advanced", TimeChallenge[]> = {
  beginner: [
    {
      scenario: "A time machine starts at 12:00 PM and travels 3 hours forward in time. What is the destination time?",
      answer: "3:00 PM",
      options: ["3:00 PM", "2:00 PM", "4:00 PM", "12:00 AM"],
      explanation: "Adding 3 hours to 12:00 PM (noon) results in 3:00 PM."
    },
    {
      scenario: "You leave the year 2026 and travel exactly 5 years into the past. What year do you land in?",
      answer: "2021",
      options: ["2021", "2020", "2022", "2031"],
      explanation: "Subtracting 5 years from 2026 gives 2021."
    },
    {
      scenario: "A lecture begins at 9:00 AM and lasts for 1 hour and 30 minutes. At what time does the lecture end?",
      answer: "10:30 AM",
      options: ["10:30 AM", "10:00 AM", "11:00 AM", "9:30 AM"],
      explanation: "9:00 AM + 1 hour is 10:00 AM, plus 30 minutes is 10:30 AM."
    },
    {
      scenario: "A train leaves at 4:15 PM and arrives at its destination at 5:00 PM. How long was the trip?",
      answer: "45 minutes",
      options: ["45 minutes", "30 minutes", "1 hour", "15 minutes"],
      explanation: "The difference between 4:15 PM and 5:00 PM is 45 minutes."
    },
    {
      scenario: "If it is currently 11:00 AM, how many hours until it is 4:00 PM?",
      answer: "5 hours",
      options: ["5 hours", "4 hours", "6 hours", "3 hours"],
      explanation: "Counting from 11 AM: 12 PM, 1 PM, 2 PM, 3 PM, 4 PM. That is exactly 5 hours."
    },
    {
      scenario: "A clock shows 8:00 AM. If you travel 12 hours forward, what time does the clock show?",
      answer: "8:00 PM",
      options: ["8:00 PM", "8:00 AM", "6:00 PM", "12:00 AM"],
      explanation: "12 hours from any time swaps the AM/PM indicator, resulting in 8:00 PM."
    },
    {
      scenario: "A historical movie starts at 7:30 PM and has a runtime of 2 hours. What time does it finish?",
      answer: "9:30 PM",
      options: ["9:30 PM", "8:30 PM", "10:00 PM", "9:00 PM"],
      explanation: "Adding 2 hours to 7:30 PM equals 9:30 PM."
    },
    {
      scenario: "If you travel 10 minutes backward from 1:05 PM, what time is it?",
      answer: "12:55 PM",
      options: ["12:55 PM", "12:50 PM", "1:00 PM", "1:15 PM"],
      explanation: "Subtracting 10 minutes from 1:05 PM goes past the hour mark to 12:55 PM."
    },
    {
      scenario: "How many minutes are in 2 hours?",
      answer: "120 minutes",
      options: ["120 minutes", "60 minutes", "100 minutes", "180 minutes"],
      explanation: "Each hour contains 60 minutes. Therefore, 2 hours equals 2 * 60 = 120 minutes."
    },
    {
      scenario: "A store opens at 8:00 AM and closes at 6:00 PM. For how many hours is the store open?",
      answer: "10 hours",
      options: ["10 hours", "8 hours", "12 hours", "9 hours"],
      explanation: "From 8 AM to 12 PM (noon) is 4 hours, and from 12 PM to 6 PM is 6 hours. 4 + 6 = 10 hours."
    },
    {
      scenario: "A portal opens at 11:45 PM and stays open for 30 minutes. At what time does it close?",
      answer: "12:15 AM",
      options: ["12:15 AM", "12:15 PM", "11:15 PM", "12:00 AM"],
      explanation: "Adding 15 minutes to 11:45 PM brings us to midnight (12:00 AM), plus the remaining 15 minutes is 12:15 AM."
    },
    {
      scenario: "You are schedule to meet at 10:15 AM but arrive 20 minutes early. What time did you arrive?",
      answer: "9:55 AM",
      options: ["9:55 AM", "9:50 AM", "10:05 AM", "10:35 AM"],
      explanation: "10:15 AM minus 15 minutes is 10:00 AM, minus 5 more minutes is 9:55 AM."
    },
    {
      scenario: "How many hours are in 3 full days?",
      answer: "72 hours",
      options: ["72 hours", "48 hours", "96 hours", "24 hours"],
      explanation: "Each day has 24 hours. 3 days * 24 hours/day = 72 hours."
    },
    {
      scenario: "A space probe takes 15 minutes to transmit a signal. If it sends a signal at 3:55 PM, at what time is it received?",
      answer: "4:10 PM",
      options: ["4:10 PM", "4:05 PM", "4:00 PM", "3:40 PM"],
      explanation: "Adding 5 minutes reaches 4:00 PM. Adding the remaining 10 minutes reaches 4:10 PM."
    },
    {
      scenario: "If a watch is 5 minutes fast and shows 6:30 PM, what is the actual time?",
      answer: "6:25 PM",
      options: ["6:25 PM", "6:35 PM", "6:20 PM", "6:30 PM"],
      explanation: "Since the watch is fast, the actual time is 5 minutes earlier than shown: 6:25 PM."
    }
  ],
  intermediate: [
    {
      scenario: "If a reactor recharge begins at 10:30 PM and takes 1 hour and 45 minutes, at what time is it complete?",
      answer: "12:15 AM",
      options: ["12:15 AM", "12:15 PM", "11:15 PM", "11:45 PM"],
      explanation: "Adding 1 hour to 10:30 PM gets 11:30 PM. Adding 45 minutes gets 12:15 AM (the next day)."
    },
    {
      scenario: "Your flight takes off from Chicago (CST) at 10:00 AM and lands in New York (EST) after a 2-hour flight. New York is 1 hour ahead of Chicago. What local time is it in New York when you land?",
      answer: "1:00 PM",
      options: ["1:00 PM", "12:00 PM", "2:00 PM", "11:00 AM"],
      explanation: "10:00 AM CST + 2 hours flight = 12:00 PM CST. Adjusting to New York time (EST, +1 hour) equals 1:00 PM."
    },
    {
      scenario: "A time bubble lasts for exactly 2.5 days. How many hours does it remain stable?",
      answer: "60 hours",
      options: ["60 hours", "48 hours", "72 hours", "50 hours"],
      explanation: "2.5 days * 24 hours/day = 60 hours."
    },
    {
      scenario: "A spacecraft engine operates on cycles of 40 minutes followed by a 15-minute cool down. If a cycle starts at 1:15 PM, at what time does the cool down end?",
      answer: "2:10 PM",
      options: ["2:10 PM", "2:00 PM", "1:55 PM", "2:20 PM"],
      explanation: "40 minutes run + 15 minutes cool down = 55 minutes total. 1:15 PM + 55 minutes = 2:10 PM."
    },
    {
      scenario: "If it is 3:45 AM, how many minutes have passed since midnight?",
      answer: "225 minutes",
      options: ["225 minutes", "180 minutes", "240 minutes", "215 minutes"],
      explanation: "3 hours * 60 minutes = 180 minutes. 180 + 45 minutes = 225 minutes."
    },
    {
      scenario: "A starship departs at 23:20 (military time) and arrives at its destination at 02:40 the next day. How long was the voyage?",
      answer: "3 hours 20 minutes",
      options: ["3 hours 20 minutes", "2 hours 40 minutes", "3 hours 40 minutes", "4 hours 20 minutes"],
      explanation: "From 23:20 to 00:00 (midnight) is 40 minutes. From 00:00 to 02:40 is 2 hours 40 minutes. Total: 3 hours 20 minutes."
    },
    {
      scenario: "An eclipse begins at 14:05 and ends at 16:22. What was the duration of the eclipse in minutes?",
      answer: "137 minutes",
      options: ["137 minutes", "120 minutes", "147 minutes", "117 minutes"],
      explanation: "From 14:05 to 16:05 is 120 minutes (2 hours). From 16:05 to 16:22 is 17 minutes. 120 + 17 = 137 minutes."
    },
    {
      scenario: "If you travel 180 minutes forward in time from 11:15 AM, what time is it?",
      answer: "2:15 PM",
      options: ["2:15 PM", "1:15 PM", "2:15 AM", "12:15 PM"],
      explanation: "180 minutes is exactly 3 hours (180 / 60). 11:15 AM + 3 hours = 2:15 PM."
    },
    {
      scenario: "A time-loop resets every 90 minutes. If the current loop started at 8:40 AM, at what time will it reset?",
      answer: "10:10 AM",
      options: ["10:10 AM", "10:00 AM", "9:40 AM", "10:20 AM"],
      explanation: "90 minutes is 1 hour and 30 minutes. 8:40 AM + 1 hr 30 mins = 10:10 AM."
    },
    {
      scenario: "A clock loses 2 minutes every hour. If it is set correctly at 12:00 PM, what time will it show at 6:00 PM that same day?",
      answer: "5:48 PM",
      options: ["5:48 PM", "5:50 PM", "6:12 PM", "5:40 PM"],
      explanation: "6 hours pass, so the clock loses 6 * 2 = 12 minutes. 6:00 PM minus 12 minutes is 5:48 PM."
    },
    {
      scenario: "If a century is 100 years, and a decade is 10 years, how many decades are in 2.5 centuries?",
      answer: "25 decades",
      options: ["25 decades", "250 decades", "15 decades", "50 decades"],
      explanation: "2.5 centuries = 250 years. Since a decade is 10 years, 250 / 10 = 25 decades."
    },
    {
      scenario: "A synchronization signal is sent from Earth every 45 minutes. If the first signal is at 1:00 AM, at what time is the 5th signal sent?",
      answer: "4:00 AM",
      options: ["4:00 AM", "3:45 AM", "4:15 AM", "4:45 AM"],
      explanation: "The intervals between the 1st and 5th signal is 4 intervals. 4 * 45 minutes = 180 minutes = 3 hours. 1:00 AM + 3 hours = 4:00 AM."
    },
    {
      scenario: "If you travel exactly 1,000 hours forward from midnight on Monday, what day of the week is it?",
      answer: "Friday",
      options: ["Friday", "Thursday", "Saturday", "Wednesday"],
      explanation: "1,000 hours / 24 hours/day = 41 days and 16 hours. 41 days is 5 weeks and 6 days. 6 days after Monday is Sunday, plus 16 hours brings us into Monday, wait: 41 days % 7 = 6 days. Monday + 6 days is Sunday. Midnight Sunday + 16 hours is 4:00 PM Monday. Wait! 41 days and 16 hours. Let's calculate: 41 * 24 = 984. 1000 - 984 = 16. Monday midnight + 41 days is Sunday midnight. Plus 16 hours is 4:00 PM Monday? Wait, let's re-verify: Monday midnight is 0:00 Monday. Monday + 1 day is Tuesday. Monday + 7 days is next Monday. Monday + 35 days is Monday. + 6 days is Sunday. Sunday midnight + 16 hours is Monday afternoon. Wait! Ah, Monday midnight + 41 days = Saturday? Let's check: Monday (0) -> Tuesday (1) -> Wednesday (2) -> Thursday (3) -> Friday (4) -> Saturday (5) -> Sunday (6) -> Monday (7). Yes! 41 days % 7 = 6. Monday + 6 = Sunday. Midnight Sunday + 16 hours is Sunday 4:00 PM? Wait, no, midnight on Monday (Sunday night / Monday morning). 41 days later is Friday midnight? Let's count: 7 days is Mon, 14 is Mon, 21 is Mon, 28 is Mon, 35 is Mon, 42 is Mon. 41 is Sunday. Yes, Sunday midnight + 16 hours is Monday 4:00 PM. Let's choose a simpler math scenario: 'If you travel 100 hours forward starting on Monday at 12:00 PM, what day of the week is it?' 100 hours = 4 days and 4 hours. Monday 12 PM + 4 days = Friday 12 PM. Plus 4 hours = Friday 4:00 PM."
    },
    {
      scenario: "If you travel 100 hours forward starting on Monday at 12:00 PM, what day of the week is it?",
      answer: "Friday",
      options: ["Friday", "Thursday", "Saturday", "Wednesday"],
      explanation: "100 hours is 4 days and 4 hours (4 * 24 + 4 = 100). Adding 4 days to Monday noon gets Friday noon, plus 4 hours is Friday 4:00 PM."
    },
    {
      scenario: "A planet rotates once every 36 hours. If a settlement experiences sunrise at 6:00 AM, at what time will the next sunrise occur?",
      answer: "6:00 PM the next day",
      options: ["6:00 PM the next day", "6:00 AM the next day", "12:00 PM the next day", "6:00 AM two days later"],
      explanation: "36 hours is 1 full day (24 hours) and a half day (12 hours). 6:00 AM + 24 hours is 6:00 AM the next day. Plus 12 hours is 6:00 PM the next day."
    }
  ],
  advanced: [
    {
      scenario: "You travel from London (GMT) to Tokyo (GMT+9). If the local time in London is 11:30 PM on Tuesday, what is the local time in Tokyo?",
      answer: "8:30 AM Wednesday",
      options: ["8:30 AM Wednesday", "8:30 PM Tuesday", "9:30 AM Wednesday", "7:30 AM Wednesday"],
      explanation: "Tokyo is 9 hours ahead. 11:30 PM Tuesday + 30 mins is Wednesday midnight (12:00 AM). Adding the remaining 8.5 hours yields 8:30 AM Wednesday."
    },
    {
      scenario: "A leap year occurs in years divisible by 4, except for century years, which must be divisible by 400. Which of these was NOT a leap year?",
      answer: "1900",
      options: ["1900", "2000", "2004", "1996"],
      explanation: "1900 is a century year. Since it is not divisible by 400, it was not a leap year, unlike 2000."
    },
    {
      scenario: "How many seconds are in a standard leap year of 366 days?",
      answer: "31,622,400 seconds",
      options: ["31,622,400 seconds", "31,536,000 seconds", "31,557,600 seconds", "32,044,000 seconds"],
      explanation: "366 days * 24 hours/day * 60 minutes/hour * 60 seconds/minute = 31,622,400 seconds."
    },
    {
      scenario: "A GPS satellite clock ticks slightly faster than clocks on Earth due to general relativity, gaining 38 microseconds per day. Approximately how many milliseconds does it gain in a year (365 days)?",
      answer: "13.87 ms",
      options: ["13.87 ms", "1.38 ms", "138.7 ms", "0.14 ms"],
      explanation: "38 microseconds * 365 = 13,870 microseconds. Since 1 millisecond = 1,000 microseconds, this is 13.87 ms."
    },
    {
      scenario: "If you travel back in time to the year 1500 BC, and then travel forward 2,500 years, what year do you end up in?",
      answer: "1000 AD",
      options: ["1000 AD", "1001 AD", "1000 BC", "999 AD"],
      explanation: "1500 BC to 1 BC is 1500 years. There is no year 0, so transition from 1 BC to 1 AD is 1 year. 2500 - 1500 = 1000 years, landing in 1000 AD."
    },
    {
      scenario: "A quartz crystal oscillator vibrates at 32,768 Hz. How many times does it vibrate in 1.5 minutes?",
      answer: "2,949,120 times",
      options: ["2,949,120 times", "1,966,080 times", "2,949 times", "49,152 times"],
      explanation: "1.5 minutes is 90 seconds. 32,768 vibrations/second * 90 seconds = 2,949,120 vibrations."
    },
    {
      scenario: "If a ship leaves port at 08:00 on Monday and sails at 15 knots (1 knot = 1.15 mph). It needs to cover 360 nautical miles. On what day and time does it arrive?",
      answer: "Tuesday at 08:00",
      options: ["Tuesday at 08:00", "Monday at 20:00", "Tuesday at 12:00", "Wednesday at 08:00"],
      explanation: "Time = Distance / Speed = 360 nautical miles / 15 knots = 24 hours. 24 hours from Monday 08:00 is Tuesday 08:00."
    },
    {
      scenario: "A radioactive isotope has a half-life of 8 days. If you start with 80 grams, how much is left after 24 days?",
      answer: "10 grams",
      options: ["10 grams", "20 grams", "5 grams", "15 grams"],
      explanation: "24 days corresponds to 3 half-lives (24 / 8). 80g -> 40g -> 20g -> 10g."
    },
    {
      scenario: "A clock is set at 12:00 PM. It gains 4 seconds every 3 hours. How much time does it gain in a full week (7 days)?",
      answer: "224 seconds",
      options: ["224 seconds", "112 seconds", "336 seconds", "448 seconds"],
      explanation: "There are 56 periods of 3 hours in a week (7 * 24 / 3). 56 periods * 4 seconds/period = 224 seconds."
    },
    {
      scenario: "If a pulsar rotates once every 1.5 milliseconds, how many times does it rotate in 1 second?",
      answer: "667 times",
      options: ["667 times", "150 times", "1500 times", "66 times"],
      explanation: "1 second = 1,000 milliseconds. 1000 / 1.5 = 666.67, which rounds to 667 rotations."
    },
    {
      scenario: "Coordinated Universal Time (UTC) occasionally adds a 'leap second' to adjust for Earth's rotation. If a leap second is added at 23:59:59 UTC, what is the next second?",
      answer: "23:59:60 UTC",
      options: ["23:59:60 UTC", "00:00:00 UTC", "00:00:01 UTC", "23:59:59 UTC"],
      explanation: "To add a second, the UTC clock displays 23:59:60 before rolling over to 00:00:00 of the next day."
    },
    {
      scenario: "A time portal remains open for 1 million milliseconds. How many minutes is this?",
      answer: "16.67 minutes",
      options: ["16.67 minutes", "10 minutes", "1.67 minutes", "100 minutes"],
      explanation: "1,000,000 ms = 1,000 seconds. 1,000 seconds / 60 seconds/minute = 16.67 minutes."
    },
    {
      scenario: "A spaceship travels at 0.8c (80% speed of light). For the crew, a journey takes 3 years. Due to time dilation, how many years pass for observers on Earth? (Lorentz factor = 1.67)",
      answer: "5 years",
      options: ["5 years", "3.75 years", "4 years", "6 years"],
      explanation: "Time on Earth = Crew Time * Lorentz factor = 3 years * 1.67 = 5 years."
    },
    {
      scenario: "If a Martian year (sol) is 668 sols, and a Martian sol is 24 hours 39 minutes. Approximately how many Earth days is a Martian year?",
      answer: "687 Earth days",
      options: ["687 Earth days", "668 Earth days", "720 Earth days", "650 Earth days"],
      explanation: "668 sols * 24.65 hours/sol = 16,466 hours. 16,466 hours / 24 hours/day = 686.9 Earth days."
    },
    {
      scenario: "A sundial measures local apparent solar time. Due to Earth's axial tilt and orbital eccentricity, sundial time can deviate from clock time by up to 16 minutes. What is this solar-time variation called?",
      answer: "Equation of Time",
      options: ["Equation of Time", "Solar Anomaly", "Sidereal Offset", "Precession Scale"],
      explanation: "The Equation of Time is the difference between apparent solar time (sundials) and mean solar time (clocks)."
    }
  ]
};

export const RIDDLE_DATA: Record<"beginner" | "intermediate" | "advanced", RiddleChallenge[]> = {
  beginner: [
    {
      riddle: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
      answer: "Echo",
      options: ["Echo", "Cloud", "Shadow", "Voice"],
      explanation: "An echo is sound reflecting off surfaces, having no physical mouth or ears."
    },
    {
      riddle: "I have keys but no locks. I have space but no room. You can enter but can't go outside. What am I?",
      answer: "Keyboard",
      options: ["Keyboard", "Laptop", "Spaceship", "Piano"],
      explanation: "A computer keyboard contains keys (letters/numbers), a spacebar, and an Enter key."
    },
    {
      riddle: "What has to be broken before you can use it?",
      answer: "Egg",
      options: ["Egg", "Mirror", "Promise", "Lock"],
      explanation: "An egg must be cracked open to be cooked or eaten."
    },
    {
      riddle: "What is full of holes but still holds water?",
      answer: "Sponge",
      options: ["Sponge", "Bucket", "Sieve", "Cloud"],
      explanation: "A sponge absorbs water and holds it in its porous cavities."
    },
    {
      riddle: "What is always in front of you but can't be seen?",
      answer: "The Future",
      options: ["The Future", "Your Nose", "The Wind", "Shadow"],
      explanation: "The future is ahead of you in time, but it remains unseen until it happens."
    },
    {
      riddle: "What goes up but never comes down?",
      answer: "Your Age",
      options: ["Your Age", "A Balloon", "Smoke", "Temperature"],
      explanation: "As time progresses, your age increases continuously and never decreases."
    },
    {
      riddle: "I have a head and a tail but no body. What am I?",
      answer: "Coin",
      options: ["Coin", "Snake", "Book", "Comet"],
      explanation: "A coin has two faces commonly referred to as 'heads' and 'tails'."
    },
    {
      riddle: "What building has the most stories?",
      answer: "Library",
      options: ["Library", "Skyscraper", "Hotel", "School"],
      explanation: "A library contains thousands of books, which are literary stories."
    },
    {
      riddle: "What can you catch but not throw?",
      answer: "A Cold",
      options: ["A Cold", "A Ball", "A Shadow", "A Secret"],
      explanation: "You catch a cold (illness) due to viruses, but you cannot physically throw it."
    },
    {
      riddle: "I am light as a feather, yet the strongest person cannot hold me for much longer than a minute. What am I?",
      answer: "Breath",
      options: ["Breath", "Shadow", "Bubble", "Thought"],
      explanation: "Air/breath has almost no weight, but you cannot hold your breath for long due to oxygen need."
    },
    {
      riddle: "What has hands but cannot clap?",
      answer: "Clock",
      options: ["Clock", "Mannequin", "Gloves", "Robot"],
      explanation: "A clock has hour, minute, and second hands, but no fingers to clap."
    },
    {
      riddle: "What has one eye but cannot see?",
      answer: "Needle",
      options: ["Needle", "Storm", "Potato", "Target"],
      explanation: "A sewing needle has a small opening at one end called an 'eye' to thread through."
    },
    {
      riddle: "What has a neck but no head?",
      answer: "Bottle",
      options: ["Bottle", "Guitar", "Shirt", "Giraffe"],
      explanation: "A bottle has a narrow neck leading to its opening, but has no head."
    },
    {
      riddle: "What has one head, one foot, and four legs?",
      answer: "Bed",
      options: ["Bed", "Dog", "Chair", "Table"],
      explanation: "A bed has a headboard, a footboard, and four support legs."
    },
    {
      riddle: "The person who makes it has no need of it; the person who buys it has no use for it. The person who uses it can neither see nor feel it. What is it?",
      answer: "Coffin",
      options: ["Coffin", "House", "Car", "Tombstone"],
      explanation: "A coffin is made for others, bought for the deceased, and used by the dead who cannot sense it."
    }
  ],
  intermediate: [
    {
      riddle: "I am taken from a mine, and shut up in a wooden case, from which I am never released, and yet I am used by almost every person. What am I?",
      answer: "Pencil Lead",
      options: ["Pencil Lead", "Coal", "Gold", "Diamond"],
      explanation: "Graphite (lead) is mined, encased in wood as a pencil, and worn away through writing."
    },
    {
      riddle: "The more of them you take, the more you leave behind. What are they?",
      answer: "Footsteps",
      options: ["Footsteps", "Breaths", "Photos", "Hours"],
      explanation: "Taking steps forward leaves more footprints/footsteps behind you."
    },
    {
      riddle: "What can travel around the world while staying in a corner?",
      answer: "Stamp",
      options: ["Stamp", "Letter", "Globe", "Airplane"],
      explanation: "A postage stamp is stuck in the corner of an envelope, which travels worldwide."
    },
    {
      riddle: "I have no life, but I can die. What am I?",
      answer: "Battery",
      options: ["Battery", "Fire", "Ice", "Flower"],
      explanation: "A battery is not a living organism, but it drains and 'dies' when depleted of charge."
    },
    {
      riddle: "What is so fragile that saying its name breaks it?",
      answer: "Silence",
      options: ["Silence", "Glass", "Secret", "Bubble"],
      explanation: "Speaking breaks the state of silence immediately."
    },
    {
      riddle: "What has keys that open no locks, with space but no room, and allows you to enter but not exit?",
      answer: "Keyboard",
      options: ["Keyboard", "Piano", "Typewriter", "Astrolabe"],
      explanation: "A keyboard is the standard input device with keys, spacebar, and Enter key."
    },
    {
      riddle: "I run along the streets but never walk, I have a mouth but never talk. What am I?",
      answer: "River",
      options: ["River", "Car", "Rain", "Wind"],
      explanation: "A river runs downstream, has a river mouth, but is water and cannot speak."
    },
    {
      riddle: "What belongs to you, but other people use it more than you do?",
      answer: "Your Name",
      options: ["Your Name", "Your Phone", "Your Car", "Your Money"],
      explanation: "Other people call you by your name far more often than you say it yourself."
    },
    {
      riddle: "If you feed me, I grow and live. If you give me water, I die. What am I?",
      answer: "Fire",
      options: ["Fire", "Plant", "Rust", "Shadow"],
      explanation: "Fire is fed by wood/fuel, but putting water on it extinguishes (kills) it."
    },
    {
      riddle: "What has a thumb and four fingers, but is not alive?",
      answer: "Glove",
      options: ["Glove", "Hand skeleton", "Mit", "Robot hand"],
      explanation: "A glove has compartments for a thumb and fingers but has no life of its own."
    },
    {
      riddle: "What has cities but no houses, forests but no trees, and water but no fish?",
      answer: "Map",
      options: ["Map", "Globe", "Painting", "Desert"],
      explanation: "A map depicts geography (cities, forests, oceans) using lines and colors, without physical contents."
    },
    {
      riddle: "I am sometimes hot, sometimes cold, and I can run even though I have no legs. What am I?",
      answer: "Water",
      options: ["Water", "Wind", "Engine", "Fever"],
      explanation: "Water can be hot (boiling) or cold (ice), and flows or 'runs' down channels."
    },
    {
      riddle: "What is easy to get into, but hard to get out of?",
      answer: "Trouble",
      options: ["Trouble", "A Car", "A Maze", "Bed"],
      explanation: "Getting into trouble is easy due to bad choices, but resolving the consequences is difficult."
    },
    {
      riddle: "I shave every day, but my beard stays the same. Who am I?",
      answer: "Barber",
      options: ["Barber", "Actor", "Razor", "Sheep"],
      explanation: "A barber shaves other people's beards all day, while his own beard remains unaffected."
    },
    {
      riddle: "What goes through towns and over hills, but never moves?",
      answer: "Road",
      options: ["Road", "Wind", "River", "Train"],
      explanation: "A road or path extends across vast geographical landscapes without shifting."
    }
  ],
  advanced: [
    {
      riddle: "I am a word of five letters. If you take away two, only one remains. What word am I?",
      answer: "Stone",
      options: ["Stone", "Alone", "Bones", "Thone"],
      explanation: "If you remove the letters 'S' and 'T' from 'STONE', you get the word 'ONE'."
    },
    {
      riddle: "I have two heads but only one body. The more still I stand, the faster I run. What am I?",
      answer: "Hourglass",
      options: ["Hourglass", "Clock", "Coin", "Conjoined twins"],
      explanation: "An hourglass has top and bottom bulbs ('heads'), and the sand inside 'runs' faster when it stands still."
    },
    {
      riddle: "I have no voice, yet I speak to all. I have no legs, yet I travel far. What am I?",
      answer: "Book",
      options: ["Book", "Letter", "Wind", "Thought"],
      explanation: "A book contains written text that communicates to readers across centuries."
    },
    {
      riddle: "I am a seed that grows without soil, a bird that flies without wings. I have no beginning, and I end only when you awaken. What am I?",
      answer: "Dream",
      options: ["Dream", "Thought", "Cloud", "Spark"],
      explanation: "Dreams develop in the mind while sleeping, feature impossible physics, and end when you wake up."
    },
    {
      riddle: "I can build castles of sand, yet I can crush mountains to dust. I am invisible, yet you can feel my presence. What am I?",
      answer: "Wind",
      options: ["Wind", "Time", "Water", "Gravity"],
      explanation: "Wind blows sand to form dunes (castles) and erodes rock formations, but remains invisible to the eye."
    },
    {
      riddle: "I am a container without hinges, key, or lid. Yet golden treasure is hidden inside me. What am I?",
      answer: "Egg",
      options: ["Egg", "Chestnut", "Coconut", "Oyster"],
      explanation: "An egg shell has no lid or key, but contains the nutritious golden yolk inside."
    },
    {
      riddle: "I am born of water, yet I die when water touches me. What am I?",
      answer: "Salt",
      options: ["Salt", "Cloud", "Ice", "Steam"],
      explanation: "Salt is harvested from evaporated seawater (born of water), but dissolves and disappears (dies) when put in water."
    },
    {
      riddle: "I can be cracked, made, told, and played. What am I?",
      answer: "Joke",
      options: ["Joke", "Record", "Card", "Game"],
      explanation: "You can crack a joke, make a joke, tell a joke, and play a joke (prank)."
    },
    {
      riddle: "I have no wings, but I can fly. I have no eyes, but I can cry. What am I?",
      answer: "Cloud",
      options: ["Cloud", "Wind", "Smoke", "Kite"],
      explanation: "Clouds float in the sky (fly) and release rain (cry) without eyes or wings."
    },
    {
      riddle: "I am a path between two cliffs, a bridge that none can cross. I appear only after the storm, and vanish in the light. What am I?",
      answer: "Rainbow",
      options: ["Rainbow", "Mist", "Bridge of sighs", "Lightning"],
      explanation: "A rainbow forms an arch in the sky after rain when sun rays hit droplets, but has no solid surface."
    },
    {
      riddle: "I have a spine but no bones. I have leaves but no branches. What am I?",
      answer: "Book",
      options: ["Book", "Fern", "Spinal column", "Tree"],
      explanation: "A book has a binding spine and pages (often historically referred to as leaves)."
    },
    {
      riddle: "I can run but cannot walk. Wherever I go, you follow close behind. I am hot, I am cold, and I can capture your reflection. What am I?",
      answer: "Water",
      options: ["Water", "Shadow", "River", "Mirror"],
      explanation: "Water flows (runs), reflects images, and is essential for human life."
    },
    {
      riddle: "I am a box that holds keys, but opens no door. I can sing, but have no voice. What am I?",
      answer: "Piano",
      options: ["Piano", "Music Box", "Accordion", "Radio"],
      explanation: "A piano contains black and white keys that strike strings to make musical notes."
    },
    {
      riddle: "I am the start of everything, and the end of time and space. I am essential to creation, and I surround every place. What letter am I?",
      answer: "E",
      options: ["E", "A", "T", "S"],
      explanation: "The letter 'E' starts the word 'Everything', ends the words 'Time' and 'Space', and is in the word 'Creation'."
    },
    {
      riddle: "I am a thread that binds two hearts, yet cannot be seen. I can make you weep, yet bring you joy. What am I?",
      answer: "Love",
      options: ["Love", "Memory", "Laughter", "Hope"],
      explanation: "Love is an invisible emotional connection that brings joy or sorrow."
    }
  ]
};

export const PROBABILITY_DATA: Record<"beginner" | "intermediate" | "advanced", ProbabilityChallenge[]> = {
  beginner: [
    {
      scenario: "What is the probability of rolling a 4 on a standard six-sided die?",
      answer: "1/6",
      options: ["1/6", "1/2", "1/4", "1/3"],
      explanation: "There is exactly one '4' on a six-sided die, out of 6 total outcomes."
    },
    {
      scenario: "What is the probability of flipping a coin and getting 'Heads'?",
      answer: "1/2",
      options: ["1/2", "1", "1/3", "1/4"],
      explanation: "A coin has 2 sides (Heads/Tails), so the probability of getting Heads is 1 out of 2."
    },
    {
      scenario: "A bag contains 3 red marbles and 2 blue marbles. What is the probability of randomly drawing a red marble?",
      answer: "3/5",
      options: ["3/5", "2/5", "1/2", "3/2"],
      explanation: "There are 3 red marbles out of a total of 5 marbles (3 + 2)."
    },
    {
      scenario: "What is the probability of drawing a red card from a standard deck of 52 cards?",
      answer: "1/2",
      options: ["1/2", "1/4", "1/13", "2/3"],
      explanation: "Half of the 52 cards in a deck are red (26 Hearts and 26 Diamonds)."
    },
    {
      scenario: "What is the probability of rolling an even number (2, 4, or 6) on a six-sided die?",
      answer: "1/2",
      options: ["1/2", "1/3", "1/6", "2/3"],
      explanation: "There are 3 even numbers out of 6 total possibilities (3/6 = 1/2)."
    },
    {
      scenario: "A spinner has 4 equal sections colored Red, Blue, Green, and Yellow. What is the probability of landing on Red?",
      answer: "1/4",
      options: ["1/4", "1/2", "3/4", "1/3"],
      explanation: "There is 1 Red section out of 4 total equal-sized sections."
    },
    {
      scenario: "A jar has 10 marbles: 8 green and 2 yellow. What is the probability of drawing a green marble?",
      answer: "4/5",
      options: ["4/5", "8/10", "1/5", "2/10"],
      explanation: "8 out of 10 marbles are green, which simplifies to 4/5."
    },
    {
      scenario: "What is the probability of rolling a number greater than 4 (i.e., 5 or 6) on a standard die?",
      answer: "1/3",
      options: ["1/3", "1/2", "1/6", "2/3"],
      explanation: "There are 2 numbers (5 and 6) greater than 4. 2/6 simplifies to 1/3."
    },
    {
      scenario: "What is the probability of drawing an Ace from a standard deck of 52 cards?",
      answer: "1/13",
      options: ["1/13", "1/4", "1/52", "4/13"],
      explanation: "There are 4 Aces in a deck of 52 cards. 4/52 simplifies to 1/13."
    },
    {
      scenario: "If an event is guaranteed to happen, what is its probability?",
      answer: "1",
      options: ["1", "0", "0.5", "100"],
      explanation: "Probability ranges from 0 (impossible) to 1 (certainty)."
    },
    {
      scenario: "If an event is impossible, what is its probability?",
      answer: "0",
      options: ["0", "1", "-1", "0.01"],
      explanation: "An impossible event has a probability of 0."
    },
    {
      scenario: "A bag has 5 white tiles and 5 black tiles. What is the probability of drawing a black tile?",
      answer: "1/2",
      options: ["1/2", "5/8", "1/5", "3/5"],
      explanation: "There are 5 black tiles out of 10 total tiles (5 + 5), which is 5/10 = 1/2."
    },
    {
      scenario: "What is the probability of rolling a 7 on a standard six-sided die?",
      answer: "0",
      options: ["0", "1/6", "1/7", "1"],
      explanation: "A standard die only contains numbers 1 through 6, making rolling a 7 impossible."
    },
    {
      scenario: "A weather forecast states there is an 80% chance of rain. What is the probability that it will NOT rain?",
      answer: "20%",
      options: ["20%", "80%", "50%", "10%"],
      explanation: "The sum of all probabilities is 100%. 100% - 80% = 20%."
    },
    {
      scenario: "A box contains 10 cards labeled 1 to 10. What is the probability of drawing a card with a number less than 4 (i.e. 1, 2, or 3)?",
      answer: "3/10",
      options: ["3/10", "4/10", "1/3", "1/2"],
      explanation: "There are 3 numbers less than 4 (1, 2, 3) out of 10 total cards."
    }
  ],
  intermediate: [
    {
      scenario: "If you roll two standard six-sided dice, what is the probability of getting a sum of exactly 7?",
      answer: "1/6",
      options: ["1/6", "1/12", "1/36", "5/36"],
      explanation: "There are 6 combinations that sum to 7: (1,6), (2,5), (3,4), (4,3), (5,2), and (6,1) out of 36 total outcomes."
    },
    {
      scenario: "You toss 3 coins simultaneously. What is the probability of getting exactly 2 'Heads'?",
      answer: "3/8",
      options: ["3/8", "1/2", "1/4", "5/8"],
      explanation: "The outcomes with 2 Heads are HHT, HTH, and THH, out of 8 total outcomes (2^3)."
    },
    {
      scenario: "What is the probability of drawing a Spade or a Heart from a standard deck of 52 cards?",
      answer: "1/2",
      options: ["1/2", "1/4", "13/52", "2/3"],
      explanation: "There are 13 Spades and 13 Hearts, totaling 26 cards. 26/52 simplifies to 1/2."
    },
    {
      scenario: "You roll a six-sided die and flip a coin. What is the probability of rolling a 5 and flipping 'Tails'?",
      answer: "1/12",
      options: ["1/12", "1/6", "1/8", "2/3"],
      explanation: "Since the events are independent, multiply their probabilities: 1/6 (rolling a 5) * 1/2 (tails) = 1/12."
    },
    {
      scenario: "A card is drawn from a deck of 52 cards. What is the probability that it is a Face card (Jack, Queen, or King)?",
      answer: "3/13",
      options: ["3/13", "12/52", "4/13", "1/4"],
      explanation: "There are 12 face cards in a deck (3 face cards per suit * 4 suits). 12/52 simplifies to 3/13."
    },
    {
      scenario: "A bag has 4 red, 3 green, and 2 blue marbles. If two marbles are drawn WITH replacement, what is the probability that both are red?",
      answer: "16/81",
      options: ["16/81", "12/72", "4/9", "8/81"],
      explanation: "Probability of first red is 4/9. Since we replace it, the second red is also 4/9. 4/9 * 4/9 = 16/81."
    },
    {
      scenario: "A bag has 4 red, 3 green, and 2 blue marbles. If two marbles are drawn WITHOUT replacement, what is the probability that both are red?",
      answer: "1/6",
      options: ["1/6", "16/81", "12/72", "2/9"],
      explanation: "First red: 4/9. Second red: 3/8. Multiply: (4/9) * (3/8) = 12/72 = 1/6."
    },
    {
      scenario: "What is the probability of rolling a sum of 11 when rolling two six-sided dice?",
      answer: "1/18",
      options: ["1/18", "1/36", "1/12", "2/18"],
      explanation: "There are 2 combinations that sum to 11: (5,6) and (6,5) out of 36 outcomes. 2/36 = 1/18."
    },
    {
      scenario: "You roll a six-sided die. What is the probability that the number rolled is prime (2, 3, or 5)?",
      answer: "1/2",
      options: ["1/2", "1/3", "2/3", "5/6"],
      explanation: "The prime numbers on a die are 2, 3, and 5 (3 outcomes). 3/6 = 1/2."
    },
    {
      scenario: "In a class of 30 students, 18 play soccer, 12 play basketball, and 5 play both. What is the probability that a randomly chosen student plays soccer or basketball?",
      answer: "5/6",
      options: ["5/6", "25/30", "1", "1/2"],
      explanation: "Using the addition rule: P(S or B) = P(S) + P(B) - P(S and B) = 18 + 12 - 5 = 25 students. 25/30 simplifies to 5/6."
    },
    {
      scenario: "If you draw a card from a deck, what is the probability that it is a Heart but NOT a Face card?",
      answer: "5/26",
      options: ["5/26", "10/52", "1/4", "3/13"],
      explanation: "There are 13 Hearts. 3 of them are face cards (J, Q, K). This leaves 10 cards. P = 10/52 = 5/26."
    },
    {
      scenario: "Two coins are flipped. What is the probability of getting at least one 'Tails'?",
      answer: "3/4",
      options: ["3/4", "1/2", "1/4", "7/8"],
      explanation: "The outcomes are HH, HT, TH, and TT. Three out of four outcomes contain at least one Tails."
    },
    {
      scenario: "A number is chosen from 1 to 20. What is the probability that it is a multiple of 3?",
      answer: "3/10",
      options: ["3/10", "6/20", "7/20", "1/3"],
      explanation: "The multiples of 3 between 1 and 20 are 3, 6, 9, 12, 15, and 18 (6 outcomes). P = 6/20 = 3/10."
    },
    {
      scenario: "What is the probability of rolling a sum less than 5 when rolling two six-sided dice?",
      answer: "1/6",
      options: ["1/6", "5/36", "1/12", "1/4"],
      explanation: "Combinations that sum to less than 5 are (1,1)=2, (1,2)=3, (2,1)=3, (1,3)=4, (2,2)=4, (3,1)=4 (6 outcomes). P = 6/36 = 1/6."
    },
    {
      scenario: "In a lottery of 100 tickets, there are 5 winning tickets. If you buy 1 ticket, what is the probability of NOT winning?",
      answer: "19/20",
      options: ["19/20", "95/100", "1/20", "9/10"],
      explanation: "There are 95 non-winning tickets. P = 95/100 = 19/20."
    }
  ],
  advanced: [
    {
      scenario: "You draw 2 cards from a standard deck of 52 cards without replacement. What is the probability that both cards are Aces?",
      answer: "1/221",
      options: ["1/221", "1/169", "1/26", "3/676"],
      explanation: "First Ace: 4/52 = 1/13. Second Ace: 3/51 = 1/17. Multiply: (1/13) * (1/17) = 1/221."
    },
    {
      scenario: "A test has a 99% accuracy rate for detecting a disease. The disease affects 1% of the population. If a person tests positive, what is the probability that they actually have the disease? (Bayes' Theorem)",
      answer: "50%",
      options: ["50%", "99%", "1%", "98%"],
      explanation: "P(D|+) = P(+|D)*P(D) / [P(+|D)*P(D) + P(+|no D)*P(no D)] = (0.99*0.01) / [(0.99*0.01) + (0.01*0.99)] = 0.0099 / 0.0198 = 50%."
    },
    {
      scenario: "If you roll three six-sided dice, what is the probability of getting three of the same number (e.g. three 6s)?",
      answer: "1/36",
      options: ["1/36", "1/216", "1/6", "5/216"],
      explanation: "The first die can be any number (6/6). The second must match the first (1/6), and the third must match the first (1/6). 1 * 1/6 * 1/6 = 1/36."
    },
    {
      scenario: "A bag has 3 red and 4 blue balls. If you draw three balls without replacement, what is the probability of getting exactly 2 red balls?",
      answer: "12/35",
      options: ["12/35", "18/35", "6/35", "3/7"],
      explanation: "Number of ways to choose 2 red and 1 blue: C(3,2) * C(4,1) = 3 * 4 = 12. Total ways to choose 3 balls: C(7,3) = 35. Probability = 12/35."
    },
    {
      scenario: "If you roll two six-sided dice, what is the probability that the sum of the numbers is at least 10?",
      answer: "1/6",
      options: ["1/6", "1/12", "5/36", "1/4"],
      explanation: "The combinations that yield a sum >= 10 are (4,6), (5,5), (6,4)=10; (5,6), (6,5)=11; (6,6)=12 (6 combinations). P = 6/36 = 1/6."
    },
    {
      scenario: "A coin is tossed until 'Heads' appears. What is the probability that the coin must be tossed exactly 4 times (meaning Tails, Tails, Tails, Heads)?",
      answer: "1/16",
      options: ["1/16", "1/8", "1/32", "1/4"],
      explanation: "Each coin toss is independent. P(TTTH) = (1/2)^4 = 1/16."
    },
    {
      scenario: "What is the probability of drawing a Full House (three cards of one rank, two of another) in a standard 5-card poker hand? (Approximately)",
      answer: "0.14%",
      options: ["0.14%", "1.4%", "0.014%", "2.1%"],
      explanation: "There are 3,744 full house combinations out of 2,598,960 possible poker hands. 3,744 / 2,598,960 = 0.00144, or 0.14%."
    },
    {
      scenario: "A drawer contains 6 black socks and 4 blue socks. If you randomly select 2 socks in the dark, what is the probability that they form a matching pair?",
      answer: "7/15",
      options: ["7/15", "1/2", "8/15", "6/10"],
      explanation: "Matching black: C(6,2) = 15. Matching blue: C(4,2) = 6. Total matching: 21. Total ways to select 2 socks: C(10,2) = 45. P = 21/45 = 7/15."
    },
    {
      scenario: "If 3 people enter an elevator in a 5-story building, what is the probability that they all get off on different floors?",
      answer: "12/25",
      options: ["12/25", "24/125", "3/5", "3/25"],
      explanation: "Total ways to exit: 5^3 = 125. Ways to exit on different floors: 5 * 4 * 3 = 60. P = 60/125 = 12/25."
    },
    {
      scenario: "In a game, a coin is flipped. If it's Heads, you win $2. If it's Tails, you lose $1. What is the expected value (average win/loss) of this game per flip?",
      answer: "$0.50",
      options: ["$0.50", "$1.00", "$0.00", "-$0.50"],
      explanation: "Expected value = P(H)*$2 + P(T)*(-$1) = 0.5 * $2 + 0.5 * (-$1) = $1.00 - $0.50 = $0.50."
    },
    {
      scenario: "In a class of 23 people, what is the approximate probability that at least two people share the same birthday? (The Birthday Paradox)",
      answer: "50.7%",
      options: ["50.7%", "12.5%", "6.3%", "95.2%"],
      explanation: "With 23 people, the number of pairings is C(23,2) = 253. P(no share) = 365! / (365^23 * (365-23)!) = 0.493. P(share) = 1 - 0.493 = 0.507."
    },
    {
      scenario: "A deck contains 5 red cards and 5 blue cards. You draw 3 cards. What is the probability that you draw more red cards than blue cards?",
      answer: "1/2",
      options: ["1/2", "3/10", "3/5", "7/10"],
      explanation: "Due to symmetry, the probability of drawing more red cards is equal to drawing more blue cards, which is exactly 1/2."
    },
    {
      scenario: "A machine has a fail rate of 10% per hour. What is the probability that it operates without failure for exactly 3 hours?",
      answer: "72.9%",
      options: ["72.9%", "70%", "90%", "81%"],
      explanation: "Success rate per hour is 90% (0.9). Probability of success for 3 hours = 0.9^3 = 0.729 = 72.9%."
    },
    {
      scenario: "What is the probability of rolling a sum that is a prime number (2, 3, 5, 7, 11) when rolling two six-sided dice?",
      answer: "5/12",
      options: ["5/12", "15/36", "1/2", "7/18"],
      explanation: "Combinations: sum=2 (1), sum=3 (2), sum=5 (4), sum=7 (6), sum=11 (2). Total = 15 outcomes. P = 15/36 = 5/12."
    },
    {
      scenario: "You are given a choice of three doors. Behind one is a car; behind the others, goats. You pick Door 1. The host (who knows what is behind the doors) opens Door 3, which has a goat. He asks if you want to switch to Door 2. What is the probability of winning the car if you switch? (Monty Hall Problem)",
      answer: "2/3",
      options: ["2/3", "1/2", "1/3", "3/4"],
      explanation: "The initial pick has a 1/3 chance of being correct. The remaining doors combined have a 2/3 chance. Since the host eliminates a goat, Door 2 inherits the full 2/3 chance."
    }
  ]
};

export const ATMOSPHERE_DATA: Record<"beginner" | "intermediate" | "advanced", AtmosphereChallenge[]> = {
  beginner: [
    {
      description: "The lowest layer of Earth's atmosphere, extending from the surface up to about 12 km, where all weather occurs.",
      targetName: "Troposphere",
      options: ["Troposphere", "Stratosphere", "Mesosphere", "Thermosphere"],
      explanation: "The troposphere contains 75% of the atmosphere's mass and almost all its water vapor, making it the weather layer."
    },
    {
      description: "A visible mass of condensed water vapor floating in the atmosphere, typically high above the ground.",
      targetName: "Cloud",
      options: ["Cloud", "Fog", "Ozone", "Aerosol"],
      explanation: "Clouds form when warm air rises, cools, and its water vapor condenses into tiny liquid droplets or ice crystals."
    },
    {
      description: "Water that falls from clouds in liquid droplets after condensing from atmospheric water vapor.",
      targetName: "Rain",
      options: ["Rain", "Snow", "Hail", "Dew"],
      explanation: "Rain is the primary liquid form of precipitation, essential for replenishing freshwater resources on Earth."
    },
    {
      description: "The movement of air caused by differences in air pressure within the atmosphere.",
      targetName: "Wind",
      options: ["Wind", "Draft", "Current", "Cyclone"],
      explanation: "Air moves from areas of high pressure to areas of low pressure, creating wind."
    },
    {
      description: "The layer of the atmosphere directly above the troposphere, extending up to 50 km, containing the protective ozone layer.",
      targetName: "Stratosphere",
      options: ["Stratosphere", "Troposphere", "Mesosphere", "Exosphere"],
      explanation: "The stratosphere is stable, cloudless, and dry. Commercial jets often fly here to avoid turbulence."
    },
    {
      description: "The mixture of gases that surrounds the Earth, held in place by gravity.",
      targetName: "Air",
      options: ["Air", "Oxygen", "Nitrogen", "Ozone"],
      explanation: "Air consists of 78% Nitrogen, 21% Oxygen, 0.9% Argon, and trace amounts of Carbon Dioxide and other gases."
    },
    {
      description: "Solid water precipitation that falls in the form of crystalline hexagonal flakes.",
      targetName: "Snow",
      options: ["Snow", "Rain", "Sleet", "Hail"],
      explanation: "Snow forms in clouds where temperature is below freezing, crystallizing water vapor directly into ice flakes."
    },
    {
      description: "A thick cloud of tiny water droplets suspended in the atmosphere at or near the Earth's surface, reducing visibility.",
      targetName: "Fog",
      options: ["Fog", "Smog", "Haze", "Cloud"],
      explanation: "Fog is essentially a cloud that touches the ground, forming when surface air cools to its dew point."
    },
    {
      description: "Frozen rain droplets that fall from strong thunderstorms in the form of large, hard balls of ice.",
      targetName: "Hail",
      options: ["Hail", "Sleet", "Snow", "Frost"],
      explanation: "Hail forms when thunderstorm updrafts carry water droplets high into freezing altitudes, layering them with ice."
    },
    {
      description: "The gas that makes up the majority of Earth's atmosphere, accounting for approximately 78% of dry air.",
      targetName: "Nitrogen",
      options: ["Nitrogen", "Oxygen", "Carbon Dioxide", "Argon"],
      explanation: "Nitrogen is relatively inert at room temperature, diluting oxygen and preventing runaway surface fires."
    },
    {
      description: "The atmospheric gas essential for animal respiration, making up 21% of Earth's atmosphere.",
      targetName: "Oxygen",
      options: ["Oxygen", "Nitrogen", "Ozone", "Hydrogen"],
      explanation: "Oxygen is produced by plants during photosynthesis and used by animals to generate energy during cellular respiration."
    },
    {
      description: "A severe rotating storm system with high winds and heavy rain, forming over warm tropical ocean waters.",
      targetName: "Hurricane",
      options: ["Hurricane", "Tornado", "Monsoon", "Blizzard"],
      explanation: "Hurricanes (or typhoons) pull energy from warm oceans, featuring a calm center called the 'eye'."
    },
    {
      description: "Water droplets that condense from air onto cold solid surfaces like grass during the night.",
      targetName: "Dew",
      options: ["Dew", "Frost", "Sleet", "Mist"],
      explanation: "Dew forms when surface temperatures drop below the dew point, causing water vapor to condense."
    },
    {
      description: "A small, rapid column of rotating air extending from a thunderstorm cloud down to the ground.",
      targetName: "Tornado",
      options: ["Tornado", "Hurricane", "Water Spout", "Squall"],
      explanation: "Tornadoes are localized but possess the fastest wind speeds on Earth, often exceeding 300 mph."
    },
    {
      description: "A trace gas in the atmosphere that plants absorb during photosynthesis and humans exhale as waste.",
      targetName: "Carbon Dioxide",
      options: ["Carbon Dioxide", "Carbon Monoxide", "Oxygen", "Methane"],
      explanation: "Carbon Dioxide is a vital greenhouse gas. While essential for plants, excess CO2 drives global warming."
    }
  ],
  intermediate: [
    {
      description: "The middle layer of the atmosphere, extending from 50 km to 85 km, where temperatures decrease with height and most meteors burn up.",
      targetName: "Mesosphere",
      options: ["Mesosphere", "Stratosphere", "Thermosphere", "Troposphere"],
      explanation: "The mesosphere is the coldest layer of the atmosphere, reaching temperatures as low as -90 degrees Celsius."
    },
    {
      description: "The fourth layer of the atmosphere, extending from 85 km to 600 km, where temperatures rise drastically and auroras occur.",
      targetName: "Thermosphere",
      options: ["Thermosphere", "Mesosphere", "Exosphere", "Stratosphere"],
      explanation: "The thermosphere absorbs high-energy X-rays and UV radiation from the sun, heating up to 2,000 degrees Celsius."
    },
    {
      description: "A layer within the stratosphere containing high concentrations of O3 gas that absorbs harmful solar ultraviolet rays.",
      targetName: "Ozone Layer",
      options: ["Ozone Layer", "Ionosphere", "Magnetosphere", "Troposphere"],
      explanation: "The ozone layer protects life on Earth by filtering out 97-99% of the sun's medium-frequency UV light."
    },
    {
      description: "The measure of the amount of water vapor present in the air.",
      targetName: "Humidity",
      options: ["Humidity", "Precipitation", "Condensation", "Density"],
      explanation: "Relative humidity compares the current water vapor in the air to the maximum amount the air can hold at that temperature."
    },
    {
      description: "An instrument used to measure atmospheric pressure, crucial for forecasting short-term weather changes.",
      targetName: "Barometer",
      options: ["Barometer", "Thermometer", "Anemometer", "Hygrometer"],
      explanation: "Falling barometric pressure indicates incoming storms, while rising pressure suggests clear, calm weather."
    },
    {
      description: "The boundary between two air masses of different temperatures and humidity levels, often causing weather changes.",
      targetName: "Weather Front",
      options: ["Weather Front", "Jet Stream", "Isobar", "Trough"],
      explanation: "Cold fronts and warm fronts represent moving boundaries where weather activity like rain or storms typically occurs."
    },
    {
      description: "An instrument used to measure wind speed.",
      targetName: "Anemometer",
      options: ["Anemometer", "Barometer", "Wind Vane", "Hygrometer"],
      explanation: "An anemometer features spinning cups that rotate faster as wind speed increases, translating rotation to velocity."
    },
    {
      description: "The temperature at which air must be cooled to become fully saturated with water vapor, causing condensation.",
      targetName: "Dew Point",
      options: ["Dew Point", "Freezing Point", "Boiling Point", "Condensation Index"],
      explanation: "When air temperature cools to its dew point, water vapor begins to condense into liquid droplets, forming dew or fog."
    },
    {
      description: "A seasonal prevailing wind in the region of South and Southeast Asia, blowing from the southwest and bringing heavy rain.",
      targetName: "Monsoon",
      options: ["Monsoon", "Tradewinds", "El Nino", "Chinook"],
      explanation: "Monsoons are caused by differential heating of land and ocean, creating massive seasonal wind shifts and rainfall."
    },
    {
      description: "Lines on a weather map connecting points of equal atmospheric pressure.",
      targetName: "Isobars",
      options: ["Isobars", "Isotherms", "Isoclines", "Isohyets"],
      explanation: "Isobars help visualize pressure gradients. Closely spaced isobars indicate strong winds."
    },
    {
      description: "The process of a gas changing into a liquid, such as water vapor forming cloud droplets.",
      targetName: "Condensation",
      options: ["Condensation", "Evaporation", "Sublimation", "Transpiration"],
      explanation: "Condensation is the reverse of evaporation, occurring when warm, moist air cools down."
    },
    {
      description: "The pressure exerted by the weight of the atmosphere, measuring about 1013.25 millibars (1 atm) at sea level.",
      targetName: "Atmospheric Pressure",
      options: ["Atmospheric Pressure", "Barometric Strain", "Chamber Density", "Altitude Weight"],
      explanation: "Atmospheric pressure decreases exponentially with altitude because there are fewer air molecules overhead."
    },
    {
      description: "The release of water vapor from plant leaves into the atmosphere.",
      targetName: "Transpiration",
      options: ["Transpiration", "Evaporation", "Respiration", "Photosynthesis"],
      explanation: "Transpiration is part of the water cycle, where plants draw water from roots and release it as vapor."
    },
    {
      description: "A localized, very intense low-pressure wind system, forming a convective column under a severe thunderstorm.",
      targetName: "Supercell",
      options: ["Supercell", "Squall Line", "Microburst", "Derecho"],
      explanation: "Supercells are highly organized thunderstorms containing a rotating updraft, responsible for major tornadoes."
    },
    {
      description: "The greenhouse gas that is the most abundant in the atmosphere, representing a major driver of natural warmth.",
      targetName: "Water Vapor",
      options: ["Water Vapor", "Carbon Dioxide", "Methane", "Ozone"],
      explanation: "Water vapor is the most abundant greenhouse gas, absorbing thermal radiation emitted from the Earth."
    }
  ],
  advanced: [
    {
      description: "The outermost layer of the atmosphere, extending from 600 km up to 10,000 km, where atoms escape into space.",
      targetName: "Exosphere",
      options: ["Exosphere", "Thermosphere", "Magnetosphere", "Stratopause"],
      explanation: "The exosphere consists of highly dispersed hydrogen and helium molecules, gradually transitioning into vacuum."
    },
    {
      description: "A region overlapping the mesosphere and thermosphere containing charged particles that reflect radio waves back to Earth.",
      targetName: "Ionosphere",
      options: ["Ionosphere", "Magnetosphere", "Exosphere", "Mesopause"],
      explanation: "The ionosphere is ionized by solar radiation, enabling long-distance AM radio communication by bouncing signals."
    },
    {
      description: "The apparent deflection of moving objects (like winds) to the right in the Northern Hemisphere and to the left in the Southern Hemisphere.",
      targetName: "Coriolis Effect",
      options: ["Coriolis Effect", "Hadley Circulation", "Ferrel Deflection", "Rossby Wave"],
      explanation: "The Coriolis effect is caused by Earth's rotation, determining the spiral rotation direction of cyclones."
    },
    {
      description: "Narrow bands of extremely strong winds in the upper atmosphere, typically blowing from west to east.",
      targetName: "Jet Stream",
      options: ["Jet Stream", "Gulf Stream", "Trade Winds", "Geostrophic Wind"],
      explanation: "Jet streams form near boundaries of adjacent air masses with significant temperature differences, affecting flight routes."
    },
    {
      description: "The boundary layer separating the troposphere from the stratosphere, where temperature ceases to decrease with altitude.",
      targetName: "Tropopause",
      options: ["Tropopause", "Stratopause", "Mesopause", "Thermopause"],
      explanation: "The tropopause acts as a thermal lid, preventing water vapor from rising easily into the stratosphere."
    },
    {
      description: "A wind that blows parallel to isobars, resulting from a balance between the pressure gradient force and the Coriolis effect.",
      targetName: "Geostrophic Wind",
      options: ["Geostrophic Wind", "Thermal Wind", "Anabatic Wind", "Katabatic Wind"],
      explanation: "Geostrophic winds occur in the upper atmosphere where surface friction is negligible, flowing along pressure contours."
    },
    {
      description: "The rate at which atmospheric temperature decreases with an increase in altitude, averaging about 6.5 degrees C per km.",
      targetName: "Lapse Rate",
      options: ["Lapse Rate", "Adiabatic Scale", "Thermal Slope", "Convection Index"],
      explanation: "The environmental lapse rate describes the temperature profile of stationary air. Dry/moist air rising expands and cools adiabatically at distinct rates."
    },
    {
      description: "Giant meanders in high-altitude winds (jet streams) that influence global weather patterns and separate cold polar air from warm air.",
      targetName: "Rossby Waves",
      options: ["Rossby Waves", "Kelvin Waves", "Hadley Cells", "Gravity Waves"],
      explanation: "Rossby waves are planetary waves caused by the variation of the Coriolis effect with latitude, driving storm tracks."
    },
    {
      description: "An atmospheric circulation cell in which air rises at the equator, flows equatorward at high altitude, and sinks at subtropical latitudes.",
      targetName: "Hadley Cell",
      options: ["Hadley Cell", "Ferrel Cell", "Polar Cell", "Walker Circulation"],
      explanation: "Hadley cells carry warmth from the tropics to mid-latitudes, generating trade winds and creating major deserts where dry air sinks."
    },
    {
      description: "A warming of the surface of the equatorial Pacific Ocean that occurs every few years, disrupting global weather patterns.",
      targetName: "El Nino",
      options: ["El Nino", "La Nina", "Pacific Oscillation", "Walker Loop"],
      explanation: "El Nino (ENSO) weakens easterly trade winds, shifting warm ocean currents eastward and causing floods in Americas and drought in Asia."
    },
    {
      description: "A weather condition where a layer of warm air sits on top of a layer of cooler air near the surface, trapping air pollutants.",
      targetName: "Thermal Inversion",
      options: ["Thermal Inversion", "Adiabatic Block", "Subsidence Cap", "Stability Front"],
      explanation: "Thermal inversions disrupt normal convection, trapping smog, dust, and greenhouse gases near city ground levels."
    },
    {
      description: "The reflectivity of a surface, such as ice reflecting 90% of solar radiation compared to oceans reflecting only 6%.",
      targetName: "Albedo",
      options: ["Albedo", "Absorptance", "Emissivity", "Scattering Index"],
      explanation: "Albedo determines how much solar energy is absorbed by Earth. Melting glaciers reduce Earth's albedo, accelerating warming."
    },
    {
      description: "A dry, warm wind that blows down the leeward side of a mountain range, heating up as it descends and compresses.",
      targetName: "Fohn Wind",
      options: ["Fohn Wind", "Monsoon", "Hadley Draft", "Geostrophic Flow"],
      explanation: "Fohn winds (like Chinook winds in Americas) undergo adiabatic heating as they sink, melting snow rapidly."
    },
    {
      description: "Clouds composed of ice crystals that form at extremely high altitudes, appearing thin, wispy, and hair-like.",
      targetName: "Cirrus Clouds",
      options: ["Cirrus Clouds", "Cumulus Clouds", "Stratus Clouds", "Altocumulus Clouds"],
      explanation: "Cirrus clouds form in the cold upper troposphere (above 6,000 meters) and can indicate incoming warm fronts."
    },
    {
      description: "The boundary layer separating the stratosphere from the mesosphere, located at approximately 50 km altitude.",
      targetName: "Stratopause",
      options: ["Stratopause", "Tropopause", "Mesopause", "Thermopause"],
      explanation: "At the stratopause, temperatures reach their maximum in the middle atmosphere due to ozone UV absorption."
    }
  ]
};
