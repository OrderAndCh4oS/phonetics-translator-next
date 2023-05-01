import {RefObject, useEffect} from 'react'

type Handler = (event: MouseEvent) => void

function useOnClickOutside<T extends HTMLElement = HTMLElement>(
    ref: RefObject<T>,
    handler: Handler,
): void {
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!event.target) return;
            if (ref.current && !ref.current.contains(event.target as Node)) {
                handler(event);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref]);
}

export default useOnClickOutside
