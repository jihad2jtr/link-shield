import { useEffect } from 'react';

interface GoogleAdSenseProps {
    client: string;
    slot: string;
    format?: string;
    responsive?: boolean;
    style?: React.CSSProperties;
}

export const GoogleAdSense = ({
    client,
    slot,
    format = 'auto',
    responsive = true,
    style = { display: 'block' }
}: GoogleAdSenseProps) => {
    useEffect(() => {
        try {
            // @ts-ignore
            if (window.adsbygoogle && process.env.NODE_ENV !== 'development') {
                // @ts-ignore
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (error) {
            console.error('AdSense error:', error);
        }
    }, []);

    // Don't show ads in development
    if (process.env.NODE_ENV === 'development' || !client || !slot) {
        return (
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500 font-medium">منطقة إعلانات Google AdSense</p>
                <p className="text-sm text-gray-400 mt-2">سيتم عرض الإعلانات هنا في الإنتاج</p>
            </div>
        );
    }

    return (
        <ins
            className="adsbygoogle"
            style={style}
            data-ad-client={client}
            data-ad-slot={slot}
            data-ad-format={format}
            data-full-width-responsive={responsive.toString()}
        />
    );
};
