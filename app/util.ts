
export function add(a: number, b: number): number {
    return a + b
}



export function isProbablyEmail(email: unknown): email is string {
    return typeof email === 'string' && email.length > 3 && email.includes('@')
}

export function validateName(name: unknown): name is string {
    return typeof name === 'string' && name.length >= 3
}

export function validatePassword(password: unknown, expectedLength: number): password is string {
    return typeof password === 'string' && password.length >= expectedLength
}

export function validateAge(age: unknown): age is number {
    return typeof age === 'number' && age >= 10
}

export function validateRequired(field: unknown): field is string {
    return typeof field === 'string' && field.length > 0
}

export function validateGrade(grade: unknown): grade is number {
    return typeof grade === 'number' && grade >= 6
} 

export function dbTimeToString(dbTime: number | null): string {
    if (dbTime === null) return 'No Data'
    
    const normalized = Math.floor(dbTime)
    const minutes = Math.floor(Math.floor(normalized) / 60)
    const seconds = normalized % 60

    return `${minutes.toString()}:${seconds.toString().padStart(2, '0')}`
}

/*export function useContainsClick(ref: React.RefObject<HTMLElement>) {
    useEffect(() => {
        
      function handleClick(event: MouseEvent) {
        assertIsNode(event.target)
        if (ref.current && ref.current.contains(event.target)) {
          alert("You Click inside me");
        }
      }
      // Bind the event listener
      document.addEventListener("mousedown", (e) => handleClick(e));
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener("mousedown", (e) => handleClick(e));
      };
    }, [ref]);
  }

  function assertIsNode(e: EventTarget | null): asserts e is Node {
    if (!e || !("nodeType" in e)) {
        throw new Error(`Node expected`);
    }
}*/
