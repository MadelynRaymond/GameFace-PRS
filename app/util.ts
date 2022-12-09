
export function add(a: number, b: number): number {
    return a + b
}



export function isProbablyEmail(email: unknown): email is string {
    return typeof email === 'string' && email.length > 3 && email.includes('@')
}

export function dbTimeToString(dbTime: number): string {
    const minutes = Math.floor(dbTime / 60)
    const seconds = dbTime % 60

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
