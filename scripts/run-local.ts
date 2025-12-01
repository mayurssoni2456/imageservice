import { readFileSync } from 'fs';
import { resolve } from 'path';
import { handler } from '../src/handlers/api/handler';
import { LambdaEvent } from '../src/dto/image.dto';

function usage(): void {
  console.log('Usage: ts-node scripts/run-local.ts <event-file>');
  process.exit(1);
}

void (async (): Promise<void> => {
  const eventFile = process.argv[2];
  if (!eventFile) usage();

  const fullPath = resolve(eventFile);
  const raw = readFileSync(fullPath, 'utf-8');
  const event = JSON.parse(raw) as LambdaEvent;

  console.log(`Invoking handler with event file: ${fullPath}`);
  const response = await handler(event);

  console.log('\n--- Lambda Response ---');
  console.log('Status:', response.statusCode);
  console.log('Headers:', response.headers);
  console.log('Body:', response.body);
})();
