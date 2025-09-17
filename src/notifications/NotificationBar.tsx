import {motion} from 'framer-motion';

interface NotificationBarProps {
    id: string;
    message: string;
    type?: 'success' | 'error' | 'info';
    onClose: (id: string) => void;
}

const typeColors: Record<string, string> = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
};

export const NotificationBar = ({id, message, type = 'info', onClose}: NotificationBarProps) => {
    return (
        <motion.div
            initial={{y: 80, opacity: 0}}
            animate={{y: 0, opacity: 1}}
            exit={{y: 80, opacity: 0}}
            transition={{duration: 0.3}}
            className={`w-full max-w-md ${typeColors[type]} text-white px-4 py-3 rounded-lg shadow-lg`}
        >
            <div className="flex justify-between items-center">
                <span className="text-sm">{message}</span>
                <button
                    onClick={() => onClose(id)}
                    className="ml-4 text-white font-bold hover:opacity-80"
                >
                    ✕
                </button>
            </div>
        </motion.div>
    );
};
