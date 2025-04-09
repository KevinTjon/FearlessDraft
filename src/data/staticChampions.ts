import { Champion } from './types';

const DDRAGON_VERSION = '15.7.1';
const DDRAGON_BASE_URL = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}`;
export const DEFAULT_CHAMPION_ICON = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/-1.png';

export const allChampions: Champion[] = [
  {
    id: "aatrox",
    numericId: 266,
    name: "Aatrox",
    title: "the Darkin Blade",
    image: `${DDRAGON_BASE_URL}/img/champion/Aatrox.png`,
    roles: ["top"]
  },
  {
    id: "ahri",
    numericId: 103,
    name: "Ahri",
    title: "the Nine-Tailed Fox",
    image: `${DDRAGON_BASE_URL}/img/champion/Ahri.png`,
    roles: ["mid"]
  },
  {
    id: "akali",
    numericId: 84,
    name: "Akali",
    title: "the Rogue Assassin",
    image: `${DDRAGON_BASE_URL}/img/champion/Akali.png`,
    roles: ["mid", "top"]
  },
  {
    id: "akshan",
    numericId: 166,
    name: "Akshan",
    title: "the Rogue Sentinel",
    image: `${DDRAGON_BASE_URL}/img/champion/Akshan.png`,
    roles: ["mid", "top"]
  },
  {
    id: "alistar",
    numericId: 12,
    name: "Alistar",
    title: "the Minotaur",
    image: `${DDRAGON_BASE_URL}/img/champion/Alistar.png`,
    roles: ["support"]
  },
  {
    id: "ambessa",
    numericId: 799,
    name: "Ambessa",
    title: "the Matriarch of War",
    image: `${DDRAGON_BASE_URL}/img/champion/Ambessa.png`,
    roles: ["top"]
  },
  {
    id: "amumu",
    numericId: 32,
    name: "Amumu",
    title: "the Sad Mummy",
    image: `${DDRAGON_BASE_URL}/img/champion/Amumu.png`,
    roles: ["jungle", "support"]
  },
  {
    id: "anivia",
    numericId: 34,
    name: "Anivia",
    title: "the Cryophoenix",
    image: `${DDRAGON_BASE_URL}/img/champion/Anivia.png`,
    roles: ["mid", "support"]
  },
  {
    id: "annie",
    numericId: 1,
    name: "Annie",
    title: "the Dark Child",
    image: `${DDRAGON_BASE_URL}/img/champion/Annie.png`,
    roles: ["mid", "support"]
  },
  {
    id: "aphelios",
    numericId: 523,
    name: "Aphelios",
    title: "the Weapon of the Faithful",
    image: `${DDRAGON_BASE_URL}/img/champion/Aphelios.png`,
    roles: ["bot"]
  },
  {
    id: "ashe",
    numericId: 22,
    name: "Ashe",
    title: "the Frost Archer",
    image: `${DDRAGON_BASE_URL}/img/champion/Ashe.png`,
    roles: ["bot", "support"]
  },
  {
    id: "aurelionsol",
    numericId: 136,
    name: "Aurelion Sol",
    title: "The Star Forger",
    image: `${DDRAGON_BASE_URL}/img/champion/AurelionSol.png`,
    roles: ["mid"]
  },
  {
    id: "aurora",
    numericId: 893,
    name: "Aurora",
    title: "the Witch Between Worlds",
    image: `${DDRAGON_BASE_URL}/img/champion/Aurora.png`,
    roles: ["mid","top"]
  },
  {
    id: "azir",
    numericId: 268,
    name: "Azir",
    title: "the Emperor of the Sands",
    image: `${DDRAGON_BASE_URL}/img/champion/Azir.png`,
    roles: ["mid"]
  },
  {
    id: "bard",
    numericId: 432,
    name: "Bard",
    title: "the Wandering Caretaker",
    image: `${DDRAGON_BASE_URL}/img/champion/Bard.png`,
    roles: ["support"]
  },
  {
    id: "belveth",
    numericId: 200,
    name: "Bel'Veth",
    title: "the Empress of the Void",
    image: `${DDRAGON_BASE_URL}/img/champion/Belveth.png`,
    roles: ["jungle"]
  },
  {
    id: "blitzcrank",
    numericId: 53,
    name: "Blitzcrank",
    title: "the Great Steam Golem",
    image: `${DDRAGON_BASE_URL}/img/champion/Blitzcrank.png`,
    roles: ["support"]
  },
  {
    id: "brand",
    numericId: 63,
    name: "Brand",
    title: "the Burning Vengeance",
    image: `${DDRAGON_BASE_URL}/img/champion/Brand.png`,
    roles: ["support", "mid"]
  },
  {
    id: "braum",
    numericId: 201,
    name: "Braum",
    title: "the Heart of the Freljord",
    image: `${DDRAGON_BASE_URL}/img/champion/Braum.png`,
    roles: ["support"]
  },
  {
    id: "briar",
    numericId: 233,
    name: "Briar",
    title: "the Restrained Hunger",
    image: `${DDRAGON_BASE_URL}/img/champion/Briar.png`,
    roles: ["jungle"]
  },
  {
    id: "caitlyn",
    numericId: 51,
    name: "Caitlyn",
    title: "the Sheriff of Piltover",
    image: `${DDRAGON_BASE_URL}/img/champion/Caitlyn.png`,
    roles: ["bot"]
  },
  {
    id: "camille",
    numericId: 164,
    name: "Camille",
    title: "the Steel Shadow",
    image: `${DDRAGON_BASE_URL}/img/champion/Camille.png`,
    roles: ["top"]
  },
  {
    id: "cassiopeia",
    numericId: 69,
    name: "Cassiopeia",
    title: "the Serpent's Embrace",
    image: `${DDRAGON_BASE_URL}/img/champion/Cassiopeia.png`,
    roles: ["mid","top"]
  },
  {
    id: "chogath",
    numericId: 31,
    name: "Cho'Gath",
    title: "the Terror of the Void",
    image: `${DDRAGON_BASE_URL}/img/champion/Chogath.png`,
    roles: ["top", "mid"]
  },
  {
    id: "corki",
    numericId: 42,
    name: "Corki",
    title: "the Daring Bombardier",
    image: `${DDRAGON_BASE_URL}/img/champion/Corki.png`,
    roles: ["mid","bot"]
  },
  {
    id: "darius",
    numericId: 122,
    name: "Darius",
    title: "the Hand of Noxus",
    image: `${DDRAGON_BASE_URL}/img/champion/Darius.png`,
    roles: ["top","jungle"]
  },
  {
    id: "diana",
    numericId: 131,
    name: "Diana",
    title: "Scorn of the Moon",
    image: `${DDRAGON_BASE_URL}/img/champion/Diana.png`,
    roles: ["mid", "jungle"]
  },
  {
    id: "draven",
    numericId: 119,
    name: "Draven",
    title: "the Glorious Executioner",
    image: `${DDRAGON_BASE_URL}/img/champion/Draven.png`,
    roles: ["bot"]
  },
  {
    id: "drmundo",
    numericId: 36,
    name: "Dr. Mundo",
    title: "the Madman of Zaun",
    image: `${DDRAGON_BASE_URL}/img/champion/DrMundo.png`,
    roles: ["top", "jungle"]
  },
  {
    id: "ekko",
    numericId: 245,
    name: "Ekko",
    title: "the Boy Who Shattered Time",
    image: `${DDRAGON_BASE_URL}/img/champion/Ekko.png`,
    roles: ["mid", "jungle"]
  },
  {
    id: "elise",
    numericId: 60,
    name: "Elise",
    title: "the Spider Queen",
    image: `${DDRAGON_BASE_URL}/img/champion/Elise.png`,
    roles: ["jungle","support"]
  },
  {
    id: "evelynn",
    numericId: 28,
    name: "Evelynn",
    title: "Agony's Embrace",
    image: `${DDRAGON_BASE_URL}/img/champion/Evelynn.png`,
    roles: ["jungle"]
  },
  {
    id: "ezreal",
    numericId: 81,
    name: "Ezreal",
    title: "the Prodigal Explorer",
    image: `${DDRAGON_BASE_URL}/img/champion/Ezreal.png`,
    roles: ["bot"]
  },
  {
    id: "fiddlesticks",
    numericId: 9,
    name: "Fiddlesticks",
    title: "the Ancient Fear",
    image: `${DDRAGON_BASE_URL}/img/champion/Fiddlesticks.png`,
    roles: ["jungle"]
  },
  {
    id: "fiora",
    numericId: 114,
    name: "Fiora",
    title: "the Grand Duelist",
    image: `${DDRAGON_BASE_URL}/img/champion/Fiora.png`,
    roles: ["top"]
  },
  {
    id: "fizz",
    numericId: 105,
    name: "Fizz",
    title: "the Tidal Trickster",
    image: `${DDRAGON_BASE_URL}/img/champion/Fizz.png`,
    roles: ["mid"]
  },
  {
    id: "galio",
    numericId: 3,
    name: "Galio",
    title: "the Colossus",
    image: `${DDRAGON_BASE_URL}/img/champion/Galio.png`,
    roles: ["mid", "support"]
  },
  {
    id: "gangplank",
    numericId: 41,
    name: "Gangplank",
    title: "the Saltwater Scourge",
    image: `${DDRAGON_BASE_URL}/img/champion/Gangplank.png`,
    roles: ["top"]
  },
  {
    id: "garen",
    numericId: 86,
    name: "Garen",
    title: "the Might of Demacia",
    image: `${DDRAGON_BASE_URL}/img/champion/Garen.png`,
    roles: ["top"]
  },
  {
    id: "gnar",
    numericId: 150,
    name: "Gnar",
    title: "the Missing Link",
    image: `${DDRAGON_BASE_URL}/img/champion/Gnar.png`,
    roles: ["top"]
  },
  {
    id: "gragas",
    numericId: 79,
    name: "Gragas",
    title: "the Rabble Rouser",
    image: `${DDRAGON_BASE_URL}/img/champion/Gragas.png`,
    roles: ["jungle", "top","mid"]
  },
  {
    id: "graves",
    numericId: 104,
    name: "Graves",
    title: "the Outlaw",
    image: `${DDRAGON_BASE_URL}/img/champion/Graves.png`,
    roles: ["jungle"]
  },
  {
    id: "gwen",
    numericId: 887,
    name: "Gwen",
    title: "the Hallowed Seamstress",
    image: `${DDRAGON_BASE_URL}/img/champion/Gwen.png`,
    roles: ["top","jungle"]
  },
  {
    id: "hecarim",
    numericId: 120,
    name: "Hecarim",
    title: "the Shadow of War",
    image: `${DDRAGON_BASE_URL}/img/champion/Hecarim.png`,
    roles: ["jungle"]
  },
  {
    id: "heimerdinger",
    numericId: 74,
    name: "Heimerdinger",
    title: "the Revered Inventor",
    image: `${DDRAGON_BASE_URL}/img/champion/Heimerdinger.png`,
    roles: ["mid", "support","bot"]
  },
  {
    id: "hwei",
    numericId: 910,
    name: "Hwei",
    title: "the Visionary",
    image: `${DDRAGON_BASE_URL}/img/champion/Hwei.png`,
    roles: ["mid","bot"]
  },
  {
    id: "illaoi",
    numericId: 420,
    name: "Illaoi",
    title: "the Kraken Priestess",
    image: `${DDRAGON_BASE_URL}/img/champion/Illaoi.png`,
    roles: ["top"]
  },
  {
    id: "irelia",
    numericId: 39,
    name: "Irelia",
    title: "the Blade Dancer",
    image: `${DDRAGON_BASE_URL}/img/champion/Irelia.png`,
    roles: ["top", "mid"]
  },
  {
    id: "ivern",
    numericId: 427,
    name: "Ivern",
    title: "the Green Father",
    image: `${DDRAGON_BASE_URL}/img/champion/Ivern.png`,
    roles: ["jungle"]
  },
  {
    id: "janna",
    numericId: 40,
    name: "Janna",
    title: "the Storm's Fury",
    image: `${DDRAGON_BASE_URL}/img/champion/Janna.png`,
    roles: ["support"]
  },
  {
    id: "jarvaniv",
    numericId: 59,
    name: "Jarvan IV",
    title: "the Exemplar of Demacia",
    image: `${DDRAGON_BASE_URL}/img/champion/JarvanIV.png`,
    roles: ["jungle"]
  },
  {
    id: "jax",
    numericId: 24,
    name: "Jax",
    title: "Grandmaster at Arms",
    image: `${DDRAGON_BASE_URL}/img/champion/Jax.png`,
    roles: ["top", "jungle"]
  },
  {
    id: "jayce",
    numericId: 126,
    name: "Jayce",
    title: "the Defender of Tomorrow",
    image: `${DDRAGON_BASE_URL}/img/champion/Jayce.png`,
    roles: ["top", "mid"]
  },
  {
    id: "jhin",
    numericId: 202,
    name: "Jhin",
    title: "the Virtuoso",
    image: `${DDRAGON_BASE_URL}/img/champion/Jhin.png`,
    roles: ["bot"]
  },
  {
    id: "jinx",
    numericId: 222,
    name: "Jinx",
    title: "the Loose Cannon",
    image: `${DDRAGON_BASE_URL}/img/champion/Jinx.png`,
    roles: ["bot"]
  },
  {
    id: "kaisa",
    numericId: 145,
    name: "Kai'Sa",
    title: "Daughter of the Void",
    image: `${DDRAGON_BASE_URL}/img/champion/Kaisa.png`,
    roles: ["bot"]
  },
  {
    id: "kalista",
    numericId: 429,
    name: "Kalista",
    title: "the Spear of Vengeance",
    image: `${DDRAGON_BASE_URL}/img/champion/Kalista.png`,
    roles: ["bot"]
  },
  {
    id: "karma",
    numericId: 43,
    name: "Karma",
    title: "the Enlightened One",
    image: `${DDRAGON_BASE_URL}/img/champion/Karma.png`,
    roles: ["support","mid","top"]
  },
  {
    id: "karthus",
    numericId: 30,
    name: "Karthus",
    title: "the Deathsinger",
    image: `${DDRAGON_BASE_URL}/img/champion/Karthus.png`,
    roles: ["jungle","bot"]
  },
  {
    id: "kassadin",
    numericId: 38,
    name: "Kassadin",
    title: "the Void Walker",
    image: `${DDRAGON_BASE_URL}/img/champion/Kassadin.png`,
    roles: ["mid"]
  },
  {
    id: "katarina",
    numericId: 55,
    name: "Katarina",
    title: "the Sinister Blade",
    image: `${DDRAGON_BASE_URL}/img/champion/Katarina.png`,
    roles: ["mid"]
  },
  {
    id: "kayle",
    numericId: 10,
    name: "Kayle",
    title: "the Righteous",
    image: `${DDRAGON_BASE_URL}/img/champion/Kayle.png`,
    roles: ["top", "mid"]
  },
  {
    id: "kayn",
    numericId: 141,
    name: "Kayn",
    title: "the Shadow Reaper",
    image: `${DDRAGON_BASE_URL}/img/champion/Kayn.png`,
    roles: ["jungle"]
  },
  {
    id: "kennen",
    numericId: 85,
    name: "Kennen",
    title: "the Heart of the Tempest",
    image: `${DDRAGON_BASE_URL}/img/champion/Kennen.png`,
    roles: ["top"]
  },
  {
    id: "khazix",
    numericId: 121,
    name: "Kha'Zix",
    title: "the Voidreaver",
    image: `${DDRAGON_BASE_URL}/img/champion/Khazix.png`,
    roles: ["jungle"]
  },
  {
    id: "kindred",
    numericId: 203,
    name: "Kindred",
    title: "The Eternal Hunters",
    image: `${DDRAGON_BASE_URL}/img/champion/Kindred.png`,
    roles: ["jungle"]
  },
  {
    id: "kled",
    numericId: 240,
    name: "Kled",
    title: "the Cantankerous Cavalier",
    image: `${DDRAGON_BASE_URL}/img/champion/Kled.png`,
    roles: ["top"]
  },
  {
    id: "kogmaw",
    numericId: 96,
    name: "Kog'Maw",
    title: "the Mouth of the Abyss",
    image: `${DDRAGON_BASE_URL}/img/champion/KogMaw.png`,
    roles: ["bot"]
  },
  {
    id: "ksante",
    numericId: 897,
    name: "K'Sante",
    title: "the Pride of Nazumah",
    image: `${DDRAGON_BASE_URL}/img/champion/KSante.png`,
    roles: ["top"]
  },
  {
    id: "leblanc",
    numericId: 7,
    name: "LeBlanc",
    title: "the Deceiver",
    image: `${DDRAGON_BASE_URL}/img/champion/Leblanc.png`,
    roles: ["mid"]
  },
  {
    id: "leesin",
    numericId: 64,
    name: "Lee Sin",
    title: "the Blind Monk",
    image: `${DDRAGON_BASE_URL}/img/champion/LeeSin.png`,
    roles: ["jungle"]
  },
  {
    id: "leona",
    numericId: 89,
    name: "Leona",
    title: "the Radiant Dawn",
    image: `${DDRAGON_BASE_URL}/img/champion/Leona.png`,
    roles: ["support"]
  },
  {
    id: "lillia",
    numericId: 876,
    name: "Lillia",
    title: "the Bashful Bloom",
    image: `${DDRAGON_BASE_URL}/img/champion/Lillia.png`,
    roles: ["jungle"]
  },
  {
    id: "lissandra",
    numericId: 127,
    name: "Lissandra",
    title: "the Ice Witch",
    image: `${DDRAGON_BASE_URL}/img/champion/Lissandra.png`,
    roles: ["mid"]
  },
  {
    id: "lucian",
    numericId: 236,
    name: "Lucian",
    title: "the Purifier",
    image: `${DDRAGON_BASE_URL}/img/champion/Lucian.png`,
    roles: ["bot", "mid"]
  },
  {
    id: "lulu",
    numericId: 117,
    name: "Lulu",
    title: "the Fae Sorceress",
    image: `${DDRAGON_BASE_URL}/img/champion/Lulu.png`,
    roles: ["support"]
  },
  {
    id: "lux",
    numericId: 99,
    name: "Lux",
    title: "the Lady of Luminosity",
    image: `${DDRAGON_BASE_URL}/img/champion/Lux.png`,
    roles: ["support", "mid"]
  },
  {
    id: "malphite",
    numericId: 54,
    name: "Malphite",
    title: "Shard of the Monolith",
    image: `${DDRAGON_BASE_URL}/img/champion/Malphite.png`,
    roles: ["top"]
  },
  {
    id: "malzahar",
    numericId: 90,
    name: "Malzahar",
    title: "the Prophet of the Void",
    image: `${DDRAGON_BASE_URL}/img/champion/Malzahar.png`,
    roles: ["mid"]
  },
  {
    id: "maokai",
    numericId: 57,
    name: "Maokai",
    title: "the Twisted Treant",
    image: `${DDRAGON_BASE_URL}/img/champion/Maokai.png`,
    roles: ["support", "jungle","top"]
  },
  {
    id: "masteryi",
    numericId: 11,
    name: "Master Yi",
    title: "the Wuju Bladesman",
    image: `${DDRAGON_BASE_URL}/img/champion/MasterYi.png`,
    roles: ["jungle"]
  },
  {
    id: "mel",
    numericId: 92,
    name: "Mel",
    title: "the Soul's Reflection",
    image: `${DDRAGON_BASE_URL}/img/champion/Mel.png`,
    roles: ["mid","bot"]
  },
  {
    id: "milio",
    numericId: 902,
    name: "Milio",
    title: "The Gentle Flame",
    image: `${DDRAGON_BASE_URL}/img/champion/Milio.png`,
    roles: ["support"]
  },
  {
    id: "missfortune",
    numericId: 21,
    name: "Miss Fortune",
    title: "the Bounty Hunter",
    image: `${DDRAGON_BASE_URL}/img/champion/MissFortune.png`,
    roles: ["bot"]
  },
  {
    id: "mordekaiser",
    numericId: 82,
    name: "Mordekaiser",
    title: "the Iron Revenant",
    image: `${DDRAGON_BASE_URL}/img/champion/Mordekaiser.png`,
    roles: ["top"]
  },
  {
    id: "morgana",
    numericId: 25,
    name: "Morgana",
    title: "the Fallen",
    image: `${DDRAGON_BASE_URL}/img/champion/Morgana.png`,
    roles: ["support", "mid"]
  },
  {
    id: "naafiri",
    numericId: 950,
    name: "Naafiri",
    title: "the Hound of a Hundred Bites",
    image: `${DDRAGON_BASE_URL}/img/champion/Naafiri.png`,
    roles: ["mid","jungle"]
  },
  {
    id: "nami",
    numericId: 267,
    name: "Nami",
    title: "the Tidecaller",
    image: `${DDRAGON_BASE_URL}/img/champion/Nami.png`,
    roles: ["support"]
  },
  {
    id: "nasus",
    numericId: 75,
    name: "Nasus",
    title: "the Curator of the Sands",
    image: `${DDRAGON_BASE_URL}/img/champion/Nasus.png`,
    roles: ["top"]
  },
  {
    id: "nautilus",
    numericId: 111,
    name: "Nautilus",
    title: "the Titan of the Depths",
    image: `${DDRAGON_BASE_URL}/img/champion/Nautilus.png`,
    roles: ["support"]
  },
  {
    id: "neeko",
    numericId: 518,
    name: "Neeko",
    title: "the Curious Chameleon",
    image: `${DDRAGON_BASE_URL}/img/champion/Neeko.png`,
    roles: ["mid", "support"]
  },
  {
    id: "nidalee",
    numericId: 76,
    name: "Nidalee",
    title: "the Bestial Huntress",
    image: `${DDRAGON_BASE_URL}/img/champion/Nidalee.png`,
    roles: ["jungle"]
  },
  {
    id: "nilah",
    numericId: 895,
    name: "Nilah",
    title: "the Joy Unbound",
    image: `${DDRAGON_BASE_URL}/img/champion/Nilah.png`,
    roles: ["bot"]
  },
  {
    id: "nocturne",
    numericId: 56,
    name: "Nocturne",
    title: "the Eternal Nightmare",
    image: `${DDRAGON_BASE_URL}/img/champion/Nocturne.png`,
    roles: ["jungle"]
  },
  {
    id: "nunu",
    numericId: 20,
    name: "Nunu & Willump",
    title: "the Boy and His Yeti",
    image: `${DDRAGON_BASE_URL}/img/champion/Nunu.png`,
    roles: ["jungle"]
  },
  {
    id: "olaf",
    numericId: 2,
    name: "Olaf",
    title: "the Berserker",
    image: `${DDRAGON_BASE_URL}/img/champion/Olaf.png`,
    roles: ["jungle", "top"]
  },
  {
    id: "orianna",
    numericId: 61,
    name: "Orianna",
    title: "the Lady of Clockwork",
    image: `${DDRAGON_BASE_URL}/img/champion/Orianna.png`,
    roles: ["mid"]
  },
  {
    id: "ornn",
    numericId: 516,
    name: "Ornn",
    title: "The Fire below the Mountain",
    image: `${DDRAGON_BASE_URL}/img/champion/Ornn.png`,
    roles: ["top"]
  },
  {
    id: "pantheon",
    numericId: 80,
    name: "Pantheon",
    title: "the Unbreakable Spear",
    image: `${DDRAGON_BASE_URL}/img/champion/Pantheon.png`,
    roles: ["top", "mid", "support","jungle"]
  },
  {
    id: "poppy",
    numericId: 78,
    name: "Poppy",
    title: "Keeper of the Hammer",
    image: `${DDRAGON_BASE_URL}/img/champion/Poppy.png`,
    roles: ["top", "jungle","support"]
  },
  {
    id: "pyke",
    numericId: 555,
    name: "Pyke",
    title: "the Bloodharbor Ripper",
    image: `${DDRAGON_BASE_URL}/img/champion/Pyke.png`,
    roles: ["support"]
  },
  {
    id: "qiyana",
    numericId: 246,
    name: "Qiyana",
    title: "Empress of the Elements",
    image: `${DDRAGON_BASE_URL}/img/champion/Qiyana.png`,
    roles: ["mid"]
  },
  {
    id: "quinn",
    numericId: 133,
    name: "Quinn",
    title: "Demacia's Wings",
    image: `${DDRAGON_BASE_URL}/img/champion/Quinn.png`,
    roles: ["top"]
  },
  {
    id: "rakan",
    numericId: 497,
    name: "Rakan",
    title: "The Charmer",
    image: `${DDRAGON_BASE_URL}/img/champion/Rakan.png`,
    roles: ["support"]
  },
  {
    id: "rammus",
    numericId: 33,
    name: "Rammus",
    title: "the Armordillo",
    image: `${DDRAGON_BASE_URL}/img/champion/Rammus.png`,
    roles: ["jungle"]
  },
  {
    id: "reksai",
    numericId: 421,
    name: "Rek'Sai",
    title: "the Void Burrower",
    image: `${DDRAGON_BASE_URL}/img/champion/RekSai.png`,
    roles: ["jungle"]
  },
  {
    id: "rell",
    numericId: 526,
    name: "Rell",
    title: "the Iron Maiden",
    image: `${DDRAGON_BASE_URL}/img/champion/Rell.png`,
    roles: ["support"]
  },
  {
    id: "renata",
    numericId: 888,
    name: "Renata Glasc",
    title: "the Chem-Baroness",
    image: `${DDRAGON_BASE_URL}/img/champion/Renata.png`,
    roles: ["support"]
  },
  {
    id: "renekton",
    numericId: 58,
    name: "Renekton",
    title: "the Butcher of the Sands",
    image: `${DDRAGON_BASE_URL}/img/champion/Renekton.png`,
    roles: ["top"]
  },
  {
    id: "rengar",
    numericId: 107,
    name: "Rengar",
    title: "the Pridestalker",
    image: `${DDRAGON_BASE_URL}/img/champion/Rengar.png`,
    roles: ["jungle"]
  },
  {
    id: "riven",
    numericId: 92,
    name: "Riven",
    title: "the Exile",
    image: `${DDRAGON_BASE_URL}/img/champion/Riven.png`,
    roles: ["top"]
  },
  {
    id: "rumble",
    numericId: 68,
    name: "Rumble",
    title: "the Mechanized Menace",
    image: `${DDRAGON_BASE_URL}/img/champion/Rumble.png`,
    roles: ["top"]
  },
  {
    id: "ryze",
    numericId: 13,
    name: "Ryze",
    title: "the Rune Mage",
    image: `${DDRAGON_BASE_URL}/img/champion/Ryze.png`,
    roles: ["mid", "top"]
  },
  {
    id: "samira",
    numericId: 360,
    name: "Samira",
    title: "the Desert Rose",
    image: `${DDRAGON_BASE_URL}/img/champion/Samira.png`,
    roles: ["bot"]
  },
  {
    id: "sejuani",
    numericId: 113,
    name: "Sejuani",
    title: "Fury of the North",
    image: `${DDRAGON_BASE_URL}/img/champion/Sejuani.png`,
    roles: ["jungle"]
  },
  {
    id: "senna",
    numericId: 235,
    name: "Senna",
    title: "the Redeemer",
    image: `${DDRAGON_BASE_URL}/img/champion/Senna.png`,
    roles: ["support"]
  },
  {
    id: "seraphine",
    numericId: 147,
    name: "Seraphine",
    title: "the Starry-Eyed Songstress",
    image: `${DDRAGON_BASE_URL}/img/champion/Seraphine.png`,
    roles: ["support", "mid","bot"]
  },
  {
    id: "sett",
    numericId: 875,
    name: "Sett",
    title: "the Boss",
    image: `${DDRAGON_BASE_URL}/img/champion/Sett.png`,
    roles: ["top", "support"]
  },
  {
    id: "shaco",
    numericId: 35,
    name: "Shaco",
    title: "the Demon Jester",
    image: `${DDRAGON_BASE_URL}/img/champion/Shaco.png`,
    roles: ["jungle"]
  },
  {
    id: "shen",
    numericId: 98,
    name: "Shen",
    title: "the Eye of Twilight",
    image: `${DDRAGON_BASE_URL}/img/champion/Shen.png`,
    roles: ["top", "support"]
  },
  {
    id: "shyvana",
    numericId: 102,
    name: "Shyvana",
    title: "the Half-Dragon",
    image: `${DDRAGON_BASE_URL}/img/champion/Shyvana.png`,
    roles: ["jungle"]
  },
  {
    id: "singed",
    numericId: 27,
    name: "Singed",
    title: "the Mad Chemist",
    image: `${DDRAGON_BASE_URL}/img/champion/Singed.png`,
    roles: ["top"]
  },
  {
    id: "sion",
    numericId: 14,
    name: "Sion",
    title: "The Undead Juggernaut",
    image: `${DDRAGON_BASE_URL}/img/champion/Sion.png`,
    roles: ["top"]
  },
  {
    id: "sivir",
    numericId: 15,
    name: "Sivir",
    title: "the Battle Mistress",
    image: `${DDRAGON_BASE_URL}/img/champion/Sivir.png`,
    roles: ["bot"]
  },
  {
    id: "skarner",
    numericId: 72,
    name: "Skarner",
    title: "the Crystal Vanguard",
    image: `${DDRAGON_BASE_URL}/img/champion/Skarner.png`,
    roles: ["jungle"]
  },
  {
    id: "smolder",
    numericId: 901,
    name: "Smolder",
    title: "the Fiery Fledgling",
    image: `${DDRAGON_BASE_URL}/img/champion/Smolder.png`,
    roles: ["bot","mid"]
  },
  {
    id: "sona",
    numericId: 37,
    name: "Sona",
    title: "Maven of the Strings",
    image: `${DDRAGON_BASE_URL}/img/champion/Sona.png`,
    roles: ["support"]
  },
  {
    id: "soraka",
    numericId: 16,
    name: "Soraka",
    title: "the Starchild",
    image: `${DDRAGON_BASE_URL}/img/champion/Soraka.png`,
    roles: ["support"]
  },
  {
    id: "swain",
    numericId: 50,
    name: "Swain",
    title: "the Noxian Grand General",
    image: `${DDRAGON_BASE_URL}/img/champion/Swain.png`,
    roles: ["mid", "support"]
  },
  {
    id: "sylas",
    numericId: 517,
    name: "Sylas",
    title: "the Unshackled",
    image: `${DDRAGON_BASE_URL}/img/champion/Sylas.png`,
    roles: ["mid"]
  },
  {
    id: "syndra",
    numericId: 134,
    name: "Syndra",
    title: "the Dark Sovereign",
    image: `${DDRAGON_BASE_URL}/img/champion/Syndra.png`,
    roles: ["mid"]
  },
  {
    id: "tahmkench",
    numericId: 223,
    name: "Tahm Kench",
    title: "the River King",
    image: `${DDRAGON_BASE_URL}/img/champion/TahmKench.png`,
    roles: ["top", "support"]
  },
  {
    id: "taliyah",
    numericId: 163,
    name: "Taliyah",
    title: "the Stoneweaver",
    image: `${DDRAGON_BASE_URL}/img/champion/Taliyah.png`,
    roles: ["jungle", "mid"]
  },
  {
    id: "talon",
    numericId: 91,
    name: "Talon",
    title: "the Blade's Shadow",
    image: `${DDRAGON_BASE_URL}/img/champion/Talon.png`,
    roles: ["mid"]
  },
  {
    id: "taric",
    numericId: 44,
    name: "Taric",
    title: "the Shield of Valoran",
    image: `${DDRAGON_BASE_URL}/img/champion/Taric.png`,
    roles: ["support"]
  },
  {
    id: "teemo",
    numericId: 17,
    name: "Teemo",
    title: "the Swift Scout",
    image: `${DDRAGON_BASE_URL}/img/champion/Teemo.png`,
    roles: ["top"]
  },
  {
    id: "thresh",
    numericId: 412,
    name: "Thresh",
    title: "the Chain Warden",
    image: `${DDRAGON_BASE_URL}/img/champion/Thresh.png`,
    roles: ["support"]
  },
  {
    id: "tristana",
    numericId: 18,
    name: "Tristana",
    title: "the Yordle Gunner",
    image: `${DDRAGON_BASE_URL}/img/champion/Tristana.png`,
    roles: ["bot","mid"]
  },
  {
    id: "trundle",
    numericId: 48,
    name: "Trundle",
    title: "the Troll King",
    image: `${DDRAGON_BASE_URL}/img/champion/Trundle.png`,
    roles: ["jungle", "top"]
  },
  {
    id: "tryndamere",
    numericId: 23,
    name: "Tryndamere",
    title: "the Barbarian King",
    image: `${DDRAGON_BASE_URL}/img/champion/Tryndamere.png`,
    roles: ["top"]
  },
  {
    id: "twistedfate",
    numericId: 4,
    name: "Twisted Fate",
    title: "the Card Master",
    image: `${DDRAGON_BASE_URL}/img/champion/TwistedFate.png`,
    roles: ["mid"]
  },
  {
    id: "twitch",
    numericId: 29,
    name: "Twitch",
    title: "the Plague Rat",
    image: `${DDRAGON_BASE_URL}/img/champion/Twitch.png`,
    roles: ["bot"]
  },
  {
    id: "udyr",
    numericId: 77,
    name: "Udyr",
    title: "the Spirit Walker",
    image: `${DDRAGON_BASE_URL}/img/champion/Udyr.png`,
    roles: ["jungle"]
  },
  {
    id: "urgot",
    numericId: 6,
    name: "Urgot",
    title: "the Dreadnought",
    image: `${DDRAGON_BASE_URL}/img/champion/Urgot.png`,
    roles: ["top"]
  },
  {
    id: "varus",
    numericId: 110,
    name: "Varus",
    title: "the Arrow of Retribution",
    image: `${DDRAGON_BASE_URL}/img/champion/Varus.png`,
    roles: ["bot", "mid"]
  },
  {
    id: "vayne",
    numericId: 67,
    name: "Vayne",
    title: "the Night Hunter",
    image: `${DDRAGON_BASE_URL}/img/champion/Vayne.png`,
    roles: ["bot", "top"]
  },
  {
    id: "veigar",
    numericId: 45,
    name: "Veigar",
    title: "the Tiny Master of Evil",
    image: `${DDRAGON_BASE_URL}/img/champion/Veigar.png`,
    roles: ["mid", "bot"]
  },
  {
    id: "velkoz",
    numericId: 161,
    name: "Vel'Koz",
    title: "the Eye of the Void",
    image: `${DDRAGON_BASE_URL}/img/champion/Velkoz.png`,
    roles: ["mid", "support"]
  },
  {
    id: "vex",
    numericId: 711,
    name: "Vex",
    title: "the Gloomist",
    image: `${DDRAGON_BASE_URL}/img/champion/Vex.png`,
    roles: ["mid"]
  },
  {
    id: "vi",
    numericId: 254,
    name: "Vi",
    title: "the Piltover Enforcer",
    image: `${DDRAGON_BASE_URL}/img/champion/Vi.png`,
    roles: ["jungle"]
  },
  {
    id: "viego",
    numericId: 234,
    name: "Viego",
    title: "The Ruined King",
    image: `${DDRAGON_BASE_URL}/img/champion/Viego.png`,
    roles: ["jungle"]
  },
  {
    id: "viktor",
    numericId: 112,
    name: "Viktor",
    title: "the Machine Herald",
    image: `${DDRAGON_BASE_URL}/img/champion/Viktor.png`,
    roles: ["mid"]
  },
  {
    id: "vladimir",
    numericId: 8,
    name: "Vladimir",
    title: "the Crimson Reaper",
    image: `${DDRAGON_BASE_URL}/img/champion/Vladimir.png`,
    roles: ["mid", "top"]
  },
  {
    id: "volibear",
    numericId: 106,
    name: "Volibear",
    title: "the Relentless Storm",
    image: `${DDRAGON_BASE_URL}/img/champion/Volibear.png`,
    roles: ["jungle", "top"]
  },
  {
    id: "warwick",
    numericId: 19,
    name: "Warwick",
    title: "the Uncaged Wrath of Zaun",
    image: `${DDRAGON_BASE_URL}/img/champion/Warwick.png`,
    roles: ["jungle"]
  },
  {
    id: "monkeyking",
    numericId: 62,
    name: "Wukong",
    title: "the Monkey King",
    image: `${DDRAGON_BASE_URL}/img/champion/MonkeyKing.png`,
    roles: ["top", "jungle"]
  },
  {
    id: "xayah",
    numericId: 498,
    name: "Xayah",
    title: "the Rebel",
    image: `${DDRAGON_BASE_URL}/img/champion/Xayah.png`,
    roles: ["bot"]
  },
  {
    id: "xerath",
    numericId: 101,
    name: "Xerath",
    title: "the Magus Ascendant",
    image: `${DDRAGON_BASE_URL}/img/champion/Xerath.png`,
    roles: ["mid", "support"]
  },
  {
    id: "xinzhao",
    numericId: 5,
    name: "Xin Zhao",
    title: "the Seneschal of Demacia",
    image: `${DDRAGON_BASE_URL}/img/champion/XinZhao.png`,
    roles: ["jungle"]
  },
  {
    id: "yasuo",
    numericId: 157,
    name: "Yasuo",
    title: "the Unforgiven",
    image: `${DDRAGON_BASE_URL}/img/champion/Yasuo.png`,
    roles: ["mid", "top","bot"]
  },
  {
    id: "yone",
    numericId: 777,
    name: "Yone",
    title: "the Unforgotten",
    image: `${DDRAGON_BASE_URL}/img/champion/Yone.png`,
    roles: ["mid", "top"]
  },
  {
    id: "yorick",
    numericId: 83,
    name: "Yorick",
    title: "Shepherd of Souls",
    image: `${DDRAGON_BASE_URL}/img/champion/Yorick.png`,
    roles: ["top"]
  },
  {
    id: "yuumi",
    numericId: 350,
    name: "Yuumi",
    title: "the Magical Cat",
    image: `${DDRAGON_BASE_URL}/img/champion/Yuumi.png`,
    roles: ["support"]
  },
  {
    id: "zac",
    numericId: 154,
    name: "Zac",
    title: "the Secret Weapon",
    image: `${DDRAGON_BASE_URL}/img/champion/Zac.png`,
    roles: ["jungle"]
  },
  {
    id: "zed",
    numericId: 238,
    name: "Zed",
    title: "the Master of Shadows",
    image: `${DDRAGON_BASE_URL}/img/champion/Zed.png`,
    roles: ["mid","zed"]
  },
  {
    id: "zeri",
    numericId: 221,
    name: "Zeri",
    title: "the Spark of Zaun",
    image: `${DDRAGON_BASE_URL}/img/champion/Zeri.png`,
    roles: ["bot"]
  },
  {
    id: "ziggs",
    numericId: 115,
    name: "Ziggs",
    title: "the Hexplosives Expert",
    image: `${DDRAGON_BASE_URL}/img/champion/Ziggs.png`,
    roles: ["mid", "bot"]
  },
  {
    id: "zilean",
    numericId: 26,
    name: "Zilean",
    title: "the Chronokeeper",
    image: `${DDRAGON_BASE_URL}/img/champion/Zilean.png`,
    roles: ["support"]
  },
  {
    id: "zoe",
    numericId: 142,
    name: "Zoe",
    title: "the Aspect of Twilight",
    image: `${DDRAGON_BASE_URL}/img/champion/Zoe.png`,
    roles: ["mid"]
  },
  {
    id: "zyra",
    numericId: 143,
    name: "Zyra",
    title: "Rise of the Thorns",
    image: `${DDRAGON_BASE_URL}/img/champion/Zyra.png`,
    roles: ["support"]
  }
]; 