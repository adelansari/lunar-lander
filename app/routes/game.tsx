import { Game } from "../game/Game";

export function meta() {
  return [
    { title: "Lunar Lander Challenge" },
    { name: "description", content: "Navigate your spacecraft to the moon's surface." },
  ];
}

export default function GameRoute() {
  return <Game />;
} 