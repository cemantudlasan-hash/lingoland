export function getBackdropStyle(hint: string = "nebula space", seed: string = ""): { background: string } {
  const cleanHint = hint.toLowerCase().trim();

  // 1. Explicit Preset matches
  switch (cleanHint) {
    case "nebula space":
      return {
        background: "radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.45) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(6, 182, 212, 0.45) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.35) 0%, transparent 60%), linear-gradient(135deg, #09090b 0%, #020617 100%)"
      };
    case "cyberpunk city":
      return {
        background: "linear-gradient(215deg, rgba(244, 63, 94, 0.7) 0%, rgba(217, 70, 239, 0.4) 35%, rgba(6, 182, 212, 0.6) 100%), #09090b"
      };
    case "lush forest":
      return {
        background: "radial-gradient(circle at 75% 20%, rgba(16, 185, 129, 0.4) 0%, transparent 60%), radial-gradient(circle at 25% 80%, rgba(234, 179, 8, 0.2) 0%, transparent 50%), linear-gradient(135deg, #064e3b 0%, #022c22 100%)"
      };
    case "tropical beach":
      return {
        background: "radial-gradient(circle at 50% 10%, rgba(253, 224, 71, 0.3) 0%, transparent 50%), linear-gradient(135deg, #06b6d4 0%, #3b82f6 40%, #1e3a8a 100%)"
      };
    case "mountain peaks":
      return {
        background: "linear-gradient(150deg, #1e293b 0%, #0f172a 50%, #334155 100%), radial-gradient(circle at 50% 120%, rgba(255, 255, 255, 0.15) 0%, transparent 60%)"
      };
    case "abstract paint":
      return {
        background: "linear-gradient(120deg, rgba(236, 72, 153, 0.5) 0%, rgba(99, 102, 241, 0.5) 50%, rgba(245, 158, 11, 0.5) 100%), linear-gradient(315deg, #18181b 0%, #09090b 100%)"
      };
    case "vintage records":
      return {
        background: "radial-gradient(circle at 50% 50%, rgba(217, 119, 6, 0.35) 0%, transparent 60%), radial-gradient(circle at 90% 10%, rgba(120, 53, 4, 0.4) 0%, transparent 50%), linear-gradient(135deg, #18181b 0%, #0c0a09 100%)"
      };
    case "modern architecture":
      return {
        background: "linear-gradient(135deg, #3f3f46 0%, #18181b 50%, #27272a 100%), radial-gradient(circle at 20% 80%, rgba(161, 161, 170, 0.15) 0%, transparent 50%)"
      };
    case "cozy library":
      return {
        background: "radial-gradient(circle at 80% 20%, rgba(251, 191, 36, 0.25) 0%, transparent 50%), linear-gradient(135deg, #451a03 0%, #1c1917 100%)"
      };
    case "desert sunset":
      return {
        background: "linear-gradient(180deg, rgba(249, 115, 22, 0.65) 0%, rgba(236, 72, 153, 0.45) 50%, rgba(49, 46, 129, 0.8) 100%)"
      };
    case "underwater reef":
      return {
        background: "radial-gradient(circle at 50% 100%, rgba(20, 184, 166, 0.4) 0%, transparent 60%), linear-gradient(135deg, #0f766e 0%, #115e59 40%, #042f2e 100%)"
      };
    case "cherry blossoms":
      return {
        background: "radial-gradient(circle at 30% 20%, rgba(244, 114, 182, 0.5) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(192, 132, 252, 0.3) 0%, transparent 50%), linear-gradient(135deg, #3b0764 0%, #18002a 100%)"
      };
    case "minimalist desk":
      return {
        background: "linear-gradient(135deg, #1f2937 0%, #111827 50%, #030712 100%), radial-gradient(circle at 80% 10%, rgba(255, 255, 255, 0.05) 0%, transparent 40%)"
      };
    case "retro synthwave":
      return {
        background: "linear-gradient(185deg, rgba(139, 92, 246, 0.5) 0%, rgba(236, 72, 153, 0.4) 40%, rgba(6, 182, 212, 0.3) 80%), #09090b"
      };
    case "aurora borealis":
      return {
        background: "linear-gradient(110deg, rgba(16, 185, 129, 0.55) 0%, rgba(6, 182, 212, 0.45) 45%, rgba(59, 130, 246, 0.45) 100%), linear-gradient(180deg, #020617 0%, #09090b 100%)"
      };
    case "ancient ruins":
      return {
        background: "radial-gradient(circle at 10% 10%, rgba(251, 146, 60, 0.25) 0%, transparent 55%), linear-gradient(135deg, #2e2a24 0%, #1c1917 100%)"
      };
  }

  // 2. Keyword-based matching for custom vibes
  if (cleanHint.includes("blue") || cleanHint.includes("water") || cleanHint.includes("ocean") || cleanHint.includes("sea") || cleanHint.includes("sky")) {
    return {
      background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)"
    };
  }
  if (cleanHint.includes("green") || cleanHint.includes("forest") || cleanHint.includes("nature") || cleanHint.includes("plant") || cleanHint.includes("tree")) {
    return {
      background: "linear-gradient(135deg, #064e3b 0%, #10b981 50%, #a7f3d0 100%)"
    };
  }
  if (cleanHint.includes("red") || cleanHint.includes("fire") || cleanHint.includes("sunset") || cleanHint.includes("warm") || cleanHint.includes("orange") || cleanHint.includes("sun")) {
    return {
      background: "linear-gradient(135deg, #7f1d1d 0%, #f97316 50%, #fde047 100%)"
    };
  }
  if (cleanHint.includes("purple") || cleanHint.includes("space") || cleanHint.includes("galaxy") || cleanHint.includes("dark") || cleanHint.includes("violet")) {
    return {
      background: "linear-gradient(135deg, #3b0764 0%, #8b5cf6 50%, #ec4899 100%)"
    };
  }
  if (cleanHint.includes("pink") || cleanHint.includes("love") || cleanHint.includes("rose") || cleanHint.includes("flower")) {
    return {
      background: "linear-gradient(135deg, #831843 0%, #db2777 50%, #fbcfe8 100%)"
    };
  }

  // 3. Fallback deterministic generator based on simple string hashing
  let hash1 = 0;
  let hash2 = 0;
  const combinedStr = cleanHint + seed;
  for (let i = 0; i < combinedStr.length; i++) {
    hash1 = combinedStr.charCodeAt(i) + ((hash1 << 5) - hash1);
    hash2 = combinedStr.charCodeAt(combinedStr.length - 1 - i) + ((hash2 << 5) - hash2);
  }

  const hue1 = Math.abs(hash1) % 360;
  const hue2 = Math.abs(hash2) % 360;
  
  const color1 = `hsl(${hue1}, 70%, 15%)`;
  const color2 = `hsl(${hue2}, 65%, 25%)`;
  const color3 = `hsl(${(hue1 + 180) % 360}, 60%, 10%)`;

  return {
    background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%), radial-gradient(circle at 80% 20%, ${color3} 0%, transparent 60%)`
  };
}
