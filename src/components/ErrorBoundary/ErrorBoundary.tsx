import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('ErrorBoundary caught:', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#FFFBF5]">
                    <h1 className="text-2xl font-semibold mb-4">Что-то пошло не так</h1>
                    <p className="text-gray-500 mb-6 text-center max-w-md">
                        Произошла ошибка при загрузке страницы. Попробуйте обновить.
                    </p>
                    <pre className="text-xs text-red-600 bg-red-50 p-4 rounded-lg max-w-lg overflow-auto mb-6">
                        {this.state.error?.message}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-[#F8C6D7] hover:bg-[#f5b6ca] transition cursor-pointer"
                    >
                        Обновить страницу
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
