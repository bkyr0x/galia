// Voiceover per scene. voDur measured with ffprobe; frames = LEAD + VO + tail.
export const SCENES = [
  { id: "S01-Herojus", vo: "vo/01.mp3", voDur: 7.81, frames: 273,
    text: "Tomui keturiasdešimt vieneri. Jis sportuoja ir jaučiasi puikiai. Bet jo kraujas pasakoja kitą istoriją." },
  { id: "S02-Problema", vo: "vo/02.mp3", voDur: 13.17, frames: 428,
    text: "Kas antra mirtis Lietuvoje – dėl širdies ir kraujagyslių ligų. Išvengiamų mirčių – pusantro karto daugiau nei EBPO vidurkis. Liga ateina tyliai, o mes sužinome per vėlai." },
  { id: "S03-Izvalga", vo: "vo/03.mp3", voDur: 12.59, frames: 417,
    text: "Šiandien Tomas turi du kelius. Pigų tyrimų paketą – ir lapą skaičių, kuriuos turi išsiaiškinti pats. Arba ilgaamžiškumo programą už tris tūkstančius eurų. Vidurio nėra." },
  { id: "S04-Atskleidimas", vo: "vo/04.mp3", voDur: 2.85, frames: 143,
    text: "Iki šiol. Susipažinkite – GALIA." },
  { id: "S05-Rezultatai", vo: "vo/05.mp3", voDur: 16.77, frames: 566,
    text: "Vienas kraujo tyrimas – daugiau nei šimtas rodiklių. Po savaitės Tomas gauna pranešimą: 84 rodikliai, 5 – už normos ribų. Padidėjęs ApoB ir blogasis cholesterolis – to įprastas paketas dažniausiai net nematuoja." },
  { id: "S06-Planas", vo: "vo/06.mp3", voDur: 12.2, frames: 411,
    text: "Gydytojas patikrina planą: trys prioritetai, du veiksmai šiandien. O kilus klausimui Tomas klausia GALIA asistento – lietuviškai, bet kuriuo paros metu." },
  { id: "S07-Pokytis", vo: "vo/07.mp3", voDur: 4.75, frames: 218,
    text: "Po pusmečio – pakartotinis tyrimas. Ir Tomas mato pokytį." },
  { id: "S08-Irodymas", vo: "vo/08.mp3", voDur: 10.84, frames: 361,
    text: "Modelis patikrintas: JAV Superpower – per 60 000 narių ir daugiau nei pusė milijardo dolerių vertės. Lietuvoje tokio sprendimo dar nėra." },
  { id: "S09-Pasiulymas", vo: "vo/09.mp3", voDur: 13.95, frames: 467,
    text: "Tai, kas galėtų kainuoti 3 000 eurų, GALIOJE kainuoja 149 eurus per metus. Su genomo tyrimu – 249. Klientai – žmonės ir darbdaviai." },
  { id: "S10-Prasymas", vo: "vo/10.mp3", voDur: 10.37, frames: 425,
    text: "Per hakatoną paleisime veikiantį prototipą: tyrimų įkėlimą, paaiškinimą lietuviškai ir asmeninį planą. Nes sveikata – tavo supergalia." },
] as const;

export const TOTAL = SCENES.reduce((s, x) => s + x.frames, 0);
