declare module 'react-rating' {
    import * as React from 'react';

    export interface RatingProps {
        initialRating?: number;
        readonly?: boolean;
        emptySymbol?: React.ReactNode;
        fullSymbol?: React.ReactNode;
        fractions?: number;
        onChange?: (value: number) => void;
        onHover?: (value: number) => void;
    }

    export default class Rating extends React.Component<RatingProps> {}
}
