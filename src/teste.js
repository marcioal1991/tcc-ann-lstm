import axios from "axios";

async function sendRequest(station, name) {
    const requestData = Object.assign({
        email: `marcioal1991+${name.toLowerCase()}@gmail.com`,
        estacoes: [String(station)],
    }, data);

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(requestData)) {
        if (Array.isArray(value)) {
            value.forEach((item) => params.append(`${key}[]`, item));
        } else {
            params.append(key, value);
        }
    }


    const response = await axios.post('https://apibdmep.inmet.gov.br/requisicao', params.toString(), {
        headers: {
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate, br, zstd',
            'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            'connection': 'keep-alive',
            'host': 'apibdmep.inmet.gov.br',
            'origin': 'https://bdmep.inmet.gov.br',
            'referer': 'https://bdmep.inmet.gov.br/',
            'sec-ch-ua': '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': "Linux",
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
        },
    });

    console.log(response.data, station, name);
}


const stations = {
    "83876": "SANTAROSA", // sem dados
    "83878": "TRESDEMAIO", // sem dados
    "83879": "TRESPASSOS",
    "83880": "PALMEIRADASMISSOES",
    "83881": "IRAI",
    "83885": "MARCELINORAMOS",
    "83892": "PORTOLUCENA",
    "83901": "SAOBORJA",
    "83907": "SAOLUIZGONZAGA",
    "83909": "SANTOANGELO",
    "83910": "PANAMBI",
    "83912": "CRUZALTA",
    "83914": "PASSOFUNDO",
    "83915": "GUAPORE",
    "83916": "LAGOAVERMELHA",
    "83917": "ANTONIOPRADO",
    "83918": "VACARIA",
    "83919": "BOMJESUS",
    "83927": "URUGUAIANA",
    "83929": "ITAQUI",
    "83931": "ALEGRETE", // sem dados
    "83932": "IBIRUBA",
    "83933": "SANTIAGO",
    "83935": "JULIODECASTILHO",
    "83936": "SANTAMARIA",
    "83938": "SOLEDADE",
    "83939": "SANTACRUZDOSUL",
    "83940": "TAQUARI",
    "83941": "BENTOGONCALVES",
    "83942": "CAXIASDOSUL",
    "83943": "TAQUARA",
    "83944": "CANELA",
    "83945": "SAOFRANCISCODEPAULA",
    "83946": "CAMBARADOSUL",
    "83948": "TORRES",
    "83950": "LAJEADO",
    "83951": "NOVOHAMBURGO",
    "83953": "SANTANADOLIVRAMENTO",
    "83954": "TRIUNFO",
    "83955": "CACEQUI",
    "83956": "DOMPEDRITO",
    "83957": "SAOGABRIEL",
    "83959": "CACAPAVADOSUL",
    "83960": "MORRODESANTATEREZA",
    "83961": "CAMPOBOM",
    "83963": "CACHOEIRADOSUL",
    "83964": "ENCRUZILHADADOSUL",
    "83966": "TAPES",
    "83967": "PORTOALEGRE",
    "83968": "VIAMAO",
    "83972": "TEUTONIA",
    "83976": "SANTANADABOAVISTA",
    "83978": "CAMAQUA",
    "83980": "BAGE",
    "83983": "PIRATINI",
    "83985": "PELOTAS",
    "83992": "JAGUARAO",
    "83994": "BARRADORIOGRANDE",
    "83995": "RIOGRANDE",
    "83997": "SANTAVITORIADOPALMAR"
};


const data = Object.freeze({
    'tipo_dados': 'H',
    'tipo_estacao': 'M',
    'variaveis': [
        'I125',
        'I117',
        'I121',
        'I114',
        'I175',
        'I106',
        'I107',
        'I101',
        'I102',
        'I103',
        'I105',
        'I112',
        'I111',
        'I110',
    ],
    'data_inicio': '2000-01-01',
    'data_fim': '2024-12-31',
    'tipo_pontuacao': 'P'
});

for (let [station, name] of Object.entries(stations)) {
    await sendRequest(station, name);
}