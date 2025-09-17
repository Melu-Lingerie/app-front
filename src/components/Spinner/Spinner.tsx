interface SpinnerProps {
    size?: number;
    className?: string;
}

export const Spinner = ({size = 40, className = ''}: SpinnerProps) => {
    return (
        <div
            role="status"
            aria-busy="true"
            className={`inline-flex relative items-center justify-center ${className}`}
        >
              <span
                  className="absolute animate-spin rounded-full border-4 border-current border-t-transparent"
                  style={{width: size, height: size}}
              />
                <span
                    className="absolute animate-spin rounded-full border-2 border-current border-b-transparent"
                    style={{width: size / 2, height: size / 2, animationDuration: '1.5s'}}
                />
                M
                <span className="sr-only">Загрузка…</span>
        </div>
    );
};
