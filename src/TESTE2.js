import FormData from 'form-data';
import axios from "axios";
const stations = {
    // "A826": "ALEGRETE",
    // "A827": "BAGE",
    // "A840": "BENTOGONCALVES",
    // "A812": "CACAPAVADOSUL",
    // "A838": "CAMAQUA",
    // "A897": "CAMBARADOSUL",
    // "A884": "CAMPOBOM",
    // "A879": "CANELA",
    // "A811": "CANGUCU",
    // "A887": "CAPAODOLEAO(PELOTAS)",
    // "A853": "CRUZALTA",
    // "A881": "DOMPEDRITO",
    // "A893": "ENCRUZILHADADOSUL",
    // "A828": "ERECHIM",
    // "A854": "FREDERICOWESTPHALEN",
    // "A883": "IBIRUBA",
    // "A836": "JAGUARAO",
    // "A844": "LAGOAVERMELHA",
    // "A878": "MOSTARDAS",
    // "A856": "PALMEIRADASMISSOES",
    // "A839": "PASSOFUNDO",
    // "A801": "PORTOALEGREJARDIMBOTANICO",
    // "B807": "PORTOALEGREBELEMNOVO",
    // "A831": "QUARAI",
    // "A802": "RIOGRANDE",
    // "A813": "RIOPARDO",
    // "A803": "SANTAMARIA",
    // "A810": "SANTAROSA",
    // "A804": "SANTANADOLIVRAMENTO",
    // "A833": "SANTIAGO",
    // "A805": "SANTOAUGUSTO",
    // "A830": "SAOBORJA",
    // "A832": "SAOGABRIEL",
    // "A829": "SAOJOSEDOSAUSENTES",
    // "A852": "SAOLUIZGONZAGA",
    // "A889": "SAOVICENTEDOSUL",
    // "A894": "SERAFINACORREA",
    "A837": "SOLEDADE",
    // "A899": "SantaVitoriadoPalmarBarradoChui",
    // "A882": "TEUTONIA",
    "A808": "TORRES",
    "A834": "TRAMANDAI",
    "A886": "TUPANCIRETA",
    "A809": "URUGUAIANA",
    "A880": "VACARIA"
};


const data = Object.freeze({
    tipo_dados: 'H',
    tipo_estacao: 'T',
    variaveis: [
        'I175',
        'I106',
        'I108',
        'I615',
        'I616',
        'I133',
        'I619',
        'I101',
        'I103',
        'I611',
        'I612',
        'I613',
        'I614',
        'I620',
        'I617',
        'I618',
        'I105',
        'I113',
        'I608',
        'I111'
    ],
    data_inicio: '2000-01-01',
    data_fim: '2024-12-31',
    tipo_pontuacao: 'P',
});

for (let [station, name] of Object.entries(stations)) {
    await sendRequest(station, name);
}

async function sendRequest(station, name) {
    const requestData = Object.assign({
        email: `marcioal1991+${name.toLowerCase()}@gmail.com`,
        estacoes: [String(station)],
    }, data);

    const formData = {};
    for (const [key, value] of Object.entries(requestData)) {
        formData[key] = value;
    }

    const params = new URLSearchParams(formData);

    const response = await axios.post('https://apibdmep.inmet.gov.br/requisicao', {
        data: params.toString(),
        headers: {
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'accept': '*/*',
            'accept-encoding':'gzip, deflate, br, zstd',
            'accept-language':'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            'connection':'keep-alive',
            // 'content-length':length,
            'host':'apibdmep.inmet.gov.br',
            'origin':'https://bdmep.inmet.gov.br',
            'referer': 'https://bdmep.inmet.gov.br/',
            'sec-ch-ua': '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
            'sec-ch-ua-mobile':'?0',
            'sec-ch-ua-platform':"Linux",
            'sec-fetch-dest':'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site':'same-site',
            'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
        },
    });

    console.log(response.data,  station, name);


}


