process.env.DATABASE_URL = "postgresql://postgres.dsssaylsfoqszcmdnqhq:Resmiin123!@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";
import { prisma } from './lib/db';

async function main() {
  const article = await prisma.article.findUnique({
    where: { slug: "panduan-lengkap-perizinan-berusaha-berbasis-risiko-oss-rba" },
    select: {
      title: true,
      schemaMarkup: true,
    }
  });
  console.log("ARTICLE:", JSON.stringify(article, null, 2));
}

main().catch(console.error);
