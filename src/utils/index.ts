export function getElementWrapper<T>(selector: string): T {
    // Convenience helper that wraps document.querySelector and provides a typed result.
    const element = document.querySelector(selector);
    if (!element) throw new Error(`Element not found: ${selector}`);
    return element as T
}

export function showEl(element: HTMLElement) {
    // Show an HTML element by removing the Bootstrap hidden class.
    element.classList.remove('d-none');
}

export function hideEl(element: HTMLElement) {
    // Hide an HTML element by adding the Bootstrap hidden class.
    element.classList.add('d-none');
}

export function enableEl(element: HTMLElement) {
    // Enable a button or input by removing the disabled attribute.
    element.removeAttribute('disabled');
}

export function disableEl(element: HTMLElement) {
    // Disable a button or input by setting the disabled attribute.
    element.setAttribute('disabled', 'true');
}

export function displayAlert(message:string, timeout: number = 3000) {
    // Display a global alert message for a short time.
    const alert = getElementWrapper<HTMLElement>('#alert');
    alert.textContent = message;
    showEl(alert);
    setTimeout(() => hideEl(alert), timeout);
}