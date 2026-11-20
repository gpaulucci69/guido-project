import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
    PROFILE_PORT: number;
}

const envsSchema = joi.object({
    PROFILE_PORT: joi.number().required()
})
.unknown(true);

const { error, value} = envsSchema.validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${ error.message}`);
}

const envVars:EnvVars = value;

export const envs = {
    port: envVars.PROFILE_PORT
}

