export type CustomerStatus = 'active' | 'inactive' | 'deleted';
export type Gender = 'male' | 'female' | 'other';
export type BonusOperationType = 'accrual' | 'debit';

export interface BonusTransaction {
    id: number;
    date: string;
    type: BonusOperationType;
    amount: number;
    reason: string;
    balanceAfter: number;
}

export interface CustomerOrder {
    id: number;
    orderNumber: string;
    date: string;
    amount: number;
    status: string;
}

export interface Customer {
    id: number;
    customerId: string;
    firstName: string;
    lastName: string;
    email: string;
    emailVerified: boolean;
    phone: string;
    birthDate?: string;
    gender?: Gender;
    deliveryAddress?: string;
    registrationDate: string;
    ordersCount: number;
    totalPurchaseAmount: number;
    bonusPoints: number;
    status: CustomerStatus;
    hasNewsletterSubscription: boolean;
    hasSecretBoxSubscription: boolean;
    bonusTransactions: BonusTransaction[];
    orders: CustomerOrder[];
}

export interface CustomerFilters {
    search?: string;
    registrationDateFrom?: string;
    registrationDateTo?: string;
    ordersCountFrom?: number;
    ordersCountTo?: number;
    purchaseAmountFrom?: number;
    purchaseAmountTo?: number;
    hasSubscription?: boolean;
    status?: CustomerStatus[];
}
