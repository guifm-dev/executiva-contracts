import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

function getDatabaseUrl(): string {
    const databaseUrl = process.env.DATABASE_URL

    if (!databaseUrl) {
        throw new Error('DATABASE_URL is not defined')
    }

    return databaseUrl
}

@Injectable()
export class PrismaService extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {
    constructor() {
        super({
            adapter: new PrismaPg(getDatabaseUrl()),
        })
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
