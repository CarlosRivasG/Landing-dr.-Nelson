import 'reflect-metadata';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { readEnvironment } from '../config/environment';
import { databaseOptions } from './options';

config({ path: resolve(__dirname, '../../../../.env'), quiet: true });

export default new DataSource(databaseOptions(readEnvironment(process.env)));
