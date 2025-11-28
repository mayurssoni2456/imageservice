export function greet(name: string = 'World'): string {
  return `Hello ${name}...!`;
}

function main(): void {
  console.log(greet());
}

main();
