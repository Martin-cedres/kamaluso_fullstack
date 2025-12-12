declare module 'isomorphic-dompurify' {
    const DOMPurify: {
        sanitize: (dirty: string, config?: any) => string;
        // Agrega otros métodos si son necesarios
    };
    export default DOMPurify;
}
