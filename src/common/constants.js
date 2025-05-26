export const MEASUREMENT_FEATURE = 'total_precipitation_hourly';
export const FEATURES =[
    'total_precipitation_hourly',
    'atmospheric_pressure_station_level',
    'sea_level_pressure_reduced_aut',
    'max_atmospheric_pressure_prev',
    'min_atmospheric_pressure_prev',
    'global_radiation',
    'station_cpu_temperature',
    'air_temperature_dry_bulb',
    'dew_point_temperature',
    'max_temperature_prev',
    'min_temperature_prev',
    'max_dew_point_temp_prev',
    'min_dew_point_temp_prev',
    'station_battery_voltage',
    'max_relative_humidity_prev_hour',
    'min_relative_humidity_prev_hour',
    'air_relative_humidity',
    'wind_direction',
    'wind_max_gust',
    'wind_speed'
];

export const FEATURES_FOR_SHAPE = FEATURES.filter((f) => f !== MEASUREMENT_FEATURE);

export const SOFT_WEIGHTS = {
    total_precipitation_hourly: 1,
    atmospheric_pressure_station_level: 1,
    sea_level_pressure_reduced_aut: 1,
    max_atmospheric_pressure_prev: 1,
    min_atmospheric_pressure_prev: 1,
    global_radiation: 1,
    station_cpu_temperature: 1,
    air_temperature_dry_bulb: 1,
    dew_point_temperature: 1,
    max_temperature_prev: 1,
    min_temperature_prev: 1,
    max_dew_point_temp_prev: 1,
    min_dew_point_temp_prev: 1,
    station_battery_voltage: 1,
    max_relative_humidity_prev_hour: 1,
    min_relative_humidity_prev_hour: 1,
    air_relative_humidity: 1,
    wind_direction: 1,
    wind_max_gust: 1,
    wind_speed: 1,
}

export const HARD_WEIGHTS = {
    total_precipitation_hourly: 1,
    atmospheric_pressure_station_level: 0.75,
    sea_level_pressure_reduced_aut: 0.70,
    max_atmospheric_pressure_prev: 0.65,
    min_atmospheric_pressure_prev: 0.80,
    global_radiation: 0.55,
    station_cpu_temperature: 0.20,
    air_temperature_dry_bulb: 0.75,
    dew_point_temperature: 0.90,
    max_temperature_prev: 0.60,
    min_temperature_prev: 0.55,
    max_dew_point_temp_prev: 0.80,
    min_dew_point_temp_prev: 0.70,
    station_battery_voltage: 0.10,
    max_relative_humidity_prev_hour: 0.85,
    min_relative_humidity_prev_hour: 0.70,
    air_relative_humidity: 0.95,
    wind_direction: 0.70,
    wind_max_gust: 0.60,
    wind_speed: 0.60,
}

export const ITEMS_PER_QUERY = 10000;
export const WINDOW_SIZE = 24;