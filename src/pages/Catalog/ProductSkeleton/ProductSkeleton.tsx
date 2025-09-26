type ProductSkeletonProps = {
    withBorder?: boolean;
};

export const ProductSkeleton = ({ withBorder = false }: ProductSkeletonProps) => (
    <div className={withBorder ? 'p-5 border-r border-b border-[#CCC]' : ''}>
        <div className="flex flex-col gap-3 animate-pulse">
            {/* Картинка */}
            <div className="w-full h-[666px] bg-gray-200 rounded" />

            {/* Инфо */}
            <div className="w-full mt-5 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-gray-300" />
                    <div className="w-3 h-3 rounded-full bg-gray-300" />
                    <div className="w-3 h-3 rounded-full bg-gray-300" />
                </div>
            </div>
        </div>
    </div>
);
