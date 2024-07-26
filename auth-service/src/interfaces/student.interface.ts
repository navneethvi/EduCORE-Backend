export interface IStudent {
    toObject(): IStudent | PromiseLike<IStudent>;
    _id: string;
    name: string;
    email: string;
    phone: number;
    password: string;
    interests: string[];
    is_blocked?: boolean;
    image?: string;
    following?: string[];
    token?: string;
}

export interface INewStudent {
    name: string;
    email: string;
    phone: number;
    password: string;
    interests: string[];
    following: string[];
}
