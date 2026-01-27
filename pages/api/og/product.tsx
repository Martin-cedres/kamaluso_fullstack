
/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const config = {
    runtime: 'edge',
};

export default function handler(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        // Dynamic params
        const title = searchParams.get('title')?.slice(0, 100) || 'Producto Personalizado';
        const price = searchParams.get('price');
        const image = searchParams.get('image');

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        textAlign: 'center',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        flexWrap: 'nowrap',
                        backgroundColor: 'white',
                        backgroundImage: 'radial-gradient(circle at 25px 25px, lightgray 2%, transparent 0%), radial-gradient(circle at 75px 75px, lightgray 2%, transparent 0%)',
                        backgroundSize: '100px 100px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            justifyItems: 'center',
                            position: 'relative',
                            width: '100%',
                            height: '100%',
                        }}
                    >
                        {/* Background Shape */}
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '1200px',
                                height: '630px',
                                background: 'linear-gradient(to bottom right, #fce7f3, #ffffff)', // Pink-50 to White
                                zIndex: -1,
                            }}
                        />

                        {/* Product Image */}
                        {image && (
                            <img
                                alt={title}
                                src={image}
                                style={{
                                    width: '400px',
                                    height: '400px',
                                    objectFit: 'cover',
                                    borderRadius: '20px',
                                    boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                                    marginRight: '60px',
                                }}
                            />
                        )}

                        {/* Quote/Info */}
                        <div
                            style={{
                                display: 'flex',
                                fontSize: 60,
                                fontStyle: 'normal',
                                color: '#1f2937', // gray-800
                                marginTop: 30,
                                lineHeight: 1.2,
                                whiteSpace: 'pre-wrap',
                                flexDirection: 'column',
                                maxWidth: '600px',
                                alignItems: 'flex-start',
                                textAlign: 'left',
                            }}
                        >
                            <div style={{ fontSize: 30, marginBottom: 10, color: '#db2777', fontWeight: 700 }}>KAMALUSO</div>
                            <div style={{ fontWeight: 900, marginBottom: 20 }}>{title}</div>
                            {price && (
                                <div
                                    style={{
                                        fontSize: 50,
                                        background: '#1f2937',
                                        color: 'white',
                                        padding: '10px 30px',
                                        borderRadius: '50px',
                                        fontWeight: 700
                                    }}
                                >
                                    $U {price}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            },
        );
    } catch (e: any) {
        console.log(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
