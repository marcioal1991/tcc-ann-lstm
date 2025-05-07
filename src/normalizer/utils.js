
const convertTime = (time) => {
    const str = time.toString().padStart(4, '0');
    const hours = str.slice(0, 2);
    const minutes = str.slice(2, 4);

    return `${hours}:${minutes}:00`;
}
const convertToNumberOrNull = (value) => {
    value = value.trim();
    if (value === 'null') return null;
    if (value === '') return null;
    return Number(value);
};

 export const normalizeCity = (cityData) => ({
        name: String(cityData['Nome']),
        station_code: String(cityData['Codigo Estacao']),
        latitude: Number(cityData['Latitude']),
        longitude: Number(cityData['Longitude']),
        altitude: Number(cityData['Altitude']),
        situation: String(cityData['Situacao']),
        start_date: String(cityData['Data Inicial']),
        end_date: String(cityData['Data Final']),
        measurement_periodicity: String(cityData['Periodicidade da Medicao']),
 });

export const normalizeData = (data, cityId) => ({
    measurement_datetime: `${data['Data Medicao']} ${convertTime(data['Hora Medicao'])}`,
    total_precipitation_hourly: convertToNumberOrNull(data['PRECIPITACAO TOTAL, HORARIO(mm)']),
    atmospheric_pressure_station_level: convertToNumberOrNull(data['PRESSAO ATMOSFERICA AO NIVEL DA ESTACAO, HORARIA(mB)']),
    sea_level_pressure_reduced_aut: convertToNumberOrNull(data['PRESSAO ATMOSFERICA REDUZIDA NIVEL DO MAR, AUT(mB)']),
    max_atmospheric_pressure_prev: convertToNumberOrNull(data['PRESSAO ATMOSFERICA MAX.NA HORA ANT. (AUT)(mB)']),
    min_atmospheric_pressure_prev: convertToNumberOrNull(data['PRESSAO ATMOSFERICA MIN. NA HORA ANT. (AUT)(mB)']),
    global_radiation: convertToNumberOrNull(data['RADIACAO GLOBAL(Kj/m²)']),
    station_cpu_temperature: convertToNumberOrNull(data['TEMPERATURA DA CPU DA ESTACAO(°C)']),
    air_temperature_dry_bulb: convertToNumberOrNull(data['TEMPERATURA DO AR - BULBO SECO, HORARIA(°C)']),
    dew_point_temperature: convertToNumberOrNull(data['TEMPERATURA DO PONTO DE ORVALHO(°C)']),
    max_temperature_prev: convertToNumberOrNull(data['TEMPERATURA MAXIMA NA HORA ANT. (AUT)(°C)']),
    min_temperature_prev: convertToNumberOrNull(data['TEMPERATURA MINIMA NA HORA ANT. (AUT)(°C)']),
    max_dew_point_temp_prev: convertToNumberOrNull(data['TEMPERATURA ORVALHO MAX. NA HORA ANT. (AUT)(°C)']),
    min_dew_point_temp_prev: convertToNumberOrNull(data['TEMPERATURA ORVALHO MIN. NA HORA ANT. (AUT)(°C)']),
    station_battery_voltage: convertToNumberOrNull(data['TENSAO DA BATERIA DA ESTACAO(V)']),
    max_relative_humidity_prev_hour: convertToNumberOrNull(data['UMIDADE REL. MAX. NA HORA ANT. (AUT)(%)']),
    min_relative_humidity_prev_hour: convertToNumberOrNull(data['UMIDADE REL. MIN. NA HORA ANT. (AUT)(%)']),
    air_relative_humidity: convertToNumberOrNull(data['UMIDADE RELATIVA DO AR, HORARIA(%)']),
    wind_direction: convertToNumberOrNull(data['VENTO, DIRECAO HORARIA (gr)(° (gr))']),
    wind_max_gust: convertToNumberOrNull(data['VENTO, RAJADA MAXIMA(m/s)']),
    wind_speed: convertToNumberOrNull(data['VENTO, VELOCIDADE HORARIA(m/s)']),
    city_id: cityId,
});







