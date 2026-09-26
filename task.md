# Зорилго Трекер (Goal Tracker) — n8n + Telegram Архитектур ба Setup Гарын Авлага

> **Стек:** Cloudflare Workers, Cloudflare D1, Drizzle ORM, Apollo GraphQL, n8n, Telegram Bot API, LLM (OpenAI/Anthropic)
> **Загвар апп:** `apps/school-funding/school-funding-service` (Cloudflare Worker + D1 + Drizzle + Apollo pattern-ийг дагана)
> **Шинэ апп:** `apps/goal-tracker/goal-tracker-service` (+ сонголтоор `goal-tracker-web`)

---

## Агуулга

1. [Санааны той&#1084;](#1-санааны-тойм)
2. [Архитектурын диагра&#1084;](#2-архитектурын-диаграм)
3. [Ко&#1084;понентууд](#3-компонентууд)
4. [Өгөгдлийн загвар (Drizzle schema)](#4-өгөгдлийн-загвар-drizzle-schema)
5. [GraphQL API](#5-graphql-api)
6. [n8n Workflow-ууд](#6-n8n-workflow-ууд)
7. [Хэрэглэгчийн за&#1084; (User Flow)](#7-хэрэглэгчийн-зам-user-flow)
8. [Monorepo дээр Setup хийх](#8-monorepo-дээр-setup-хийх)
9. [n8n Setup](#9-n8n-setup)
10. [Аюулгүй байдал](#10-аюулгүй-байдал)
11. [Локал Development](#11-локал-development)
12. [Дараагийн алха&#1084;ууд](#12-дараагийн-алхамууд)

--

## 1. Санааны той&#1084;

Сурагч **то&#1084; зорилго** (жишээ нь: "IELTS 7.0 авах", "Стартап ко&#1084;пани хийх") тавина. AI үүнийг:

1. **Зорилтууд** (sub-goals / objectives) болгож задална
2. Тэдгээр зорилт бүрийг биелүүлэх **өдөр тут&#1084;ын таск**-уудад хуваана

Дараа нь Telegram bot **өдөр бүр тодорхой цагт** тухайн өдрийн таскийг сурагчид илгээнэ. Сурагч таскаа хийгээд хийсэн зүйлээ товч байдлаар chat-руу бичиж явуулна. AI энэ хариултыг таскийн шаардлагатай харьцуулж **биелсэн эсэх**-ийг үнэлээд, зорилт/зорилгын **progress**-ийг ахиулна эсвэл ахиулахгүй.

Орchestration давхарга нь бүхэлдээ **n8n** дээр байна (cron trigger, Telegram trigger, AI node, HTTP Request → GraphQL API). Өгөгдлийн эх сурвалж (source of truth) нь Cloudflare D1 дээрх **Drizzle** schema бүхий **GraphQL API** (Cloudflare Worker дээр ажиллана).

---

## 2. Архитектурын диагра&#1084;

```
┌──────────────┐        /start, /link           ┌────────────────────┐
│   Сурагч     │ ───────────────────────────────▶│   Telegram Bot     │
│  (Telegram)  │◀─────────────────────────────── │   (BotFather)      │
└──────┬───────┘        өдрийн таск, feedback     └──────────┬─────────┘
       │                                                     │ webhook
       │ (сонголтоор)                                        ▼
       │                                          ┌────────────────────┐
       │                                          │        n8n         │
┌──────▼───────┐   зорилго үүсгэх (GraphQL)       │  (orchestration)   │
│ goal-tracker- │ ───────────────────────────────▶│                    │
│     web       │                                 │ • Goal Decompose   │
│ (Next.js,     │                                 │ • Daily Dispatcher │
│  Clerk auth)  │                                 │ • Submission +     │
└───────────────┘                                 │   AI Evaluation    │
                                                    │ • Missed Reminder  │
                                                    └──────────┬─────────┘
                                     HTTP (X-Service-Key)      │  LLM API
                              ┌─────────────────────────────┐ │ (decompose /
                              │                              ▼ ▼  evaluate)
                              │   goal-tracker-service (Cloudflare Worker) │
                              │   Apollo GraphQL + Drizzle ORM             │
                              └──────────────────┬──────────────────────┘
                                                  ▼
                                        ┌───────────────────┐
                                        │  Cloudflare D1     │
                                        │  (SQLite)          │
                                        │  users / goals /   │
                                        │  objectives /      │
                                        │  tasks / submissions│
                                        │  / evaluations      │
                                        └───────────────────┘
```

---

## 3. Ко&#1084;понентууд

| Ко&#1084;понент                   | Үүрэг                                                                                   | Технологи                                              |
| --------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| **Telegram Bot**                  | Таск илгээх, сурагчийн хариулт хүлээн авах цонх                                         | BotFather                                              |
| **n8n**                           | Cron/webhook trigger, AI дуудалт, GraphQL API дуудалт — бүх бизнес логикийг оркестрлэнэ | n8n (self-host эсвэл cloud)                            |
| **goal-tracker-service**          | Source of truth. GraphQL API, Drizzle schema, D1 хадгалалт                              | Cloudflare Worker, `@apollo/server`, `drizzle-orm/d1`  |
| **goal-tracker-web** (сонголтоор) | Сурагч/эцэг эх зорилгоо үүсгэх, progress харах dashboard                                | Next.js + Clerk (`school-funding-web`-тэй адил загвар) |
| **LLM (OpenAI/Anthropic)**        | (a) зорилгыг зорилт+таск болгож задлах, (b) сурагчийн хариултыг үнэлэх                  | n8n доторх AI node                                     |

`goal-tracker-service` нь `school-funding-service`-тэй яг адилхан бүтэцтэй байна: Cloudflare Worker дээр Apollo GraphQL, D1 database, Drizzle ORM, `@as-integrations/cloudflare-workers` handler. Ялгаа нь зөвхөн domain (goal/task) болон auth загвар дээр — Clerk-ийн зэрэгцээ n8n-д зориулсан **service API key** нэ&#1084;эгдэнэ (доор [10-р бүлэг](#10-аюулгүй-байдал)-ийг үзнэ үү).

---

## 4. Өгөгдлийн загвар (Drizzle schema)

`apps/goal-tracker/goal-tracker-service/src/db/` дотор `school-funding-service`-ийн загвараар (SQLite/D1, `sqliteTable`) дараах хүснэгтүүдийг үүсгэнэ:

### `users.schema.ts`

| Багана                   | Тайлбар                                                               |
| ------------------------ | --------------------------------------------------------------------- |
| `id`                     | Clerk user id (web dashboard-аар нэвтэрсэн бол) эсвэл generated id    |
| `userName`, `email`      |                                                                       |
| `telegramChatId`         | unique, nullable — bot холбогдох хүртэл хоосон                        |
| `telegramUsername`       |                                                                       |
| `timezone`               | таск илгээх цагийг тооцоход хэрэглэгдэнэ (default `Asia/Ulaanbaatar`) |
| `linkCode`               | Telegram-г dashboard account-тай холбох түр код                       |
| `createdAt`, `updatedAt` |                                                                       |

### `goals.schema.ts` (то&#1084; зорилго)

`id`, `userId`, `title`, `description`, `status` (`ACTIVE` / `COMPLETED` / `ABANDONED`), `progressPercent`, `createdAt`, `updatedAt`

### `objectives.schema.ts` (зорилтууд)

`id`, `goalId`, `title`, `description`, `orderIndex`, `status` (`PENDING` / `IN_PROGRESS` / `DONE`), `progressPercent`, `createdAt`, `updatedAt`

### `tasks.schema.ts` (өдөр тут&#1084;ын таск)

`id`, `objectiveId`, `title`, `description`, `acceptanceCriteria` (AI үнэлгээнд ашиглах шалгуур текст), `scheduledDate`, `scheduledTime` (`HH:mm`), `status` (`SCHEDULED` / `SENT` / `SUBMITTED` / `EVALUATING` / `DONE` / `FAILED` / `MISSED`), `telegramMessageId`, `createdAt`, `updatedAt`

### `submissions.schema.ts`

`id`, `taskId`, `userId`, `content`, `telegramMessageId`, `submittedAt`

### `evaluations.schema.ts`

`id`, `submissionId`, `verdict` (`DONE` / `NOT_DONE`), `aiFeedback`, `aiScore`, `evaluatedAt`

`src/db/index.ts` дотроос бүгдийг `export *` хийж, `drizzle-provider/index.ts` дотор `drizzle(d1, { schema })`-оор холбоно — яг `school-funding-service`-тэй адил.

---

## 5. GraphQL API

Хоёр төрлийн эрхээр ялгана: **web хэрэглэгч** (Clerk JWT) болон **n8n service** (`X-Service-Key` header). Схе&#1084;ийг resolver context дээрх `isService` flag-аар зэрэгцүүлнэ.

**Mutations:**

| Mutation                                               | Дуудагч     | Үүрэг                                                                  |
| ------------------------------------------------------ | ----------- | ---------------------------------------------------------------------- |
| `createGoal(input)`                                    | web / Clerk | Шинэ то&#1084; зорилго үүсгэнэ, n8n-д decompose webhook trigger хийнэ  |
| `bulkCreateObjectives(goalId, objectives[])`           | n8n         | AI-аас гарсан зорилтуудыг хадгална                                     |
| `bulkCreateTasks(objectiveId, tasks[])`                | n8n         | AI-аас гарсан өдөр тут&#1084;ын таскуудыг хадгална                     |
| `linkTelegramAccount(code, chatId, username)`          | n8n         | `/start <code>` дараа Telegram chat-г user-тэй холбоно                 |
| `recordTaskSent(taskId, telegramMessageId)`            | n8n         | Таск илгээгдсэнийг тэ&#1084;дэглэнэ (`SENT`)                           |
| `recordSubmission(taskId, content, telegramMessageId)` | n8n         | Сурагчийн хариултыг хадгална (`SUBMITTED`)                             |
| `recordEvaluation(submissionId, verdict, feedback)`    | n8n         | AI-ийн үнэлгээг хадгалж, task/objective/goal progress-ийг дахин тооцно |
| `markTaskMissed(taskId)`                               | n8n         | Хугацаандаа хариулаагүй таскийг `MISSED` болгоно                       |

**Queries:**

| Query                           | Дуудагч | Үүрэг                                                                                                               |
| ------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------- |
| `getMyGoals`                    | web     | Хэрэглэгчийн бүх зорилго, зорилт, progress                                                                          |
| `getGoalTree(goalId)`           | web     | Нэг зорилгын бүтэн &#1084;од (зорилт → таск)                                                                        |
| `getTasksDueNow(windowMinutes)` | n8n     | Одоогийн цагт илгээх ёстой SCHEDULED таскууд (бүх timezone)                                                         |
| `getActiveTaskForChat(chatId)`  | n8n     | Тухайн Telegram chat-ын ха&#1084;гийн сүүлд SENT болсон таск — ирсэн &#1084;ессежийг аль таскт холбохыг тодорхойлно |

Файлын бүтэц (`school-funding-service`-тэй яг адил): `src/graphql/schemas/*.schema.ts` (typeDefs), `src/graphql/resolvers/{queries,mutations}/*.ts`, `src/types/index.ts` дотор resolver interfaces.

---

## 6. n8n Workflow-ууд

### A. Goal Decomposition (зорилго задлах)

`Webhook Trigger` (goal-tracker-service эсвэл web app-аас `createGoal` дараа дуудагдана) → `AI node` (LLM: то&#1084; зорилгыг 3–6 зорилт, зорилт бүрт өдөр тут&#1084;ын таскуудын жагсаалт + хугацаа болгож задлах, structured JSON output) → `HTTP Request`: `bulkCreateObjectives` → давталтаар `bulkCreateTasks`

### B. Daily Task Dispatcher (өдрийн таск илгээгч)

`Cron` (жишээ нь 15 &#1084;инут тута&#1084;) → `HTTP Request`: `getTasksDueNow` → `Loop Over Items` → `Telegram: sendMessage` (таскийн гарчиг+тайлбар) → `HTTP Request`: `recordTaskSent`

### C. Telegram Submission Receiver + AI Evaluation

`Telegram Trigger` (шинэ &#1084;ессеж) → `HTTP Request`: `getActiveTaskForChat` → `HTTP Request`: `recordSubmission` → `AI node`: сурагчийн хариултыг таскийн `acceptanceCriteria`-тай харьцуулж `{verdict, feedback}` буцаана → `HTTP Request`: `recordEvaluation` (progress recalculation backend талд авто&#1084;атаар хийгдэнэ) → `Telegram: sendMessage` (үр дүн + feedback хариулна)

### D. Missed Task Reminder (сонголтоор)

`Cron` (өдрийн эцэст) → тухайн өдрийн `SENT` боловч хариулаагүй таскуудыг татах → `markTaskMissed` → `Telegram: sendMessage` сануулга

---

## 7. Хэрэглэгчийн за&#1084; (User Flow)

1. **Бүртгэл/холболт** — Сурагч `goal-tracker-web`-д Clerk-ээр нэвтэрч, эсвэл шууд Telegram bot-д `/start` бичнэ. Bot линк код өгнө → dashboard дээр код баталгаажуулснаар Telegram chat нь account-тай холбогдоно (`linkTelegramAccount`).
2. **То&#1084; зорилго тавих** — Сурагч dashboard дээр (эсвэл bot-руу шууд) то&#1084; зорилгоо бичнэ, жишээ нь "3 сарын дараа IELTS 7.0 авах".
3. **AI задаргаа** — n8n-ийн Goal Decomposition workflow авто&#1084;атаар ажиллаж, зорилгыг зорилтууд болон өдрийн хуваарьтай таскуудад задална, DB-д хадгална.
4. **Өдрийн таск ирнэ** — Тухайн таск дээр тохирсон цагт n8n Dispatcher ажиллаж, Telegram bot да&#1084;жуулан сурагчид "Өнөөдрийн таск: ..." &#1084;ессеж илгээнэ.
5. **Гүйцэтгэл + тайлан** — Сурагч бодит а&#1084;ьдрал дээр таскаа хийгээд, юу хийснээ товч бичиж bot-руу явуулна.
6. **AI үнэлгээ** — n8n &#1084;ессежийг хүлээж аваад, AI-аар тухайн таскийн шаардлагатай харьцуулж үнэлнэ (биелсэн/биелээгүй + шалтгаан).
7. **Хариу + Progress** — Bot сурагчид "✅ Дуусгасан!" эсвэл "❌ Дахин оролдоод илгээ" гэсэн feedback-тэй хариу бичнэ. Биелсэн бол таск `DONE`, зорилт/зорилгын progress ахина.
8. **Хугацаандаа хариулаагүй** — Тухайн өдөр хариу ирээгүй бол `MISSED` болж, сануулга явна (сонголтоор дараагийн өдрийн төлөвлөгөөнд нөлөөлж болно).
9. **Ахиц харах** — Сурагч dashboard дээр аль ч үед бүх зорилго/зорилт/таскийн явц, түүхийг харна.

---

## 8. Monorepo дээр Setup хийх

### 8.1 Nx app scaffold (`school-funding-service`-ийг load хийж хуулбарлана)

```bash
mkdir -p apps/goal-tracker/goal-tracker-service/src/{db,drizzle-provider,graphql/schemas,graphql/resolvers/queries,graphql/resolvers/mutations,types,webhooks}
```

`school-funding-service`-ээс дараах файлуудыг хуулж, domain-аа тохируулна (project нэр, D1 database нэр, schema талбарууд):

- `project.json` — targets (`serve-local`, `serve-remote`, `build`, `drizzle:push`, `drizzle:generate`, `drizzle:studio`, `wrangler:migrate-local`, `wrangler:migrate-remote`, `deploy`, `lint`) — бүгд `cwd: apps/goal-tracker/goal-tracker-service`, зөвхөн database нэрийг `goal-tracker` болгоно
- `wrangler.jsonc` — `name: "goal-tracker"`, шинэ `d1_databases` binding (доор үзнэ үү)
- `drizzle.config.ts`, `drizzle-dev.config.ts` — `requireEnv` ашиглан адилхан (`libs/shared/cloudflare`)
- `tsconfig.json`, `tsconfig.lib.json`, `eslint.config.mjs` — хуулж болно

### 8.2 D1 database үүсгэх

```bash
cd apps/goal-tracker/goal-tracker-service
bunx wrangler d1 create goal-tracker
```

Гарсан `database_id`-г `wrangler.jsonc`-д тавина:

```jsonc
{
  "name": "goal-tracker",
  "main": "src/index.ts",
  "compatibility_date": "2026-06-22",
  "compatibility_flags": ["nodejs_compat"],
  "dev": { "port": 4002 },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "goal-tracker",
      "database_id": "<wrangler d1 create-ээс гарсан id>",
      "migrations_dir": "./drizzle",
    },
  ],
}
```

> `dev.port`-ийг `4002` гэх &#1084;эт өөр порт болгоно — `school-funding-service` (4001), `todo-service`-тэй давхцахгүй байх ёстой.

### 8.3 Drizzle schema бичих

[4-р бүлэгт](#4-өгөгдлийн-загвар-drizzle-schema) заасан 6 хүснэгтийг `src/db/*.schema.ts`-д бичээд `src/db/index.ts`-д `export *` хийнэ. Дараа нь:

```bash
bunx nx run goal-tracker-service:drizzle:generate   # migration файл үүсгэнэ
bunx nx run goal-tracker-service:wrangler:migrate-local
bunx nx run goal-tracker-service:wrangler:migrate-remote
```

### 8.4 GraphQL schema + resolvers

[5-р бүлэгт](#5-graphql-api) заасан typeDefs болон resolver-уудыг `school-funding-service`-ийн `create-project.ts` &#1084;аягийн pattern-аар бичнэ (`GraphQLError`, `db.query.*`, `db.insert(...)`).

### 8.5 Service-to-service auth (n8n → Worker)

`src/index.ts`-ийн `fetch` handler дотор Clerk-ийн зэрэгцээ шинэ шалгалт нэ&#1084;нэ:

```ts
const serviceKey = request.headers.get('x-service-key');
const isService = serviceKey && serviceKey === env.N8N_SERVICE_KEY;
```

Context-д `isService`-г да&#1084;жуулж, зөвхөн n8n-д зориулсан mutation/query-үүдийг (`bulkCreateObjectives`, `recordTaskSent`, гэх &#1084;эт) resolver дотор `if (!ctx.isService) throw new GraphQLError('Эрх байхгүй')` гэж ха&#1084;гаална.

`.dev.vars`-д нэ&#1084;нэ:

```
N8N_SERVICE_KEY=<сана&#1084;саргүй урт нууц утга>
```

Production дээр:

```bash
bunx wrangler secret put N8N_SERVICE_KEY
```

### 8.6 (Сонголтоор) `goal-tracker-web`

`school-funding-web`-ийг template болгон Next.js dashboard хийж болно (Clerk auth, Apollo Client, `NEXT_PUBLIC_GRAPHQL_URL` env). Хэрэв MVP-д зөвхөн Telegram-аар ажиллуулах бол энэ алх&#1084;ыг хойшлуулж болно — зорилгыг ч бас `/newgoal` bot command-аар оруулж болно.

---

## 9. n8n Setup

1. **Hosting** — MVP-д n8n Cloud эсвэл жижиг VPS/Railway дээр Docker-оор self-host (Telegram webhook болон n8n webhook node-д публик HTTPS URL шаардлагатай).
2. **Telegram bot үүсгэх** — Telegram дээр `@BotFather`-тай ярилцаж `/newbot`, bot token авна.
3. **n8n Credentials:**
   - `Telegram API` — bot token
   - `HTTP Header Auth` — `X-Service-Key: <N8N_SERVICE_KEY>` (goal-tracker-service рүү дуудахад ашиглана)
   - `OpenAI` / `Anthropic` API key — decompose болон evaluate node-уудад
4. **Env variables (n8n instance дээр):**
   - `TELEGRAM_BOT_TOKEN`
   - `GOAL_SERVICE_GRAPHQL_URL` (жишээ: `https://goal-tracker.<account>.workers.dev/graphql`)
   - `N8N_SERVICE_KEY`
   - `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`
5. [6-р бүлэгт](#6-n8n-workflow-ууд) заасан 3–4 workflow-г үүсгэж, идэвхжүүлнэ (`Active` toggle) — Telegram Trigger идэвхжихэд n8n авто&#1084;атаар Telegram webhook-г бүртгэнэ.

---

## 10. Аюулгүй байдал

- n8n → `goal-tracker-service` бүх дуудалт `X-Service-Key` header-тэй байх ёстой; энэ key-г Clerk JWT-ийн оронд ашиглана, учир нь n8n нь "хэрэглэгч" биш "систе&#1084;" тул.
- Web dashboard → `goal-tracker-service` дуудалт Clerk JWT-ээр хэвээрээ (`school-funding-service`-тэй адил `getAuthFromRequest`).
- Telegram webhook нь n8n-ийн Telegram Trigger дотор авто&#1084;атаар баталгаажина (Telegram-ийн `secret_token` &#1084;еханиз&#1084;ыг n8n дотооддоо ашигладаг).
- `N8N_SERVICE_KEY`-г `.dev.vars`, `wrangler secret`, n8n credential 3 газарт л хадгална — code-д hardcode хийхгүй.

---

## 11. Локал Development

```bash
# goal-tracker-service (Cloudflare Worker + GraphQL)
bunx nx run goal-tracker-service:serve-local

# Drizzle studio-гоор DB-г browser-р үзэх
bunx nx run goal-tracker-service:drizzle:studio

# (сонголтоор) dashboard
bunx nx run goal-tracker-web:serve
```

n8n-г локалаар турших бол `n8n start` (Docker: `docker run -it --rm -p 5678:5678 n8nio/n8n`) ажиллуулаад, Cloudflare Worker-ийн `serve-local` URL руу (`http://localhost:4002/graphql`) HTTP Request node-уудаас хандана. Telegram webhook локал дээр туршихад `ngrok`/`cloudflared tunnel` шаардлагатай.

---

## 12. Дараагийн алха&#1084;ууд

- [ ] `apps/goal-tracker/goal-tracker-service` scaffold ([8.1](#81-nx-app-scaffold-school-funding-service-ийг-load-хийж-хуулбарлана))
- [ ] D1 database үүсгэх, `wrangler.jsonc` тохируулах ([8.2](#82-d1-database-үүсгэх))
- [ ] Drizzle schema 6 хүснэгт бичих, migrate ([8.3](#83-drizzle-schema-бичих))
- [ ] GraphQL schema/resolvers бичих ([8.4](#84-graphql-schema--resolvers))
- [ ] `N8N_SERVICE_KEY` auth нэ&#1084;эх ([8.5](#85-service-to-service-auth-n8n--worker))
- [ ] n8n instance босгох, Telegram bot үүсгэх ([9](#9-n8n-setup))
- [ ] 4 workflow (Decompose / Dispatcher / Submission+Evaluation / Missed) бичих
- [ ] (Сонголтоор) `goal-tracker-web` dashboard
