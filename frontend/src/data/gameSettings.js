// Impostazioni modificabili di ogni gioco, usate dal popup "Personalizzazioni".
// La chiave è lo slug del gioco. Per aggiungere un gioco basta aggiungere qui la sua lista.
//
// Tipi disponibili:
//   counter  -> numero con i tasti - e +   (min e max opzionali)
//   checkbox -> casella da spuntare

const gameSettings = {
    impostore: [
        { key: "impostors", label: "Numero impostori", type: "counter", default: 1, min: 1 },
        { key: "impostorHint", label: "Indizio impostori", type: "checkbox", default: false },
    ],

    // esempio per quando si implementerà:
    // "lupus-in-tabula": [
    //     { key: "wolves", label: "Numero lupi", type: "counter", default: 2, min: 1 },
    //     { key: "seer", label: "Veggente", type: "checkbox", default: true },
    // ],
}

export default gameSettings
