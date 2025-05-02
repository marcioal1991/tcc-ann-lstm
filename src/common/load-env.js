import DotEnv from 'dotenv';
import path from "path";

DotEnv.config({
    path: path.resolve(import.meta.dirname, '..', '.env'),
});
