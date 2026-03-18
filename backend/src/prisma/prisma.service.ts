import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config(); // 读取 .env

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy{
	private pool:Pool;
	constructor(){
		console.log(process.env.DATABASE_URL);
		const pool = new Pool({connectionString: process.env.DATABASE_URL});
		const adapter = new PrismaPg(pool as any);
		super({adapter});
		this.pool = pool;
	}
	async onModuleInit() {
		await this.$connect();
		console.log("Prisma connected");
	}
	async onModuleDestroy() {
		await this.$disconnect();
		await this.pool.end();
	}
}

