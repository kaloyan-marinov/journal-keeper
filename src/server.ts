const createGreeting = (fullName: string): string => {
    return `Hello, ${fullName}!`;
}

const greeting = new Date().toISOString() + ' - ' + createGreeting('John Doe');

console.log(greeting)
