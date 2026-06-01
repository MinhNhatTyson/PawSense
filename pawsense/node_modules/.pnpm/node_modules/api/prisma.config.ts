import * as dotenv from 'dotenv'
import path from 'path'
import { defineConfig } from '@prisma/config'

dotenv.config({ path: path.join(__dirname, '.env') })

export default defineConfig({
  earlyAccess: true,
  schema: path.join('prisma', 'schema.prisma'),
  migrate: {
    adapter: async () => {
      const { PrismaPg } = await import('@prisma/adapter-pg')
      const connectionString = process.env.DATABASE_URL!
      return new PrismaPg({ connectionString })
    }
  }
})