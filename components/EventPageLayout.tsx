import React from 'react';

interface EventPageLayoutProps {
    children: React.ReactNode;
}

const EventPageLayout: React.FC<EventPageLayoutProps> = ({ children }) => {
    return (
        <>
            {/* No header ni footer aquí - usar los del sitio en _app.tsx */}
            {children}
        </>
    );
};

export default EventPageLayout;
